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

const AttendanceAppeals = () => {
  const [pendingAppeals, setPendingAppeals] = useState([]);
  const [historyAppeals, setHistoryAppeals] = useState([]);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedAppeal, setSelectedAppeal] = useState(null);
  const [adminRemarks, setAdminRemarks] = useState('');
  const [showRemarkModal, setShowRemarkModal] = useState(false);
  const [actionType, setActionType] = useState(''); // 'approved' or 'rejected'
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
        <div className="appeals-list">
          {pendingAppeals.map((appeal) => (
            <div key={appeal.id} className="appeal-card">
              <div className="appeal-header">
                <div className="appeal-user">
                  <strong>{appeal.full_name}</strong>
                  <span className="appeal-id">{appeal.employee_id}</span>
                </div>
                <div className="appeal-date">{new Date(appeal.submitted_at).toLocaleString()}</div>
              </div>
              <div className="appeal-body">
                <p><strong>Date of absence:</strong> {appeal.date}</p>
                <p><strong>Reason:</strong> {appeal.reason}</p>
                {appeal.image_url && (
                  <div className="appeal-proof">
                    <a href={`${API_BASE.replace(/\/api$/, '')}${appeal.image_url}`} target="_blank" rel="noopener noreferrer">
                      View Proof (Image)
                    </a>
                  </div>
                )}
              </div>
              <div className="appeal-actions">
                <button className="btn-approve" onClick={() => openRemarkModal(appeal, 'approved')}>
                  Approve
                </button>
                <button className="btn-reject" onClick={() => openRemarkModal(appeal, 'rejected')}>
                  Reject
                </button>
              </div>
            </div>
          ))}
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
        footer={
          <button className="btn-modal-submit" onClick={() => setShowHistoryModal(false)}>
            Close
          </button>
        }
      >
        {historyAppeals.length === 0 ? (
          <p className="no-history">No past appeals found.</p>
        ) : (
          <div className="history-appeals-list">
            {historyAppeals.map((appeal) => (
              <div key={appeal.id} className="appeal-card history-card">
                <div className="appeal-header">
                  <div className="appeal-user">
                    <strong>{appeal.full_name}</strong>
                    <span className="appeal-id">{appeal.employee_id}</span>
                  </div>
                  <div className="appeal-date">{new Date(appeal.submitted_at).toLocaleString()}</div>
                </div>
                <div className="appeal-body">
                  <p><strong>Date of absence:</strong> {appeal.date}</p>
                  <p><strong>Reason:</strong> {appeal.reason}</p>
                  {appeal.image_url && (
                    <a href={`${API_BASE.replace(/\/api$/, '')}${appeal.image_url}`} target="_blank" rel="noopener noreferrer">
                      View Proof
                    </a>
                  )}
                  <div className={`status-badge ${appeal.status}`}>
                    Status: {appeal.status.toUpperCase()}
                  </div>
                  {appeal.admin_remarks && (
                    <p className="appeal-remarks">
                      <strong>Admin Remarks:</strong> {appeal.admin_remarks}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </FormalModal>
    </div>
  );
};

export default AttendanceAppeals;