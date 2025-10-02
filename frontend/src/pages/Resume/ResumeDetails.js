import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { resumeAPI, formatFileSize, formatDate } from '../../services/api';
import {
  HiArrowLeft,
  HiDownload,
  HiTrash,
  HiRefresh,
  HiMail,
  HiPhone,
  HiLocationMarker,
  HiLink,
  HiCode,
  HiBriefcase,
  HiAcademicCap,
  HiLightBulb,
  HiUser,
  HiDocumentText,
} from 'react-icons/hi';
import Button from '../../components/UI/Button';
import Badge from '../../components/UI/Badge';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import toast from 'react-hot-toast';

const ResumeDetails = () => {
  const { id } = useParams();
  
  const { data, isLoading, error, refetch } = useQuery(
    ['resume', id],
    () => resumeAPI.getResume(id),
    {
      enabled: !!id,
    }
  );

  const resume = data?.resume;

  const handleExportResume = async () => {
    if (!resume) return;
    
    try {
      const response = await resumeAPI.exportResume(id, true);
      const blob = new Blob([response.data], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${resume.originalFileName}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('Resume data exported successfully');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export resume data');
    }
  };

  const handleDeleteResume = async () => {
    if (!resume) return;
    
    if (!window.confirm(`Are you sure you want to delete "${resume.originalFileName}"?`)) {
      return;
    }

    try {
      await resumeAPI.deleteResume(id);
      toast.success('Resume deleted successfully');
      // Redirect to history page
      window.location.href = '/history';
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete resume');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return <Badge variant="success">Completed</Badge>;
      case 'processing':
        return <Badge variant="warning">Processing</Badge>;
      case 'failed':
        return <Badge variant="error">Failed</Badge>;
      default:
        return <Badge variant="secondary">Uploaded</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !resume) {
    return (
      <div className="text-center py-12">
        <div className="text-error-600 mb-4">
          <HiDocumentText className="mx-auto h-12 w-12" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Resume not found
        </h3>
        <p className="text-gray-600 mb-4">
          {error?.response?.data?.message || 'The requested resume could not be found.'}
        </p>
        <Link to="/history">
          <Button variant="primary">
            <HiArrowLeft className="h-4 w-4 mr-2" />
            Back to History
          </Button>
        </Link>
      </div>
    );
  }

  const parsedData = resume.parsedData || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/history">
            <Button variant="ghost" size="sm">
              <HiArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {resume.originalFileName}
            </h1>
            <div className="flex items-center space-x-3 mt-1">
              {getStatusBadge(resume.processingStatus)}
              {resume.aiConfidence && (
                <span className="text-sm text-gray-600">
                  AI Confidence: {resume.aiConfidence}%
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" onClick={() => refetch()}>
            <HiRefresh className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          {resume.processingStatus === 'completed' && (
            <Button variant="secondary" size="sm" onClick={handleExportResume}>
              <HiDownload className="h-4 w-4 mr-2" />
              Export JSON
            </Button>
          )}
          <Button variant="error" size="sm" onClick={handleDeleteResume}>
            <HiTrash className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* Resume Info */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-medium text-gray-900">Resume Information</h3>
        </div>
        <div className="card-body">
          <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
            <div>
              <dt className="text-sm font-medium text-gray-500">File Name</dt>
              <dd className="mt-1 text-sm text-gray-900">{resume.originalFileName}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">File Size</dt>
              <dd className="mt-1 text-sm text-gray-900">{formatFileSize(resume.fileSize)}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Uploaded</dt>
              <dd className="mt-1 text-sm text-gray-900">{formatDate(resume.createdAt)}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
              <dd className="mt-1 text-sm text-gray-900">{formatDate(resume.updatedAt)}</dd>
            </div>
          </dl>
        </div>
      </div>

      {resume.processingStatus === 'failed' && (
        <div className="card border-error-200 bg-error-50">
          <div className="card-body">
            <h3 className="text-lg font-medium text-error-800">Processing Failed</h3>
            <p className="mt-2 text-sm text-error-700">
              {resume.processingError || 'An error occurred while processing this resume.'}
            </p>
          </div>
        </div>
      )}

      {resume.processingStatus === 'processing' && (
        <div className="card border-warning-200 bg-warning-50">
          <div className="card-body">
            <div className="flex items-center">
              <LoadingSpinner size="sm" className="mr-3" />
              <h3 className="text-lg font-medium text-warning-800">
                Processing Resume
              </h3>
            </div>
            <p className="mt-2 text-sm text-warning-700">
              Your resume is being processed. This usually takes 10-30 seconds.
            </p>
          </div>
        </div>
      )}

      {resume.processingStatus === 'completed' && parsedData && (
        <div className="space-y-6">
          {/* Personal Information */}
          {(parsedData.fullName || parsedData.email || parsedData.phone || parsedData.address) && (
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <HiUser className="h-5 w-5 mr-2" />
                  Personal Information
                </h3>
              </div>
              <div className="card-body">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {parsedData.fullName && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Full Name</dt>
                      <dd className="mt-1 text-sm text-gray-900">{parsedData.fullName}</dd>
                    </div>
                  )}
                  {parsedData.email && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500 flex items-center">
                        <HiMail className="h-4 w-4 mr-1" />
                        Email
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900">{parsedData.email}</dd>
                    </div>
                  )}
                  {parsedData.phone && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500 flex items-center">
                        <HiPhone className="h-4 w-4 mr-1" />
                        Phone
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900">{parsedData.phone}</dd>
                    </div>
                  )}
                  {parsedData.address && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500 flex items-center">
                        <HiLocationMarker className="h-4 w-4 mr-1" />
                        Address
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900">{parsedData.address}</dd>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Summary */}
          {parsedData.summary && (
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <HiDocumentText className="h-5 w-5 mr-2" />
                  Professional Summary
                </h3>
              </div>
              <div className="card-body">
                <p className="text-sm text-gray-900 whitespace-pre-wrap">
                  {parsedData.summary}
                </p>
              </div>
            </div>
          )}

          {/* Skills */}
          {parsedData.skills && parsedData.skills.length > 0 && (
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <HiLightBulb className="h-5 w-5 mr-2" />
                  Skills
                </h3>
              </div>
              <div className="card-body">
                <div className="flex flex-wrap gap-2">
                  {parsedData.skills.map((skill, index) => (
                    <Badge key={index} variant="primary">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Experience */}
          {parsedData.experience && parsedData.experience.length > 0 && (
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <HiBriefcase className="h-5 w-5 mr-2" />
                  Work Experience
                </h3>
              </div>
              <div className="card-body">
                <div className="space-y-6">
                  {parsedData.experience.map((exp, index) => (
                    <div key={index} className="border-l-4 border-primary-200 pl-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">
                            {exp.position}
                          </h4>
                          <p className="text-sm text-gray-600">{exp.company}</p>
                          <p className="text-sm text-gray-500">
                            {exp.startDate} - {exp.endDate}
                          </p>
                        </div>
                        {exp.isCurrent && (
                          <Badge variant="success" size="sm">Current</Badge>
                        )}
                      </div>
                      {exp.description && (
                        <p className="mt-2 text-sm text-gray-700 whitespace-pre-wrap">
                          {exp.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Education */}
          {parsedData.education && parsedData.education.length > 0 && (
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <HiAcademicCap className="h-5 w-5 mr-2" />
                  Education
                </h3>
              </div>
              <div className="card-body">
                <div className="space-y-6">
                  {parsedData.education.map((edu, index) => (
                    <div key={index} className="border-l-4 border-secondary-200 pl-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">
                          {edu.degree} {edu.fieldOfStudy && `in ${edu.fieldOfStudy}`}
                        </h4>
                        <p className="text-sm text-gray-600">{edu.institution}</p>
                        <p className="text-sm text-gray-500">
                          {edu.startDate} - {edu.endDate}
                          {edu.gpa && ` • GPA: ${edu.gpa}`}
                        </p>
                      </div>
                      {edu.description && (
                        <p className="mt-2 text-sm text-gray-700 whitespace-pre-wrap">
                          {edu.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Projects */}
          {parsedData.projects && parsedData.projects.length > 0 && (
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <HiCode className="h-5 w-5 mr-2" />
                  Projects
                </h3>
              </div>
              <div className="card-body">
                <div className="space-y-6">
                  {parsedData.projects.map((project, index) => (
                    <div key={index} className="border-l-4 border-success-200 pl-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">
                            {project.name}
                          </h4>
                          {project.startDate && project.endDate && (
                            <p className="text-sm text-gray-500">
                              {project.startDate} - {project.endDate}
                            </p>
                          )}
                        </div>
                        {project.link && (
                          <a
                            href={project.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary-600 hover:text-primary-700"
                          >
                            <HiLink className="h-4 w-4" />
                          </a>
                        )}
                      </div>
                      {project.description && (
                        <p className="mt-2 text-sm text-gray-700 whitespace-pre-wrap">
                          {project.description}
                        </p>
                      )}
                      {project.technologies && project.technologies.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {project.technologies.map((tech, techIndex) => (
                            <Badge key={techIndex} variant="secondary" size="sm">
                              {tech}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Links */}
          {(parsedData.linkedinLink || parsedData.githubLink) && (
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <HiLink className="h-5 w-5 mr-2" />
                  Links
                </h3>
              </div>
              <div className="card-body">
                <div className="space-y-2">
                  {parsedData.linkedinLink && (
                    <a
                      href={parsedData.linkedinLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-primary-600 hover:text-primary-700"
                    >
                      <HiLink className="h-4 w-4 mr-2" />
                      LinkedIn Profile
                    </a>
                  )}
                  {parsedData.githubLink && (
                    <a
                      href={parsedData.githubLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-primary-600 hover:text-primary-700"
                    >
                      <HiLink className="h-4 w-4 mr-2" />
                      GitHub Profile
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Languages */}
          {parsedData.languages && parsedData.languages.length > 0 && (
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-medium text-gray-900">Languages</h3>
              </div>
              <div className="card-body">
                <div className="flex flex-wrap gap-2">
                  {parsedData.languages.map((language, index) => (
                    <Badge key={index} variant="secondary">
                      {language}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Certifications */}
          {parsedData.certifications && parsedData.certifications.length > 0 && (
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-medium text-gray-900">Certifications</h3>
              </div>
              <div className="card-body">
                <ul className="space-y-2">
                  {parsedData.certifications.map((cert, index) => (
                    <li key={index} className="text-sm text-gray-900">
                      • {cert}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ResumeDetails;
