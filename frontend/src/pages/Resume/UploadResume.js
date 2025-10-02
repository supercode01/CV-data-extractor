import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { resumeAPI, formatFileSize } from '../../services/api';
import {
  HiUpload,
  HiDocument,
  HiX,
  HiCheckCircle,
  HiExclamationCircle,
} from 'react-icons/hi';
import Button from '../../components/UI/Button';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import toast from 'react-hot-toast';

const UploadResume = () => {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const navigate = useNavigate();

  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    // Handle accepted files
    acceptedFiles.forEach((file) => {
      const fileWithId = {
        id: Math.random().toString(36).substr(2, 9),
        file,
        status: 'ready',
        progress: 0,
        error: null,
      };
      setUploadedFiles(prev => [...prev, fileWithId]);
    });

    // Handle rejected files
    rejectedFiles.forEach(({ file, errors }) => {
      const errorMessage = errors.map(e => e.message).join(', ');
      toast.error(`${file.name}: ${errorMessage}`);
    });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    maxFiles: 5,
    maxSize: 5 * 1024 * 1024, // 5MB
  });

  const removeFile = (fileId) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
    setUploadProgress(prev => {
      const newProgress = { ...prev };
      delete newProgress[fileId];
      return newProgress;
    });
  };

  const uploadFile = async (fileWithId) => {
    const { id, file } = fileWithId;
    
    try {
      setUploadedFiles(prev => 
        prev.map(f => f.id === id ? { ...f, status: 'uploading' } : f)
      );

      const formData = new FormData();
      formData.append('resume', file);

      const response = await resumeAPI.uploadResume(
        formData,
        (progressEvent) => {
          const progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(prev => ({ ...prev, [id]: progress }));
        }
      );

      setUploadedFiles(prev =>
        prev.map(f =>
          f.id === id
            ? {
                ...f,
                status: 'completed',
                resumeId: response.data.resume.id,
                parsedData: response.data.resume.parsedData,
              }
            : f
        )
      );

      toast.success(`${file.name} uploaded and processed successfully!`);
    } catch (error) {
      console.error('Upload error:', error);
      const errorMessage = error.response?.data?.message || 'Upload failed';
      
      setUploadedFiles(prev =>
        prev.map(f =>
          f.id === id
            ? { ...f, status: 'error', error: errorMessage }
            : f
        )
      );

      toast.error(`${file.name}: ${errorMessage}`);
    }
  };

  const handleUpload = async () => {
    if (uploadedFiles.length === 0) {
      toast.error('Please select files to upload');
      return;
    }

    setIsUploading(true);

    try {
      // Upload files sequentially to avoid overwhelming the server
      for (const fileWithId of uploadedFiles.filter(f => f.status === 'ready')) {
        await uploadFile(fileWithId);
      }
    } finally {
      setIsUploading(false);
      setUploadProgress({});
    }
  };

  const handleViewResults = (resumeId) => {
    navigate(`/resume/${resumeId}`);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <HiCheckCircle className="h-5 w-5 text-success-500" />;
      case 'uploading':
        return <LoadingSpinner size="sm" />;
      case 'error':
        return <HiExclamationCircle className="h-5 w-5 text-error-500" />;
      default:
        return <HiDocument className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'ready':
        return 'Ready to upload';
      case 'uploading':
        return 'Uploading...';
      case 'completed':
        return 'Completed';
      case 'error':
        return 'Upload failed';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Upload Resume</h1>
        <p className="mt-1 text-sm text-gray-600">
          Upload your resume in PDF or DOCX format for AI-powered parsing.
        </p>
      </div>

      {/* Upload Area */}
      <div className="card">
        <div className="card-body">
          <div
            {...getRootProps()}
            className={`dropzone ${isDragActive ? 'active' : ''}`}
          >
            <input {...getInputProps()} />
            <div className="text-center">
              <HiUpload className="mx-auto h-12 w-12 text-gray-400" />
              <div className="mt-4">
                {isDragActive ? (
                  <p className="text-lg font-medium text-primary-600">
                    Drop the files here...
                  </p>
                ) : (
                  <div>
                    <p className="text-lg font-medium text-gray-900">
                      Drag & drop files here, or click to select
                    </p>
                    <p className="mt-2 text-sm text-gray-600">
                      Supports PDF and DOCX files up to 5MB
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* File List */}
      {uploadedFiles.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900">
              Selected Files ({uploadedFiles.length})
            </h3>
          </div>
          <div className="card-body">
            <div className="space-y-4">
              {uploadedFiles.map((fileWithId) => (
                <div
                  key={fileWithId.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    {getStatusIcon(fileWithId.status)}
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">
                        {fileWithId.file.name}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {formatFileSize(fileWithId.file.size)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {getStatusText(fileWithId.status)}
                      </p>
                      {fileWithId.error && (
                        <p className="text-xs text-error-600 mt-1">
                          {fileWithId.error}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {/* Progress bar */}
                    {fileWithId.status === 'uploading' && (
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                          style={{
                            width: `${uploadProgress[fileWithId.id] || 0}%`,
                          }}
                        />
                      </div>
                    )}

                    {/* View results button */}
                    {fileWithId.status === 'completed' && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleViewResults(fileWithId.resumeId)}
                      >
                        View Results
                      </Button>
                    )}

                    {/* Remove button */}
                    {fileWithId.status !== 'uploading' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(fileWithId.id)}
                      >
                        <HiX className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Upload button */}
            <div className="mt-6 flex justify-end space-x-3">
              <Button
                variant="secondary"
                onClick={() => {
                  setUploadedFiles([]);
                  setUploadProgress({});
                }}
                disabled={isUploading}
              >
                Clear All
              </Button>
              <Button
                variant="primary"
                onClick={handleUpload}
                loading={isUploading}
                disabled={
                  isUploading ||
                  uploadedFiles.filter(f => f.status === 'ready').length === 0
                }
              >
                {isUploading ? 'Uploading...' : 'Upload Files'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-medium text-gray-900">
            Upload Instructions
          </h3>
        </div>
        <div className="card-body">
          <div className="prose prose-sm max-w-none">
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              <li>
                <strong>Supported formats:</strong> PDF and DOCX files only
              </li>
              <li>
                <strong>File size limit:</strong> Maximum 5MB per file
              </li>
              <li>
                <strong>Multiple files:</strong> You can upload up to 5 files at once
              </li>
              <li>
                <strong>Processing time:</strong> Typically takes 10-30 seconds per file
              </li>
              <li>
                <strong>Best results:</strong> Ensure your resume has clear text and proper formatting
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadResume;
