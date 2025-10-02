import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { resumeAPI, formatFileSize, formatDate } from '../../services/api';
import {
  HiSearch,
  HiFilter,
  HiDocumentText,
  HiDownload,
  HiTrash,
  HiEye,
  HiRefresh,
} from 'react-icons/hi';
import Button from '../../components/UI/Button';
import Input from '../../components/UI/Input';
import Badge from '../../components/UI/Badge';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

const ResumeHistory = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const { data, isLoading, error, refetch } = useQuery(
    ['resumeHistory', currentPage, itemsPerPage, statusFilter, searchTerm],
    () => resumeAPI.getHistory({
      page: currentPage,
      limit: itemsPerPage,
      status: statusFilter || undefined,
      search: searchTerm || undefined,
    }),
    {
      keepPreviousData: true,
      staleTime: 2 * 60 * 1000, // 2 minutes
    }
  );

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    refetch();
  };

  const handleStatusFilter = (status) => {
    setStatusFilter(status === statusFilter ? '' : status);
    setCurrentPage(1);
  };

  const handleDeleteResume = async (resumeId, fileName) => {
    if (!window.confirm(`Are you sure you want to delete "${fileName}"?`)) {
      return;
    }

    try {
      await resumeAPI.deleteResume(resumeId);
      toast.success('Resume deleted successfully');
      refetch();
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete resume');
    }
  };

  const handleExportResume = async (resumeId, fileName) => {
    try {
      const response = await resumeAPI.exportResume(resumeId, true);
      const blob = new Blob([response.data], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${fileName}.json`;
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

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return '✅';
      case 'processing':
        return '⏳';
      case 'failed':
        return '❌';
      default:
        return '📄';
    }
  };

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-error-600 mb-4">
          <HiDocumentText className="mx-auto h-12 w-12" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Error loading resumes
        </h3>
        <p className="text-gray-600 mb-4">
          {error.response?.data?.message || 'Something went wrong'}
        </p>
        <Button variant="primary" onClick={() => refetch()}>
          <HiRefresh className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Resume History</h1>
          <p className="mt-1 text-sm text-gray-600">
            View and manage all your uploaded resumes
          </p>
        </div>
        <Link to="/upload">
          <Button variant="primary">
            Upload New Resume
          </Button>
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="card">
        <div className="card-body">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <form onSubmit={handleSearch} className="flex-1">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search by filename, name, email, or skills..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
                <HiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
            </form>

            {/* Status Filter */}
            <div className="flex flex-wrap gap-2">
              <Button
                variant={statusFilter === '' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => handleStatusFilter('')}
              >
                All
              </Button>
              <Button
                variant={statusFilter === 'completed' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => handleStatusFilter('completed')}
              >
                Completed
              </Button>
              <Button
                variant={statusFilter === 'processing' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => handleStatusFilter('processing')}
              >
                Processing
              </Button>
              <Button
                variant={statusFilter === 'failed' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => handleStatusFilter('failed')}
              >
                Failed
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Resume List */}
      <div className="card">
        <div className="card-header">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">
              Resumes ({data?.pagination?.totalResumes || 0})
            </h3>
            <Button variant="ghost" size="sm" onClick={() => refetch()}>
              <HiRefresh className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        <div className="card-body p-0">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : data?.resumes?.length > 0 ? (
            <>
              {/* Desktop Table */}
              <div className="hidden sm:block responsive-table">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Resume
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Size
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Uploaded
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {data.resumes.map((resume) => (
                      <tr key={resume.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className="text-lg mr-3">
                              {getStatusIcon(resume.processingStatus)}
                            </span>
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {resume.originalFileName}
                              </div>
                              {resume.parsedData?.fullName && (
                                <div className="text-sm text-gray-500">
                                  {resume.parsedData.fullName}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(resume.processingStatus)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatFileSize(resume.fileSize || 0)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(resume.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <Link to={`/resume/${resume.id}`}>
                              <Button variant="ghost" size="sm">
                                <HiEye className="h-4 w-4" />
                              </Button>
                            </Link>
                            {resume.processingStatus === 'completed' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleExportResume(resume.id, resume.originalFileName)}
                              >
                                <HiDownload className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteResume(resume.id, resume.originalFileName)}
                            >
                              <HiTrash className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="sm:hidden space-y-4 p-6">
                {data.resumes.map((resume) => (
                  <div
                    key={resume.id}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-lg">
                          {getStatusIcon(resume.processingStatus)}
                        </span>
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">
                            {resume.originalFileName}
                          </h4>
                          {resume.parsedData?.fullName && (
                            <p className="text-sm text-gray-600">
                              {resume.parsedData.fullName}
                            </p>
                          )}
                        </div>
                      </div>
                      {getStatusBadge(resume.processingStatus)}
                    </div>

                    <div className="mt-3 text-sm text-gray-500">
                      <p>Size: {formatFileSize(resume.fileSize || 0)}</p>
                      <p>Uploaded: {formatDate(resume.createdAt)}</p>
                    </div>

                    <div className="mt-4 flex justify-end space-x-2">
                      <Link to={`/resume/${resume.id}`}>
                        <Button variant="ghost" size="sm">
                          <HiEye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </Link>
                      {resume.processingStatus === 'completed' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleExportResume(resume.id, resume.originalFileName)}
                        >
                          <HiDownload className="h-4 w-4 mr-1" />
                          Export
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteResume(resume.id, resume.originalFileName)}
                      >
                        <HiTrash className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {data.pagination && data.pagination.totalPages > 1 && (
                <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                  <div className="flex-1 flex justify-between sm:hidden">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={!data.pagination.hasPrev}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setCurrentPage(prev => prev + 1)}
                      disabled={!data.pagination.hasNext}
                    >
                      Next
                    </Button>
                  </div>
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        Showing{' '}
                        <span className="font-medium">
                          {(currentPage - 1) * itemsPerPage + 1}
                        </span>{' '}
                        to{' '}
                        <span className="font-medium">
                          {Math.min(currentPage * itemsPerPage, data.pagination.totalResumes)}
                        </span>{' '}
                        of{' '}
                        <span className="font-medium">
                          {data.pagination.totalResumes}
                        </span>{' '}
                        results
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={!data.pagination.hasPrev}
                      >
                        Previous
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setCurrentPage(prev => prev + 1)}
                        disabled={!data.pagination.hasNext}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <HiDocumentText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No resumes found
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || statusFilter
                  ? 'Try adjusting your search or filter criteria.'
                  : 'Get started by uploading your first resume.'}
              </p>
              <div className="mt-6">
                <Link to="/upload">
                  <Button variant="primary">
                    Upload Resume
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResumeHistory;
