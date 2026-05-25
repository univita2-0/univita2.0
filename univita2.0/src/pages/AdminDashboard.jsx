// src/pages/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import './Dashboard.css';
import {
  ShieldCheck, Users, Activity, FileText, Bell, Zap,
  Clock, AlertCircle, ChevronRight, Calendar, CheckCircle, XCircle
} from 'lucide-react';
import axios from 'axios';
import { API_BASE } from '../api';

const getAuthHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('auth_token')}` }
});

// Helper to format date as YYYY-MM-DD in local timezone
const getTodayDate = () => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

const AdminDashboard = ({ setView, onShowPayrollHistory }) => {
  const [stats, setStats] = useState({
    totalEmployees: 0,
    pendingLeaves: 0,
    todayVisitors: 0,
    systemStatus: 'Operational'
  });
  const [pendingTasks, setPendingTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Fetch all employees (active only? adjust as needed)
      const employeesRes = await axios.get(`${API_BASE}/employees`, getAuthHeaders());
      const allEmployees = employeesRes.data || [];
      // Count only active employees (status = 'active')
      const activeEmployees = allEmployees.filter(emp => emp.status === 'active');
      const totalActive = activeEmployees.length;

      // 2. Fetch all leave requests
      const leaveRes = await axios.get(`${API_BASE}/leave-requests/all`, getAuthHeaders());
      const allLeaves = leaveRes.data || [];
      const pendingLeaves = allLeaves.filter(leave => leave.status === 'Pending');
      const pendingCount = pendingLeaves.length;
      // Get last 5 pending leaves (most recent first)
      const recentPending = [...pendingLeaves]
        .sort((a, b) => new Date(b.request_date) - new Date(a.request_date))
        .slice(0, 5);

      // 3. Fetch today's approved visitors (appointments)
      const today = getTodayDate();
      const appointmentsRes = await axios.get(`${API_BASE}/appointments/history`, getAuthHeaders());
      const allAppointments = appointmentsRes.data || [];
      const todaysApproved = allAppointments.filter(
        app => app.visit_date === today && app.status === 'APPROVED'
      );
      const visitorCount = todaysApproved.length;

      // 4. (Optional) Check backend health – simple ping to a public endpoint
      let systemStatus = 'Operational';
      try {
        await axios.get(`${API_BASE}/events`, { timeout: 3000 });
      } catch (healthErr) {
        systemStatus = 'Degraded';
      }

      setStats({
        totalEmployees: totalActive,
        pendingLeaves: pendingCount,
        todayVisitors: visitorCount,
        systemStatus
      });
      setPendingTasks(recentPending);
    } catch (err) {
      console.error('Dashboard load error:', err);
      setError('Failed to load dashboard data. Please refresh.');
    } finally {
      setLoading(false);
    }
  };

  // Format date nicely
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
        <p>Loading dashboard...</p>
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
          <ShieldCheck size={20} className="text-teal" />
          <span>Security Protocol: <strong>Active</strong></span>
        </div>
        <div className="health-item">
          <Activity size={20} className="text-blue" />
          <span>System Status: <strong>{stats.systemStatus}</strong></span>
        </div>
        <div className="health-item">
          <Clock size={20} className="text-amber" />
          <span>Last Updated: <strong>{new Date().toLocaleTimeString()}</strong></span>
        </div>
      </section>

      {/* Key Metrics Grid */}
      <section className="stats-grid">
        <div className="dash-stat-card border-teal" onClick={() => setView('employee-management')}>
          <div className="ds-icon bg-teal-light text-teal"><Users size={22} /></div>
          <div className="ds-value">{stats.totalEmployees}</div>
          <div className="ds-label">Active Personnel</div>
        </div>

        <div className="dash-stat-card border-blue" onClick={() => setView('manage-request')}>
          <div className="ds-icon bg-blue-light text-blue"><Calendar size={22} /></div>
          <div className="ds-value">{stats.todayVisitors}</div>
          <div className="ds-label">Today's Visitors</div>
        </div>

        <div className="dash-stat-card border-amber" onClick={() => setView('leave-management')}>
          <div className="ds-icon bg-amber-light text-amber"><Bell size={22} /></div>
          <div className="ds-value">{stats.pendingLeaves}</div>
          <div className="ds-label">Pending Leaves</div>
        </div>
      </section>

      {/* Middle Section: Tasks & Quick Actions */}
      <section className="middle-section">
        <div className="overview-panel">
          <div className="panel-header">
            <div className="ph-title">
              <Clock size={20} className="text-teal" />
              <span>Recent Pending Requests</span>
            </div>
            {stats.pendingLeaves > 5 && (
              <button className="view-all-btn" onClick={() => setView('leave-management')}>
                View All <ChevronRight size={14} />
              </button>
            )}
          </div>
          <div className="task-list">
            {pendingTasks.length === 0 ? (
              <div className="no-tasks">
                <CheckCircle size={28} className="text-green" />
                <p>No pending leave requests</p>
              </div>
            ) : (
              pendingTasks.map(task => (
                <div key={task.id} className="task-item">
                  <div className="task-info">
                    <AlertCircle size={16} className="text-amber" />
                    <div>
                      <p className="task-text">
                        <strong>{task.full_name || `ID: ${task.user_id}`}</strong> requested <strong>{task.type}</strong>
                      </p>
                      <p className="task-date">{formatDate(task.request_date)}</p>
                    </div>
                  </div>
                  <button
                    className="view-task-btn"
                    onClick={() => setView('leave-management')}
                  >
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
              <span>Quick Actions</span>
            </div>
          </div>
          <div className="action-list">
            <button className="action-row" onClick={() => setView('manage-request')}>
              <span>Approve Visitor Entries</span>
              <ChevronRight size={16} />
            </button>
            <button className="action-row" onClick={() => setView('attendance-report')}>
              <span>View Today's Attendance</span>
              <ChevronRight size={16} />
            </button>
            <button className="action-row" onClick={() => setView('employee-management')}>
              <span>Add New Employee</span>
              <ChevronRight size={16} />
            </button>
            <button className="action-row" onClick={onShowPayrollHistory}>
              <span>Payroll Access Logs</span>
              <ChevronRight size={16} />
            </button>
            <button className="action-row" onClick={() => setView('reports')}>
              <span>Generate Compliance Report</span>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AdminDashboard;