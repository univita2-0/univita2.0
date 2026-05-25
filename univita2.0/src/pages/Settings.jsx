// src/pages/Settings.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { User, Lock, Bell, Eye, EyeOff, Shield, Key } from 'lucide-react';
import './Settings.css';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Profile form
  const [profileData, setProfileData] = useState({
    full_name: '',
    email: '',
    phone: '',
  });

  // Password change
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  // PIN change (only for admin/hr)
  const [pinData, setPinData] = useState({
    currentPin: '',
    newPin: '',
    confirmPin: '',
  });
  const [pinError, setPinError] = useState('');
  const [showPinChange, setShowPinChange] = useState(false);

  // Preferences (stored in localStorage)
  const [preferences, setPreferences] = useState({
    emailAlerts: true,
    emergencyAlerts: true,
    leaveUpdates: true,
    darkMode: false,
  });

  const token = localStorage.getItem('auth_token');
  const userRole = localStorage.getItem('user_role');
  const canChangePin = userRole === 'admin' || userRole === 'hr_admin';

  const authAxios = axios.create({
    baseURL: API_BASE,
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  // Load user data
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
    if (storedUser.id) {
      setUser(storedUser);
      setProfileData({
        full_name: storedUser.full_name || '',
        email: storedUser.email || '',
        phone: storedUser.phone || '',
      });
    }
    // Load preferences from localStorage
    const savedPrefs = localStorage.getItem('user_preferences');
    if (savedPrefs) {
      setPreferences(JSON.parse(savedPrefs));
    }
  }, []);

  const showMessage = (text, type = 'success') => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 4000);
  };

  // Update profile
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authAxios.put(`/api/employees/${user.id}`, {
        full_name: profileData.full_name,
        email: profileData.email,
        phone: profileData.phone,
      });
      // Update localStorage
      const updatedUser = { ...user, full_name: profileData.full_name, email: profileData.email, phone: profileData.phone };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      showMessage('Profile updated successfully');
    } catch (err) {
      showMessage(err.response?.data?.message || 'Update failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Change password
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordError('');
    if (passwordData.newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters');
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await authAxios.put(`/api/users/${user.id}/update-password`, {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      showMessage('Password changed successfully');
    } catch (err) {
      setPasswordError(err.response?.data?.message || 'Invalid current password');
    } finally {
      setLoading(false);
    }
  };

  // Change PIN (only for admin/hr)
  const handlePinChange = async (e) => {
    e.preventDefault();
    setPinError('');
    if (pinData.newPin.length < 4 || pinData.newPin.length > 6 || !/^\d+$/.test(pinData.newPin)) {
      setPinError('PIN must be 4-6 digits');
      return;
    }
    if (pinData.newPin !== pinData.confirmPin) {
      setPinError('PINs do not match');
      return;
    }
    setLoading(true);
    try {
      await authAxios.put('/api/users/update-pin', {
        email: user.email,
        currentPin: pinData.currentPin,
        newPin: pinData.newPin,
      });
      setPinData({ currentPin: '', newPin: '', confirmPin: '' });
      setShowPinChange(false);
      showMessage('PIN changed successfully');
    } catch (err) {
      setPinError(err.response?.data?.message || 'PIN change failed');
    } finally {
      setLoading(false);
    }
  };

  // Save preferences
  const handlePreferenceChange = (key, value) => {
    const newPrefs = { ...preferences, [key]: value };
    setPreferences(newPrefs);
    localStorage.setItem('user_preferences', JSON.stringify(newPrefs));
    showMessage('Preferences saved');
  };

  return (
    <div className="settings-container">
      <div className="settings-header">
        
        <p>Manage your account, security, and preferences</p>
      </div>

      {message.text && (
        <div className={`settings-message ${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="settings-tabs">
        <button className={`settings-tab ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>
          <User size={18} /> Profile
        </button>
        <button className={`settings-tab ${activeTab === 'security' ? 'active' : ''}`} onClick={() => setActiveTab('security')}>
          <Lock size={18} /> Security
        </button>
        
      </div>

      <div className="settings-content">
        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <form onSubmit={handleProfileUpdate} className="settings-form">
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                value={profileData.full_name}
                onChange={(e) => setProfileData({ ...profileData, full_name: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                value={profileData.email}
                onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Phone Number</label>
              <input
                type="tel"
                value={profileData.phone}
                onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
              />
            </div>
            <button type="submit" className="btn-save" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <div className="security-section">
            <div className="security-card">
              <h3><Lock size={18} /> Change Password</h3>
              <form onSubmit={handlePasswordChange} className="settings-form">
                <div className="form-group">
                  <label>Current Password</label>
                  <div className="password-input-wrapper">
                    <input
                      type={showCurrent ? 'text' : 'password'}
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      required
                    />
                    <button type="button" onClick={() => setShowCurrent(!showCurrent)}>
                      {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                <div className="form-group">
                  <label>New Password</label>
                  <div className="password-input-wrapper">
                    <input
                      type={showNew ? 'text' : 'password'}
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      required
                    />
                    <button type="button" onClick={() => setShowNew(!showNew)}>
                      {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                <div className="form-group">
                  <label>Confirm New Password</label>
                  <div className="password-input-wrapper">
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      required
                    />
                    <button type="button" onClick={() => setShowConfirm(!showConfirm)}>
                      {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                {passwordError && <p className="error-text">{passwordError}</p>}
                <button type="submit" className="btn-save" disabled={loading}>
                  {loading ? 'Updating...' : 'Update Password'}
                </button>
              </form>
            </div>

            {canChangePin && (
              <div className="security-card">
                <h3><Key size={18} /> Payroll PIN</h3>
                {!showPinChange ? (
                  <button className="btn-change-pin" onClick={() => setShowPinChange(true)}>
                    Change PIN
                  </button>
                ) : (
                  <form onSubmit={handlePinChange} className="settings-form">
                    <div className="form-group">
                      <label>Current PIN</label>
                      <input
                        type="password"
                        maxLength="6"
                        pattern="\d*"
                        value={pinData.currentPin}
                        onChange={(e) => setPinData({ ...pinData, currentPin: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>New PIN (4-6 digits)</label>
                      <input
                        type="password"
                        maxLength="6"
                        pattern="\d*"
                        value={pinData.newPin}
                        onChange={(e) => setPinData({ ...pinData, newPin: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Confirm New PIN</label>
                      <input
                        type="password"
                        maxLength="6"
                        pattern="\d*"
                        value={pinData.confirmPin}
                        onChange={(e) => setPinData({ ...pinData, confirmPin: e.target.value })}
                        required
                      />
                    </div>
                    {pinError && <p className="error-text">{pinError}</p>}
                    <div className="pin-actions">
                      <button type="submit" className="btn-save" disabled={loading}>
                        {loading ? 'Saving...' : 'Save PIN'}
                      </button>
                      <button type="button" className="btn-cancel" onClick={() => { setShowPinChange(false); setPinError(''); setPinData({ currentPin: '', newPin: '', confirmPin: '' }); }}>
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>
        )}

        {/* Preferences Tab */}
        {activeTab === 'preferences' && (
          <div className="preferences-section">
            <div className="preference-item">
              <div className="pref-info">
                <h4>Email Notifications</h4>
                <p>Receive email alerts for pending approvals and updates</p>
              </div>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={preferences.emailAlerts}
                  onChange={(e) => handlePreferenceChange('emailAlerts', e.target.checked)}
                />
                <span className="slider round"></span>
              </label>
            </div>
            <div className="preference-item">
              <div className="pref-info">
                <h4>Emergency Alerts</h4>
                <p>Get real-time notifications for critical alerts</p>
              </div>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={preferences.emergencyAlerts}
                  onChange={(e) => handlePreferenceChange('emergencyAlerts', e.target.checked)}
                />
                <span className="slider round"></span>
              </label>
            </div>
            <div className="preference-item">
              <div className="pref-info">
                <h4>Leave Request Updates</h4>
                <p>Get notified when leave requests are submitted or approved</p>
              </div>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={preferences.leaveUpdates}
                  onChange={(e) => handlePreferenceChange('leaveUpdates', e.target.checked)}
                />
                <span className="slider round"></span>
              </label>
            </div>
            <div className="preference-item">
              <div className="pref-info">
                <h4>Dark Mode</h4>
                <p>Switch to dark theme (coming soon)</p>
              </div>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={preferences.darkMode}
                  onChange={(e) => handlePreferenceChange('darkMode', e.target.checked)}
                  disabled
                />
                <span className="slider round"></span>
              </label>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;