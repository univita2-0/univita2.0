// src/pages/ManageRequest.jsx
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Search, Check, X, Eye, Calendar, Clock, User, Mail, Phone, Users, AlertCircle } from 'lucide-react';
import FormalModal from '../components/FormalModal';
import { API_BASE } from '../api';
import './ManageRequest.css';

const getAuthHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('auth_token')}` }
});

const ManageRequest = () => {
  const [requests, setRequests] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [additionalVisitors, setAdditionalVisitors] = useState([]);

  // Modal states
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/appointments/pending`, getAuthHeaders());
      setRequests(res.data || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load pending requests');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const fetchAdditionalVisitors = async (appointmentId) => {
    try {
      const res = await axios.get(`${API_BASE}/appointments/${appointmentId}/visitors`, getAuthHeaders());
      return res.data || [];
    } catch (err) {
      console.error('Error fetching visitors:', err);
      return [];
    }
  };

  const openRejectModal = (request) => {
    setSelectedRequest(request);
    setRejectionReason('');
    setShowRejectModal(true);
  };

  const handleApprove = async (req) => {
    const currentAdminId = localStorage.getItem('user_id');
    if (!currentAdminId) {
      toast.error("Session Error: Please logout and login again.");
      return;
    }
    try {
      await axios.put(`${API_BASE}/appointments/${req.id}/status`, {
        status: 'APPROVED',
        adminNotes: '',
        visitorEmail: req.email,
        visitorName: `${req.first_name || ''} ${req.last_name || ''}`,
        adminId: currentAdminId
      }, getAuthHeaders());
      toast.success('Visit request approved successfully!');
      fetchRequests();
      setShowDetailsModal(false);
    } catch (err) {
      console.error(err);
      toast.error('Failed to approve request.');
    }
  };

  const handleRejectConfirm = async () => {
    if (!rejectionReason.trim()) {
      toast.warning('Please provide a reason for rejection.');
      return;
    }
    const currentAdminId = localStorage.getItem('user_id');
    if (!currentAdminId) {
      toast.error("Session Error: Please logout and login again.");
      return;
    }
    try {
      await axios.put(`${API_BASE}/appointments/${selectedRequest.id}/status`, {
        status: 'REJECTED',
        adminNotes: rejectionReason,
        visitorEmail: selectedRequest.email,
        visitorName: `${selectedRequest.first_name || ''} ${selectedRequest.last_name || ''}`,
        adminId: currentAdminId
      }, getAuthHeaders());
      toast.success('Visit request rejected successfully.');
      setShowRejectModal(false);
      setSelectedRequest(null);
      setRejectionReason('');
      fetchRequests();
    } catch (err) {
      console.error(err);
      toast.error('Failed to reject request.');
    }
  };

  const openDetailsModal = async (request) => {
    setSelectedRequest(request);
    const visitors = await fetchAdditionalVisitors(request.id);
    setAdditionalVisitors(visitors);
    setShowDetailsModal(true);
  };

  const filteredRequests = requests.filter(req => {
    const fullName = `${req.first_name || ''} ${req.last_name || ''}`.toLowerCase();
    const email = (req.email || '').toLowerCase();
    return fullName.includes(searchTerm.toLowerCase()) || email.includes(searchTerm.toLowerCase());
  });

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return '--:--';
    return timeStr.substring(0, 5);
  };

  return (
    <div className="mrq-container">
      <div className="mrq-card">
        <div className="mrq-card-header">
          <div>
            <h2>Pending Visit Requests</h2>
            <p className="mrq-subtitle">Review and manage visitor appointment requests</p>
          </div>
          <div className="search-wrapper">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        <div className="mrq-table-wrapper">
          {loading ? (
            <div className="loading-spinner">
              <div className="spinner"></div>
              <p>Loading requests...</p>
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="empty-state">
              <AlertCircle size={48} />
              <p>No pending requests found</p>
              {searchTerm && <span>Try a different search term</span>}
            </div>
          ) : (
            <table className="mrq-table">
              <thead>
                <tr>
                  <th>Guest</th>
                  <th>Date & Time</th>
                  <th>Purpose</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests.map((req) => (
                  <tr key={req.id}>
                    <td className="guest-cell">
                      <div className="guest-name">
                        {req.first_name} {req.last_name}
                      </div>
                      <div className="guest-email">{req.email}</div>
                      {req.phone && <div className="guest-phone">{req.phone}</div>}
                    </td>
                    <td className="datetime-cell">
                      <div className="date">
                        <Calendar size={12} />
                        <span>{formatDate(req.visit_date)}</span>
                      </div>
                      <div className="time">
                        <Clock size={12} />
                        <span>{formatTime(req.visit_time)}</span>
                      </div>
                    </td>
                    <td className="purpose-cell">{req.reason || '—'}</td>
                    <td className="actions-cell">
                      <div className="action-buttons">
                        <button
                          className="action-icon"
                          onClick={() => openDetailsModal(req)}
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          className="action-approve"
                          onClick={() => handleApprove(req)}
                        >
                          <Check size={14} /> Approve
                        </button>
                        <button
                          className="action-reject"
                          onClick={() => openRejectModal(req)}
                        >
                          <X size={14} /> Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Reject Modal */}
      <FormalModal
        show={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        title="Reject Visit Request"
        footer={
          <>
            <button className="btn-modal-cancel" onClick={() => setShowRejectModal(false)}>
              Cancel
            </button>
            <button className="btn-modal-submit btn-danger" onClick={handleRejectConfirm}>
              Reject Request
            </button>
          </>
        }
      >
        <p>
          Are you sure you want to reject <strong>{selectedRequest?.first_name} {selectedRequest?.last_name}</strong>'s visit request?
        </p>
        <div className="modal-form-group">
          <label>Reason for rejection *</label>
          <textarea
            rows="3"
            className="modal-input"
            placeholder="Provide a clear explanation..."
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
          />
        </div>
      </FormalModal>

      {/* Details Modal */}
      <FormalModal
        show={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        title="Visit Request Details"
        wide
        footer={
          <div className="details-modal-actions">
            <button className="btn-modal-cancel" onClick={() => setShowDetailsModal(false)}>
              Close
            </button>
            <button className="btn-approve-modal" onClick={() => handleApprove(selectedRequest)}>
              <Check size={14} /> Approve
            </button>
            <button className="btn-reject-modal" onClick={() => {
              setShowDetailsModal(false);
              openRejectModal(selectedRequest);
            }}>
              <X size={14} /> Reject
            </button>
          </div>
        }
      >
        {selectedRequest && (
          <>
            <div className="details-grid">
              <div className="detail-item">
                <User size={16} />
                <strong>Name:</strong>
                <span>{selectedRequest.first_name} {selectedRequest.last_name}</span>
              </div>
              <div className="detail-item">
                <Mail size={16} />
                <strong>Email:</strong>
                <span>{selectedRequest.email}</span>
              </div>
              <div className="detail-item">
                <Phone size={16} />
                <strong>Phone:</strong>
                <span>{selectedRequest.phone || 'N/A'}</span>
              </div>
              <div className="detail-item">
                <Calendar size={16} />
                <strong>Date:</strong>
                <span>{formatDate(selectedRequest.visit_date)}</span>
              </div>
              <div className="detail-item">
                <Clock size={16} />
                <strong>Time:</strong>
                <span>{formatTime(selectedRequest.visit_time)}</span>
              </div>
              <div className="detail-item full-width">
                <strong>Purpose:</strong>
                <span className="purpose-text">{selectedRequest.reason || '—'}</span>
              </div>
            </div>

            {additionalVisitors.length > 0 && (
              <div className="additional-visitors">
                <h4><Users size={16} /> Additional Visitors</h4>
                <ul>
                  {additionalVisitors.map((v, idx) => (
                    <li key={idx}>{v.visitor_name}</li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </FormalModal>
    </div>
  );
};

export default ManageRequest;