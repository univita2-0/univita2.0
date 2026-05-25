// src/pages/LeaveBalancesManagement.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { RefreshCw, Edit, Save, X, AlertCircle, Search } from 'lucide-react';
import FormalModal from '../components/FormalModal';
import { API_BASE } from '../api';
import './LeaveBalancesManagement.css';

const getAuthHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('auth_token')}` }
});

const LeaveBalancesManagement = () => {
  const [employees, setEmployees] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Modal state
  const [showBalanceModal, setShowBalanceModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [balances, setBalances] = useState([]);
  const [editingBalance, setEditingBalance] = useState(null);
  const [tempValue, setTempValue] = useState('');
  const [saving, setSaving] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const modalYearRef = useRef(selectedYear);

  const loadEmployees = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/employees`, getAuthHeaders());
      const instructors = res.data.filter(emp => emp.role === 'instructor' && emp.status === 'active');
      setEmployees(instructors);
    } catch (err) {
      console.error('Failed to load employees:', err);
      toast.error('Failed to load employees');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadLeaveTypes = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE}/leave-types`, getAuthHeaders());
      setLeaveTypes(res.data);
    } catch (err) {
      console.error('Failed to load leave types:', err);
      toast.error('Failed to load leave types');
    }
  }, []);

  useEffect(() => {
    loadEmployees();
    loadLeaveTypes();
  }, [loadEmployees, loadLeaveTypes]);

  const fetchBalances = async (userId, year) => {
    if (!leaveTypes.length) return [];
    setModalLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/leave-balances/${userId}?year=${year}`, getAuthHeaders());
      const data = res.data;
      const enriched = leaveTypes.map(lt => {
        const existing = data.find(b => b.leave_type === lt.name);
        return {
          leave_type_id: lt.id,
          leave_type: lt.name,
          remaining_days: existing ? existing.remaining_days : lt.annual_quota,
          annual_quota: lt.annual_quota,
        };
      });
      setBalances(enriched);
      modalYearRef.current = year;
    } catch (err) {
      console.error('Failed to fetch balances:', err);
      toast.error('Failed to load leave balances');
      setBalances([]);
    } finally {
      setModalLoading(false);
    }
  };

  const openBalanceModal = async (employee) => {
    setSelectedEmployee(employee);
    setBalances([]);
    setEditingBalance(null);
    setShowBalanceModal(true);
    await fetchBalances(employee.id, selectedYear);
  };

  useEffect(() => {
    if (showBalanceModal && selectedEmployee) {
      fetchBalances(selectedEmployee.id, selectedYear);
    }
  }, [selectedYear, showBalanceModal, selectedEmployee]);

  const handleEditBalance = (balance) => {
    setEditingBalance(balance.leave_type_id);
    setTempValue(balance.remaining_days.toString());
  };

  const handleSaveBalance = async (balance) => {
    const newValue = parseFloat(tempValue);
    if (isNaN(newValue) || newValue < 0) {
      toast.warning('Please enter a valid non‑negative number.');
      return;
    }
    setSaving(true);
    try {
      await axios.put(`${API_BASE}/leave-balances/${selectedEmployee.id}`, {
        leave_type_id: balance.leave_type_id,
        remaining_days: newValue,
        year: modalYearRef.current
      }, getAuthHeaders());
      setBalances(prev =>
        prev.map(b =>
          b.leave_type_id === balance.leave_type_id ? { ...b, remaining_days: newValue } : b
        )
      );
      setEditingBalance(null);
      toast.success('Balance updated successfully');
    } catch (err) {
      console.error(err);
      toast.error('Failed to update balance');
    } finally {
      setSaving(false);
    }
  };

  const cancelEdit = () => {
    setEditingBalance(null);
    setTempValue('');
  };

  const filteredEmployees = employees.filter(emp =>
    emp.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.employee_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="lbm-container">
      <div className="lbm-header">
        <h3>Employee Leave Balances</h3>
        <div className="lbm-controls">
          <div className="lbm-year-selector">
            <label>Year:</label>
            <select value={selectedYear} onChange={(e) => setSelectedYear(parseInt(e.target.value))}>
              {[new Date().getFullYear() - 1, new Date().getFullYear(), new Date().getFullYear() + 1].map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
          <button onClick={loadEmployees} className="btn-refresh" title="Refresh">
            <RefreshCw size={18} />
          </button>
        </div>
      </div>

      <div className="lbm-search">
        <Search size={16} className="search-icon" />
        <input
          type="text"
          placeholder="Search by name or ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="loading-spinner">Loading employees...</div>
      ) : (
        <div className="lbm-table-wrapper">
          <table className="lbm-table">
            <thead>
              <tr>
                <th>Employee ID</th>
                <th>Full Name</th>
                <th>Email</th>
                <th style={{ textAlign: 'center' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.length === 0 ? (
                <tr><td colSpan="4" className="empty-row">No instructors found.</td></tr>
              ) : (
                filteredEmployees.map(emp => (
                  <tr key={emp.id}>
                    <td>{emp.employee_id}</td>
                    <td>{emp.full_name}</td>
                    <td>{emp.email}</td>
                    <td className="text-center">
                      <button className="btn-view-balances" onClick={() => openBalanceModal(emp)}>
                        View / Edit Balances
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Leave Balances Modal */}
      <FormalModal
        show={showBalanceModal}
        onClose={() => {
          setShowBalanceModal(false);
          setSelectedEmployee(null);
          setEditingBalance(null);
        }}
        title={`Leave Balances – ${selectedEmployee?.full_name}`}
        wide
      >
        {modalLoading ? (
          <div className="loading-spinner">Loading balances...</div>
        ) : (
          <>
            <div className="lbm-modal-info">
              Balances for year <strong>{selectedYear}</strong>. Adjust remaining days as needed.
            </div>
            <div className="lbm-balances-table-wrapper">
              <table className="lbm-balances-table">
                <thead>
                  <tr>
                    <th>Leave Type</th>
                    <th>Annual Quota</th>
                    <th>Remaining Days</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {balances.length === 0 ? (
                    <tr><td colSpan="4" className="empty-row">No leave types configured. Please contact admin.</td></tr>
                  ) : (
                    balances.map(balance => (
                      <tr key={balance.leave_type_id}>
                        <td><strong>{balance.leave_type}</strong></td>
                        <td>{balance.annual_quota} days</td>
                        <td>
                          {editingBalance === balance.leave_type_id ? (
                            <input
                              type="number"
                              step="0.5"
                              value={tempValue}
                              onChange={(e) => setTempValue(e.target.value)}
                              className="balance-input"
                              autoFocus
                            />
                          ) : (
                            <span>{balance.remaining_days} days</span>
                          )}
                        </td>
                        <td>
                          {editingBalance === balance.leave_type_id ? (
                            <div className="balance-actions">
                              <button
                                onClick={() => handleSaveBalance(balance)}
                                disabled={saving}
                                className="btn-save"
                              >
                                <Save size={14} /> Save
                              </button>
                              <button onClick={cancelEdit} className="btn-cancel-edit">
                                <X size={14} /> Cancel
                              </button>
                            </div>
                          ) : (
                            <button onClick={() => handleEditBalance(balance)} className="btn-edit-balance">
                              <Edit size={14} /> Edit
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="lbm-note">
              <AlertCircle size={14} /> Approved leave requests automatically deduct 1 day from the remaining balance.
            </div>
          </>
        )}
      </FormalModal>
    </div>
  );
};

export default LeaveBalancesManagement;