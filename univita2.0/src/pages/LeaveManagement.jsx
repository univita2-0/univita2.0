// src/pages/LeaveManagement.jsx
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Check, X, Search, RefreshCw } from 'lucide-react';
import FormalModal from '../components/FormalModal';
import { API_BASE } from '../api';
import './LeaveManagement.css';

const getAuthHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('auth_token')}` }
});

const LeaveManagement = () => {
  const [pending, setPending] = useState([]);
  const [history, setHistory] = useState([]);
  const [view, setView] = useState('pending');
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showRemarksModal, setShowRemarksModal] = useState(false);
  const [actionType, setActionType] = useState('');
  const [remarks, setRemarks] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/leave-requests/all`, getAuthHeaders());
      const all = res.data || [];
      setPending(all.filter(r => r.status === 'Pending'));
      setHistory(all.filter(r => r.status !== 'Pending'));
    } catch (err) {
      console.error(err);
      toast.error('Failed to load leave requests');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openActionModal = (request, action) => {
    setSelectedRequest(request);
    setActionType(action);
    setRemarks('');
    setShowRemarksModal(true);
  };

  const handleAction = async () => {
    if (!selectedRequest) return;
    try {
      await axios.put(
        `${API_BASE}/leave-requests/${selectedRequest.id}/status`,
        { status: actionType, admin_remarks: remarks.trim() || null },
        getAuthHeaders()
      );
      toast.success(`Leave request ${actionType.toLowerCase()} successfully.`);
      setShowRemarksModal(false);
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error('Action failed');
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-PH');
  };

  const filteredList = (view === 'pending' ? pending : history).filter(req =>
    (req.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     req.user_id?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="lm-container">
      <div className="lm-header">
        <h2>Leave Requests</h2>
        <div className="lm-actions">
          <div className="lm-search">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              placeholder="Search by name or ID..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="btn-refresh" onClick={fetchData} title="Refresh">
            <RefreshCw size={18} />
          </button>
        </div>
      </div>

      <div className="lm-tabs">
        <button
          className={`lm-tab ${view === 'pending' ? 'active' : ''}`}
          onClick={() => setView('pending')}
        >
          Pending <span className="badge-count">{pending.length}</span>
        </button>
        <button
          className={`lm-tab ${view === 'history' ? 'active' : ''}`}
          onClick={() => setView('history')}
        >
          History <span className="badge-count">{history.length}</span>
        </button>
      </div>

      <div className="lm-table-wrapper">
        <table className="lm-table">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Type</th>
              <th>Date</th>
              <th>Reason</th>
              {view === 'pending' && <th>Actions</th>}
              {view === 'history' && <th>Status</th>}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="5" className="empty-row">Loading...</td></tr>
            ) : filteredList.length === 0 ? (
              <tr><td colSpan="5" className="empty-row">No leave requests found.</td></tr>
            ) : (
              filteredList.map(req => (
                <tr key={req.id}>
                  <td>
                    <div className="employee-info">
                      <strong>{req.full_name || `ID: ${req.user_id}`}</strong>
                      {req.employee_id && <small>{req.employee_id}</small>}
                    </div>
                   </td>
                  <td>{req.type || '—'}</td>
                  <td>{formatDate(req.request_date)}</td>
                  <td>
                    <div className="reason-text" title={req.reason}>
                      {req.reason?.substring(0, 80)}{req.reason?.length > 80 ? '…' : ''}
                    </div>
                   </td>
                  {view === 'pending' && (
                    <td className="actions-cell">
                      <button className="btn-approve" onClick={() => openActionModal(req, 'Approved')}>
                        <Check size={14} /> Approve
                      </button>
                      <button className="btn-reject" onClick={() => openActionModal(req, 'Rejected')}>
                        <X size={14} /> Reject
                      </button>
                    </td>
                  )}
                  {view === 'history' && (
                    <td>
                      <span className={`status-badge ${req.status.toLowerCase()}`}>
                        {req.status}
                      </span>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Remarks Modal */}
      <FormalModal
        show={showRemarksModal}
        onClose={() => setShowRemarksModal(false)}
        title={`${actionType} Leave Request`}
        footer={
          <>
            <button className="btn-modal-cancel" onClick={() => setShowRemarksModal(false)}>Cancel</button>
            <button className="btn-modal-submit" onClick={handleAction}>
              Yes, {actionType}
            </button>
          </>
        }
      >
        <p>Are you sure you want to <strong>{actionType.toLowerCase()}</strong> this leave request?</p>
        <div className="modal-form-group">
          <label>Remarks (optional)</label>
          <textarea
            rows="3"
            className="modal-input"
            placeholder="Add any comments (will be visible to the employee)..."
            value={remarks}
            onChange={e => setRemarks(e.target.value)}
          />
        </div>
      </FormalModal>
    </div>
  );
};

export default LeaveManagement;