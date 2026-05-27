// src/pages/AttendanceAppeals.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import FormalModal from '../components/FormalModal';
import { API_BASE } from '../api';
import './AttendanceAppeals.css';

const getAuthHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('auth_token')}` }
});

// Format date from ISO to YYYY-MM-DD
const formatDate = (dateStr) => {
  if (!dateStr) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
  return dateStr.split('T')[0];
};

// Format time from HH:MM:SS to HH:MM
const formatTime = (timeStr) => {
  if (!timeStr) return '';
  return timeStr.substring(0, 5);
};

const AttendanceAppeals = () => {
  const [pendingAppeals, setPendingAppeals] = useState([]);
  const [historyAppeals, setHistoryAppeals] = useState([]);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedAppeal, setSelectedAppeal] = useState(null);
  const [adminRemarks, setAdminRemarks] = useState('');
  const [showRemarkModal, setShowRemarkModal] = useState(false);
  const [actionType, setActionType] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPendingAppeals();
  }, []);

  const fetchPendingAppeals = async () => {
    try {
      const res = await axios.get(`${API_BASE}/attendance-appeals/pending`, getAuthHeaders());
      setPendingAppeals(res.data);
    } catch (err) {
      console.error('Error fetching pending appeals:', err);
      toast.error('Failed to load pending appeals');
    }
  };

  const fetchHistoryAppeals = async () => {
    try {
      const res = await axios.get(`${API_BASE}/attendance-appeals/history`, getAuthHeaders());
      setHistoryAppeals(res.data);
    } catch (err) {
      console.error('Error fetching history appeals:', err);
      toast.error('Failed to load history');
    }
  };

  const openRemarkModal = (appeal, action) => {
    setSelectedAppeal(appeal);
    setActionType(action);
    setAdminRemarks('');
    setShowRemarkModal(true);
  };

  const updateAppealStatus = async () => {
    if (!selectedAppeal) return;
    setLoading(true);
    try {
      await axios.put(`${API_BASE}/attendance-appeals/${selectedAppeal.id}/status`, {
        status: actionType,
        admin_remarks: adminRemarks || null,
      }, getAuthHeaders());
      toast.success(`Appeal ${actionType === 'approved' ? 'approved' : 'rejected'} successfully.`);
      setShowRemarkModal(false);
      fetchPendingAppeals();
      fetchHistoryAppeals();
    } catch (err) {
      console.error('Error updating appeal status:', err);
      toast.error('Failed to update appeal status. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const openHistoryModal = () => {
    fetchHistoryAppeals();
    setShowHistoryModal(true);
  };

  return (
    <div className="attendance-appeals-container">
      <div className="appeals-header">
        <h1>Attendance Appeals</h1>
        <button className="btn-history" onClick={openHistoryModal}>
          View History
        </button>
      </div>

      {pendingAppeals.length === 0 ? (
        <div className="no-appeals-card">
          <p>No pending appeals.</p>
        </div>
      ) : (
        <div className="appeals-table-wrapper">
          <table className="appeals-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Employee ID</th>
                <th>Date</th>
                <th>Requested Time In</th>
                <th>Requested Time Out</th>
                <th>Reason</th>
                <th>Proof</th>
                <th>Submitted</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pendingAppeals.map((appeal) => (
                <tr key={appeal.id}>
                  <td>{appeal.full_name}</td>
                  <td>{appeal.employee_id}</td>
                  <td>{formatDate(appeal.date)}</td>
                  <td>{appeal.requested_time_in ? formatTime(appeal.requested_time_in) : '—'}</td>
                  <td>{appeal.requested_time_out ? formatTime(appeal.requested_time_out) : '—'}</td>
                  <td>{appeal.reason}</td>
                  <td className="proof-cell">
                    {appeal.image_url ? (
                      <a href={`${API_BASE.replace(/\/api$/, '')}${appeal.image_url}`} target="_blank" rel="noopener noreferrer">
                        View
                      </a>
                    ) : '—'}
                  </td>
                  <td className="submitted-cell">{new Date(appeal.submitted_at).toLocaleString()}</td>
                  <td className="actions-cell">
                    <button className="btn-approve" onClick={() => openRemarkModal(appeal, 'approved')}>
                      Approve
                    </button>
                    <button className="btn-reject" onClick={() => openRemarkModal(appeal, 'rejected')}>
                      Reject
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Remarks Modal */}
      <FormalModal
        show={showRemarkModal}
        onClose={() => setShowRemarkModal(false)}
        title="Add Remarks (Optional)"
        footer={
          <>
            <button className="btn-modal-cancel" onClick={() => setShowRemarkModal(false)} disabled={loading}>
              Cancel
            </button>
            <button className="btn-modal-submit" onClick={updateAppealStatus} disabled={loading}>
              {loading ? 'Processing...' : actionType === 'approved' ? 'Approve' : 'Reject'}
            </button>
          </>
        }
      >
        <textarea
          rows="4"
          placeholder="Enter remarks for the employee (e.g., reason for approval/rejection)..."
          value={adminRemarks}
          onChange={(e) => setAdminRemarks(e.target.value)}
          className="remarks-textarea"
          disabled={loading}
        />
      </FormalModal>

      {/* History Modal */}
      <FormalModal
        show={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
        title="Appeal History"
        size="large"
        footer={
          <button className="btn-modal-submit" onClick={() => setShowHistoryModal(false)}>
            Close
          </button>
        }
      >
        {historyAppeals.length === 0 ? (
          <p className="no-history">No past appeals found.</p>
        ) : (
          <div className="history-table-wrapper">
            <table className="history-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>ID</th>
                  <th>Date</th>
                  <th>Requested In</th>
                  <th>Requested Out</th>
                  <th>Reason</th>
                  <th>Proof</th>
                  <th>Status</th>
                  <th>Admin Remarks</th>
                  <th>Submitted</th>
                </tr>
              </thead>
              <tbody>
                {historyAppeals.map((appeal) => (
                  <tr key={appeal.id}>
                    <td>{appeal.full_name}</td>
                    <td>{appeal.employee_id}</td>
                    <td>{formatDate(appeal.date)}</td>
                    <td>{appeal.requested_time_in ? formatTime(appeal.requested_time_in) : '—'}</td>
                    <td>{appeal.requested_time_out ? formatTime(appeal.requested_time_out) : '—'}</td>
                    <td>{appeal.reason}</td>
                    <td className="proof-cell">
                      {appeal.image_url ? (
                        <a href={`${API_BASE.replace(/\/api$/, '')}${appeal.image_url}`} target="_blank" rel="noopener noreferrer">
                          View
                        </a>
                      ) : '—'}
                    </td>
                    <td><span className={`status-badge ${appeal.status}`}>{appeal.status.toUpperCase()}</span></td>
                    <td className="remarks-cell">{appeal.admin_remarks || '—'}</td>
                    <td className="submitted-cell">{new Date(appeal.submitted_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </FormalModal>
    </div>
  );
};

export default AttendanceAppeals;