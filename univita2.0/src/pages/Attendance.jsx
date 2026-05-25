// src/pages/Attendance.js – Formal detail modal with proper alignment
import React, { useState, useEffect, useCallback, useRef } from 'react';
import './Attendance.css';
import { Download, ChevronLeft, ChevronRight, Search, Calendar, Eye, X, Maximize2 } from 'lucide-react';
import axios from 'axios';
import FormalModal from '../components/FormalModal';
import { API_BASE } from '../api';

// Helper to get auth headers
const getAuthHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('auth_token')}` }
});

// Static base URL for uploaded images (without /api suffix)
const STATIC_BASE = API_BASE.replace(/\/api$/, ''); // removes trailing /api if present

const Attendance = () => {
  const [view, setView] = useState('daily');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [attendanceData, setAttendanceData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [stats, setStats] = useState({ present: 0, absent: 0, late: 0, overtime: 0 });
  const dateInputRef = useRef(null);

  // Detail modal state
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [expandedSelfie, setExpandedSelfie] = useState(null);

  const isFutureDate = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);
    return checkDate > today;
  };
  const isFuture = isFutureDate(currentDate);

  const fetchAttendance = useCallback(async () => {
    if (isFuture && view === 'daily') {
      setAttendanceData([]);
      setStats({ present: 0, absent: 0, late: 0, overtime: 0 });
      return;
    }
    try {
      const dateStr = currentDate.toLocaleDateString('en-CA');
      const response = await axios.get(`${API_BASE}/attendance-report?date=${dateStr}`, getAuthHeaders());
      const rawData = response.data;

      if (view === 'daily') {
        const now = new Date();
        const currentTimeStr = now.toTimeString().split(' ')[0];
        const isToday = currentDate.toDateString() === now.toDateString();
        const isPastDay = currentDate < now && !isToday;

        const data = rawData.map(record => {
          let calculatedStatus = "";
          const sStart = record.start_time || record.scheduled_start;
          const sEnd = record.end_time || record.scheduled_end;

          if (!sStart || sStart === '--:--') {
            calculatedStatus = 'No Schedule';
          } else if (record.time_in && record.time_in !== '--:--') {
            calculatedStatus = record.time_in > sStart ? 'Late' : 'Present';
          } else {
            if (isToday) {
              if (sEnd && currentTimeStr < sEnd) calculatedStatus = 'Scheduled';
              else calculatedStatus = 'Absent';
            } else if (isPastDay) calculatedStatus = 'Absent';
            else calculatedStatus = 'Scheduled';
          }
          return {
            ...record,
            status: calculatedStatus,
            start_time: sStart,
            end_time: sEnd,
            location: (record.time_in && record.time_in !== '--:--') ? (record.location || 'Main Campus') : '--',
            time_in: record.time_in || '--:--',
            time_out: record.time_out || '--:--',
            total_hours: record.total_hours || '0.00',
            clock_in_selfie: record.clock_in_selfie || null,
            clock_out_selfie: record.clock_out_selfie || null,
            clock_in_latitude: record.clock_in_latitude || null,
            clock_in_longitude: record.clock_in_longitude || null,
            clock_out_latitude: record.clock_out_latitude || null,
            clock_out_longitude: record.clock_out_longitude || null,
          };
        });
        setAttendanceData(data);
        calculateStats(data);
      } else {
        // Monthly summary (unchanged)
        const summaryMap = {};
        rawData.forEach(emp => {
          const empId = emp.employee_id;
          if (!summaryMap[empId]) {
            summaryMap[empId] = {
              full_name: emp.full_name,
              employee_id: empId,
              total_working: 0,
              present_days: 0,
              absent_days: 0,
              late_days: 0
            };
          }
          const sStart = emp.start_time || emp.scheduled_start;
          const sEnd = emp.end_time || emp.scheduled_end;
          const hasClockedIn = emp.time_in && emp.time_in !== '--:--';
          const hasSchedule = !!sStart;
          if (hasClockedIn) {
            summaryMap[empId].present_days += 1;
            summaryMap[empId].total_working += 1;
            if (hasSchedule && emp.time_in > sStart) summaryMap[empId].late_days += 1;
          } else if (hasSchedule) {
            const now = new Date();
            const currentTimeStr = now.toTimeString().split(' ')[0];
            const recDate = new Date(emp.date);
            const isToday = recDate.toDateString() === now.toDateString();
            if (recDate < now && (!isToday || (sEnd && currentTimeStr >= sEnd))) {
              summaryMap[empId].absent_days += 1;
            }
          }
        });
        setAttendanceData(Object.values(summaryMap));
      }
    } catch (error) {
      console.error("Error fetching attendance:", error);
      setAttendanceData([]);
    }
  }, [currentDate, view, isFuture]);

  useEffect(() => { fetchAttendance(); }, [fetchAttendance]);

  const calculateStats = (data) => {
    let counts = { present: 0, absent: 0, late: 0, overtime: 0 };
    data.forEach(item => {
      const s = item.status?.toLowerCase();
      if (s === 'present') counts.present++;
      else if (s === 'absent') counts.absent++;
      else if (s === 'late') counts.late++;
      if (parseFloat(item.total_hours) > 8) counts.overtime++;
    });
    setStats(counts);
  };

  const changeDate = (offset) => {
    const newDate = new Date(currentDate);
    if (view === 'daily') newDate.setDate(newDate.getDate() + offset);
    else newDate.setMonth(newDate.getMonth() + offset);
    setCurrentDate(newDate);
  };

  const handleDateSelect = (e) => {
    const selectedDate = new Date(e.target.value);
    if (!isNaN(selectedDate)) setCurrentDate(selectedDate);
  };

  const handleViewDetails = (record) => {
    setSelectedRecord(record);
    setShowDetailModal(true);
  };

  // Helper to check if a location coordinate is valid (not null, not undefined, not '0', not '0.0')
  const isValidCoordinate = (value) => {
    if (!value) return false;
    const num = parseFloat(value);
    return !isNaN(num) && num !== 0;
  };

  const filteredData = attendanceData.filter(row => {
    const nameMatch = (row.full_name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const statusMatch = view === 'monthly' || statusFilter === 'All Status' || row.status === statusFilter;
    return nameMatch && statusMatch;
  });

  return (
    <div className="attendance-container">
      <div className="att-stats-row">
        {[
          { label: "Present Today", value: isFuture ? 0 : stats.present, border: "border-green" },
          { label: "Absent Today", value: isFuture ? 0 : stats.absent, border: "border-red" },
          { label: "Late Arrivals", value: isFuture ? 0 : stats.late, border: "border-orange" },
          { label: "Overtime", value: isFuture ? 0 : stats.overtime, border: "border-purple" },
        ].map((stat, idx) => (
          <div key={idx} className={`att-stat-card ${stat.border}`}>
            <p className="att-stat-label">{stat.label}</p>
            <p className="att-stat-value">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="att-controls">
          <div className="view-toggles">
            <button className={`btn-toggle ${view === 'daily' ? 'active' : ''}`} onClick={() => setView('daily')}>Daily View</button>
            <button className={`btn-toggle ${view === 'monthly' ? 'active' : ''}`} onClick={() => setView('monthly')}>Monthly View</button>
          </div>
          <div className="att-actions">
            <div className="att-search">
              <input type="text" placeholder="Search employee..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              <Search size={18} className="att-search-icon" />
            </div>
            {view === 'daily' && (
              <select className="att-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="All Status">All Status</option>
                <option value="Present">Present</option>
                <option value="Late">Late</option>
                <option value="Absent">Absent</option>
                <option value="Scheduled">Scheduled</option>
              </select>
            )}
            <button className="btn-export" onClick={() => window.print()}><Download size={18} /> Export Report</button>
          </div>
        </div>

        <div className="date-nav">
          <button className="nav-arrow" onClick={() => changeDate(-1)}><ChevronLeft size={24} /></button>
          <div className="current-date-display" style={{ cursor: 'pointer', position: 'relative', alignItems: 'center', gap: '12px', display: 'flex' }} onClick={() => dateInputRef.current.showPicker()}>
            <Calendar size={20} color="#00796b" />
            <span>
              {view === 'daily'
                ? currentDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
                : currentDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
            </span>
            <input type={view === 'daily' ? "date" : "month"} ref={dateInputRef} style={{ position: 'absolute', opacity: 0, width: 0, height: 0, pointerEvents: 'none' }} onChange={handleDateSelect} value={currentDate.toLocaleDateString('en-CA')} />
          </div>
          <button className="nav-arrow" onClick={() => changeDate(1)}><ChevronRight size={24} /></button>
        </div>

        <div className="table-container">
          <table className="custom-table">
            <thead>
              {view === 'daily' ? (
                <tr>
                  <th>EMPLOYEE NAME</th>
                  <th>STATUS</th>
                  <th>TIME IN</th>
                  <th>TIME OUT</th>
                  <th>TOTAL HOURS</th>
                  <th>ACTION</th>
                </tr>
              ) : (
                <tr>
                  <th>EMPLOYEE NAME</th>
                  <th className="text-center">WORKING DAYS</th>
                  <th className="text-center">PRESENT</th>
                  <th className="text-center">ABSENT</th>
                  <th className="text-center">LATE</th>
                </tr>
              )}
            </thead>
            <tbody>
              {isFuture && view === 'daily' ? (
                <tr><td colSpan="6" className="text-center p-10 text-gray-500">No records available for future dates. </td></tr>
              ) : filteredData.length > 0 ? (
                filteredData.map((row, index) => (
                  <tr key={index}>
                    {view === 'daily' ? (
                      <>
                        <td className="font-bold"><div>{row.full_name}</div><div style={{ fontSize: '11px', color: '#64748b' }}>{row.employee_id}</div> </td>
                        <td><span className={`status-badge ${row.status?.toLowerCase()}`}>{row.status}</span> </td>
                        <td>{row.time_in} </td>
                        <td>{row.time_out} </td>
                        <td>{row.total_hours} hrs </td>
                        <td>
                          <button className="btn-view-details" onClick={() => handleViewDetails(row)} title="View Details">
                            <Eye size={18} />
                          </button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="font-bold"><div>{row.full_name}</div><div style={{ fontSize: '11px', color: '#64748b' }}>{row.employee_id}</div> </td>
                        <td className="text-center">{row.total_working} </td>
                        <td className="text-center text-green-600 font-bold">{row.present_days} </td>
                        <td className="text-center text-red-600">{row.absent_days} </td>
                        <td className="text-center text-orange-600">{row.late_days} </td>
                      </>
                    )}
                  </tr>
                ))
              ) : (
                <tr><td colSpan={view === 'daily' ? "6" : "5"} className="empty-row-message text-center p-4">No records found for this date. </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Formal Detail Modal */}
<FormalModal
  show={showDetailModal}
  onClose={() => setShowDetailModal(false)}
  title="Attendance Details"
  size="large"
  footer={<button className="btn-modal-submit" onClick={() => setShowDetailModal(false)}>Close</button>}
>
  {selectedRecord && (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
      <div className="attendance-detail-formal">
        
        <div className="detail-row">
          <div className="detail-field">
            <span className="detail-label">Employee ID</span>
            <span className="detail-value">{selectedRecord.employee_id}</span>
          </div>
          <div className="detail-field">
            <span className="detail-label">Full Name</span>
            <span className="detail-value">{selectedRecord.full_name}</span>
          </div>
        </div>

        <div className="detail-row">
          <div className="detail-field">
            <span className="detail-label">Status</span>
            <span className={`status-badge ${selectedRecord.status?.toLowerCase()}`}>{selectedRecord.status}</span>
          </div>
          <div className="detail-field">
            <span className="detail-label">Total Hours</span>
            <span className="detail-value">{selectedRecord.total_hours} hrs</span>
          </div>
        </div>

        <div className="detail-row">
          <div className="detail-field">
            <span className="detail-label">Time In</span>
            <span className="detail-value">{selectedRecord.time_in}</span>
          </div>
          <div className="detail-field">
            <span className="detail-label">Time Out</span>
            <span className="detail-value">{selectedRecord.time_out}</span>
          </div>
        </div>

        {/* Row 4: Location Names */}
<div className="detail-row">
  <div className="detail-field">
    <span className="detail-label">Clock In Location</span>
    <span className="detail-value">
      {/* Read the 'location' string directly from the database record */}
      {selectedRecord.location ? selectedRecord.location.split('(')[0] : '—'}
    </span>
  </div>
  <div className="detail-field">
    <span className="detail-label">Clock Out Location</span>
    <span className="detail-value">
      {/* Since you haven't clocked out yet, this will show — until the record is updated */}
      {selectedRecord.location && selectedRecord.time_out !== '--:--' ? selectedRecord.location.split('(')[0] : '—'}
    </span>
  </div>
</div>

<div className="detail-row">
  <div className="detail-field">
    <span className="detail-label">Clock In Selfie</span>
    {selectedRecord.clock_in_selfie ? (
      <button className="selfie-view-btn" onClick={() => setExpandedSelfie(selectedRecord.clock_in_selfie)}>
        <Eye size={14} /> View
      </button>
    ) : <span className="detail-value">—</span>}
  </div>
  <div className="detail-field">
    <span className="detail-label">Clock Out Selfie</span>
    {selectedRecord.clock_out_selfie ? (
      <button className="selfie-view-btn" onClick={() => setExpandedSelfie(selectedRecord.clock_out_selfie)}>
        <Eye size={14} /> View
      </button>
    ) : <span className="detail-value">—</span>}
  </div>
</div>
      </div>
    </div>
  )}
</FormalModal>

      {/* Selfie Expansion Modal */}
      {expandedSelfie && (
        <div className="selfie-overlay" onClick={() => setExpandedSelfie(null)}>
          <div className="selfie-modal" onClick={(e) => e.stopPropagation()}>
            <button className="selfie-close-btn" onClick={() => setExpandedSelfie(null)}>
              <X size={24} />
            </button>
            <img src={`${STATIC_BASE}${expandedSelfie}`} alt="Selfie" style={{ maxWidth: '100%', maxHeight: '80vh' }} />
            <button className="selfie-fullscreen" onClick={() => window.open(`${STATIC_BASE}${expandedSelfie}`, '_blank')}>
              <Maximize2 size={20} /> Fullscreen
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Attendance;