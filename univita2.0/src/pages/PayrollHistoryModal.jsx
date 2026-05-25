// src/pages/PayrollHistoryModal.jsx
import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { API_BASE } from '../api';

const getAuthHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('auth_token')}` }
});

const PayrollHistoryModal = ({ show, onClose }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!show) return;
    setLoading(true);
    axios.get(`${API_BASE}/payroll/access-logs`, getAuthHeaders())
      .then(res => setLogs(res.data))
      .catch(err => {
        console.error(err);
        toast.error('Failed to load access logs');
      })
      .finally(() => setLoading(false));
  }, [show]);

  if (!show) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content history-modal">
        <div className="modal-header">
          <h3>Payroll Access History</h3>
          <button onClick={onClose} className="close-modal-btn"><X size={20} /></button>
        </div>
        <div className="modal-body">
          {loading ? (
            <p>Loading...</p>
          ) : logs.length === 0 ? (
            <p>No access records found.</p>
          ) : (
            <table className="history-table">
              <thead>
                <tr>
                  <th>Admin</th>
                  <th>Email</th>
                  <th>Date & Time</th>
                </tr>
              </thead>
              <tbody>
                {logs.map(log => (
                  <tr key={log.accessed_at}>
                    <td>{log.full_name}</td>
                    <td>{log.email}</td>
                    <td>{new Date(log.accessed_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default PayrollHistoryModal;