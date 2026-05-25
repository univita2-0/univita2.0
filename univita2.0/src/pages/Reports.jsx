import React, { useState, useEffect, useMemo } from 'react';
import './Reports.css';
import {
  Download, Users, Calendar, DollarSign, PieChart,
  Clock, FileText, TrendingUp, AlertCircle, CheckCircle, XCircle
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, PieChart as RPieChart, Pie, Cell
} from 'recharts';

const API_BASE = 'http://localhost:5000/api';

const Reports = () => {
  const [selectedReport, setSelectedReport] = useState('attendance');
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Data states
  const [attendanceData, setAttendanceData] = useState([]);
  const [payrollData, setPayrollData] = useState([]);
  const [visitorStats, setVisitorStats] = useState({ approved: 0, rejected: 0, pending: 0 });
  const [scheduleData, setScheduleData] = useState([]);
  const [visitorList, setVisitorList] = useState([]);
  // Appeals data
  const [pendingAppeals, setPendingAppeals] = useState([]);
  const [historyAppeals, setHistoryAppeals] = useState([]);

  const token = localStorage.getItem('auth_token') || '';

  const availableMonths = useMemo(() => {
    const months = [];
    const today = new Date();
    for (let i = 0; i < 12; i++) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
      months.push({ value, label });
    }
    return months;
  }, []);

  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        switch (selectedReport) {
          case 'attendance': await fetchAttendanceData(); break;
          case 'payroll': await fetchPayrollData(); break;
          case 'visitor': await fetchVisitorData(); break;
          case 'scheduling': await fetchSchedulingData(); break;
          case 'appeals': await fetchAppealsData(); break;
          default: break;
        }
      } catch (err) {
        console.error(err);
        setError(err.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedReport, selectedMonth]);

  const fetchAttendanceData = async () => {
    const [month, year] = selectedMonth.split('-');
    const res = await fetch(`${API_BASE}/attendance-monthly?month=${month}&year=${year}`, { headers });
    if (!res.ok) throw new Error('Failed to fetch attendance data');
    const data = await res.json();
    setAttendanceData((data || []).map(e => ({
      ...e,
      regular_hours: Number(e.regular_hours) || 0,
      overtime_hours: Number(e.overtime_hours) || 0,
      leave_days: Number(e.leave_days) || 0,
    })));
  };

  const fetchPayrollData = async () => {
    const res = await fetch(`${API_BASE}/payroll/history`, { headers });
    if (!res.ok) throw new Error('Failed to fetch payroll data');
    const all = await res.json();
    const target = new Date(selectedMonth + '-01').toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
    setPayrollData(all.filter(p => p.month_year === target));
  };

  const fetchVisitorData = async () => {
    const [month, year] = selectedMonth.split('-');
    const start = `${year}-${month}-01`;
    const end = new Date(year, month, 0).toISOString().split('T')[0];
    const [histRes, pendRes] = await Promise.all([
      fetch(`${API_BASE}/appointments/history`, { headers }),
      fetch(`${API_BASE}/appointments/pending`, { headers })
    ]);
    const history = await histRes.json();
    const pending = await pendRes.json();
    const monthHist = history.filter(v => v.visit_date >= start && v.visit_date <= end);
    const monthPend = pending.filter(v => v.visit_date >= start && v.visit_date <= end);
    setVisitorStats({
      approved: monthHist.filter(v => v.status === 'APPROVED').length,
      rejected: monthHist.filter(v => v.status === 'REJECTED').length,
      pending: monthPend.length
    });
    setVisitorList([...monthHist, ...monthPend]);
  };

  const fetchSchedulingData = async () => {
    const res = await fetch(`${API_BASE}/schedules`, { headers });
    if (!res.ok) throw new Error('Failed to fetch schedules');
    const all = await res.json();
    setScheduleData(all.filter(s => s.schedule_date && s.schedule_date.startsWith(selectedMonth)));
  };

  const fetchAppealsData = async () => {
    const [pendingRes, historyRes] = await Promise.all([
      fetch(`${API_BASE}/attendance-appeals/pending`, { headers }),
      fetch(`${API_BASE}/attendance-appeals/history`, { headers })
    ]);
    if (!pendingRes.ok || !historyRes.ok) throw new Error('Failed to fetch appeals');
    const pending = await pendingRes.json();
    const history = await historyRes.json();
    setPendingAppeals(pending);
    setHistoryAppeals(history);
  };

  const handleExport = () => window.print();

  // ---------- SCREEN renderers ----------
  const renderAttendanceReport = () => {
    const totalReg = attendanceData.reduce((s, e) => s + (e.regular_hours || 0), 0);
    const totalOver = attendanceData.reduce((s, e) => s + (e.overtime_hours || 0), 0);
    const totalLeave = attendanceData.reduce((s, e) => s + (e.leave_days || 0), 0);
    const chart = attendanceData.map(e => ({
      name: e.full_name?.split(' ')[0] || e.employee_id,
      'Regular Hours': e.regular_hours || 0,
      'Overtime Hours': e.overtime_hours || 0
    }));
    return (
      <div className="screen-only">
        <div className="report-stats-row">
          <StatBox label="Total Regular Hrs" value={totalReg.toFixed(1)} icon={<Clock />} />
          <StatBox label="Total Overtime Hrs" value={totalOver.toFixed(1)} icon={<TrendingUp />} />
          <StatBox label="Leave Days" value={totalLeave} icon={<FileText />} />
          <StatBox label="Employees" value={attendanceData.length} icon={<Users />} />
        </div>
        <div className="chart-card">
          <h3>Hours per Employee</h3>
          {attendanceData.length === 0 ? <p className="empty-text">No data</p> : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chart}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="Regular Hours" fill="#3B82F6" />
                <Bar dataKey="Overtime Hours" fill="#F97316" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    );
  };

  const renderPayrollReport = () => {
    const grossSum = payrollData.reduce((s, p) => s + (parseFloat(p.gross_pay) || 0), 0);
    const netSum = payrollData.reduce((s, p) => s + (parseFloat(p.net_pay) || 0), 0);
    const chart = payrollData.slice(0, 10).map(p => ({
      name: p.full_name?.split(' ')[0] || 'Emp',
      Gross: p.gross_pay,
      Net: p.net_pay
    }));
    return (
      <div className="screen-only">
        <div className="report-stats-row">
          <StatBox label="Employees Paid" value={payrollData.length} icon={<Users />} />
          <StatBox label="Total Gross Pay" value={`₱${grossSum.toLocaleString()}`} icon={<DollarSign />} />
          <StatBox label="Total Net Pay" value={`₱${netSum.toLocaleString()}`} icon={<DollarSign />} />
          <StatBox label="Avg Net Pay" value={`₱${(payrollData.length ? netSum / payrollData.length : 0).toLocaleString()}`} icon={<TrendingUp />} />
        </div>
        <div className="chart-card">
          <h3>Payroll Summary</h3>
          {payrollData.length === 0 ? <p className="empty-text">No data</p> : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chart}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(v) => `₱${Number(v).toLocaleString()}`} />
                <Legend />
                <Bar dataKey="Gross" fill="#F59E0B" />
                <Bar dataKey="Net" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    );
  };

  const renderVisitorReport = () => {
    const total = visitorStats.approved + visitorStats.rejected + visitorStats.pending;
    const pieData = [
      { name: 'Approved', value: visitorStats.approved },
      { name: 'Rejected', value: visitorStats.rejected },
      { name: 'Pending', value: visitorStats.pending }
    ];
    return (
      <div className="screen-only">
        <div className="report-stats-row">
          <StatBox label="Approved" value={visitorStats.approved} icon={<Users />} />
          <StatBox label="Rejected" value={visitorStats.rejected} icon={<Users />} />
          <StatBox label="Pending" value={visitorStats.pending} icon={<Users />} />
          <StatBox label="Total" value={total} icon={<PieChart />} />
        </div>
        <div className="chart-card">
          <h3>Visitor Request Status</h3>
          {total === 0 ? <p className="empty-text">No data</p> : (
            <ResponsiveContainer width="100%" height={300}>
              <RPieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                  {pieData.map((_, i) => <Cell key={i} fill={['#10B981','#EF4444','#F59E0B'][i]} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </RPieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    );
  };

  const renderScheduleReport = () => {
    const total = scheduleData.length;
    const uniq = new Set(scheduleData.map(s => s.employee_id)).size;
    const upc = scheduleData.filter(s => new Date(s.schedule_date) >= new Date()).length;
    return (
      <div className="screen-only">
        <div className="report-stats-row">
          <StatBox label="Total Schedules" value={total} icon={<Calendar />} />
          <StatBox label="Unique Employees" value={uniq} icon={<Users />} />
          <StatBox label="Upcoming" value={upc} icon={<Clock />} />
          <StatBox label="Coverage" value={`${total ? Math.round((uniq/8)*100) : 0}%`} icon={<TrendingUp />} />
        </div>
        <div className="chart-card">
          <h3>Schedule Overview</h3>
          {scheduleData.length === 0 ? <p className="empty-text">No data</p> : (
            <div className="simple-table">
              <table className="custom-table">
                <thead><tr><th>Date</th><th>Employee</th><th>Course</th><th>Location</th></tr></thead>
                <tbody>{scheduleData.slice(0,20).map((s,i)=>( <tr key={i}><td>{s.schedule_date}</td><td>{s.full_name}</td><td>{s.course}</td><td>{s.place}</td></tr>))}</tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderAppealsReport = () => {
    const pendingCount = pendingAppeals.length;
    const approvedCount = historyAppeals.filter(a => a.status === 'approved').length;
    const rejectedCount = historyAppeals.filter(a => a.status === 'rejected').length;
    const totalProcessed = approvedCount + rejectedCount;
    const pieData = [
      { name: 'Pending', value: pendingCount },
      { name: 'Approved', value: approvedCount },
      { name: 'Rejected', value: rejectedCount }
    ];
    return (
      <div className="screen-only">
        <div className="report-stats-row">
          <StatBox label="Pending Appeals" value={pendingCount} icon={<AlertCircle />} />
          <StatBox label="Approved" value={approvedCount} icon={<CheckCircle />} />
          <StatBox label="Rejected" value={rejectedCount} icon={<XCircle />} />
          <StatBox label="Total Processed" value={totalProcessed} icon={<FileText />} />
        </div>
        <div className="chart-card">
          <h3>Appeal Status Overview</h3>
          {pendingCount + approvedCount + rejectedCount === 0 ? (
            <p className="empty-text">No appeals data</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <RPieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                  {pieData.map((_, i) => <Cell key={i} fill={['#F59E0B', '#10B981', '#EF4444'][i]} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </RPieChart>
            </ResponsiveContainer>
          )}
        </div>
        <div className="chart-card">
          <h3>Recent Pending Appeals</h3>
          {pendingAppeals.length === 0 ? <p className="empty-text">No pending appeals</p> : (
            <div className="simple-table">
              <table className="custom-table">
                <thead><tr><th>Date</th><th>Employee</th><th>Reason</th></tr></thead>
                <tbody>
                  {pendingAppeals.slice(0, 10).map(a => (
                    <tr key={a.id}>
                      <td>{a.date}</td>
                      <td>{a.full_name} ({a.employee_id})</td>
                      <td>{a.reason.substring(0, 60)}...</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  };

  // ---------- PRINTABLE REPORTS (formal) ----------
  const PrintableHeader = () => (
    <div className="company-header">
      <h1>HCT ACADEMY</h1>
      <p>123 Healthcare Avenue, Pasay City, Metro Manila</p>
      <p>Phone: (02) 8123-4567 | Email: info@hct.ph</p>
    </div>
  );

  const renderPrintableAttendance = () => {
    const wd = 22;
    return (
      <div className="print-only printable-report">
        <PrintableHeader />
        <h2 className="print-report-title">ATTENDANCE REPORT</h2>
        <p className="print-subtitle">{availableMonths.find(m=>m.value===selectedMonth)?.label}</p>
        <table className="formal-table">
          <thead><tr><th>Sr.</th><th>ID</th><th>Name</th><th>Work Days</th><th>Present</th><th>Absent</th><th>Leave</th><th>%</th></tr></thead>
          <tbody>
            {attendanceData.map((emp,i)=>{
              const present = emp.regular_hours>0?1:0;
              const absent = present?0:1;
              const pct = ((present/wd)*100).toFixed(1);
              return(<tr key={i}><td>{i+1}</td><td>{emp.employee_id}</td><td>{emp.full_name}</td><td>{wd}</td><td>{present}</td><td>{absent}</td><td>{emp.leave_days||0}</td><td>{pct}%</td></tr>);
            })}
          </tbody>
        </table>
        <div className="signatures"><div>Prepared: HR</div><div>Reviewed: HR Manager</div><div>Approved: Head Admin</div></div>
      </div>
    );
  };

  const renderPrintablePayroll = () => (
    <div className="print-only printable-report">
      <PrintableHeader />
      <h2 className="print-report-title">PAYROLL REPORT</h2>
      <p className="print-subtitle">{availableMonths.find(m=>m.value===selectedMonth)?.label}</p>
      <table className="formal-table">
        <thead><tr><th>Sr.</th><th>ID</th><th>Name</th><th>Gross</th><th>Tax</th><th>SSS</th><th>PhilHealth</th><th>PagIBIG</th><th>Other Ded.</th><th>Net</th></tr></thead>
        <tbody>
          {payrollData.map((p,i)=>(<tr key={i}><td>{i+1}</td><td>{p.employee_id||p.user_id}</td><td>{p.full_name}</td><td>{Number(p.gross_pay).toLocaleString()}</td><td>{Number(p.tax_deduction).toLocaleString()}</td><td>{Number(p.sss_deduction).toLocaleString()}</td><td>{Number(p.philhealth_deduction).toLocaleString()}</td><td>{Number(p.pagibig_deduction).toLocaleString()}</td><td>{Number(p.loan_deduction + p.other_deduction).toLocaleString()}</td><td>{Number(p.net_pay).toLocaleString()}</td></tr>))}
        </tbody>
      </table>
      <div className="signatures"><div>Prepared: HR</div><div>Reviewed: Finance</div><div>Approved: Director</div></div>
    </div>
  );

  const renderPrintableVisitor = () => (
    <div className="print-only printable-report">
      <PrintableHeader />
      <h2 className="print-report-title">VISITOR REPORT</h2>
      <p className="print-subtitle">{availableMonths.find(m=>m.value===selectedMonth)?.label}</p>
      <table className="formal-table">
        <thead><tr><th>Sr.</th><th>Name</th><th>Email</th><th>Date</th><th>Reason</th><th>Status</th></tr></thead>
        <tbody>{visitorList.map((v,i)=>(<tr key={i}><td>{i+1}</td><td>{v.first_name} {v.last_name}</td><td>{v.email}</td><td>{v.visit_date}</td><td>{v.reason}</td><td>{v.status}</td></tr>))}</tbody>
      </table>
      <div className="signatures"><div>Prepared: Security</div><div>Reviewed: Facility Manager</div></div>
    </div>
  );

  const renderPrintableSchedule = () => (
    <div className="print-only printable-report">
      <PrintableHeader />
      <h2 className="print-report-title">SCHEDULE REPORT</h2>
      <p className="print-subtitle">{availableMonths.find(m=>m.value===selectedMonth)?.label}</p>
      <table className="formal-table">
        <thead><tr><th>Sr.</th><th>Date</th><th>Instructor</th><th>Course</th><th>Location</th><th>Start</th><th>End</th></tr></thead>
        <tbody>{scheduleData.map((s,i)=>(<tr key={i}><td>{i+1}</td><td>{s.schedule_date}</td><td>{s.full_name}</td><td>{s.course}</td><td>{s.place}</td><td>{s.start_time?.substring(0,5)}</td><td>{s.end_time?.substring(0,5)}</td></tr>))}</tbody>
      </table>
      <div className="signatures"><div>Prepared: HR</div><div>Approved: Academics</div></div>
    </div>
  );

  const renderPrintableAppeals = () => (
    <div className="print-only printable-report">
      <PrintableHeader />
      <h2 className="print-report-title">ATTENDANCE APPEALS REPORT</h2>
      <p className="print-subtitle">{availableMonths.find(m=>m.value===selectedMonth)?.label}</p>
      <table className="formal-table">
        <thead><tr><th>Sr.</th><th>Employee</th><th>Date</th><th>Reason</th><th>Status</th><th>Remarks</th></tr></thead>
        <tbody>
          {[...pendingAppeals, ...historyAppeals].slice(0, 50).map((a,i) => (
            <tr key={i}>
              <td>{i+1}</td>
              <td>{a.full_name} ({a.employee_id})</td>
              <td>{a.date}</td>
              <td>{a.reason}</td>
              <td className={a.status === 'pending' ? 'text-warning' : (a.status === 'approved' ? 'text-success' : 'text-danger')}>{a.status.toUpperCase()}</td>
              <td>{a.admin_remarks || '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="signatures"><div>Prepared: HR</div><div>Reviewed: HR Manager</div></div>
    </div>
  );

  // ---------- MAIN RENDER ----------
  return (
    <div className="reports-container">
      <div className="reports-control-bar">
        <span className="report-title">Reports & Analytics</span>
        <div className="report-actions">
          <select className="report-date-select" value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)}>
            {availableMonths.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>
          <button className="btn-export-report" onClick={handleExport}><Download size={16} /> Export / Print</button>
        </div>
      </div>

      <div className="reports-nav-grid">
        {[
          { id:'attendance', title:'Attendance Report', desc:'Monthly attendance summary.' },
          { id:'payroll', title:'Payroll Report', desc:'Gross pay, net pay, deductions.' },
          { id:'visitor', title:'Visitor Report', desc:'Approved, rejected, pending requests.' },
          { id:'scheduling', title:'Schedule Report', desc:'Upcoming schedules and distribution.' },
          { id:'appeals', title:'Attendance Appeals', desc:'Pending, approved, rejected appeals.' }
        ].map(r => (
          <div key={r.id} className={`report-nav-card ${selectedReport===r.id?'active':''}`} onClick={()=>setSelectedReport(r.id)}>
            <div className="r-card-title">{r.title}</div>
            <div className="r-card-desc">{r.desc}</div>
          </div>
        ))}
      </div>

      <div className="report-content-area screen-only">
        {loading ? <div className="report-loader">⏳ Loading...</div> :
         error ? <div className="error-message">Error: {error}</div> :
         <>
           <div className="current-report-header">
             <h2 className="cr-title">
               {selectedReport==='attendance'&&'Attendance Report'}
               {selectedReport==='payroll'&&'Payroll Report'}
               {selectedReport==='visitor'&&'Visitor Report'}
               {selectedReport==='scheduling'&&'Schedule Report'}
               {selectedReport==='appeals'&&'Attendance Appeals Report'}
             </h2>
             <p className="cr-subtitle">{availableMonths.find(m=>m.value===selectedMonth)?.label}</p>
           </div>
           {selectedReport==='attendance' && renderAttendanceReport()}
           {selectedReport==='payroll' && renderPayrollReport()}
           {selectedReport==='visitor' && renderVisitorReport()}
           {selectedReport==='scheduling' && renderScheduleReport()}
           {selectedReport==='appeals' && renderAppealsReport()}
         </>
        }
      </div>

      {/* Printable content (hidden on screen, printed) */}
      {selectedReport==='attendance' && renderPrintableAttendance()}
      {selectedReport==='payroll' && renderPrintablePayroll()}
      {selectedReport==='visitor' && renderPrintableVisitor()}
      {selectedReport==='scheduling' && renderPrintableSchedule()}
      {selectedReport==='appeals' && renderPrintableAppeals()}
    </div>
  );
};

const StatBox = ({ label, value, icon }) => (
  <div className="r-stat-box">
    <div className="stat-icon">{icon}</div>
    <div className="stat-info">
      <div className="r-stat-label">{label}</div>
      <div className="r-stat-value">{value}</div>
    </div>
  </div>
);

export default Reports;