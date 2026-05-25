// src/pages/EmergencyAlerts.jsx
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import './EmergencyAlerts.css';
import { API_BASE } from '../api';

const EmergencyAlerts = () => {
  // Form state
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [severity, setSeverity] = useState('info');
  const [targetRoles, setTargetRoles] = useState(['instructor', 'admin', 'security', 'hr_admin']);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState('');

  // History state
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Get auth token from localStorage
  const getAuthHeaders = () => {
    const token = localStorage.getItem('auth_token');
    return { Authorization: `Bearer ${token}` };
  };

  const fetchAlerts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/emergency-alerts`, {
        headers: getAuthHeaders()
      });
      setAlerts(res.data);
    } catch (err) {
      console.error('Failed to fetch alerts', err);
      if (err.response?.status === 401) {
        toast.error('Session expired. Please log in again.');
      } else {
        toast.error('Failed to load alert history');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  const handleSend = async () => {
    if (!title.trim() || !message.trim()) {
      toast.warning('Title and message are required.');
      return;
    }
    setSendError('');
    setSending(true);
    try {
      await axios.post(
        `${API_BASE}/emergency-alerts`,
        {
          title: title.trim(),
          message: message.trim(),
          severity,
          target_roles: targetRoles,
        },
        { headers: getAuthHeaders() }
      );
      toast.success('Alert sent successfully.');
      setTitle('');
      setMessage('');
      setSeverity('info');
      setTargetRoles(['instructor', 'admin', 'security', 'hr_admin']);
      fetchAlerts();
    } catch (err) {
      if (err.response?.status === 401) {
        toast.error('Unauthorized – please log in as Admin or HR.');
      } else {
        toast.error(err.response?.data?.error || 'Failed to send alert.');
      }
    } finally {
      setSending(false);
    }
  };

  const toggleRole = (role) => {
    if (targetRoles.includes(role)) {
      setTargetRoles(targetRoles.filter(r => r !== role));
    } else {
      setTargetRoles([...targetRoles, role]);
    }
  };

  const filteredAlerts = alerts.filter(alert => {
    if (filterSeverity !== 'all' && alert.severity !== filterSeverity) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return alert.title.toLowerCase().includes(q) || alert.message.toLowerCase().includes(q);
    }
    return true;
  });

  const severityClass = (sev) => {
    switch (sev) {
      case 'critical': return 'severity-critical';
      case 'warning': return 'severity-warning';
      default: return 'severity-info';
    }
  };

  const formatRoles = (roles) => {
    try {
      let arr = typeof roles === 'string' ? JSON.parse(roles) : roles;
      if (!Array.isArray(arr)) arr = [arr];
      return arr.map(r => {
        if (r === 'hr_admin') return 'HR';
        return r.charAt(0).toUpperCase() + r.slice(1);
      }).join(', ');
    } catch { return roles; }
  };

  return (
    <div className="emergency-alerts">
      {/* New alert form */}
      <div className="form-card">
        <h3 className="section-title">New Emergency Alert</h3>
        <div className="form-grid">
          <div className="form-field">
            <label>Title</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Brief headline" />
          </div>
          <div className="form-field">
            <label>Severity</label>
            <select value={severity} onChange={e => setSeverity(e.target.value)}>
              <option value="info">Info</option>
              <option value="warning">Warning</option>
              <option value="critical">Critical</option>
            </select>
          </div>
          <div className="form-field full-width">
            <label>Message</label>
            <textarea rows="3" value={message} onChange={e => setMessage(e.target.value)} placeholder="Detailed instructions for recipients" />
          </div>
          <div className="form-field full-width">
            <label>Target roles</label>
            <div className="checkbox-group">
              {[
                { value: 'instructor', label: 'Instructor' },
                { value: 'admin', label: 'Admin' },
                { value: 'security', label: 'Security' },
                { value: 'hr_admin', label: 'HR' }
              ].map(role => (
                <label key={role.value}>
                  <input
                    type="checkbox"
                    checked={targetRoles.includes(role.value)}
                    onChange={() => toggleRole(role.value)}
                  />
                  <span>{role.label}</span>
                </label>
              ))}
            </div>
          </div>
          {sendError && <div className="error-message">{sendError}</div>}
          <div className="form-actions">
            <button className="btn-primary" onClick={handleSend} disabled={sending}>
              {sending ? 'Sending...' : 'Send Alert'}
            </button>
          </div>
        </div>
      </div>

      {/* History log */}
      <div className="history-card">
        <div className="history-header">
          <h3 className="section-title">Alert History</h3>
          <div className="history-controls">
            <select value={filterSeverity} onChange={e => setFilterSeverity(e.target.value)}>
              <option value="all">All severities</option>
              <option value="critical">Critical</option>
              <option value="warning">Warning</option>
              <option value="info">Info</option>
            </select>
            <input type="text" placeholder="Search..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
            <button className="btn-icon" onClick={fetchAlerts} title="Refresh">↻</button>
          </div>
        </div>

        {loading ? (
          <div className="loading-state">Loading…</div>
        ) : filteredAlerts.length === 0 ? (
          <div className="empty-state">No alerts found.</div>
        ) : (
          <div className="table-wrapper">
            <table className="minimal-table">
              <thead>
                <tr>
                  <th>Date & time</th>
                  <th>Title</th>
                  <th>Message</th>
                  <th>Severity</th>
                  <th>Target roles</th>
                </tr>
              </thead>
              <tbody>
                {filteredAlerts.map(alert => (
                  <tr key={alert.id}>
                    <td className="nowrap">{new Date(alert.sent_at).toLocaleString()}</td>
                    <td className="title-cell">{alert.title}</td>
                    <td className="message-cell">{alert.message}</td>
                    <td><span className={`severity-badge ${severityClass(alert.severity)}`}>{alert.severity}</span></td>
                    <td>{formatRoles(alert.target_roles)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmergencyAlerts;