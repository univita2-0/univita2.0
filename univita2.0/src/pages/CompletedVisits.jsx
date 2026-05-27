// src/pages/CompletedVisits.jsx
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Calendar, Search, Download, User, Clock, MapPin } from 'lucide-react';
import { API_BASE } from '../api';
import './CompletedVisits.css';

const getAuthHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('auth_token')}` }
});

const CompletedVisits = () => {
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);

  const fetchHistory = useCallback(async () => {
    if (!startDate || !endDate) {
      toast.warning('Please select both start and end dates');
      return;
    }
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/visitor-requests/history`, {
        params: { startDate, endDate },
        ...getAuthHeaders()
      });
      setVisitors(res.data);
    } catch (err) {
      console.error('Failed to fetch visitor history', err);
      toast.error(err.response?.data?.error || 'Failed to load history');
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const exportToCSV = () => {
    const headers = ['Name', 'Visit Date', 'Checked In', 'Checked Out', 'Duration', 'Destination', 'BLE Tag'];
    const rows = visitors.map(v => [
      `${v.first_name} ${v.last_name}`,
      v.visit_date,
      v.arrived_time,
      v.returned_time,
      v.duration,
      v.destination || '—',
      v.ble_id || '—'
    ]);
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `visitor_history_${startDate}_to_${endDate}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('CSV exported');
  };

  return (
    <div className="completed-visits-container">
      <div className="cv-header">
        <h2>Completed Visits</h2>
        <p>Visitors who checked in and returned their BLE tags</p>
      </div>

      <div className="cv-filters">
        <div className="date-range">
          <div className="filter-group">
            <label>From</label>
            <input
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className="date-input"
            />
          </div>
          <div className="filter-group">
            <label>To</label>
            <input
              type="date"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              className="date-input"
            />
          </div>
          <button className="btn-search" onClick={fetchHistory} disabled={loading}>
            <Search size={16} /> {loading ? 'Loading...' : 'Search'}
          </button>
          <button className="btn-export" onClick={exportToCSV} disabled={visitors.length === 0}>
            <Download size={16} /> Export CSV
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading-state">Loading completed visits...</div>
      ) : visitors.length === 0 ? (
        <div className="empty-state">
          <Calendar size={48} />
          <p>No completed visits found for the selected date range.</p>
        </div>
      ) : (
        <div className="cv-table-wrapper">
          <table className="cv-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Visit Date</th>
                <th>Checked In</th>
                <th>Checked Out</th>
                <th>Duration</th>
                <th>Destination</th>
                <th>BLE Tag</th>
              </tr>
            </thead>
            <tbody>
              {visitors.map(v => (
                <tr key={v.id}>
                  <td>
                    <strong>{v.first_name} {v.last_name}</strong>
                    <br /><span className="small-text">{v.email}</span>
                  </td>
                  <td>{v.visit_date} <br /><span className="small-text">{v.visit_time?.slice(0,5)}</span></td>
                  <td>{v.arrived_time}</td>
                  <td>{v.returned_time}</td>
                  <td><span className="duration-badge">{v.duration}</span></td>
                  <td>{v.destination || '—'}</td>
                  <td>{v.ble_id || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default CompletedVisits;