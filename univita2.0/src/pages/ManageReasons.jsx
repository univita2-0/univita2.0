// src/pages/ManageReasons.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Plus, Trash2, Edit2, Check, X, AlertCircle, List } from 'lucide-react';
import { API_BASE } from '../api';
import FormalModal from '../components/FormalModal';
import './ManageReasons.css';

const getAuthHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('auth_token')}` }
});

const ManageReasons = () => {
  const [reasons, setReasons] = useState([]);
  const [newReason, setNewReason] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);

  const fetchReasons = async () => {
    setFetchLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/visit-reasons`, getAuthHeaders());
      setReasons(res.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load reasons');
    } finally {
      setFetchLoading(false);
    }
  };

  useEffect(() => { fetchReasons(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newReason.trim()) {
      toast.warning('Please enter a reason');
      return;
    }
    setLoading(true);
    try {
      await axios.post(`${API_BASE}/visit-reasons`, { reason_text: newReason.trim() }, getAuthHeaders());
      toast.success('Reason added successfully');
      setNewReason('');
      fetchReasons();
    } catch (err) {
      toast.error('Failed to add reason');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id) => {
    setDeleteTargetId(id);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    try {
      await axios.delete(`${API_BASE}/visit-reasons/${deleteTargetId}`, getAuthHeaders());
      toast.success('Reason deleted');
      setShowDeleteConfirm(false);
      fetchReasons();
    } catch (err) {
      toast.error('Failed to delete reason');
    }
  };

  const startEdit = (id, text) => {
    setEditingId(id);
    setEditValue(text);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValue('');
  };

  const saveEdit = async (id) => {
    if (!editValue.trim()) {
      toast.warning('Reason cannot be empty');
      return;
    }
    try {
      await axios.put(`${API_BASE}/visit-reasons/${id}`, { reason_text: editValue.trim() }, getAuthHeaders());
      toast.success('Reason updated');
      setEditingId(null);
      fetchReasons();
    } catch (err) {
      toast.error('Failed to update reason');
    }
  };

  return (
    <div className="mgr-container">
      <div className="mgr-card">
        <div className="mgr-card-header">
          <div>
            <h2>Visit Reasons</h2>
            <p className="mgr-subtitle">Manage appointment reasons that visitors can select when booking a visit.</p>
          </div>
          <div className="mgr-stats">
            <List size={18} />
            <span>{reasons.length} {reasons.length === 1 ? 'Reason' : 'Reasons'}</span>
          </div>
        </div>

        <form onSubmit={handleAdd} className="mgr-add-form">
          <div className="mgr-input-group">
            <label htmlFor="newReason">New Reason</label>
            <input
              id="newReason"
              type="text"
              placeholder="e.g., Facility Tour, Interview, Meeting"
              value={newReason}
              onChange={(e) => setNewReason(e.target.value)}
              className="mgr-input"
            />
          </div>
          <button type="submit" className="btn-primary" disabled={loading}>
            <Plus size={16} /> {loading ? 'Adding...' : 'Add Reason'}
          </button>
        </form>

        <div className="mgr-table-wrapper">
          {fetchLoading ? (
            <div className="loading-spinner">
              <div className="spinner"></div>
              <p>Loading reasons...</p>
            </div>
          ) : reasons.length === 0 ? (
            <div className="empty-state">
              <AlertCircle size={48} />
              <p>No reasons configured yet</p>
              <span>Add your first reason using the form above</span>
            </div>
          ) : (
            <table className="mgr-table">
              <thead>
                <tr>
                  <th>Reason</th>
                  <th className="mgr-actions-header">Actions</th>
                </tr>
              </thead>
              <tbody>
                {reasons.map((reason) => (
                  <tr key={reason.id}>
                    <td className="mgr-reason-cell">
                      {editingId === reason.id ? (
                        <input
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="mgr-edit-input"
                          autoFocus
                        />
                      ) : (
                        <span>{reason.reason_text}</span>
                      )}
                    </td>
                    <td className="mgr-actions-cell">
                      {editingId === reason.id ? (
                        <div className="mgr-action-group">
                          <button
                            className="btn-icon btn-save"
                            onClick={() => saveEdit(reason.id)}
                            title="Save"
                          >
                            <Check size={16} />
                          </button>
                          <button
                            className="btn-icon btn-cancel"
                            onClick={cancelEdit}
                            title="Cancel"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ) : (
                        <div className="mgr-action-group">
                          <button
                            className="btn-icon btn-edit"
                            onClick={() => startEdit(reason.id, reason.reason_text)}
                            title="Edit"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            className="btn-icon btn-delete"
                            onClick={() => handleDelete(reason.id)}
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <FormalModal
        show={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title="Delete Reason"
        footer={
          <>
            <button className="btn-modal-cancel" onClick={() => setShowDeleteConfirm(false)}>
              Cancel
            </button>
            <button className="btn-modal-submit btn-danger" onClick={confirmDelete}>
              Yes, Delete
            </button>
          </>
        }
      >
        <p>Are you sure you want to permanently delete <strong>{reasons.find(r => r.id === deleteTargetId)?.reason_text}</strong>?</p>
        <p className="mgr-modal-warning">This action cannot be undone. Visitors will no longer see this reason when booking appointments.</p>
      </FormalModal>
    </div>
  );
};

export default ManageReasons;