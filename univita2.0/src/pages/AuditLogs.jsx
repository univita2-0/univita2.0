// src/pages/AuditLogs.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Download, Calendar, Filter } from 'lucide-react';
import { toast } from 'react-toastify';
import './AuditLogs.css';
import { API_BASE } from '../api';

const getAuthHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('auth_token')}` }
});

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('');

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/audit-logs`, getAuthHeaders());
      setLogs(res.data);
      setFilteredLogs(res.data);
    } catch (err) {
      console.error('Failed to fetch audit logs', err);
      if (err.response?.status === 401) {
        toast.error('Session expired. Please log in again.');
      } else if (err.response?.status === 403) {
        toast.error('Access denied. Admin privileges required.');
      } else {
        toast.error('Failed to load audit logs.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = [...logs];
    if (searchTerm) {
      filtered = filtered.filter(log =>
        log.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.action?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.target_type?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (dateFilter) {
      filtered = filtered.filter(log => log.created_at?.startsWith(dateFilter));
    }
    if (actionFilter) {
      filtered = filtered.filter(log => log.action === actionFilter);
    }
    setFilteredLogs(filtered);
  }, [searchTerm, dateFilter, actionFilter, logs]);

  const exportCSV = () => {
    const headers = ['Timestamp', 'User', 'Action', 'Target Type', 'Target ID', 'IP Address'];
    const rows = filteredLogs.map(log => [
      log.created_at,
      log.user_email || 'System',
      log.action,
      log.target_type || '',
      log.target_id || '',
      log.ip_address || ''
    ]);
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit_logs_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.info('CSV export started');
  };

  const uniqueActions = [...new Set(logs.map(log => log.action))];

  return (
    <div className="audit-container">
      <div className="audit-header">
        <h2>Audit Logs</h2>
        <button className="btn-export" onClick={exportCSV}>
          <Download size={16} /> Export CSV
        </button>
      </div>

      <div className="audit-filters">
        <div className="filter-group">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search by user, action, target..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <Calendar size={16} />
          <input
            type="date"
            value={dateFilter}
            onChange={e => setDateFilter(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <Filter size={16} />
          <select value={actionFilter} onChange={e => setActionFilter(e.target.value)}>
            <option value="">All Actions</option>
            {uniqueActions.map(action => (
              <option key={action} value={action}>{action}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="loading-spinner">Loading audit logs...</div>
      ) : (
        <div className="audit-table-wrapper">
          <table className="audit-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>User</th>
                <th>Action</th>
                <th>Target Type</th>
                <th>Target ID</th>
                <th>IP Address</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length === 0 ? (
                <tr><td colSpan="6" className="empty-row">No audit logs found.</td></tr>
              ) : (
                filteredLogs.map(log => (
                  <tr key={log.id}>
                    <td>{new Date(log.created_at).toLocaleString()}</td>
                    <td>{log.user_email || 'System'}</td>
                    <td><span className="action-badge">{log.action}</span></td>
                    <td>{log.target_type || '—'}</td>
                    <td>{log.target_id || '—'}</td>
                    <td>{log.ip_address || '—'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AuditLogs;