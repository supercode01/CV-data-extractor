import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { useAuth } from '../../contexts/AuthContext';
import { resumeAPI } from '../../services/api';
import {
  HiUpload,
  HiDocumentText,
  HiChartBar,
  HiClock,
  HiCheckCircle,
  HiExclamationCircle,
  HiXCircle,
} from 'react-icons/hi';
import Button from '../../components/UI/Button';
import Badge from '../../components/UI/Badge';
import LoadingSpinner from '../../components/UI/LoadingSpinner';

const Dashboard = () => {
  const { user } = useAuth();

  // Fetch recent resumes
  const { data: resumeData, isLoading } = useQuery(
    'recentResumes',
    () => resumeAPI.getHistory({ limit: 5 }),
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <HiCheckCircle className="h-5 w-5 text-success-500" />;
      case 'processing':
        return <HiClock className="h-5 w-5 text-warning-500" />;
      case 'failed':
        return <HiXCircle className="h-5 w-5 text-error-500" />;
      default:
        return <HiExclamationCircle className="h-5 w-5 text-gray-400" />;
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

  const stats = [
    {
      name: 'Total Resumes',
      value: resumeData?.pagination?.totalResumes || 0,
      icon: HiDocumentText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      name: 'Completed',
      value: resumeData?.resumes?.filter(r => r.processingStatus === 'completed').length || 0,
      icon: HiCheckCircle,
      color: 'text-success-600',
      bgColor: 'bg-success-100',
    },
    {
      name: 'Processing',
      value: resumeData?.resumes?.filter(r => r.processingStatus === 'processing').length || 0,
      icon: HiClock,
      color: 'text-warning-600',
      bgColor: 'bg-warning-100',
    },
    {
      name: 'Failed',
      value: resumeData?.resumes?.filter(r => r.processingStatus === 'failed').length || 0,
      icon: HiXCircle,
      color: 'text-error-600',
      bgColor: 'bg-error-100',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Welcome back, {user?.firstName}!
        </h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Manage your resumes and track parsing progress.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link to="/upload" className="group">
          <div className="card hover:shadow-medium transition-shadow duration-200">
            <div className="card-body text-center">
              <div className="mx-auto h-12 w-12 bg-primary-100 rounded-lg flex items-center justify-center group-hover:bg-primary-200 transition-colors">
                <HiUpload className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
                Upload Resume
              </h3>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Upload a new resume for AI-powered parsing
              </p>
            </div>
          </div>
        </Link>

        <Link to="/history" className="group">
          <div className="card hover:shadow-medium transition-shadow duration-200">
            <div className="card-body text-center">
              <div className="mx-auto h-12 w-12 bg-secondary-100 rounded-lg flex items-center justify-center group-hover:bg-secondary-200 transition-colors">
                <HiDocumentText className="h-6 w-6 text-secondary-600" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
                Resume History
              </h3>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                View all your uploaded and parsed resumes
              </p>
            </div>
          </div>
        </Link>

        {user?.role === 'admin' && (
          <Link to="/admin" className="group">
            <div className="card hover:shadow-medium transition-shadow duration-200">
              <div className="card-body text-center">
                <div className="mx-auto h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                  <HiChartBar className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
                  Admin Panel
                </h3>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  Manage users and system analytics
                </p>
              </div>
            </div>
          </Link>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.name} className="card">
            <div className="card-body">
              <div className="flex items-center">
                <div className={`flex-shrink-0 ${stat.bgColor} rounded-lg p-3`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {stat.name}
                  </p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {stat.value}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Resumes */}
      <div className="card">
        <div className="card-header">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Recent Resumes
            </h3>
            <Link to="/history">
              <Button variant="ghost" size="sm">
                View all
              </Button>
            </Link>
          </div>
        </div>
        
        <div className="card-body">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner size="lg" />
            </div>
          ) : resumeData?.resumes?.length > 0 ? (
            <div className="space-y-4">
              {resumeData.resumes.map((resume) => (
                <div
                  key={resume.id}
                  className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    {getStatusIcon(resume.processingStatus)}
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                        {resume.originalFileName}
                      </h4>
                      {resume.parsedData?.fullName && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {resume.parsedData.fullName}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    {getStatusBadge(resume.processingStatus)}
                    <Link to={`/resume/${resume.id}`}>
                      <Button variant="ghost" size="sm">
                        View
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <HiDocumentText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                No resumes yet
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Get started by uploading your first resume.
              </p>
              <div className="mt-6">
                <Link to="/upload">
                  <Button variant="primary">
                    <HiUpload className="h-4 w-4 mr-2" />
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

export default Dashboard;
