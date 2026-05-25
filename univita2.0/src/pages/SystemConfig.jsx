// src/pages/SystemConfig.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Save, RefreshCw } from 'lucide-react';
import './SystemConfig.css';
import { API_BASE } from '../api';

const getAuthHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('auth_token')}` }
});

const SystemConfig = () => {
  const [config, setConfig] = useState({
    password_expiry_days: 365,
    otp_expiry_minutes: 5,
    geofence_default_radius: 200,
    max_login_attempts: 5
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const res = await axios.get(`${API_BASE}/system-config`, getAuthHeaders());
      setConfig(res.data);
    } catch (err) {
      console.error('Failed to fetch config', err);
      toast.error('Failed to load configuration');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.put(`${API_BASE}/system-config`, config, getAuthHeaders());
      toast.success('Configuration saved successfully.');
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to save configuration.';
      toast.error(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="loading-spinner">Loading configuration...</div>;

  return (
    <div className="config-container">
      <div className="config-header">
        <h2>System Configuration</h2>
        <p>Manage security policies and system settings</p>
      </div>

      <div className="config-card">
        <h2>Security Policies</h2>
        <div className="config-form">
          <div className="config-field">
            <label>Password Expiry (days)</label>
            <input
              type="number"
              value={config.password_expiry_days}
              onChange={e => setConfig({ ...config, password_expiry_days: parseInt(e.target.value) || 0 })}
              min="0"
            />
            <p className="field-hint">Number of days until password expires (0 = never expire)</p>
          </div>
          <div className="config-field">
            <label>OTP Expiry (minutes)</label>
            <input
              type="number"
              value={config.otp_expiry_minutes}
              onChange={e => setConfig({ ...config, otp_expiry_minutes: parseInt(e.target.value) || 1 })}
              min="1"
            />
          </div>
          <div className="config-field">
            <label>Default Geofence Radius (meters)</label>
            <input
              type="number"
              value={config.geofence_default_radius}
              onChange={e => setConfig({ ...config, geofence_default_radius: parseInt(e.target.value) || 50 })}
              min="50"
            />
          </div>
          <div className="config-field">
            <label>Max Login Attempts</label>
            <input
              type="number"
              value={config.max_login_attempts}
              onChange={e => setConfig({ ...config, max_login_attempts: parseInt(e.target.value) || 3 })}
              min="1"
            />
          </div>
        </div>
        <div className="config-actions">
          <button className="btn-save-config" onClick={handleSave} disabled={saving}>
            <Save size={16} /> {saving ? 'Saving...' : 'Save Changes'}
          </button>
          <button className="btn-refresh-config" onClick={fetchConfig}>
            <RefreshCw size={16} /> Reset
          </button>
        </div>
      </div>
    </div>
  );
};

export default SystemConfig;