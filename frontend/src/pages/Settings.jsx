import React, { useState, useEffect } from 'react';
import { userService } from '../services/api';
import { useAuth } from '../utils/AuthContext';
import './Settings.css';

const Settings = () => {
  const { user, logout } = useAuth();
  const [profileData, setProfileData] = useState({
    username: '',
    email: '',
    currency: 'INR',
    language: 'en',
    monthlyBudget: 0
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState({
    profile: false,
    password: false
  });
  const [message, setMessage] = useState({
    type: '',
    text: ''
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        username: user.username || '',
        email: user.email || '',
        currency: user.currency || 'INR',
        language: user.language || 'en',
        monthlyBudget: user.monthlyBudget || 0
      });
    }
  }, [user]);

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(prev => ({ ...prev, profile: true }));

    try {
      await userService.updateProfile(profileData);
      showMessage('success', 'Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      showMessage('error', error.response?.data?.message || 'Error updating profile');
    } finally {
      setLoading(prev => ({ ...prev, profile: false }));
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showMessage('error', 'New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      showMessage('error', 'Password must be at least 6 characters long');
      return;
    }

    setLoading(prev => ({ ...prev, password: true }));

    try {
      await userService.updatePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      showMessage('success', 'Password updated successfully!');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      console.error('Error updating password:', error);
      showMessage('error', error.response?.data?.message || 'Error updating password');
    } finally {
      setLoading(prev => ({ ...prev, password: false }));
    }
  };

  const handleDeleteAccount = () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently lost.')) {
      alert('Account deletion would be processed here. In a real app, this would call your API.');
      // In a real app: await userService.deleteAccount();
      logout();
    }
  };

  const handleInputChange = (setter) => (e) => {
    const { name, value, type } = e.target;
    setter(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    }));
  };

  return (
    <div className="settings-container">
      <div className="settings-header">
        <h1>Settings</h1>
        <p>Manage your account preferences and settings</p>
      </div>

      {message.text && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="settings-content">
        {/* Profile Settings */}
        <div className="settings-section">
          <div className="section-header">
            <h2>Profile Settings</h2>
            <p>Update your personal information</p>
          </div>
          
          <form onSubmit={handleProfileUpdate} className="settings-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="username">Username</label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={profileData.username}
                  onChange={handleInputChange(setProfileData)}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={profileData.email}
                  onChange={handleInputChange(setProfileData)}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="monthlyBudget">Monthly Budget (₹)</label>
                <input
                  type="number"
                  id="monthlyBudget"
                  name="monthlyBudget"
                  value={profileData.monthlyBudget}
                  onChange={handleInputChange(setProfileData)}
                  min="0"
                  step="100"
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={loading.profile}
            >
              {loading.profile ? 'Updating...' : 'Save Changes'}
            </button>
          </form>
        </div>

        {/* Account Settings */}
        <div className="settings-section">
          <div className="section-header">
            <h2>Account Security</h2>
            <p>Change your password</p>
          </div>
          
          <form onSubmit={handlePasswordUpdate} className="settings-form">
            <div className="form-group">
              <label htmlFor="currentPassword">Current Password</label>
              <input
                type="password"
                id="currentPassword"
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={handleInputChange(setPasswordData)}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="newPassword">New Password</label>
              <input
                type="password"
                id="newPassword"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handleInputChange(setPasswordData)}
                required
                minLength="6"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm New Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handleInputChange(setPasswordData)}
                required
                minLength="6"
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={loading.password}
            >
              {loading.password ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>

        {/* Preferences */}
        <div className="settings-section">
          <div className="section-header">
            <h2>Preferences</h2>
            <p>Customize your experience</p>
          </div>
          
          <form onSubmit={handleProfileUpdate} className="settings-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="currency">Currency</label>
                <select
                  id="currency"
                  name="currency"
                  value={profileData.currency}
                  onChange={handleInputChange(setProfileData)}
                >
                  <option value="INR">Indian Rupee (₹)</option>
                  <option value="USD">US Dollar ($)</option>
                  <option value="EUR">Euro (€)</option>
                  <option value="GBP">British Pound (£)</option>
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="language">Language</label>
                <select
                  id="language"
                  name="language"
                  value={profileData.language}
                  onChange={handleInputChange(setProfileData)}
                >
                  <option value="en">English</option>
                  <option value="hi">Hindi</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                </select>
              </div>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={loading.profile}
            >
              {loading.profile ? 'Saving...' : 'Save Preferences'}
            </button>
          </form>
        </div>

        {/* Danger Zone */}
        <div className="settings-section danger-zone">
          <div className="section-header">
            <h2>Danger Zone</h2>
            <p>Irreversible and destructive actions</p>
          </div>
          
          <div className="danger-actions">
            <div className="danger-action">
              <div className="danger-info">
                <h3>Delete Account</h3>
                <p>Permanently delete your account and all associated data. This action cannot be undone.</p>
              </div>
              <button 
                onClick={handleDeleteAccount}
                className="btn btn-danger"
              >
                Delete Account
              </button>
            </div>
            
            <div className="danger-action">
              <div className="danger-info">
                <h3>Export Data</h3>
                <p>Download all your transactions and account data as a CSV file.</p>
              </div>
              <button 
                onClick={() => alert('Data export would be implemented here')}
                className="btn btn-secondary"
              >
                Export Data
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;