import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { adminAPI, formatDate } from '../../services/api';
import {
  HiSearch,
  HiUsers,
  HiTrash,
  HiRefresh,
  HiUser,
  HiShieldCheck,
} from 'react-icons/hi';
import Button from '../../components/UI/Button';
import Input from '../../components/UI/Input';
import Badge from '../../components/UI/Badge';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import toast from 'react-hot-toast';

const AdminUsers = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const { data, isLoading, error, refetch } = useQuery(
    ['adminUsers', currentPage, itemsPerPage, roleFilter, statusFilter, searchTerm],
    () => adminAPI.getUsers({
      page: currentPage,
      limit: itemsPerPage,
      role: roleFilter || undefined,
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

  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`Are you sure you want to delete user "${userName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await adminAPI.deleteUser(userId);
      toast.success('User deleted successfully');
      refetch();
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete user');
    }
  };

  const handleToggleUserStatus = async (userId, isActive, userName) => {
    try {
      await adminAPI.updateUser(userId, { isActive: !isActive });
      toast.success(`User ${!isActive ? 'activated' : 'deactivated'} successfully`);
      refetch();
    } catch (error) {
      console.error('Update error:', error);
      toast.error('Failed to update user status');
    }
  };

  const handleToggleUserRole = async (userId, currentRole, userName) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    
    if (!window.confirm(`Are you sure you want to change "${userName}" role to ${newRole}?`)) {
      return;
    }

    try {
      await adminAPI.updateUser(userId, { role: newRole });
      toast.success(`User role changed to ${newRole} successfully`);
      refetch();
    } catch (error) {
      console.error('Update error:', error);
      toast.error('Failed to update user role');
    }
  };

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-error-600 mb-4">
          <HiUsers className="mx-auto h-12 w-12" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Error loading users
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
          <h1 className="text-2xl font-bold text-gray-900">Manage Users</h1>
          <p className="mt-1 text-sm text-gray-600">
            View and manage user accounts
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={() => refetch()}>
          <HiRefresh className="h-4 w-4 mr-2" />
          Refresh
        </Button>
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
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
                <HiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
            </form>

            {/* Role Filter */}
            <div className="flex flex-wrap gap-2">
              <Button
                variant={roleFilter === '' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setRoleFilter('')}
              >
                All Roles
              </Button>
              <Button
                variant={roleFilter === 'user' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setRoleFilter('user')}
              >
                Users
              </Button>
              <Button
                variant={roleFilter === 'admin' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setRoleFilter('admin')}
              >
                Admins
              </Button>
            </div>

            {/* Status Filter */}
            <div className="flex flex-wrap gap-2">
              <Button
                variant={statusFilter === '' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setStatusFilter('')}
              >
                All Status
              </Button>
              <Button
                variant={statusFilter === 'active' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setStatusFilter('active')}
              >
                Active
              </Button>
              <Button
                variant={statusFilter === 'inactive' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setStatusFilter('inactive')}
              >
                Inactive
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Users List */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-medium text-gray-900">
            Users ({data?.pagination?.totalUsers || 0})
          </h3>
        </div>

        <div className="card-body p-0">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : data?.users?.length > 0 ? (
            <>
              {/* Desktop Table */}
              <div className="hidden sm:block responsive-table">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Joined
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Last Active
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {data.users.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 flex-shrink-0">
                              <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                                <span className="text-sm font-medium text-primary-600">
                                  {user.firstName?.[0]}{user.lastName?.[0]}
                                </span>
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {user.firstName} {user.lastName}
                              </div>
                              <div className="text-sm text-gray-500">{user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {user.role === 'admin' ? (
                              <Badge variant="primary">
                                <HiShieldCheck className="h-3 w-3 mr-1" />
                                Admin
                              </Badge>
                            ) : (
                              <Badge variant="secondary">
                                <HiUser className="h-3 w-3 mr-1" />
                                User
                              </Badge>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge variant={user.isActive ? 'success' : 'error'}>
                            {user.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(user.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.lastLogin ? formatDate(user.lastLogin) : 'Never'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleToggleUserStatus(user.id, user.isActive, `${user.firstName} ${user.lastName}`)}
                            >
                              {user.isActive ? 'Deactivate' : 'Activate'}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleToggleUserRole(user.id, user.role, `${user.firstName} ${user.lastName}`)}
                            >
                              {user.role === 'admin' ? 'Remove Admin' : 'Make Admin'}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteUser(user.id, `${user.firstName} ${user.lastName}`)}
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
                {data.users.map((user) => (
                  <div
                    key={user.id}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                          <span className="text-sm font-medium text-primary-600">
                            {user.firstName?.[0]}{user.lastName?.[0]}
                          </span>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">
                            {user.firstName} {user.lastName}
                          </h4>
                          <p className="text-sm text-gray-600">{user.email}</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end space-y-1">
                        {user.role === 'admin' ? (
                          <Badge variant="primary" size="sm">
                            Admin
                          </Badge>
                        ) : (
                          <Badge variant="secondary" size="sm">
                            User
                          </Badge>
                        )}
                        <Badge variant={user.isActive ? 'success' : 'error'} size="sm">
                          {user.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </div>

                    <div className="mt-3 text-sm text-gray-500">
                      <p>Joined: {formatDate(user.createdAt)}</p>
                      <p>Last Active: {user.lastLogin ? formatDate(user.lastLogin) : 'Never'}</p>
                    </div>

                    <div className="mt-4 flex justify-end space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleUserStatus(user.id, user.isActive, `${user.firstName} ${user.lastName}`)}
                      >
                        {user.isActive ? 'Deactivate' : 'Activate'}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleUserRole(user.id, user.role, `${user.firstName} ${user.lastName}`)}
                      >
                        {user.role === 'admin' ? 'Remove Admin' : 'Make Admin'}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteUser(user.id, `${user.firstName} ${user.lastName}`)}
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
                          {Math.min(currentPage * itemsPerPage, data.pagination.totalUsers)}
                        </span>{' '}
                        of{' '}
                        <span className="font-medium">
                          {data.pagination.totalUsers}
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
              <HiUsers className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No users found
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || roleFilter || statusFilter
                  ? 'Try adjusting your search or filter criteria.'
                  : 'No users have registered yet.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;
