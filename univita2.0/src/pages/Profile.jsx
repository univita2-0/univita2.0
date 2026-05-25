// src/pages/Profile.jsx – Modern, formal, with necessary details only
import React, { useState, useEffect } from 'react';
import './Profile.css';
import {
  Mail, Shield, Clock, Key, User, Phone, Briefcase, Edit2, Save, X, AlertCircle, CheckCircle
} from 'lucide-react';
import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const Profile = () => {
  const [user, setUser] = useState({
    id: localStorage.getItem('user_id') || '',
    name: localStorage.getItem('user_name') || '',
    email: localStorage.getItem('user_email') || '',
    role: localStorage.getItem('user_role') || '',
    employeeId: localStorage.getItem('employee_id') || '',
    phone: '',
    position: '',
    daysSinceChange: 0,
    lastLogin: localStorage.getItem('last_login') || 'Today'
  });
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({
    full_name: '',
    email: '',
    phone: ''
  });

  // Password change modal
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordError, setPasswordError] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const token = localStorage.getItem('auth_token');
  const authAxios = axios.create({
    baseURL: API_BASE,
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });

  useEffect(() => {
    fetchUserDetails();
  }, []);

  const fetchUserDetails = async () => {
    if (!user.id) return;
    try {
      const res = await authAxios.get(`/api/employees/${user.id}`);
      const data = res.data;
      // Use a separate variable to avoid ESLint issues with 'prev'
      const updatedUser = {
        ...user,
        name: data.full_name || user.name,
        email: data.email || user.email,
        phone: data.phone || '',
        position: data.position_level || data.position || '',
        daysSinceChange: data.password_last_changed
          ? Math.floor((Date.now() - new Date(data.password_last_changed).getTime()) / (1000 * 60 * 60 * 24))
          : 0
      };
      setUser(updatedUser);
      setEditForm({
        full_name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone
      });
    } catch (err) {
      console.error('Failed to load user details', err);
    }
  };

  const daysRemaining = Math.max(0, 365 - user.daysSinceChange);
  const isExpiringSoon = daysRemaining <= 30;

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authAxios.put(`/api/employees/${user.id}`, {
        full_name: editForm.full_name,
        email: editForm.email,
        phone: editForm.phone
      });
      localStorage.setItem('user_name', editForm.full_name);
      localStorage.setItem('user_email', editForm.email);
      setUser(prev => ({
        ...prev,
        name: editForm.full_name,
        email: editForm.email,
        phone: editForm.phone
      }));
      setMessage({ type: 'success', text: 'Profile updated successfully' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      setEditMode(false);
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Update failed' });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordError('');
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      setPasswordError('All fields are required.');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }
    if (passwordForm.newPassword.trim().length < 6) {
      setPasswordError('Password must be at least 6 characters.');
      return;
    }
    setChangingPassword(true);
    try {
      await authAxios.put(`/api/users/${user.id}/update-password`, {
        currentPassword: passwordForm.currentPassword.trim(),
        newPassword: passwordForm.newPassword.trim()
      });
      setShowPasswordModal(false);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setMessage({ type: 'success', text: 'Password changed successfully. Please log in again.' });
      setTimeout(() => {
        localStorage.clear();
        window.location.href = '/';
      }, 2000);
    } catch (err) {
      setPasswordError(err.response?.data?.message || 'Failed to update password.');
    } finally {
      setChangingPassword(false);
    }
  };

  const getRoleLabel = (role) => {
    const labels = {
      admin: 'Administrator',
      hr_admin: 'HR Personnel',
      security: 'Security Officer',
      instructor: 'Instructor'
    };
    return labels[role] || role;
  };

  return (
    <div className="profile-modern">
      {message.text && (
        <div className={`profile-toast ${message.type}`}>
          {message.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          <span>{message.text}</span>
        </div>
      )}

      <div className="profile-header">
        <div className="profile-avatar">
          <span>{user.name.charAt(0).toUpperCase()}</span>
        </div>
        <div className="profile-title">
          <h1>{user.name}</h1>
          <p className="profile-role">{getRoleLabel(user.role)}</p>
        </div>
        <button className="profile-edit-btn" onClick={() => setEditMode(true)}>
          <Edit2 size={16} /> Edit Profile
        </button>
      </div>

      <div className="profile-grid">
        {/* Account Information Card */}
        <div className="profile-card">
          <h3>Account Information</h3>
          <div className="profile-info-list">
            <div className="info-item">
              <Mail size={18} />
              <div>
                <label>Email Address</label>
                <p>{user.email}</p>
              </div>
            </div>
            <div className="info-item">
              <Phone size={18} />
              <div>
                <label>Phone Number</label>
                <p>{user.phone || '—'}</p>
              </div>
            </div>
            <div className="info-item">
              <Briefcase size={18} />
              <div>
                <label>Position</label>
                <p>{user.position || '—'}</p>
              </div>
            </div>
            <div className="info-item">
              <Shield size={18} />
              <div>
                <label>Employee ID</label>
                <p>{user.employeeId}</p>
              </div>
            </div>
            <div className="info-item">
              <Clock size={18} />
              <div>
                <label>Last Login</label>
                <p>{user.lastLogin}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Security Card */}
        <div className="profile-card">
          <h3>Security</h3>
          <div className="security-section">
            <div className="password-status">
              <div className={`status-indicator ${isExpiringSoon ? 'warning' : 'safe'}`}></div>
              <div>
                <p className="status-title">Password Expiry</p>
                <p className="status-text">
                  {isExpiringSoon
                    ? `Your password will expire in ${daysRemaining} days.`
                    : `Valid for ${daysRemaining} more days`}
                </p>
              </div>
            </div>
            <button className="btn-change-password" onClick={() => setShowPasswordModal(true)}>
              <Key size={16} /> Change Password
            </button>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {editMode && (
        <div className="modal-overlay" onClick={() => setEditMode(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Profile</h2>
              <button className="modal-close" onClick={() => setEditMode(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleEditSubmit}>
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  value={editForm.full_name}
                  onChange={e => setEditForm({ ...editForm, full_name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={e => setEditForm({ ...editForm, email: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  value={editForm.phone}
                  onChange={e => setEditForm({ ...editForm, phone: e.target.value })}
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setEditMode(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-save" disabled={loading}>
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="modal-overlay" onClick={() => setShowPasswordModal(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Change Password</h2>
              <button className="modal-close" onClick={() => setShowPasswordModal(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleChangePassword}>
              {passwordError && <div className="error-box">{passwordError}</div>}
              <div className="form-group">
                <label>Current Password</label>
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={e => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>New Password</label>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Confirm New Password</label>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={e => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  required
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowPasswordModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-save" disabled={changingPassword}>
                  {changingPassword ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;