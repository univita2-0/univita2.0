// src/pages/HRDashboard.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Users, FileText, Clock, AlertCircle, Calendar, TrendingUp, Zap, ChevronRight,
  ShieldCheck, UserCheck, CheckCircle
} from 'lucide-react';
import { API_BASE } from '../api';
import './Dashboard.css';

const getAuthHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('auth_token')}` }
});

const HRDashboard = ({ setView }) => {
  const [stats, setStats] = useState({
    totalEmployees: 0,
    pendingLeaves: 0,
    presentToday: 0,
    pendingAppeals: 0,
    pendingScheduleRequests: 0
  });
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Active instructors (role = 'instructor', status = 'active')
      const empRes = await axios.get(`${API_BASE}/employees`, getAuthHeaders());
      const activeInstructors = empRes.data.filter(u => u.role === 'instructor' && u.status === 'active');
      const totalEmployees = activeInstructors.length;

      // 2. Pending leave requests
      const leaveRes = await axios.get(`${API_BASE}/leave-requests/all`, getAuthHeaders());
      const pendingLeavesList = leaveRes.data.filter(l => l.status === 'Pending');
      const pendingLeaves = pendingLeavesList.length;
      const recentLeaves = pendingLeavesList.slice(0, 5);

      // 3. Present today (attendance)
      const today = new Date().toISOString().split('T')[0];
      const attRes = await axios.get(`${API_BASE}/attendance-report?date=${today}`, getAuthHeaders());
      const presentToday = attRes.data.filter(a => a.status === 'Present' || a.status === 'present').length;

      // 4. Pending attendance appeals
      const appealsRes = await axios.get(`${API_BASE}/attendance-appeals/pending`, getAuthHeaders());
      const pendingAppeals = appealsRes.data.length;
      const recentAppeals = appealsRes.data.slice(0, 3);

      // 5. Pending schedule change requests
      const schedReqRes = await axios.get(`${API_BASE}/schedule-requests/pending`, getAuthHeaders());
      const pendingScheduleRequests = schedReqRes.data.length;

      setStats({
        totalEmployees,
        pendingLeaves,
        presentToday,
        pendingAppeals,
        pendingScheduleRequests
      });

      // Build task list
      const taskItems = [
        ...recentLeaves.map(l => ({
          id: `leave-${l.id}`,
          type: 'Leave Request',
          title: `${l.full_name || l.user_id} requested ${l.type}`,
          date: l.request_date,
          action: 'leave-management'
        })),
        ...recentAppeals.map(a => ({
          id: `appeal-${a.id}`,
          type: 'Attendance Appeal',
          title: `${a.full_name} submitted an appeal for ${a.date}`,
          date: a.date,
          action: 'attendance-appeals'
        }))
      ];
      setTasks(taskItems);
    } catch (err) {
      console.error('HR Dashboard error:', err);
      setError('Failed to load dashboard data. Please refresh.');
    } finally {
      setLoading(false);
    }
  };

  const handleNavigate = (view) => {
    if (setView) setView(view);
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
        <p>Loading HR dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-error">
        <AlertCircle size={32} />
        <p>{error}</p>
        <button onClick={loadDashboardData} className="btn-retry">Retry</button>
      </div>
    );
  }

  return (
    <div className="dashboard-content">
      {/* System Health Banner */}
      <section className="system-health-banner">
        <div className="health-item">
          <Users size={20} className="text-teal" />
          <span>HR Active: <strong>{stats.totalEmployees} Instructors</strong></span>
        </div>
        <div className="health-item">
          <Clock size={20} className="text-blue" />
          <span>Present Today: <strong>{stats.presentToday}</strong></span>
        </div>
        <div className="health-item">
          <AlertCircle size={20} className="text-amber" />
          <span>Pending Actions: <strong>{stats.pendingLeaves + stats.pendingAppeals + stats.pendingScheduleRequests}</strong></span>
        </div>
      </section>

      {/* Key Metrics Grid */}
      <section className="stats-grid">
        <div className="dash-stat-card border-teal" onClick={() => handleNavigate('employee-management')}>
          <div className="ds-icon bg-teal-light text-teal"><Users size={22} /></div>
          <div className="ds-value">{stats.totalEmployees}</div>
          <div className="ds-label">Active Instructors</div>
        </div>

        <div className="dash-stat-card border-amber" onClick={() => handleNavigate('leave-management')}>
          <div className="ds-icon bg-amber-light text-amber"><FileText size={22} /></div>
          <div className="ds-value">{stats.pendingLeaves}</div>
          <div className="ds-label">Pending Leaves</div>
        </div>

        <div className="dash-stat-card border-blue" onClick={() => handleNavigate('attendance-report')}>
          <div className="ds-icon bg-blue-light text-blue"><UserCheck size={22} /></div>
          <div className="ds-value">{stats.presentToday}</div>
          <div className="ds-label">Present Today</div>
        </div>

        <div className="dash-stat-card border-purple" onClick={() => handleNavigate('attendance-appeals')}>
          <div className="ds-icon bg-purple-light text-purple"><AlertCircle size={22} /></div>
          <div className="ds-value">{stats.pendingAppeals}</div>
          <div className="ds-label">Attendance Appeals</div>
        </div>

        <div className="dash-stat-card border-orange" onClick={() => handleNavigate('schedule-requests')}>
          <div className="ds-icon bg-orange-light text-orange"><Calendar size={22} /></div>
          <div className="ds-value">{stats.pendingScheduleRequests}</div>
          <div className="ds-label">Schedule Changes</div>
        </div>
      </section>

      {/* Middle Section: Tasks & Quick Actions */}
      <section className="middle-section">
        <div className="overview-panel">
          <div className="panel-header">
            <div className="ph-title">
              <Clock size={20} className="text-teal" />
              <span>HR Tasks Requiring Action</span>
            </div>
          </div>
          <div className="task-list">
            {tasks.length === 0 ? (
              <div className="no-tasks">
                <CheckCircle size={28} className="text-green" />
                <p>No pending HR tasks</p>
              </div>
            ) : (
              tasks.map(task => (
                <div key={task.id} className="task-item">
                  <div className="task-info">
                    <AlertCircle size={16} className="text-amber" />
                    <div>
                      <p className="task-text"><strong>{task.type}</strong> – {task.title}</p>
                      <p className="task-date">{task.date?.split('T')[0] || 'Pending'}</p>
                    </div>
                  </div>
                  <button className="view-task-btn" onClick={() => handleNavigate(task.action)}>
                    Review
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="quick-actions-panel">
          <div className="panel-header">
            <div className="ph-title">
              <Zap size={20} className="text-orange" />
              <span>HR Shortcuts</span>
            </div>
          </div>
          <div className="action-list">
            <button className="action-row" onClick={() => handleNavigate('leave-management')}>
              <span>Manage Leave Requests</span>
              <ChevronRight size={16} />
            </button>
            <button className="action-row" onClick={() => handleNavigate('attendance-appeals')}>
              <span>Review Attendance Appeals</span>
              <ChevronRight size={16} />
            </button>
            <button className="action-row" onClick={() => handleNavigate('employee-management')}>
              <span>Add New Employee</span>
              <ChevronRight size={16} />
            </button>
            <button className="action-row" onClick={() => handleNavigate('schedule')}>
              <span>Manage Schedules</span>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HRDashboard;