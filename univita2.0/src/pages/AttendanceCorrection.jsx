// src/pages/AttendanceCorrection.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import FormalModal from '../components/FormalModal';
import { Search, Edit3 } from 'lucide-react';
import { API_BASE } from '../api';
import './AttendanceCorrection.css';

const getAuthHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('auth_token')}` }
});

const AttendanceCorrection = () => {
  const [employeeId, setEmployeeId] = useState('');
  const [records, setRecords] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ time_in: '', time_out: '', status: '', location: '' });
  const [searchDone, setSearchDone] = useState(false);

  const fetchRecords = async () => {
    if (!employeeId.trim()) return;
    try {
      const res = await axios.get(`${API_BASE}/attendance-report-user/${employeeId.trim()}`, getAuthHeaders());
      setRecords(res.data || []);
      setSearchDone(true);
    } catch (err) {
      console.error(err);
      toast.error('Failed to fetch attendance records');
    }
  };

  const openEditor = (record) => {
    setEditing(record);
    setForm({
      time_in: record.time_in || '',
      time_out: record.time_out || '',
      status: record.status || '',
      location: record.location || ''
    });
  };

  const handleSave = async () => {
    try {
      await axios.put(`${API_BASE}/attendance/${editing.id}`, form, getAuthHeaders());
      toast.success('Record updated successfully');
      setEditing(null);
      fetchRecords();
    } catch (err) {
      console.error(err);
      toast.error('Failed to update record. Please try again.');
    }
  };

  return (
    <div className="ac-container">
      <h3 className="ac-title">Attendance Correction</h3>

      <div className="ac-search-row">
        <div className="ac-search-input-wrapper">
          <input
            type="text"
            placeholder="Employee ID (e.g., E002)"
            value={employeeId}
            onChange={e => setEmployeeId(e.target.value)}
            className="ac-input"
          />
        </div>
        <button className="ac-search-btn" onClick={fetchRecords}>
          <Search size={16} /> Search
        </button>
      </div>

      {searchDone && (
        <div className="ac-table-wrapper">
          <table className="ac-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Time In</th>
                <th>Time Out</th>
                <th>Status</th>
                <th>Location</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {records.length === 0 ? (
                <tr className="ac-empty-row">
                  <td colSpan="6">No records found for this employee.</td>
                </tr>
              ) : (
                records.map(rec => (
                  <tr key={rec.id}>
                    <td>{rec.date}</td>
                    <td>{rec.time_in || '--:--'}</td>
                    <td>{rec.time_out || '--:--'}</td>
                    <td>{rec.status}</td>
                    <td className="ac-location-cell" title={rec.location}>
                      {rec.location && rec.location.length > 30 ? rec.location.substring(0, 30) + '…' : rec.location || '—'}
                    </td>
                    <td>
                      <button onClick={() => openEditor(rec)} className="ac-edit-btn">
                        <Edit3 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      <FormalModal
        show={!!editing}
        onClose={() => setEditing(null)}
        title="Edit Attendance"
        footer={
          <>
            <button className="btn-modal-cancel" onClick={() => setEditing(null)}>Cancel</button>
            <button className="btn-modal-submit" onClick={handleSave}>Save</button>
          </>
        }
      >
        <div className="ac-modal-group">
          <label className="ac-modal-label">Time In</label>
          <input type="time" className="ac-input" value={form.time_in} onChange={e => setForm({...form, time_in: e.target.value})} />
        </div>
        <div className="ac-modal-group">
          <label className="ac-modal-label">Time Out</label>
          <input type="time" className="ac-input" value={form.time_out} onChange={e => setForm({...form, time_out: e.target.value})} />
        </div>
        <div className="ac-modal-group">
          <label className="ac-modal-label">Status</label>
          <select className="ac-select" value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
            <option value="">Select</option>
            <option value="present">Present</option>
            <option value="late">Late</option>
            <option value="absent">Absent</option>
          </select>
        </div>
        <div className="ac-modal-group">
          <label className="ac-modal-label">Location</label>
          <input type="text" className="ac-input" value={form.location} onChange={e => setForm({...form, location: e.target.value})} />
        </div>
      </FormalModal>
    </div>
  );
};

export default AttendanceCorrection;