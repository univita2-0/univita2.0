import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Clock, CheckCircle, XCircle, History } from 'lucide-react';
import { API_BASE } from '../api';
import FormalModal from '../components/FormalModal';
import './OvertimeRequests.css';

const getAuthHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('auth_token')}` }
});

const OvertimeRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // History modal state
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyRequests, setHistoryRequests] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const fetchPending = async () => {
    try {
      const res = await axios.get(`${API_BASE}/overtime-requests/pending`, getAuthHeaders());
      setRequests(res.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load pending requests');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllHistory = async () => {
    setLoadingHistory(true);
    try {
      const res = await axios.get(`${API_BASE}/overtime-requests/all`, getAuthHeaders());
      setHistoryRequests(res.data);
      setShowHistoryModal(true);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load history');
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleAction = async (id, status) => {
    try {
      await axios.put(`${API_BASE}/overtime-requests/${id}/status`, { status }, getAuthHeaders());
      toast.success(`Request ${status}`);
      fetchPending(); // refresh pending list
    } catch (err) {
      console.error(err);
      toast.error(`Failed to ${status} request`);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const getScenarioLabel = (scenario) => {
    switch (scenario) {
      case 'future': return 'Future Date';
      case 'ongoing': return 'Ongoing Shift';
      case 'after_shift': return 'After Shift';
      default: return scenario || '—';
    }
  };

  const getStatusClass = (status) => {
    const s = status?.toLowerCase();
    if (s === 'approved') return 'status-approved';
    if (s === 'rejected') return 'status-rejected';
    return 'status-pending';
  };

  if (loading) return <div className="loading-spinner">Loading...</div>;

  return (
    <div className="ot-container">
      <div className="ot-header">
        <Clock size={24} />
        <h2>Overtime Requests</h2>
        <button className="ot-history-btn" onClick={fetchAllHistory}>
          <History size={18} /> History
        </button>
      </div>

      {requests.length === 0 ? (
        <div className="ot-empty">No pending overtime requests.</div>
      ) : (
        <div className="ot-table-wrapper">
          <table className="ot-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Date</th>
                <th>Scenario</th>
                <th>Start</th>
                <th>End</th>
                <th>Reason</th>
                <th>Attachment</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map(req => (
                <tr key={req.id}>
                  <td>{req.full_name} ({req.employee_id})</td>
                  <td>{req.date}</td>
                  <td>{getScenarioLabel(req.scenario_type)}</td>
                  <td>{req.start_time}</td>
                  <td>{req.end_time}</td>
                  <td>{req.reason}</td>
                  <td>
                    {req.attachment ? (
                      <a href={`${API_BASE.replace('/api', '')}${req.attachment}`} target="_blank" rel="noopener noreferrer">
                        View
                      </a>
                    ) : '—'}
                   </td>
                  <td className="ot-actions">
                    <button className="ot-approve" onClick={() => handleAction(req.id, 'approved')}>
                      <CheckCircle size={18} /> Approve
                    </button>
                    <button className="ot-reject" onClick={() => handleAction(req.id, 'rejected')}>
                      <XCircle size={18} /> Reject
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* History Modal */}
      <FormalModal
        show={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
        title="Overtime Request History"
        size="large"
        footer={<button className="btn-modal-cancel" onClick={() => setShowHistoryModal(false)}>Close</button>}
      >
        {loadingHistory ? (
          <div className="text-center p-4">Loading history...</div>
        ) : historyRequests.length === 0 ? (
          <div className="text-center p-4 text-gray-500">No overtime requests found.</div>
        ) : (
          <div className="history-table-wrapper">
            <table className="history-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Employee</th>
                  <th>Date</th>
                  <th>Scenario</th>
                  <th>Time</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Processed</th>
                  <th>Submitted</th>
                </tr>
              </thead>
              <tbody>
                {historyRequests.map(req => (
                  <tr key={req.id}>
                    <td>{req.id}</td>
                    <td>{req.full_name}<br/><span className="emp-id-small">{req.employee_id}</span></td>
                    <td>{req.date}</td>
                    <td>{getScenarioLabel(req.scenario_type)}</td>
                    <td>{req.start_time} – {req.end_time}</td>
                    <td className="reason-cell">{req.reason}</td>
                    <td><span className={`status-badge ${getStatusClass(req.status)}`}>{req.status?.toUpperCase()}</span></td>
                    <td>{req.processed ? '✓ Yes' : '❌ No'}</td>
                    <td>{new Date(req.created_at).toLocaleString()}</td>
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

export default OvertimeRequests;