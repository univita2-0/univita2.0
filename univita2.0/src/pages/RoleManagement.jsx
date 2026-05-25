// src/pages/RoleManagement.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Users, Shield } from 'lucide-react';
import './RoleManagement.css';
import { API_BASE } from '../api';

const getAuthHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('auth_token')}` }
});

const RoleManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const currentUserId = parseInt(localStorage.getItem('user_id') || '0');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${API_BASE}/employees`, getAuthHeaders());
      setUsers(res.data);
    } catch (err) {
      console.error('Failed to fetch users', err);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    if (userId === currentUserId) {
      toast.error('You cannot change your own role.');
      return;
    }
    setUpdating(userId);
    try {
      await axios.put(`${API_BASE}/users/${userId}/role`, { role: newRole }, getAuthHeaders());
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
      toast.success(`Role updated for ${users.find(u => u.id === userId)?.full_name}`);
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Update failed.';
      toast.error(errorMsg);
    } finally {
      setUpdating(null);
    }
  };

  const getRoleBadgeClass = (role) => {
    const classes = {
      admin: 'badge-admin',
      hr_admin: 'badge-hr',
      security: 'badge-security',
      instructor: 'badge-instructor'
    };
    return classes[role] || 'badge-default';
  };

  if (loading) return <div className="loading-spinner">Loading users...</div>;

  return (
    <div className="role-container">
      <div className="role-header">
        <h2>Role Management</h2>
        <p>Assign and manage system roles for all users</p>
      </div>

      <div className="role-table-wrapper">
        <table className="role-table">
          <thead>
            <tr>
              <th>Employee ID</th>
              <th>Full Name</th>
              <th>Email</th>
              <th>Current Role</th>
              <th>Change Role</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td>{user.employee_id}</td>
                <td>{user.full_name}</td>
                <td>{user.email}</td>
                <td>
                  <span className={`role-badge ${getRoleBadgeClass(user.role)}`}>
                    {user.role === 'hr_admin' ? 'HR' : user.role}
                  </span>
                </td>
                <td>
                  <select
                    value={user.role}
                    onChange={e => handleRoleChange(user.id, e.target.value)}
                    disabled={updating === user.id || user.id === currentUserId}
                    className="role-select"
                  >
                    <option value="admin">Admin</option>
                    <option value="hr_admin">HR</option>
                    <option value="security">Security</option>
                    <option value="instructor">Instructor</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RoleManagement;