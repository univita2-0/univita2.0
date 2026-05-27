import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Search, Download, Calendar, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
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
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [actionFilter, setActionFilter] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(20);

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
        log.target_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.ip_address?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (dateFrom) {
      filtered = filtered.filter(log => log.created_at >= dateFrom);
    }
    if (dateTo) {
      const endDate = new Date(dateTo);
      endDate.setDate(endDate.getDate() + 1);
      const endDateStr = endDate.toISOString().split('T')[0];
      filtered = filtered.filter(log => log.created_at < endDateStr);
    }
    if (actionFilter) {
      filtered = filtered.filter(log => log.action === actionFilter);
    }
    setFilteredLogs(filtered);
    setCurrentPage(1);
  }, [searchTerm, dateFrom, dateTo, actionFilter, logs]);

  const formatChanges = (oldVal, newVal) => {
    if (!oldVal && !newVal) return '—';
    if (oldVal && !newVal) return `Removed: ${JSON.stringify(oldVal).substring(0, 60)}`;
    if (!oldVal && newVal) return `Added: ${JSON.stringify(newVal).substring(0, 60)}`;
    return `Changed: ${JSON.stringify(oldVal).substring(0, 40)} → ${JSON.stringify(newVal).substring(0, 40)}`;
  };

  const totalLogs = filteredLogs.length;
  const totalPages = Math.ceil(totalLogs / rowsPerPage);
  const paginatedLogs = filteredLogs.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);
  const uniqueActions = useMemo(() => [...new Set(logs.map(log => log.action))], [logs]);

  const exportCSV = () => {
    const headers = ['Timestamp', 'User', 'Action', 'Resource', 'Changes', 'IP Address'];
    const rows = filteredLogs.map(log => [
      log.created_at,
      log.user_email || 'System',
      log.action,
      log.target_type || '',
      formatChanges(log.old_value, log.new_value).replace(/[➕🗑️✏️]/g, '').trim(),
      log.ip_address || ''
    ]);
    const csvContent = [headers, ...rows].map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit_logs_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.info('CSV export started');
  };

  return (
    <div className="audit-container">
      <div className="audit-header">
        <div>
          <h1>Audit Logs</h1>
          <p className="audit-description">Complete history of system actions and data changes</p>
        </div>
        <button className="btn-export" onClick={exportCSV}>
          <Download size={16} /> Export to CSV
        </button>
      </div>

      {/* Filters Section */}
      <div className="filters-bar">
        <div className="filter-item search-filter">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search user, action, resource or IP..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-item date-filter">
          <Calendar size={18} />
          <div className="date-input-group">
            <input
              type="date"
              value={dateFrom}
              onChange={e => setDateFrom(e.target.value)}
              placeholder="From"
            />
            <span>–</span>
            <input
              type="date"
              value={dateTo}
              onChange={e => setDateTo(e.target.value)}
              placeholder="To"
            />
          </div>
          {(dateFrom || dateTo) && (
            <button className="clear-dates" onClick={() => { setDateFrom(''); setDateTo(''); }}>
              Clear
            </button>
          )}
        </div>

        <div className="filter-item action-filter">
          <Filter size={18} />
          <select value={actionFilter} onChange={e => setActionFilter(e.target.value)}>
            <option value="">All Actions</option>
            {uniqueActions.map(action => (
              <option key={action} value={action}>{action}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="loading-state">Loading audit logs...</div>
      ) : (
        <>
          <div className="table-wrapper">
            <table className="audit-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>User</th>
                  <th>Action</th>
                  <th>Resource</th>
                  <th>Changes</th>
                  <th>IP Address</th>
                </tr>
              </thead>
              <tbody>
                {paginatedLogs.length === 0 ? (
                  <tr className="empty-row">
                    <td colSpan="6">No audit records found. Try adjusting your filters.</td>
                  </tr>
                ) : (
                  paginatedLogs.map(log => (
                    <tr key={log.id}>
                      <td className="timestamp">{new Date(log.created_at).toLocaleString()}</td>
                      <td className="user">{log.user_email || 'System'}</td>
                      <td><span className="action-tag">{log.action}</span></td>
                      <td className="resource">{log.target_type || '—'}</td>
                      <td className="changes" title={formatChanges(log.old_value, log.new_value)}>
                        {formatChanges(log.old_value, log.new_value)}
                      </td>
                      <td className="ip">{log.ip_address || '—'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalLogs > 0 && (
            <div className="pagination-bar">
              <div className="rows-per-page">
                <span>Rows per page:</span>
                <select value={rowsPerPage} onChange={e => setRowsPerPage(Number(e.target.value))}>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
              <div className="pagination-controls">
                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>
                  <ChevronLeft size={18} />
                </button>
                <span className="page-indicator">
                  Page {currentPage} of {totalPages || 1}
                </span>
                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AuditLogs;