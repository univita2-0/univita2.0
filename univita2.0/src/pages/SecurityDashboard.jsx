// src/pages/SecurityDashboard.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  UserCheck, Calendar, Clock, MapPin, Zap, ChevronRight,
  Users, ShieldCheck, Eye, CheckCircle, AlertCircle
} from 'lucide-react';
import { API_BASE } from '../api';
import './Dashboard.css';

const getAuthHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('auth_token')}` }
});

const SecurityDashboard = ({ setView }) => {
  const [stats, setStats] = useState({
    approvedToday: 0,
    totalVisitorsToday: 0,
    activeBleTags: 0
  });
  const [todayVisitors, setTodayVisitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Get approved visitor requests for today
      const res = await axios.get(`${API_BASE}/visitor-requests`, {
        params: { date: today, status: 'APPROVED' },
        ...getAuthHeaders()
      });
      const approvedVisitors = res.data || [];
      setTodayVisitors(approvedVisitors);

      // 2. Get active BLE tags (currently in use)
      const bleRes = await axios.get(`${API_BASE}/ble-tags/in-use`, getAuthHeaders());
      const activeBleTags = bleRes.data.length;

      setStats({
        approvedToday: approvedVisitors.length,
        totalVisitorsToday: approvedVisitors.length,
        activeBleTags
      });
    } catch (err) {
      console.error('Security Dashboard error:', err);
      setError('Failed to load security data. Please refresh.');
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
        <p>Loading security dashboard...</p>
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
          <MapPin size={20} className="text-blue" />
          <span>Active BLE Tags: <strong>{stats.activeBleTags}</strong></span>
        </div>
        <div className="health-item">
          <Users size={20} className="text-amber" />
          <span>Visitors Today: <strong>{stats.totalVisitorsToday}</strong></span>
        </div>
      </section>

      {/* Key Metrics Grid */}
      <section className="stats-grid">
        <div className="dash-stat-card border-blue" onClick={() => handleNavigate('manage-request')}>
          <div className="ds-icon bg-blue-light text-blue"><Calendar size={22} /></div>
          <div className="ds-value">{stats.approvedToday}</div>
          <div className="ds-label">Approved Today</div>
        </div>

        <div className="dash-stat-card border-amber" onClick={() => handleNavigate('visitor-history')}>
          <div className="ds-icon bg-amber-light text-amber"><Users size={22} /></div>
          <div className="ds-value">{stats.totalVisitorsToday}</div>
          <div className="ds-label">Total Visitors</div>
        </div>

        <div className="dash-stat-card border-purple" onClick={() => handleNavigate('ble-tags')}>
          <div className="ds-icon bg-purple-light text-purple"><MapPin size={22} /></div>
          <div className="ds-value">{stats.activeBleTags}</div>
          <div className="ds-label">Active BLE Tags</div>
        </div>
      </section>

      {/* Middle Section: Today's Visitors & Quick Actions */}
      <section className="middle-section">
        <div className="overview-panel">
          <div className="panel-header">
            <div className="ph-title">
              <UserCheck size={20} className="text-teal" />
              <span>Today's Approved Visitors</span>
            </div>
          </div>
          <div className="task-list">
            {todayVisitors.length === 0 ? (
              <div className="no-tasks">
                <CheckCircle size={28} className="text-green" />
                <p>No approved visitors for today</p>
              </div>
            ) : (
              todayVisitors.map(visitor => (
                <div key={visitor.id} className="task-item">
                  <div className="task-info">
                    <UserCheck size={16} className="text-green" />
                    <div>
                      <p className="task-text">
                        <strong>{visitor.first_name} {visitor.last_name}</strong>
                      </p>
                      <p className="task-date">
                        {visitor.visit_time ? visitor.visit_time.substring(0,5) : 'No time'}
                        {visitor.reason && ` · ${visitor.reason.substring(0,40)}${visitor.reason.length > 40 ? '…' : ''}`}
                      </p>
                    </div>
                  </div>
                  <button
                    className="view-task-btn"
                    onClick={() => handleNavigate('track-visitor')}
                  >
                    Track
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
              <span>Security Shortcuts</span>
            </div>
          </div>
          <div className="action-list">
            <button className="action-row" onClick={() => handleNavigate('track-visitor')}>
              <span>Live Visitor Tracking</span>
              <ChevronRight size={16} />
            </button>
            <button className="action-row" onClick={() => handleNavigate('completed-visits')}>
              <span>View Visitor History</span>
              <ChevronRight size={16} />
            </button>
            <button className="action-row" onClick={() => handleNavigate('manage-ble')}>
              <span>Manage BLE Tags</span>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SecurityDashboard;