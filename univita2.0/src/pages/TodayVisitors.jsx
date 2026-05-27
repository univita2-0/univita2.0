// src/pages/TodayVisitors.jsx
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { User, Info, RefreshCw, Calendar } from 'lucide-react';
import { API_BASE } from '../api';
import FormalModal from '../components/FormalModal';
import './TodayVisitors.css';

const getAuthHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('auth_token')}` }
});

// ----- Floor‑specific room lists (unchanged) -----
const FLOOR_3_ROOMS = [
  'AHA Room', 'Private Room', 'Operating Room', 'Delivery Room', 'MICU', 'ICU',
  'Classroom', 'Library', 'Breakout Room 1', 'Breakout Room 2', 'Breakout Room 3',
  'Faculty Room', 'Main Entrance'
];
const FLOOR_5_ROOMS = [
  'Lounge / IV Drip', 'Operating Room', 'Delivery Room', 'ICU', 'Educ Head',
  'Executive', 'Conference', 'Creatives', 'Debrief Room', 'Entrance',
  'AHA Room', 'Classroom 1', 'Classroom 2', 'HR / Admin', 'Pantry'
];

const ALL_ROOMS = [...new Set([...FLOOR_3_ROOMS, ...FLOOR_5_ROOMS])];

const getFloorByRoom = (roomName) => {
  if (FLOOR_3_ROOMS.includes(roomName)) return '3';
  if (FLOOR_5_ROOMS.includes(roomName)) return '5';
  return '3';
};

const formatTo12Hour = (timeStr) => {
  if (!timeStr) return '—';
  const [hour, minute] = timeStr.split(':');
  let h = parseInt(hour, 10);
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${h}:${minute} ${ampm}`;
};

const TodayVisitors = () => {
  // --- Date filter state ---
  const [selectedDate, setSelectedDate] = useState(() => new Date().toLocaleDateString('en-CA'));
  const [visitors, setVisitors] = useState([]);
  const [allBleTags, setAllBleTags] = useState([]);
  const [availableBleTags, setAvailableBleTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, arrived: 0, noShow: 0, returned: 0 });
  const [showNoShowModal, setShowNoShowModal] = useState(false);
  const [noShowTargetId, setNoShowTargetId] = useState(null);
  const [showTagsModal, setShowTagsModal] = useState(false);
  const [tagsLoading, setTagsLoading] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [returnTargetId, setReturnTargetId] = useState(null);

  // Fetch visitors for the selected date
  const fetchVisitorsForDate = useCallback(async (date) => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/visitor-requests`, {
        params: { date, status: 'APPROVED' },
        ...getAuthHeaders()
      });
      const data = res.data || [];
      setVisitors(data);
      setStats({
        total: data.length,
        arrived: data.filter(v => v.arrived == 1 && v.returned != 1).length,
        noShow: data.filter(v => v.no_show == 1).length,
        returned: data.filter(v => v.returned == 1).length,
      });
    } catch (err) {
      console.error('Failed to fetch visitors', err);
      toast.error('Could not load visitor list');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch BLE tags (independent of date)
  const fetchBleTags = useCallback(async () => {
    setTagsLoading(true);
    try {
      const [tagsRes, inUseRes] = await Promise.all([
        axios.get(`${API_BASE}/ble-tags`, getAuthHeaders()),
        axios.get(`${API_BASE}/ble-tags/in-use`, getAuthHeaders())
      ]);
      const allTags = tagsRes.data.map(tag => ({
        ...tag,
        inUse: inUseRes.data.includes(tag.ble_id)
      }));
      setAllBleTags(allTags);
      setAvailableBleTags(allTags.filter(tag => !tag.inUse));
    } catch (err) {
      console.error('Failed to load BLE tags', err);
      toast.error('Could not load BLE tags.');
    } finally {
      setTagsLoading(false);
    }
  }, []);

  // Reload when selected date changes
  useEffect(() => {
    fetchVisitorsForDate(selectedDate);
  }, [selectedDate, fetchVisitorsForDate]);

  // Initial load of BLE tags
  useEffect(() => {
    fetchBleTags();
  }, [fetchBleTags]);

  // Handlers (unchanged)
  const markArrived = async (id, room, bleId) => {
    if (!room || !bleId) {
      toast.warning('Please select both a destination room and a BLE tag.');
      return;
    }
    const floor = getFloorByRoom(room);
    try {
      await axios.put(`${API_BASE}/visitor-requests/${id}/arrive`, {
        destination: room,
        ble_id: bleId
      }, getAuthHeaders());
      await fetchVisitorsForDate(selectedDate);
      await fetchBleTags();
      toast.success('Visitor checked in and BLE tag assigned.');
    } catch (err) {
      console.error(err);
      toast.error('Error marking arrival.');
    }
  };

  const confirmNoShow = (id) => {
    setNoShowTargetId(id);
    setShowNoShowModal(true);
  };

  const markNoShow = async () => {
    if (!noShowTargetId) return;
    try {
      await axios.put(`${API_BASE}/visitor-requests/${noShowTargetId}/no-show`, {}, getAuthHeaders());
      await fetchVisitorsForDate(selectedDate);
      await fetchBleTags();
      toast.info('Visitor marked as no show.');
    } catch (err) {
      console.error(err);
      toast.error('Failed to mark as no show.');
    } finally {
      setShowNoShowModal(false);
      setNoShowTargetId(null);
    }
  };

  const confirmReturn = (id) => {
    setReturnTargetId(id);
    setShowReturnModal(true);
  };

  const returnBleTag = async () => {
    if (!returnTargetId) return;
    try {
      await axios.put(`${API_BASE}/visitor-requests/${returnTargetId}/return`, {}, getAuthHeaders());
      await fetchVisitorsForDate(selectedDate);
      await fetchBleTags();
      toast.success('BLE tag returned and now available.');
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || 'Failed to return tag.');
    } finally {
      setShowReturnModal(false);
      setReturnTargetId(null);
    }
  };

  // Format the displayed date
  const formattedDate = new Date(selectedDate).toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  if (loading && visitors.length === 0) return <div className="loading-state">Loading visitors...</div>;

  return (
    <div className="today-visitors-container">
      <div className="tv-header">
        <div>
          <h2>Approved Visitors</h2>
          <p className="tv-date">{formattedDate}</p>
        </div>
        <div className="tv-header-actions">
          <div className="date-filter">
            <Calendar size={16} />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="date-picker"
            />
          </div>
          <button className="btn-view-tags" onClick={() => { fetchBleTags(); setShowTagsModal(true); }}>
            <Info size={16} /> View BLE Tags
          </button>
        </div>
      </div>

      <div className="tv-stats">
        <div className="stat-card"><span className="stat-value">{stats.total}</span><span className="stat-label">Total Approved</span></div>
        <div className="stat-card"><span className="stat-value">{stats.arrived}</span><span className="stat-label">Checked In</span></div>
        <div className="stat-card"><span className="stat-value">{stats.noShow}</span><span className="stat-label">No Show</span></div>
        <div className="stat-card"><span className="stat-value">{stats.returned}</span><span className="stat-label">Returned</span></div>
      </div>

      {visitors.length === 0 ? (
        <div className="empty-state"><User size={48} /><p>No approved visitors for this date.</p></div>
      ) : (
        <div className="visitors-table-wrapper">
          <table className="visitors-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Time</th>
                <th>Purpose</th>
                <th>Assignment</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {visitors.map(v => (
                <tr key={v.id}>
                  <td>
                    <strong>{v.first_name} {v.last_name}</strong>
                    <br /><span className="small-text">{v.email}</span>
                  </td>
                  <td>{v.visit_time ? formatTo12Hour(v.visit_time) : '—'}</td>
                  <td>{v.reason || '—'}</td>
                  <td>
                    {!v.arrived && !v.no_show ? (
                      <div className="assignment-controls">
                        <select id={`room-${v.id}`} className="action-select">
                          <option value="">Select Room</option>
                          {ALL_ROOMS.map(room => <option key={room} value={room}>{room}</option>)}
                        </select>
                        <select id={`ble-${v.id}`} className="action-select">
                          <option value="">Select BLE Tag</option>
                          {availableBleTags.length === 0 ? (
                            <option disabled>No available tags</option>
                          ) : (
                            availableBleTags.map(tag => (
                              <option key={tag.ble_id} value={tag.ble_id}>{tag.ble_id} – {tag.label || tag.ble_id}</option>
                            ))
                          )}
                        </select>
                      </div>
                    ) : (
                      <div className="assigned-info">
                        {v.ble_id && <span>BLE: {v.ble_id}</span>}
                        {v.destination && <span>Room: {v.destination}</span>}
                      </div>
                    )}
                  </td>
                  <td>
                    {v.arrived && v.returned ? (
                      <span className="badge-returned">Returned</span>
                    ) : v.arrived ? (
                      <span className="badge-arrived">Checked In</span>
                    ) : v.no_show ? (
                      <span className="badge-no-show">No Show</span>
                    ) : (
                      <span className="badge-expected">Expected</span>
                    )}
                  </td>
                  <td>
                    {!v.arrived && !v.no_show && (
                      <div className="action-buttons">
                        <button
                          className="btn-mark-arrived"
                          onClick={() => markArrived(
                            v.id,
                            document.getElementById(`room-${v.id}`).value,
                            document.getElementById(`ble-${v.id}`).value
                          )}
                          disabled={availableBleTags.length === 0}
                        >
                          Arrived
                        </button>
                        <button
                          className="btn-mark-no-show"
                          onClick={() => confirmNoShow(v.id)}
                        >
                          No Show
                        </button>
                      </div>
                    )}
                    {v.arrived && !v.returned && (
                      <button className="btn-return-tag" onClick={() => confirmReturn(v.id)}>
                        Return Tag
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modals remain unchanged */}
      <FormalModal
        show={showTagsModal}
        onClose={() => setShowTagsModal(false)}
        title="BLE Tags Inventory"
        size="large"
        footer={<button className="btn-modal-submit" onClick={() => setShowTagsModal(false)}>Close</button>}
      >
        <div className="ble-inventory-header">
          <button className="btn-refresh-tags" onClick={fetchBleTags} disabled={tagsLoading}>
            <RefreshCw size={14} /> {tagsLoading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
        <div className="ble-inventory">
          {tagsLoading && allBleTags.length === 0 ? (
            <div className="loading-tags">Loading tags...</div>
          ) : allBleTags.length === 0 ? (
            <div className="empty-tags">No BLE tags registered. Please add tags in Manage BLE Tags.</div>
          ) : (
            <table className="ble-status-table">
              <thead>
                <tr><th>BLE ID</th><th>Label</th><th>MAC Address</th><th>Status</th></tr>
              </thead>
              <tbody>
                {allBleTags.map(tag => (
                  <tr key={tag.id}>
                    <td>{tag.ble_id}</td>
                    <td>{tag.label || '—'}</td>
                    <td>{tag.mac_address || '—'}</td>
                    <td>
                      {tag.inUse ? (
                        <span className="tag-status in-use">In Use</span>
                      ) : (
                        <span className="tag-status available">Available</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </FormalModal>

      <FormalModal
        show={showNoShowModal}
        onClose={() => setShowNoShowModal(false)}
        title="Confirm No Show"
        footer={
          <>
            <button className="btn-modal-cancel" onClick={() => setShowNoShowModal(false)}>Cancel</button>
            <button className="btn-modal-submit" onClick={markNoShow} style={{ backgroundColor: '#dc2626' }}>
              Yes, Mark No Show
            </button>
          </>
        }
      >
        <p>Are you sure you want to mark this visitor as <strong>No Show</strong>? This action cannot be undone.</p>
      </FormalModal>

      <FormalModal
        show={showReturnModal}
        onClose={() => setShowReturnModal(false)}
        title="Return BLE Tag"
        footer={
          <>
            <button className="btn-modal-cancel" onClick={() => setShowReturnModal(false)}>Cancel</button>
            <button className="btn-modal-submit" onClick={returnBleTag} style={{ backgroundColor: '#f59e0b' }}>
              Yes, Return Tag
            </button>
          </>
        }
      >
        <p>Return the BLE tag? It will become available for other visitors.</p>
      </FormalModal>
    </div>
  );
};

export default TodayVisitors;