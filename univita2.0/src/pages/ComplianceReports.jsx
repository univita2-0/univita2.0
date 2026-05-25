// src/pages/ComplianceReports.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Download, Calendar, FileText, ShieldCheck, CheckCircle, TrendingUp } from 'lucide-react';
import './ComplianceReports.css';
import { API_BASE } from '../api';

const getAuthHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('auth_token')}` }
});

const ComplianceReports = () => {
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);
  const [lastGenerated, setLastGenerated] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem('last_compliance_report');
    if (saved) setLastGenerated(new Date(parseInt(saved)));
  }, []);

  const generateReport = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE}/reports/compliance/attendance-compliance`, {
        params: { month, year },
        responseType: 'blob',
        ...getAuthHeaders()
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `attendance_compliance_${year}_${String(month).padStart(2, '0')}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      const now = Date.now();
      localStorage.setItem('last_compliance_report', now);
      setLastGenerated(new Date(now));

      toast.success('Report downloaded successfully');
    } catch (err) {
      console.error(err);
      let errorMsg = 'Failed to generate report. Please try again.';
      if (err.response?.status === 401) errorMsg = 'Session expired. Please log in again.';
      else if (err.response?.data?.error) errorMsg = err.response.data.error;
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const monthNames = Array.from({ length: 12 }, (_, i) =>
    new Date(2000, i, 1).toLocaleString('default', { month: 'long' })
  );
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

  return (
    <div className="compliance-container">
      <div className="compliance-header">
        <div>
          
          <p className="compliance-subtitle">Audit‑ready attendance compliance reports for accreditation</p>
        </div>
        <div className="compliance-badge">
          <ShieldCheck size={18} />
          
        </div>
      </div>

      <div className="compliance-grid">
        {/* Main Report Card */}
        <div className="report-card main-card">
          <div className="card-icon teal-bg">
            <FileText size={24} />
          </div>
          <h3>Attendance Compliance Report</h3>
          <p className="card-desc">
            Summarises instructor attendance, late arrivals, leave days, and compliance rate
            for the selected month. Includes scheduled vs. actual presence.
          </p>

          {/* 🔥 INLINE STYLES to force side‑by‑side */}
          <div className="report-filters" style={{ display: 'flex', flexDirection: 'row', gap: '1rem', marginBottom: '1.5rem', alignItems: 'flex-end', flexWrap: 'nowrap' }}>
            <div className="filter-group" style={{ flex: 1, minWidth: 0 }}>
              <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', color: '#64748b', marginBottom: '0.25rem' }}>Month</label>
              <div className="filter-select-wrapper" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '0.5rem 0.75rem', width: '100%' }}>
                <Calendar size={16} />
                <select value={month} onChange={e => setMonth(parseInt(e.target.value))} style={{ background: 'transparent', border: 'none', flex: 1, fontSize: '0.9rem', fontWeight: 500, color: '#0f172a', outline: 'none', cursor: 'pointer', minWidth: 0 }}>
                  {monthNames.map((name, idx) => (
                    <option key={idx + 1} value={idx + 1}>{name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="filter-group" style={{ flex: 1, minWidth: 0 }}>
              <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', color: '#64748b', marginBottom: '0.25rem' }}>Year</label>
              <div className="filter-select-wrapper" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '0.5rem 0.75rem', width: '100%' }}>
                <Calendar size={16} />
                <select value={year} onChange={e => setYear(parseInt(e.target.value))} style={{ background: 'transparent', border: 'none', flex: 1, fontSize: '0.9rem', fontWeight: 500, color: '#0f172a', outline: 'none', cursor: 'pointer', minWidth: 0 }}>
                  {years.map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {lastGenerated && (
            <div className="last-generated">
              <CheckCircle size={14} />
              <span>Last generated: {lastGenerated.toLocaleString()}</span>
            </div>
          )}

          <button className="btn-generate" onClick={generateReport} disabled={loading}>
            {loading ? (
              <>
                <span className="spinner"></span>
                Generating...
              </>
            ) : (
              <>
                <Download size={18} />
                Download PDF
              </>
            )}
          </button>
        </div>

        {/* What's Inside Card */}
        <div className="report-card info-card">
          <div className="card-icon slate-bg">
            <TrendingUp size={24} />
          </div>
          <h3>Report Contents</h3>
          <ul className="report-features">
            <li>✔️ Instructor attendance summary</li>
            <li>✔️ Late arrivals & leave days</li>
            <li>✔️ Compliance rate per instructor</li>
            <li>✔️ Overall summary with target</li>
            <li>✔️ Institution header & footer</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ComplianceReports;