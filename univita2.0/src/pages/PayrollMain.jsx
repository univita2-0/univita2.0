// src/pages/PayrollMain.jsx
import React, { useState, useEffect, useCallback } from 'react';
import './PayrollMain.css';
import {
  ChevronLeft, ChevronRight, Calendar, Search, History, CalendarDays,
  Download, Eye, DollarSign, Users, TrendingUp, AlertCircle
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';
import FormalModal from '../components/FormalModal';
import { API_BASE } from '../api';

const getAuthHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('auth_token')}` }
});

const taxTable = [
  { min: 0, max: 20833, rate: 0, base: 0 },
  { min: 20833, max: 33332, rate: 0.15, base: 0 },
  { min: 33332, max: 66666, rate: 0.20, base: 3125 },
  { min: 66666, max: 166666, rate: 0.25, base: 13750 },
  { min: 166666, max: 666666, rate: 0.30, base: 46250 },
  { min: 666666, max: Infinity, rate: 0.35, base: 231250 },
];

const computeMonthlyTax = (taxableIncome) => {
  for (let bracket of taxTable) {
    if (taxableIncome > bracket.min && taxableIncome <= bracket.max) {
      return bracket.base + (taxableIncome - bracket.min) * bracket.rate;
    }
  }
  return 0;
};

const OT_MULTIPLIER = 1.25;

const PayrollMain = ({ setView }) => {
  const [employees, setEmployees] = useState([]);
  const [attendanceSummary, setAttendanceSummary] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [employeeExtras, setEmployeeExtras] = useState({});
  const [showMonthlyModal, setShowMonthlyModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPayslipModal, setShowPayslipModal] = useState(false);
  const [payslipEmployee, setPayslipEmployee] = useState(null);
  const [loading, setLoading] = useState(false);

  const monthName = new Date(selectedYear, selectedMonth - 1).toLocaleString('default', { month: 'long' });
  const now = new Date();
  const isFutureMonth = selectedYear > now.getFullYear() || (selectedYear === now.getFullYear() && selectedMonth > now.getMonth() + 1);

  const loadData = useCallback(async () => {
    if (isFutureMonth) return;
    setLoading(true);
    try {
      const [empRes, attRes] = await Promise.all([
        axios.get(`${API_BASE}/employees`, getAuthHeaders()),
        axios.get(`${API_BASE}/attendance-monthly?month=${selectedMonth}&year=${selectedYear}`, getAuthHeaders())
      ]);
      const activeInstructors = empRes.data.filter(u => u.role.toLowerCase() === 'instructor' && u.status === 'active');
      setEmployees(activeInstructors);

      const attMap = {};
      attRes.data.forEach(record => {
        attMap[record.employee_id] = {
          regularHours: Number(record.regular_hours || 0),
          overtimeHours: Number(record.overtime_hours || 0),
          leaveDays: Number(record.leave_days || 0),
          lateMinutes: Number(record.late_minutes || 0)
        };
      });
      setAttendanceSummary(attMap);

      const extras = {};
      activeInstructors.forEach(emp => {
        extras[emp.employee_id] = {
          transport: 0, meal: 0, housing: 0, loans: 0, other: 0,
          lateMinutesOverride: null,
          sssOverride: null, philHealthOverride: null, pagIbigOverride: null
        };
      });
      setEmployeeExtras(extras);
    } catch (err) {
      console.error("Error loading payroll data:", err);
      toast.error('Failed to load payroll data.');
    } finally {
      setLoading(false);
    }
  }, [selectedMonth, selectedYear, isFutureMonth]);

  useEffect(() => { loadData(); }, [loadData]);

  const filteredEmployees = employees.filter(emp =>
    (emp.full_name || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const computePayroll = (emp) => {
    const att = attendanceSummary[emp.employee_id] || { regularHours: 0, overtimeHours: 0, leaveDays: 0, lateMinutes: 0 };
    const monthlySalary = Number(emp.monthly_salary || 0);
    const workDays = Number(emp.work_days_per_month || 22);
    const hourlyRate = workDays > 0 ? (monthlySalary / workDays / 8) : 0;
    const overtimePay = att.overtimeHours * hourlyRate * OT_MULTIPLIER;
    const extras = employeeExtras[emp.employee_id] || {};

    const lateMinutes = (extras.lateMinutesOverride != null) ? extras.lateMinutesOverride : att.lateMinutes;
    const lateDeduction = (lateMinutes / 60) * hourlyRate;

    const allowances = (extras.transport || 0) + (extras.meal || 0) + (extras.housing || 0);
    const grossPay = monthlySalary + overtimePay + allowances - lateDeduction;

    const sss = (extras.sssOverride != null) ? extras.sssOverride : Math.min(monthlySalary * 0.045, 1125);
    const philHealth = (extras.philHealthOverride != null) ? extras.philHealthOverride : Math.min(monthlySalary * 0.025, 1250);
    const pagIbig = (extras.pagIbigOverride != null) ? extras.pagIbigOverride : Math.min(monthlySalary * 0.02, 100);

    const taxableIncome = grossPay - sss - philHealth - pagIbig;
    const tax = computeMonthlyTax(taxableIncome);
    const totalDeductions = tax + sss + philHealth + pagIbig + (extras.loans || 0) + (extras.other || 0);
    const netPay = grossPay - totalDeductions;

    return {
      regularHours: att.regularHours,
      overtimeHours: att.overtimeHours,
      overtimePay,
      allowances,
      grossPay,
      sss,
      philHealth,
      pagIbig,
      loans: extras.loans || 0,
      other: extras.other || 0,
      tax,
      netPay,
      totalDeductions,
      monthlySalary,
      hourlyRate,
      workDays,
      lateMinutes,
      lateDeduction
    };
  };

  const handleFinalize = async (emp) => {
    if (!emp.id) {
      toast.error('Employee ID missing.');
      return;
    }
    const calc = computePayroll(emp);
    const monthYear = `${monthName} ${selectedYear}`;
    const payload = {
      user_id: emp.id,
      month_year: monthYear,
      salary_rate: calc.hourlyRate,
      total_hours: calc.regularHours,
      overtime_hours: calc.overtimeHours,
      overtime_pay: calc.overtimePay,
      transport_allowance: employeeExtras[emp.employee_id]?.transport || 0,
      meal_allowance: employeeExtras[emp.employee_id]?.meal || 0,
      housing_allowance: employeeExtras[emp.employee_id]?.housing || 0,
      sss_deduction: calc.sss,
      philhealth_deduction: calc.philHealth,
      pagibig_deduction: calc.pagIbig,
      loan_deduction: calc.loans,
      other_deduction: calc.other,
      gross_pay: calc.grossPay,
      tax_deduction: calc.tax,
      net_pay: calc.netPay,
      total_earnings: calc.netPay,
      status: 'paid'
    };
    try {
      const res = await axios.post(`${API_BASE}/payroll/finalize`, payload, getAuthHeaders());
      if (res.data.success) {
        toast.success(`Payroll finalized for ${emp.full_name}`);
        loadData();
      } else {
        toast.error(res.data.error || 'Failed');
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error');
    }
  };

  const handleMonthlyPayroll = async () => {
    setIsProcessing(true);
    try {
      const response = await axios.post(`${API_BASE}/payroll/run-monthly`, { month: selectedMonth, year: selectedYear }, getAuthHeaders());
      if (response.data.success) {
        const processed = response.data.processed || 0;
        const skipped = response.data.skipped || 0;
        toast.success(`Monthly payroll processed: ${processed} employees finalized.${skipped > 0 ? ` ${skipped} already existed.` : ''}`);
        setShowMonthlyModal(false);
        loadData();
      } else {
        toast.error('Failed to process monthly payroll.');
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Server error');
    } finally {
      setIsProcessing(false);
    }
  };

  const openPayslip = (emp) => {
    setPayslipEmployee(emp);
    setShowPayslipModal(true);
  };

  const updateExtras = (empId, field, value) => {
    setEmployeeExtras(prev => ({
      ...prev,
      [empId]: { ...prev[empId], [field]: value === '' ? null : parseFloat(value) || 0 }
    }));
  };

  const printPayslip = (emp) => {
    const calc = computePayroll(emp);
    const extras = employeeExtras[emp.employee_id] || {};
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    printWindow.document.write(`
      <html><head><title>Payslip - ${emp.full_name}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        h2 { text-align: center; }
        .payslip-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        .payslip-table td, .payslip-table th { padding: 8px; border: 1px solid #ddd; }
        .payslip-table th { background: #f2f2f2; text-align: left; }
        .net-pay { font-weight: bold; font-size: 1.2em; }
        @media print { body { margin: 0; } button { display: none; } }
      </style></head><body>
      <h2>Payslip - ${emp.full_name}</h2>
      <table class="payslip-table">
        <tr><th>Employee ID</th><td>${emp.employee_id}</td></tr>
        <tr><th>Position</th><td>${emp.position_level || 'Instructor'}</td></tr>
        <tr><th>Regular Hours</th><td>${calc.regularHours} hrs</td></tr>
        <tr><th>Overtime Hours</th><td>${calc.overtimeHours} hrs</td></tr>
        <tr><th>Late Minutes (total)</th><td>${calc.lateMinutes}</td></tr>
        <tr><th>Late Deduction</th><td>₱${calc.lateDeduction.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</td></tr>
        <tr><th>Monthly Salary</th><td>₱${calc.monthlySalary.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</td></tr>
        <tr><th>Overtime Pay</th><td>₱${calc.overtimePay.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</td></tr>
        <tr><th>Transport Allowance</th><td>₱${(extras.transport || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}</td></tr>
        <tr><th>Meal Allowance</th><td>₱${(extras.meal || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}</td></tr>
        <tr><th>Housing Allowance</th><td>₱${(extras.housing || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}</td></tr>
        <tr><th>Gross Pay</th><td>₱${calc.grossPay.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</td></tr>
        <tr><th>SSS (4.5% up to 1,125)</th><td>₱${calc.sss.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</td></tr>
        <tr><th>PhilHealth (2.5% up to 1,250)</th><td>₱${calc.philHealth.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</td></tr>
        <tr><th>Pag-IBIG (2% up to 100)</th><td>₱${calc.pagIbig.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</td></tr>
        <tr><th>Loans</th><td>₱${(calc.loans).toLocaleString('en-PH', { minimumFractionDigits: 2 })}</td></tr>
        <tr><th>Other Deductions</th><td>₱${(calc.other).toLocaleString('en-PH', { minimumFractionDigits: 2 })}</td></tr>
        <tr><th>Withholding Tax</th><td>₱${calc.tax.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</td></tr>
        <tr class="net-pay"><th>Net Pay</th><td>₱${calc.netPay.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</td></tr>
      </table>
      <script>window.onload = () => { window.print(); setTimeout(() => window.close(), 500); }</script>
      </body></html>
    `);
    printWindow.document.close();
  };

  const exportToCSV = () => {
    const headers = [
      "Full Name","Employee ID","Regular Hours","Overtime Hours","Late Minutes","Late Deduction",
      "Monthly Salary","Overtime Pay","Transport Allowance","Meal Allowance","Housing Allowance",
      "Gross Pay","SSS","PhilHealth","Pag-IBIG","Loans","Other Deductions","Tax","Net Pay"
    ];
    const rows = [];
    filteredEmployees.forEach(emp => {
      const calc = computePayroll(emp);
      const extras = employeeExtras[emp.employee_id] || {};
      rows.push([
        emp.full_name, emp.employee_id, calc.regularHours, calc.overtimeHours, calc.lateMinutes, calc.lateDeduction,
        calc.monthlySalary, calc.overtimePay,
        extras.transport || 0, extras.meal || 0, extras.housing || 0,
        calc.grossPay, calc.sss, calc.philHealth, calc.pagIbig, calc.loans, calc.other,
        calc.tax, calc.netPay
      ].map(value => {
        const stringValue = String(value);
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n'))
          return `"${stringValue.replace(/"/g, '""')}"`;
        return stringValue;
      }));
    });
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Payroll_${monthName}_${selectedYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.info('CSV export started');
  };

  const summary = !isFutureMonth ? filteredEmployees.reduce((acc, emp) => {
    const calc = computePayroll(emp);
    acc.totalGross += calc.grossPay;
    acc.totalTax += calc.tax;
    acc.totalNet += calc.netPay;
    return acc;
  }, { totalEmployees: filteredEmployees.length, totalGross: 0, totalTax: 0, totalNet: 0 }) : { totalEmployees: 0, totalGross: 0, totalTax: 0, totalNet: 0 };

  const isAllowanceEligible = (emp) => emp.employment_type === 'Full-time' && emp.contract_type === 'Regular';

  return (
    <div className="card payroll-main-card">
      <div className="pm-month-header">
        <div className="pm-nav-inner">
          <button className="nav-arrow-btn" onClick={() => {
            if (selectedMonth === 1) { setSelectedMonth(12); setSelectedYear(selectedYear - 1); }
            else { setSelectedMonth(selectedMonth - 1); }
          }}><ChevronLeft size={20}/></button>
          <div className="date-display-wrapper">
            <Calendar size={20} />
            <span className="date-text">{monthName} {selectedYear}</span>
          </div>
          <button className="nav-arrow-btn" onClick={() => {
            if (selectedMonth === 12) { setSelectedMonth(1); setSelectedYear(selectedYear + 1); }
            else { setSelectedMonth(selectedMonth + 1); }
          }}><ChevronRight size={20}/></button>
        </div>
      </div>

      {isFutureMonth ? (
        <div className="empty-row" style={{ textAlign: 'center', padding: '4rem', fontSize: '1.2rem', color: '#6B7280', fontWeight: '500' }}>
          Cannot access future dates.
        </div>
      ) : (
        <>
          <div className="pm-summary-row">
            <div className="summary-card"><Users size={20} className="icon" /><div><div className="summary-label">Employees</div><div className="summary-value">{summary.totalEmployees}</div></div></div>
            <div className="summary-card"><DollarSign size={20} className="icon green" /><div><div className="summary-label">Total Gross Pay</div><div className="summary-value">₱{summary.totalGross.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</div></div></div>
            <div className="summary-card"><TrendingUp size={20} className="icon red" /><div><div className="summary-label">Total Tax</div><div className="summary-value">₱{summary.totalTax.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</div></div></div>
            <div className="summary-card"><DollarSign size={20} className="icon blue" /><div><div className="summary-label">Total Net Pay</div><div className="summary-value">₱{summary.totalNet.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</div></div></div>
          </div>

          <div className="pm-actions-row">
            <div className="pm-title">Monthly Payroll ({monthName} {selectedYear})</div>
            <div className="flex-gap-2">
              <button className="btn-monthly-payroll" onClick={() => setShowMonthlyModal(true)}><CalendarDays size={18} /> Process Month</button>
              <button className="btn-view-history" onClick={() => setView('payroll-history')}><History size={18} /> History</button>
              <button className="btn-export" onClick={exportToCSV}><Download size={18} /> Export CSV</button>
              <div className="pm-search">
                <Search size={18} className="search-icon" />
                <input type="text" className="search-input" placeholder="Search employee..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
              </div>
            </div>
          </div>

          <div className="table-container">
            {loading ? (
              <div className="empty-row">Loading...</div>
            ) : (
              <table className="custom-table payroll-table">
                <thead><tr><th>ID</th><th>Name</th><th>Email</th><th>Position</th><th>Actions</th></tr></thead>
                <tbody>
                  {filteredEmployees.length === 0 ? ( <tr><td colSpan="6" className="empty-row">No employees found. </td> </tr> ) : (
                    filteredEmployees.map(emp => {
                      const att = attendanceSummary[emp.employee_id] || { regularHours: 0 };
                      return (
                        <tr key={emp.employee_id}>
                          <td>{emp.employee_id}</td>
                          <td>{emp.full_name}</td>
                          <td>{emp.email}</td>
                          <td>{emp.position_level || '—'}</td>
                          
                          <td className="text-right">
                            <div className="action-buttons-inline">
                              <button className="btn-payslip" onClick={() => openPayslip(emp)}><Eye size={14} /></button>
                              <button className="btn-finalize" onClick={() => handleFinalize(emp)}>Finalize</button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}

      <FormalModal show={showMonthlyModal} onClose={() => setShowMonthlyModal(false)} title="Process Monthly Payroll" footer={<><button className="btn-modal-cancel" onClick={() => setShowMonthlyModal(false)}>Cancel</button><button className="btn-modal-submit" onClick={handleMonthlyPayroll} disabled={isProcessing}>{isProcessing ? 'Processing...' : 'Run Payroll'}</button></>}>
        <p className="modal-subtitle">This will calculate payroll for all active instructors for the selected month.</p>
        <div className="modal-form-group"><label className="modal-label">Month</label><select value={selectedMonth} onChange={(e) => setSelectedMonth(parseInt(e.target.value))} className="modal-select">{Array.from({ length: 12 }, (_, i) => i + 1).map(m => (<option key={m} value={m}>{new Date(2000, m-1, 1).toLocaleString('default', { month: 'long' })}</option>))}</select></div>
        <div className="modal-form-group"><label className="modal-label">Year</label><select value={selectedYear} onChange={(e) => setSelectedYear(parseInt(e.target.value))} className="modal-select">{Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(y => (<option key={y} value={y}>{y}</option>))}</select></div>
      </FormalModal>

      <FormalModal show={showPayslipModal && !!payslipEmployee} onClose={() => { setShowPayslipModal(false); setPayslipEmployee(null); }} title={`Payslip – ${payslipEmployee?.full_name || ''}`} wide footer={<><button className="btn-modal-cancel" onClick={() => { setShowPayslipModal(false); setPayslipEmployee(null); }}>Close</button><button className="btn-print" onClick={() => printPayslip(payslipEmployee)}>Print</button></>}>
        {payslipEmployee && (() => {
          const emp = payslipEmployee;
          const calc = computePayroll(emp);
          const extras = employeeExtras[emp.employee_id] || {};
          const eligible = isAllowanceEligible(emp);
          return (
            <div className="payslip-body">
              <div className="payslip-row"><span>Employee ID:</span><span>{emp.employee_id}</span></div>
              <div className="payslip-row"><span>Position:</span><span>{emp.position_level || '—'}</span></div>
              <div className="payslip-row"><span>Monthly Salary:</span><span>₱{calc.monthlySalary.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span></div>
              <div className="payslip-row"><span>Regular Hours:</span><span>{calc.regularHours} hrs</span></div>
              <div className="payslip-row"><span>Overtime Hours:</span><span>{calc.overtimeHours} hrs</span></div>
              <div className="payslip-row"><span>Overtime Pay:</span><span>₱{calc.overtimePay.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span></div>
              <div className="payslip-row"><span>Late Deduction:</span> <span>₱{calc.lateDeduction.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span></div>
              <hr/>
              <h4 style={{ margin: '0 0 10px 0' }}>Allowances {!eligible && <span style={{ color: '#EF4444', fontSize: '0.8rem' }}>(Not eligible)</span>}</h4>
              <div className="payslip-row"><span>Transport</span>{eligible ? <input type="number" min="0" value={extras.transport || ''} onChange={e => updateExtras(emp.employee_id, 'transport', e.target.value)} className="payslip-edit-input" /> : <span>₱0.00</span>}</div>
              <div className="payslip-row"><span>Meal</span>{eligible ? <input type="number" min="0" value={extras.meal || ''} onChange={e => updateExtras(emp.employee_id, 'meal', e.target.value)} className="payslip-edit-input" /> : <span>₱0.00</span>}</div>
              <div className="payslip-row"><span>Housing</span>{eligible ? <input type="number" min="0" value={extras.housing || ''} onChange={e => updateExtras(emp.employee_id, 'housing', e.target.value)} className="payslip-edit-input" /> : <span>₱0.00</span>}</div>
              <hr/>
              <div className="payslip-row"><span>Gross Pay:</span><span>₱{calc.grossPay.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span></div>
              <hr/>
              <h4 style={{ margin: '0 0 10px 0' }}>Deductions</h4>
              <div className="payslip-row"><span>SSS (4.5% up to ₱1,125)</span><input type="number" min="0" value={extras.sssOverride != null ? extras.sssOverride : calc.sss} onChange={e => updateExtras(emp.employee_id, 'sssOverride', e.target.value)} className="payslip-edit-input" style={{ width: '100px' }} /></div>
              <div className="payslip-row"><span>PhilHealth (2.5% up to ₱1,250)</span><input type="number" min="0" value={extras.philHealthOverride != null ? extras.philHealthOverride : calc.philHealth} onChange={e => updateExtras(emp.employee_id, 'philHealthOverride', e.target.value)} className="payslip-edit-input" style={{ width: '100px' }} /></div>
              <div className="payslip-row"><span>Pag-IBIG (2% up to ₱100)</span><input type="number" min="0" value={extras.pagIbigOverride != null ? extras.pagIbigOverride : calc.pagIbig} onChange={e => updateExtras(emp.employee_id, 'pagIbigOverride', e.target.value)} className="payslip-edit-input" style={{ width: '100px' }} /></div>
              <div className="payslip-row"><span>Loans</span><input type="number" min="0" value={extras.loans || ''} onChange={e => updateExtras(emp.employee_id, 'loans', e.target.value)} className="payslip-edit-input" /></div>
              <div className="payslip-row"><span>Other</span><input type="number" min="0" value={extras.other || ''} onChange={e => updateExtras(emp.employee_id, 'other', e.target.value)} className="payslip-edit-input" /></div>
              <div className="payslip-row"><span>Withholding Tax:</span><span>₱{calc.tax.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span></div>
              <hr/>
              <div className="payslip-row net-row"><span>Net Pay:</span><span>₱{calc.netPay.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span></div>
            </div>
          );
        })()}
      </FormalModal>
    </div>
  );
};

export default PayrollMain;