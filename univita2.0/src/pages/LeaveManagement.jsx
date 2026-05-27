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
  const [groups, setGroups] = useState([]);
  const [view, setView] = useState('pending');
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [showRemarksModal, setShowRemarksModal] = useState(false);
  const [actionType, setActionType] = useState('');
  const [remarks, setRemarks] = useState('');

  const fetchGroups = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/leave-requests/grouped`, getAuthHeaders());
      const all = res.data || [];
      setGroups(all);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load leave requests');
      setGroups([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  const openActionModal = (group, action) => {
    setSelectedGroup(group);
    setActionType(action);
    setRemarks('');
    setShowRemarksModal(true);
  };

  const handleBatchAction = async () => {
    if (!selectedGroup) return;
    try {
      await axios.put(
        `${API_BASE}/leave-requests/batch-status`,
        {
          ids: selectedGroup.ids,
          status: actionType,
          admin_remarks: remarks.trim() || null
        },
        getAuthHeaders()
      );
      toast.success(`${selectedGroup.request_count} leave request(s) ${actionType.toLowerCase()}.`);
      setShowRemarksModal(false);
      fetchGroups();
    } catch (err) {
      console.error(err);
      toast.error('Action failed');
    }
  };

  const formatDateRange = (start, end) => {
    if (!start) return '';
    if (start === end) return start;
    return `${start} – ${end}`;
  };

  const filteredGroups = groups
    .filter(group =>
      view === 'pending' ? group.status === 'Pending' : group.status !== 'Pending'
    )
    .filter(group =>
      group.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      group.employee_id?.toLowerCase().includes(searchTerm.toLowerCase())
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
          <button className="btn-refresh" onClick={fetchGroups} title="Refresh">
            <RefreshCw size={18} />
          </button>
        </div>
      </div>

      <div className="lm-tabs">
        <button
          className={`lm-tab ${view === 'pending' ? 'active' : ''}`}
          onClick={() => setView('pending')}
        >
          Pending <span className="badge-count">{groups.filter(g => g.status === 'Pending').length}</span>
        </button>
        <button
          className={`lm-tab ${view === 'history' ? 'active' : ''}`}
          onClick={() => setView('history')}
        >
          History <span className="badge-count">{groups.filter(g => g.status !== 'Pending').length}</span>
        </button>
      </div>

      <div className="lm-table-wrapper">
        <table className="lm-table">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Type</th>
              <th>Date Range</th>
              <th>Days</th>
              <th>Reason</th>
              {view === 'pending' && <th>Actions</th>}
              {view === 'history' && <th>Status</th>}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="empty-row">Loading...</td>
              </tr>
            ) : filteredGroups.length === 0 ? (
              <tr>
                <td colSpan="6" className="empty-row">No leave requests found.</td>
              </tr>
            ) : (
              filteredGroups.map(group => (
                <tr key={group.ids?.[0] || Math.random()}>
                  <td>
                    <div className="employee-info">
                      <strong>{group.full_name || 'Unknown'}</strong>
                      <small>{group.employee_id || ''}</small>
                    </div>
                  </td>
                  <td>
                    {group.type || 'Leave'} 
                    {group.type === 'Sick Leave' ? ' 🤒' : group.type === 'Vacation' ? ' 🏖️' : ' 📝'}
                  </td>
                  <td>{formatDateRange(group.start_date, group.end_date)}</td>
                  <td className="text-center">{group.request_count || 1} day(s)</td>
                  <td>
                    <div className="reason-text" title={group.reason}>
                      {group.reason?.substring(0, 80)}{group.reason?.length > 80 ? '…' : ''}
                    </div>
                  </td>
                  {view === 'pending' && (
                    <td className="actions-cell">
                      <button className="btn-approve" onClick={() => openActionModal(group, 'Approved')}>
                        <Check size={14} /> Approve All
                      </button>
                      <button className="btn-reject" onClick={() => openActionModal(group, 'Rejected')}>
                        <X size={14} /> Reject All
                      </button>
                    </td>
                  )}
                  {view === 'history' && (
                    <td>
                      <span className={`status-badge ${(group.status || '').toLowerCase()}`}>
                        {group.status || 'Pending'}
                      </span>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Batch Action Modal */}
      <FormalModal
        show={showRemarksModal}
        onClose={() => setShowRemarksModal(false)}
        title={`${actionType} Leave Request${selectedGroup?.request_count > 1 ? 's' : ''}`}
        footer={
          <>
            <button className="btn-modal-cancel" onClick={() => setShowRemarksModal(false)}>Cancel</button>
            <button className="btn-modal-submit" onClick={handleBatchAction}>
              Yes, {actionType} {selectedGroup?.request_count} request(s)
            </button>
          </>
        }
      >
        <p>
          Are you sure you want to <strong>{actionType.toLowerCase()}</strong> the leave request
          {selectedGroup?.request_count > 1 && `s`} for <strong>{selectedGroup?.full_name}</strong> from
          <strong> {selectedGroup?.start_date}</strong> to <strong>{selectedGroup?.end_date}</strong>?
        </p>
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