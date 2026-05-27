// src/pages/History.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Eye, Calendar, Clock, X, CalendarIcon } from 'lucide-react';
import FormalModal from '../components/FormalModal';
import { toast } from 'react-toastify';
import { API_BASE } from '../api';
import './History.css';

const getAuthHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('auth_token')}` }
});

const History = () => {
  const [historyData, setHistoryData] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  
  // Modal state
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [editDate, setEditDate] = useState('');
  const [editTime, setEditTime] = useState('');
  const [updating, setUpdating] = useState(false);
  const [isPastAppointment, setIsPastAppointment] = useState(false);

  const fetchHistory = async () => {
    try {
      const res = await axios.get(`${API_BASE}/appointments/history`, getAuthHeaders());
      setHistoryData(res.data);
    } catch (err) {
      console.error("Error fetching history:", err);
      toast.error('Failed to load history');
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  // Filter by selected date
  const filteredData = historyData.filter(item => {
    if (!selectedDate) return true;
    const itemDate = new Date(item.visit_date).toISOString().split('T')[0];
    return itemDate === selectedDate;
  });

  const openDetails = (appointment) => {
    setSelectedAppointment(appointment);
    const visitDate = appointment.visit_date?.split('T')[0] || '';
    setEditDate(visitDate);
    setEditTime(appointment.visit_time?.substring(0,5) || '');
    
    const today = new Date().toISOString().split('T')[0];
    setIsPastAppointment(visitDate < today);
    
    setShowDetailModal(true);
  };

  const handleUpdate = async () => {
    if (!editDate || !editTime) {
      toast.warning('Please provide both date and time');
      return;
    }
    setUpdating(true);
    try {
      await axios.put(`${API_BASE}/appointments/${selectedAppointment.id}`, {
        visit_date: editDate,
        visit_time: editTime
      }, getAuthHeaders());
      toast.success('Appointment updated successfully');
      setShowDetailModal(false);
      fetchHistory();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || 'Update failed');
    } finally {
      setUpdating(false);
    }
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return '—';
    const [hour, minute] = timeStr.split(':');
    let h = parseInt(hour, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return `${h}:${minute} ${ampm}`;
  };

  const formatDisplayDate = (dateStr) => {
    if (!dateStr) return 'Select date';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <div className="history-container">
      <div className="history-card">
        <div className="history-header">
          <h2 className="history-title">Request Visit History</h2>
          <div className="date-filter-pill">
            <CalendarIcon size={16} />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="date-picker-input"
            />
            {selectedDate && (
              <button
                className="clear-date-btn"
                onClick={() => setSelectedDate('')}
                title="Clear filter"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        <div className="table-wrapper">
          <table className="history-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Reason</th>
                <th>Date</th>
                <th>Time</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length === 0 ? (
                <tr className="empty-row">
                  <td colSpan="7">
                    {selectedDate
                      ? `No visits found for ${formatDisplayDate(selectedDate)}`
                      : 'No visit history found.'}
                  </td>
                </tr>
              ) : (
                filteredData.map((item) => (
                  <tr key={item.id}>
                    <td className="guest-name">{item.first_name} {item.last_name}</td>
                    <td className="guest-email">{item.email}</td>
                    <td className="purpose-cell">{item.reason}</td>
                    <td>{new Date(item.visit_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                    <td>{formatTime(item.visit_time)}</td>
                    <td>
                      <span className={`status-badge ${item.status.toLowerCase()}`}>
                        {item.status}
                      </span>
                    </td>
                    <td>
                      <button className="action-eye" onClick={() => openDetails(item)}>
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal (unchanged) */}
      <FormalModal
        show={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title="Appointment Details"
        size="medium"
        footer={
          <>
            <button className="btn-modal-cancel" onClick={() => setShowDetailModal(false)}>Close</button>
            {!isPastAppointment && (
              <button className="btn-modal-submit" onClick={handleUpdate} disabled={updating}>
                {updating ? 'Saving...' : 'Save Changes'}
              </button>
            )}
          </>
        }
      >
        {selectedAppointment && (
          <div className="appointment-details">
            <div className="detail-row"><strong>Name:</strong> {selectedAppointment.first_name} {selectedAppointment.last_name}</div>
            <div className="detail-row"><strong>Email:</strong> {selectedAppointment.email}</div>
            {selectedAppointment.phone && <div className="detail-row"><strong>Phone:</strong> {selectedAppointment.phone}</div>}
            <div className="detail-row"><strong>Purpose:</strong> {selectedAppointment.reason}</div>
            <div className="detail-row"><strong>Status:</strong> <span className={`status-badge ${selectedAppointment.status.toLowerCase()}`}>{selectedAppointment.status}</span></div>
            {isPastAppointment ? (
              <div className="detail-row read-only-message">This appointment is in the past and cannot be edited.</div>
            ) : (
              <div className="detail-row edit-fields">
                <div className="edit-field"><label><Calendar size={14} /> Date</label><input type="date" value={editDate} onChange={(e) => setEditDate(e.target.value)} min={new Date().toISOString().split('T')[0]} /></div>
                <div className="edit-field"><label><Clock size={14} /> Time</label><input type="time" value={editTime} onChange={(e) => setEditTime(e.target.value)} /></div>
              </div>
            )}
            {selectedAppointment.admin_notes && <div className="detail-row"><strong>Admin Notes:</strong> {selectedAppointment.admin_notes}</div>}
          </div>
        )}
      </FormalModal>
    </div>
  );
};

export default History;