import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import {
  HiUser,
  HiMail,
  HiKey,
  HiSave,
  HiEye,
  HiEyeOff,
  HiCog,
  HiBell,
  HiShieldCheck,
  HiTrash,
  HiDownload,
  HiUpload,
  HiColorSwatch,
  HiGlobe,
  HiClock,
} from 'react-icons/hi';
import Button from '../../components/UI/Button';
import Input from '../../components/UI/Input';
import Badge from '../../components/UI/Badge';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import toast from 'react-hot-toast';

const Settings = () => {
  const { user, updateProfile, changePassword } = useAuth();
  const { t, changeLanguage } = useLanguage();
  const [activeTab, setActiveTab] = useState('profile');
  
  // Profile form state
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
  });
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Password form state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState({});

  // Preferences state
  const [preferences, setPreferences] = useState(() => {
    const saved = localStorage.getItem('userPreferences');
    return saved ? JSON.parse(saved) : {
      theme: 'light',
      language: 'en',
      notifications: {
        email: true,
        push: false,
        resumeUpdates: true,
        systemUpdates: false,
      },
      privacy: {
        profileVisibility: 'private',
        dataSharing: false,
      },
    };
  });
  const [isUpdatingPreferences, setIsUpdatingPreferences] = useState(false);

  // Update profile data when user changes
  useEffect(() => {
    if (user) {
      setProfileData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
      });
    }
  }, [user]);

  // Apply theme changes
  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    
    const applyTheme = (theme) => {
      if (theme === 'dark') {
        root.classList.add('dark');
        body.classList.add('dark');
      } else {
        // Default to light theme for 'light' and 'auto' modes
        root.classList.remove('dark');
        body.classList.remove('dark');
      }
    };

    applyTheme(preferences.theme);
  }, [preferences.theme]);

  // Save preferences to localStorage
  useEffect(() => {
    localStorage.setItem('userPreferences', JSON.stringify(preferences));
  }, [preferences]);

  // Early return if user is not loaded
  if (!user) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setIsUpdatingProfile(true);

    try {
      const result = await updateProfile(profileData);
      if (result && result.success) {
        toast.success('Profile updated successfully!');
      }
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear error when user starts typing
    if (passwordErrors[name]) {
      setPasswordErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validatePasswordForm = () => {
    const errors = {};

    if (!passwordData.currentPassword) {
      errors.currentPassword = 'Current password is required';
    }

    if (!passwordData.newPassword) {
      errors.newPassword = 'New password is required';
    } else if (passwordData.newPassword.length < 6) {
      errors.newPassword = 'Password must be at least 6 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(passwordData.newPassword)) {
      errors.newPassword = 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
    }

    if (!passwordData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (!validatePasswordForm()) {
      return;
    }

    setIsChangingPassword(true);

    try {
      const result = await changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      
      if (result && result.success) {
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
        toast.success('Password changed successfully!');
      }
    } catch (error) {
      console.error('Password change error:', error);
      toast.error('Failed to change password');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handlePreferenceChange = (section, key, value) => {
    setPreferences(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value,
      },
    }));
  };

  const handleThemeChange = (theme) => {
    setPreferences(prev => ({
      ...prev,
      theme: theme,
    }));
    toast.success(`Theme changed to ${theme}`);
  };

  const handleLanguageChange = (language) => {
    setPreferences(prev => ({
      ...prev,
      language: language,
    }));
    changeLanguage(language);
    toast.success(`Language changed to ${language === 'en' ? 'English' : language === 'es' ? 'Spanish' : 'French'}`);
  };

  const handlePreferencesSubmit = async (e) => {
    e.preventDefault();
    setIsUpdatingPreferences(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Preferences updated successfully!');
    } catch (error) {
      console.error('Preferences update error:', error);
      toast.error('Failed to update preferences');
    } finally {
      setIsUpdatingPreferences(false);
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handleExportData = () => {
    toast.success('Data export started. You will receive an email when ready.');
  };

  const handleDeleteAccount = () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      toast.error('Account deletion is not implemented yet.');
    }
  };

  const tabs = [
    { id: 'profile', name: 'Profile', icon: HiUser },
    { id: 'security', name: 'Security', icon: HiShieldCheck },
    { id: 'preferences', name: 'Preferences', icon: HiCog },
    { id: 'notifications', name: 'Notifications', icon: HiBell },
    { id: 'privacy', name: 'Privacy', icon: HiGlobe },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="mt-1 text-sm text-gray-600">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Navigation */}
        <div className="lg:w-64">
          <nav className="space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                    activeTab === tab.id
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div className="card">
                <div className="card-header">
                  <h3 className="text-lg font-medium text-gray-900 flex items-center">
                    <HiUser className="h-5 w-5 mr-2" />
                    Profile Information
                  </h3>
                </div>
                <div className="card-body">
                  <form onSubmit={handleProfileSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                      <Input
                        label="First Name"
                        name="firstName"
                        type="text"
                        value={profileData.firstName}
                        onChange={handleProfileChange}
                        required
                      />
                      
                      <Input
                        label="Last Name"
                        name="lastName"
                        type="text"
                        value={profileData.lastName}
                        onChange={handleProfileChange}
                        required
                      />
                    </div>

                    <Input
                      label="Email Address"
                      name="email"
                      type="email"
                      value={profileData.email}
                      onChange={handleProfileChange}
                      required
                      helperText="This will be used for login and notifications"
                    />

                    <div className="flex justify-end">
                      <Button
                        type="submit"
                        variant="primary"
                        loading={isUpdatingProfile}
                        disabled={isUpdatingProfile}
                      >
                        <HiSave className="h-4 w-4 mr-2" />
                        Save Changes
                      </Button>
                    </div>
                  </form>
                </div>
              </div>

              {/* Account Information */}
              <div className="card">
                <div className="card-header">
                  <h3 className="text-lg font-medium text-gray-900">Account Information</h3>
                </div>
                <div className="card-body">
                  <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Account Type</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        <Badge variant={user?.role === 'admin' ? 'primary' : 'secondary'}>
                          {user?.role === 'admin' ? 'Administrator' : 'User'}
                        </Badge>
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Member Since</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Last Login</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {user?.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Account Status</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        <Badge variant={user?.isActive ? 'success' : 'error'}>
                          {user?.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <div className="card">
                <div className="card-header">
                  <h3 className="text-lg font-medium text-gray-900 flex items-center">
                    <HiKey className="h-5 w-5 mr-2" />
                    Change Password
                  </h3>
                </div>
                <div className="card-body">
                  <form onSubmit={handlePasswordSubmit} className="space-y-6">
                    <div className="relative">
                      <Input
                        label="Current Password"
                        name="currentPassword"
                        type={showPasswords.current ? 'text' : 'password'}
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                        error={passwordErrors.currentPassword}
                        required
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => togglePasswordVisibility('current')}
                        style={{ top: '28px' }}
                      >
                        {showPasswords.current ? (
                          <HiEyeOff className="h-5 w-5 text-gray-400" />
                        ) : (
                          <HiEye className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                    </div>

                    <div className="relative">
                      <Input
                        label="New Password"
                        name="newPassword"
                        type={showPasswords.new ? 'text' : 'password'}
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        error={passwordErrors.newPassword}
                        required
                        helperText="Must contain uppercase, lowercase, and number"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => togglePasswordVisibility('new')}
                        style={{ top: '28px' }}
                      >
                        {showPasswords.new ? (
                          <HiEyeOff className="h-5 w-5 text-gray-400" />
                        ) : (
                          <HiEye className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                    </div>

                    <div className="relative">
                      <Input
                        label="Confirm New Password"
                        name="confirmPassword"
                        type={showPasswords.confirm ? 'text' : 'password'}
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        error={passwordErrors.confirmPassword}
                        required
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => togglePasswordVisibility('confirm')}
                        style={{ top: '28px' }}
                      >
                        {showPasswords.confirm ? (
                          <HiEyeOff className="h-5 w-5 text-gray-400" />
                        ) : (
                          <HiEye className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                    </div>

                    <div className="flex justify-end">
                      <Button
                        type="submit"
                        variant="primary"
                        loading={isChangingPassword}
                        disabled={isChangingPassword}
                      >
                        <HiKey className="h-4 w-4 mr-2" />
                        Change Password
                      </Button>
                    </div>
                  </form>
                </div>
              </div>

              {/* Data Management */}
              <div className="card">
                <div className="card-header">
                  <h3 className="text-lg font-medium text-gray-900">Data Management</h3>
                </div>
                <div className="card-body">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">Export Data</h4>
                        <p className="text-sm text-gray-600">Download all your data in JSON format</p>
                      </div>
                      <Button variant="secondary" onClick={handleExportData}>
                        <HiDownload className="h-4 w-4 mr-2" />
                        Export
                      </Button>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
                      <div>
                        <h4 className="text-sm font-medium text-red-900">Delete Account</h4>
                        <p className="text-sm text-red-600">Permanently delete your account and all data</p>
                      </div>
                      <Button variant="error" onClick={handleDeleteAccount}>
                        <HiTrash className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Preferences Tab */}
          {activeTab === 'preferences' && (
            <div className="space-y-6">
              <div className="card">
                <div className="card-header">
                  <h3 className="text-lg font-medium text-gray-900 flex items-center">
                    <HiCog className="h-5 w-5 mr-2" />
                    General Preferences
                  </h3>
                </div>
                <div className="card-body">
                  <form onSubmit={handlePreferencesSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Theme
                        </label>
                        <select
                          value={preferences.theme}
                          onChange={(e) => handleThemeChange(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                          <option value="light">Light</option>
                          <option value="dark">Dark</option>
                          <option value="auto">Auto</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Language
                        </label>
                        <select
                          value={preferences.language}
                          onChange={(e) => handleLanguageChange(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                          <option value="en">English</option>
                          <option value="es">Spanish</option>
                          <option value="fr">French</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button
                        type="submit"
                        variant="primary"
                        loading={isUpdatingPreferences}
                        disabled={isUpdatingPreferences}
                      >
                        <HiSave className="h-4 w-4 mr-2" />
                        Save Preferences
                      </Button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div className="card">
                <div className="card-header">
                  <h3 className="text-lg font-medium text-gray-900 flex items-center">
                    <HiBell className="h-5 w-5 mr-2" />
                    Notification Settings
                  </h3>
                </div>
                <div className="card-body">
                  <form onSubmit={handlePreferencesSubmit} className="space-y-6">
                    <div className="space-y-4">
                      {Object.entries(preferences.notifications).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between">
                          <div>
                            <h4 className="text-sm font-medium text-gray-900 capitalize">
                              {key.replace(/([A-Z])/g, ' $1').trim()}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {key === 'email' && 'Receive notifications via email'}
                              {key === 'push' && 'Receive push notifications'}
                              {key === 'resumeUpdates' && 'Get notified when resume processing is complete'}
                              {key === 'systemUpdates' && 'Receive system updates and announcements'}
                            </p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={value}
                              onChange={(e) => handlePreferenceChange('notifications', key, e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                          </label>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-end">
                      <Button
                        type="submit"
                        variant="primary"
                        loading={isUpdatingPreferences}
                        disabled={isUpdatingPreferences}
                      >
                        <HiSave className="h-4 w-4 mr-2" />
                        Save Notifications
                      </Button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* Privacy Tab */}
          {activeTab === 'privacy' && (
            <div className="space-y-6">
              <div className="card">
                <div className="card-header">
                  <h3 className="text-lg font-medium text-gray-900 flex items-center">
                    <HiGlobe className="h-5 w-5 mr-2" />
                    Privacy Settings
                  </h3>
                </div>
                <div className="card-body">
                  <form onSubmit={handlePreferencesSubmit} className="space-y-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Profile Visibility
                        </label>
                        <select
                          value={preferences.privacy.profileVisibility}
                          onChange={(e) => handlePreferenceChange('privacy', 'profileVisibility', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                          <option value="private">Private</option>
                          <option value="public">Public</option>
                          <option value="friends">Friends Only</option>
                        </select>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">Data Sharing</h4>
                          <p className="text-sm text-gray-600">
                            Allow sharing of anonymized data for product improvement
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={preferences.privacy.dataSharing}
                            onChange={(e) => handlePreferenceChange('privacy', 'dataSharing', e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                        </label>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button
                        type="submit"
                        variant="primary"
                        loading={isUpdatingPreferences}
                        disabled={isUpdatingPreferences}
                      >
                        <HiSave className="h-4 w-4 mr-2" />
                        Save Privacy Settings
                      </Button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
