import React from 'react';
import { useQuery } from 'react-query';
import { adminAPI } from '../../services/api';
import {
  HiUsers,
  HiDocumentText,
  HiCheckCircle,
  HiClock,
  HiXCircle,
  HiChartBar,
  HiTrendingUp,
  HiServer,
} from 'react-icons/hi';
import Button from '../../components/UI/Button';
import LoadingSpinner from '../../components/UI/LoadingSpinner';

const AdminDashboard = () => {
  const { data: stats, isLoading, error } = useQuery(
    'adminStats',
    () => adminAPI.getStats(),
    {
      refetchInterval: 30000, // Refresh every 30 seconds
    }
  );

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-error-600 mb-4">
          <HiChartBar className="mx-auto h-12 w-12" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Error loading statistics
        </h3>
        <p className="text-gray-600 mb-4">
          {error.response?.data?.message || 'Something went wrong'}
        </p>
        <Button variant="primary" onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </div>
    );
  }

  const systemStats = [
    {
      name: 'Total Users',
      value: stats?.users?.total || 0,
      icon: HiUsers,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      change: stats?.users?.recent || 0,
      changeLabel: 'New this month',
    },
    {
      name: 'Total Resumes',
      value: stats?.resumes?.total || 0,
      icon: HiDocumentText,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      change: stats?.resumes?.recent || 0,
      changeLabel: 'New this month',
    },
    {
      name: 'Completed',
      value: stats?.resumes?.completed || 0,
      icon: HiCheckCircle,
      color: 'text-success-600',
      bgColor: 'bg-success-100',
      change: Math.round(((stats?.resumes?.completed || 0) / (stats?.resumes?.total || 1)) * 100),
      changeLabel: 'Success rate',
    },
    {
      name: 'Processing',
      value: stats?.resumes?.processing || 0,
      icon: HiClock,
      color: 'text-warning-600',
      bgColor: 'bg-warning-100',
      change: stats?.resumes?.processing || 0,
      changeLabel: 'Currently processing',
    },
    {
      name: 'Failed',
      value: stats?.resumes?.failed || 0,
      icon: HiXCircle,
      color: 'text-error-600',
      bgColor: 'bg-error-100',
      change: Math.round(((stats?.resumes?.failed || 0) / (stats?.resumes?.total || 1)) * 100),
      changeLabel: 'Failure rate',
    },
  ];

  const formatUptime = (seconds) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${minutes}m`;
  };

  const formatMemoryUsage = (bytes) => {
    const mb = bytes / 1024 / 1024;
    return `${mb.toFixed(2)} MB`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="mt-1 text-sm text-gray-600">
          System overview and analytics
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {systemStats.map((stat) => (
          <div key={stat.name} className="card">
            <div className="card-body">
              <div className="flex items-center">
                <div className={`flex-shrink-0 ${stat.bgColor} rounded-lg p-3`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    {stat.name}
                  </p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {stat.value}
                  </p>
                  <p className="text-xs text-gray-500">
                    {stat.changeLabel}: {stat.change}
                    {stat.changeLabel.includes('rate') && '%'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="card">
          <div className="card-body text-center">
            <div className="mx-auto h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <HiUsers className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              Manage Users
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              View and manage user accounts
            </p>
            <div className="mt-4">
              <Button
                variant="primary"
                size="sm"
                onClick={() => window.location.href = '/admin/users'}
              >
                View Users
              </Button>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body text-center">
            <div className="mx-auto h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
              <HiDocumentText className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              Manage Resumes
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              View and manage all resumes
            </p>
            <div className="mt-4">
              <Button
                variant="primary"
                size="sm"
                onClick={() => window.location.href = '/admin/resumes'}
              >
                View Resumes
              </Button>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body text-center">
            <div className="mx-auto h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <HiTrendingUp className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              System Health
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              Monitor system performance
            </p>
            <div className="mt-4">
              <Button variant="secondary" size="sm" onClick={() => window.location.reload()}>
                Refresh Stats
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* System Information */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* System Stats */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900">System Information</h3>
          </div>
          <div className="card-body">
            <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-gray-500">Uptime</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {formatUptime(stats?.system?.uptime || 0)}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Node Version</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {stats?.system?.nodeVersion || 'Unknown'}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Memory Usage</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {formatMemoryUsage(stats?.system?.memoryUsage?.heapUsed || 0)}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Environment</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {process.env.NODE_ENV || 'development'}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
          </div>
          <div className="card-body">
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <HiUsers className="h-4 w-4 text-blue-600" />
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">
                    {stats?.users?.recent || 0} new users this month
                  </p>
                  <p className="text-sm text-gray-500">
                    User registration activity
                  </p>
                </div>
              </div>

              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                    <HiDocumentText className="h-4 w-4 text-green-600" />
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">
                    {stats?.resumes?.recent || 0} new resumes this month
                  </p>
                  <p className="text-sm text-gray-500">
                    Resume upload activity
                  </p>
                </div>
              </div>

              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <HiServer className="h-4 w-4 text-purple-600" />
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">
                    System running smoothly
                  </p>
                  <p className="text-sm text-gray-500">
                    All services operational
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
