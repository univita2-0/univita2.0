import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { RefreshCw, History, AlertCircle, Eye } from 'lucide-react';
import FormalModal from '../components/FormalModal';
import { API_BASE } from '../api';
import './LocationTracking.css';

const getAuthHeaders = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('auth_token')}` } });

const LocationTracking = () => {
  const [instructors, setInstructors] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Date filter
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  
  // History modal
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyDate, setHistoryDate] = useState(new Date().toISOString().split('T')[0]);
  const [alertHistory, setAlertHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  
  // Timeline modal (per instructor)
  const [showTimelineModal, setShowTimelineModal] = useState(false);
  const [selectedInstructor, setSelectedInstructor] = useState(null);
  const [timelineData, setTimelineData] = useState({ timeline: [], alerts: [] });
  const [timelineLoading, setTimelineLoading] = useState(false);

  // Helper: convert HH:MM:SS to 12‑hour format
  const formatTo12Hour = (timeString) => {
    if (!timeString || timeString === '00:00:00') return 'N/A';
    const [hours, minutes] = timeString.split(':');
    const h = parseInt(hours, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const displayHours = h % 12 || 12;
    return `${displayHours}:${minutes} ${ampm}`;
  };

  // Fetch main tracking data for the selected date
  const fetchData = async (date = selectedDate) => {
    setLoading(true);
    try {
      const [statusRes, alertsRes] = await Promise.all([
        axios.get(`${API_BASE}/location-tracking/status?date=${date}`, getAuthHeaders()),
        axios.get(`${API_BASE}/location-tracking/alerts?date=${date}`, getAuthHeaders())
      ]);
      setInstructors(statusRes.data || []);
      setAlerts(alertsRes.data || []);
    } catch (err) {
      toast.error('Failed to load tracking data.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch alert history for the selected date (used in history modal)
  const fetchAlertHistory = async (date) => {
    setHistoryLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/location-tracking/alerts?date=${date}`, getAuthHeaders());
      setAlertHistory(res.data);
    } catch (err) {
      toast.error('Failed to load alert history');
    } finally {
      setHistoryLoading(false);
    }
  };

  // Open timeline modal for an instructor on the selected date
  const openTimelineModal = async (employeeId, fullName) => {
    setSelectedInstructor({ id: employeeId, name: fullName });
    setShowTimelineModal(true);
    setTimelineLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/location-tracking/instructor-timeline/${employeeId}?date=${selectedDate}`, getAuthHeaders());
      setTimelineData(res.data);
    } catch (err) {
      toast.error('Failed to load timeline data');
    } finally {
      setTimelineLoading(false);
    }
  };

  // Initial load and whenever date changes
  useEffect(() => {
    fetchData(selectedDate);
  }, [selectedDate]);

  // WebSocket real‑time updates (only for today's data, but we keep it generic)
  useEffect(() => {
    const ws = new WebSocket(`ws://${window.location.hostname}:5000?token=${localStorage.getItem('auth_token')}`);
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'instructor_status_update') {
        // Only update if we are viewing today
        if (selectedDate === new Date().toISOString().split('T')[0]) {
          setInstructors(prev => prev.map(inst =>
            inst.employee_id === data.instructor.employee_id ? { ...inst, ...data.instructor } : inst
          ));
        }
      } else if (data.type === 'new_alert') {
        if (selectedDate === new Date().toISOString().split('T')[0]) {
          fetchData(selectedDate);
        }
      }
    };
    return () => ws.close();
  }, [selectedDate]);

  // Load history when modal opens
  useEffect(() => {
    if (showHistoryModal) {
      fetchAlertHistory(historyDate);
    }
  }, [showHistoryModal, historyDate]);

  return (
    <div className="lt-dashboard">
      <div className="lt-header">
        <div>
          <h1>Location Tracking</h1>
          <p className="subtitle">Real-time campus geofencing compliance</p>
        </div>
        <div className="lt-actions">
          <input
            type="date"
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
            className="date-picker"
          />
          <button className="nav-action-btn" onClick={() => setShowHistoryModal(true)}>
            <History size={16} /> History
          </button>
          <button className="nav-action-btn sync-btn" onClick={() => fetchData(selectedDate)}>
            <RefreshCw size={16} /> Sync
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading-skeleton">Loading...</div>
      ) : (
        <>
          <div className="stats-row">
            <div className="stat-card">
              <div className="stat-value">{instructors.length}</div>
              <div className="stat-label">Active</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{instructors.filter(i => i.gps_status === 'GPS ON').length}</div>
              <div className="stat-label">GPS On</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{instructors.filter(i => i.last_is_inside === 1).length}</div>
              <div className="stat-label">On‑Campus</div>
            </div>
            <div className="stat-card">
              <div className="stat-value" style={{ color: '#dc2626' }}>{alerts.length}</div>
              <div className="stat-label">Alerts</div>
            </div>
          </div>

          <div className="card">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Instructor</th>
                  <th>Assignment</th>
                  <th>GPS Status</th>
                  <th>Campus Status</th>
                  <th>Last Position</th>
                  <th>Entered Campus</th>
                  <th>Went Outside</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {instructors.length === 0 ? (
                  <tr className="empty-row">
                    <td colSpan="8">No instructors with schedules on this date.</td>
                  </tr>
                ) : (
                  instructors.map(inst => {
                    const isGpsOn = inst.gps_status === 'GPS ON';
                    const isOutside = inst.last_is_inside === 0;
                    const isAlert = !isGpsOn || isOutside;

                    return (
                      <tr key={inst.employee_id} className={isAlert ? 'alert-row' : ''}>
                        <td>
                          <div className="instructor-name">{inst.full_name}</div>
                          <div className="employee-id">{inst.employee_id}</div>
                        </td>
                        <td>
                          {inst.schedule_course ? (
                            <div className="schedule-badge">
                              <span className="schedule-course">{inst.schedule_course}</span>
                              <span className="schedule-time">
                                {formatTo12Hour(inst.start_time)} – {formatTo12Hour(inst.end_time)}
                              </span>
                            </div>
                          ) : (
                            <div className="no-schedule-text">No active shift</div>
                          )}
                        </td>
                        <td>
                          <span className={`status-pill ${isGpsOn ? 'pill-gps-on' : 'pill-gps-off'}`}>
                            {inst.gps_status}
                          </span>
                        </td>
                        <td>
                          <span className={`status-pill ${inst.last_is_inside === 1 ? 'pill-active' : 'pill-outside'}`}>
                            {inst.last_is_inside === 1 ? 'INSIDE' : 'OUTSIDE'}
                          </span>
                        </td>
                        <td className="coordinates">
                          {isGpsOn ? (inst.last_position_name || 'Calculating...') : 'Unavailable'}
                        </td>
                        <td>{inst.campus_entry_time || '—'}</td>
                        <td>{inst.campus_exit_time || '—'}</td>
                        <td>
                          <button
                            className="action-icon eye-icon"
                            onClick={() => openTimelineModal(inst.employee_id, inst.full_name)}
                            title="View detailed timeline"
                          >
                            <Eye size={18} />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* History Modal (enlarged) */}
      <FormalModal
        show={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
        title="Alert History"
        wide
        style={{ maxWidth: '85vw', maxHeight: '85vh', overflowY: 'auto' }}
      >
        <div className="history-controls">
          <label>Filter by date:</label>
          <input
            type="date"
            value={historyDate}
            onChange={e => setHistoryDate(e.target.value)}
          />
          <button onClick={() => fetchAlertHistory(historyDate)}>Refresh</button>
        </div>
        {historyLoading ? (
          <p>Loading...</p>
        ) : (
          <table className="data-table small">
            <thead>
              <tr>
                <th>Time</th>
                <th>Instructor</th>
                <th>Alert Message</th>
                <th>Location (lat, lng)</th>
              </tr>
            </thead>
            <tbody>
              {alertHistory.length === 0 ? (
                <tr><td colSpan="4">No alerts on this date.</td></tr>
              ) : (
                alertHistory.map(alert => (
                  <tr key={alert.id}>
                    <td>{new Date(alert.created_at).toLocaleString()}</td>
                    <td>{alert.full_name}</td>
                    <td>{alert.alert_message}</td>
                    <td>{alert.latitude}, {alert.longitude}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </FormalModal>

      {/* Timeline Modal (per instructor, enlarged) */}
      <FormalModal
        show={showTimelineModal}
        onClose={() => setShowTimelineModal(false)}
        title={`Timeline for ${selectedInstructor?.name} (${selectedDate})`}
        wide
        style={{ maxWidth: '85vw', maxHeight: '85vh', overflowY: 'auto' }}
      >
        {timelineLoading ? (
          <div className="loading-skeleton">Loading timeline...</div>
        ) : (
          <>
            <h4>GPS & Campus Status Changes</h4>
            <table className="data-table small">
              <thead>
                <tr>
                  <th>Time (Manila)</th>
                  <th>GPS Enabled</th>
                  <th>Campus Status</th>
                  <th>Location Name</th>
                </tr>
              </thead>
              <tbody>
                {timelineData.timeline.length === 0 ? (
                  <tr><td colSpan="4">No tracking records for this date.</td></tr>
                ) : (
                  timelineData.timeline.map((rec, idx) => (
                    <tr key={idx}>
                      <td>{new Date(rec.ping_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}</td>
                      <td>{rec.location_enabled ? 'ON' : 'OFF'}</td>
                      <td>{rec.is_inside_campus ? 'INSIDE' : 'OUTSIDE'}</td>
                      <td>{rec.location_name}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            <h4>Alerts</h4>
            <table className="data-table small">
              <thead>
                <tr><th>Time</th><th>Alert Message</th></tr>
              </thead>
              <tbody>
                {timelineData.alerts.length === 0 ? (
                  <tr><td colSpan="2">No alerts recorded on this date.</td></tr>
                ) : (
                  timelineData.alerts.map(alert => (
                    <tr key={alert.id}>
                      <td>{new Date(alert.created_at).toLocaleTimeString()}</td>
                      <td>{alert.alert_message}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </>
        )}
      </FormalModal>
    </div>
  );
};

export default LocationTracking;