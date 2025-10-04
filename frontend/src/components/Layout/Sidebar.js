import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  HiHome,
  HiUpload,
  HiDocumentText,
  HiUsers,
  HiX,
  HiAdjustments,
  HiShieldCheck,
  HiChartBar,
  HiDocumentDuplicate,
} from 'react-icons/hi';
import clsx from 'clsx';

const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const location = useLocation();

  const navigation = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: HiHome,
    },
    {
      name: 'Upload Resume',
      href: '/upload',
      icon: HiUpload,
    },
    {
      name: 'Resume History',
      href: '/history',
      icon: HiDocumentText,
    },
    {
      name: 'Settings',
      href: '/settings',
      icon: HiAdjustments,
    },
  ];

  const adminNavigation = [
    {
      name: 'Admin Dashboard',
      href: '/admin',
      icon: HiChartBar,
    },
    {
      name: 'Manage Users',
      href: '/admin/users',
      icon: HiUsers,
    },
    {
      name: 'Manage Resumes',
      href: '/admin/resumes',
      icon: HiDocumentDuplicate,
    },
  ];

  const NavItem = ({ item }) => (
    <NavLink
      to={item.href}
      className={({ isActive }) =>
        clsx(
          'group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors duration-200',
          isActive
            ? 'bg-primary-100 dark:bg-primary-900 text-primary-900 dark:text-primary-100'
            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
        )
      }
      onClick={onClose}
    >
      <item.icon
        className={        clsx(
          'mr-3 h-5 w-5 flex-shrink-0',
          location.pathname === item.href
            ? 'text-primary-500 dark:text-primary-400'
            : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-500 dark:group-hover:text-gray-400'
        )}
      />
      {item.name}
    </NavLink>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col lg:bg-white dark:lg:bg-gray-800 lg:border-r lg:border-gray-200 dark:lg:border-gray-700">
        <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto">
          {/* Logo */}
          <div className="flex items-center flex-shrink-0 px-4">
            <div className="h-8 w-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <HiDocumentText className="h-5 w-5 text-white" />
            </div>
            <span className="ml-2 text-lg font-semibold text-gray-900 dark:text-white">
              Resume Parser
            </span>
          </div>

          {/* Navigation */}
          <nav className="mt-8 flex-1 px-2 space-y-1">
            {navigation.map((item) => (
              <NavItem key={item.name} item={item} />
            ))}

            {/* Admin section */}
            {user?.role === 'admin' && (
              <>
                <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center px-2 mb-2">
                    <HiShieldCheck className="h-4 w-4 text-gray-400 dark:text-gray-500 mr-2" />
                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Admin
                    </span>
                  </div>
                  {adminNavigation.map((item) => (
                    <NavItem key={item.name} item={item} />
                  ))}
                </div>
              </>
            )}
          </nav>
        </div>
      </div>

      {/* Mobile sidebar */}
      <div
        className={clsx(
          'fixed inset-0 z-50 lg:hidden',
          isOpen ? 'block' : 'hidden'
        )}
      >
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={onClose} />
        
        <div className="relative flex w-full max-w-xs flex-1 flex-col bg-white dark:bg-gray-800">
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              type="button"
              className="ml-1 flex h-10 w-10 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={onClose}
            >
              <HiX className="h-6 w-6 text-white" />
            </button>
          </div>

          <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto">
            {/* Logo */}
            <div className="flex items-center flex-shrink-0 px-4">
              <div className="h-8 w-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <HiDocumentText className="h-5 w-5 text-white" />
              </div>
              <span className="ml-2 text-lg font-semibold text-gray-900 dark:text-white">
                Resume Parser
              </span>
            </div>

            {/* Navigation */}
            <nav className="mt-8 flex-1 px-2 space-y-1">
              {navigation.map((item) => (
                <NavItem key={item.name} item={item} />
              ))}

              {/* Admin section */}
              {user?.role === 'admin' && (
                <>
                  <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center px-2 mb-2">
                      <HiShieldCheck className="h-4 w-4 text-gray-400 dark:text-gray-500 mr-2" />
                      <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Admin
                      </span>
                    </div>
                    {adminNavigation.map((item) => (
                      <NavItem key={item.name} item={item} />
                    ))}
                  </div>
                </>
              )}
            </nav>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
