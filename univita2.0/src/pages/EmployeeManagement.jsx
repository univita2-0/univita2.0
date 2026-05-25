import React, { useState, useEffect, useCallback } from 'react';
import './EmployeeManagement.css';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
  Search, Edit2, Trash2, RefreshCw, UserCheck, UserX, Key, LockOpen,
  CalendarDays, AlertCircle, ChevronLeft, ChevronRight, Filter, Users,
  Info, Eye, EyeOff
} from 'lucide-react';
import FormalModal from '../components/FormalModal';
import { API_BASE } from '../api';

const getAuthHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('auth_token')}` }
});

const EmployeeManagement = ({ onOpenPinChange }) => {
  const [employees, setEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('instructors');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [activeTabModal, setActiveTabModal] = useState('general');
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    employee_id: '',
    full_name: '',
    first_name: '',
    last_name: '',
    middle_initial: '',
    email: '',
    username: '',
    phone: '',
    date_of_birth: '',
    gender: 'Prefer not to say',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    street: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'Philippines',
    additional_info: '',
    position: 'Entry Level Simulationist',
    employment_type: 'Full-time',
    date_of_joining: '',
    account_expiry: '',
    status: 'active',
    role: 'instructor',
    salary: 0,
  });

  // Tooltip state
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipContent, setTooltipContent] = useState('');

  // Leave balance modal (unchanged)
  const [showLeaveBalanceModal, setShowLeaveBalanceModal] = useState(false);
  const [balanceEmployee, setBalanceEmployee] = useState(null);
  const [leaveBalances, setLeaveBalances] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [editingBalance, setEditingBalance] = useState(null);
  const [balanceYear, setBalanceYear] = useState(new Date().getFullYear());
  const [balanceLoading, setBalanceLoading] = useState(false);

  // Soft delete modal
  const [showSoftDeleteModal, setShowSoftDeleteModal] = useState(false);
  const [softDeleteTarget, setSoftDeleteTarget] = useState(null);

  // Permanent delete modal
  const [showPermanentDeleteModal, setShowPermanentDeleteModal] = useState(false);
  const [permanentDeleteTarget, setPermanentDeleteTarget] = useState(null);
  const [generatedEmpId, setGeneratedEmpId] = useState('');
  const [generatedPassword, setGeneratedPassword] = useState('');

  // Add employee modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEmployeeData, setNewEmployeeData] = useState({
    first_name: '',
    last_name: '',
    middle_initial: '',
    full_name: '',
    email: '',
    phone: '',
    position: 'Entry Level Simulationist',
    employment_type: 'Full-time',
    role: 'instructor',
    status: 'active',
  });

  // Helper: auto-calculate salary based on position
  const calculateSalary = (position) => {
    if (position === 'Entry Level Simulationist') return 32000;
    if (position === 'Senior Simulationist') return 45000;
    return 32000;
  };

  // Auto‑generate full name from first, middle, last
  const updateFullName = (first, middle, last) => {
    let full = first;
    if (middle && middle.trim()) full += ` ${middle.trim()}`;
    if (last && last.trim()) full += ` ${last.trim()}`;
    return full.trim();
  };

  // Load employees
  const loadEmployees = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const res = await axios.get(`${API_BASE}/employees`, getAuthHeaders());
      setEmployees(res.data);
    } catch (err) {
      console.error('Error loading data:', err);
      toast.error('Failed to load employees');
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  }, []);

  useEffect(() => {
    loadEmployees();
  }, [loadEmployees]);

  useEffect(() => {
    const fetchLeaveTypes = async () => {
      try {
        const res = await axios.get(`${API_BASE}/leave-types`, getAuthHeaders());
        setLeaveTypes(res.data);
      } catch (err) {
        console.error('Failed to load leave types', err);
      }
    };
    fetchLeaveTypes();
  }, []);

  const generateNewEmployeeId = async () => {
  try {
    const res = await axios.get(`${API_BASE}/employees/last-id`, getAuthHeaders());
    let lastNum = 0;
    if (res.data.lastId) {
      const match = res.data.lastId.match(/\d+/);
      if (match) lastNum = parseInt(match[0], 10);
    }
    const newNum = lastNum + 1;
    const newId = `E${newNum.toString().padStart(3, '0')}`;
    setGeneratedEmpId(newId);
    setGeneratedPassword(`emp${newId.substring(1)}`);
  } catch (err) {
    // fallback: count existing employees
    const newNum = employees.length + 1;
    const newId = `E${newNum.toString().padStart(3, '0')}`;
    setGeneratedEmpId(newId);
    setGeneratedPassword(`emp${newId.substring(1)}`);
  }
};

  // Open edit modal
  const openEditModal = (emp) => {
    setSelectedEmployee(emp);
    const nameParts = (emp.full_name || '').split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).filter(p => p.length > 1).join(' ') || '';
    const middleInitial = nameParts.length > 2 && nameParts[1].length === 1 ? nameParts[1] : '';
    setFormData({
      employee_id: emp.employee_id,
      full_name: emp.full_name,
      first_name: firstName,
      last_name: lastName,
      middle_initial: middleInitial,
      email: emp.email,
      username: emp.email,
      phone: emp.phone || '',
      date_of_birth: emp.date_of_birth || '',
      gender: emp.gender || 'Prefer not to say',
      emergency_contact_name: emp.emergency_contact_name || '',
      emergency_contact_phone: emp.emergency_contact_phone || '',
      street: emp.street_address || '',
      city: emp.city || '',
      state: emp.state_province || '',
      postal_code: emp.postal_code || '',
      country: emp.country || 'Philippines',
      additional_info: emp.additional_info || '',
      position: emp.position_level || 'Entry Level Simulationist',
      employment_type: emp.contract_type || 'Full-time',
      date_of_joining: emp.date_of_joining || '',
      account_expiry: emp.account_expiration_date || '',
      status: emp.status,
      role: emp.role,
      salary: calculateSalary(emp.position_level || 'Entry Level Simulationist'),
    });
    setActiveTabModal('general');
    setShowChangePassword(false);
    setNewPassword('');
    setConfirmPassword('');
    setPasswordError('');
    setShowEditModal(true);
  };

  // Handle edit form changes with auto full name
  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'first_name' || name === 'last_name' || name === 'middle_initial') {
      setFormData(prev => {
        const newFirst = name === 'first_name' ? value : prev.first_name;
        const newMiddle = name === 'middle_initial' ? value : prev.middle_initial;
        const newLast = name === 'last_name' ? value : prev.last_name;
        const newFull = updateFullName(newFirst, newMiddle, newLast);
        return { ...prev, [name]: value, full_name: newFull };
      });
    } else if (name === 'position') {
      setFormData(prev => ({
        ...prev,
        position: value,
        salary: calculateSalary(value)
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // Update employee
  const handleUpdateEmployee = async () => {
    try {
      const payload = {
        full_name: formData.full_name,
        email: formData.email,
        phone: formData.phone,
        position_level: formData.position,
        contract_type: formData.employment_type,
        status: formData.status,
        role: formData.role,
        date_of_joining: formData.date_of_joining,
        monthly_salary: formData.salary,
        // additional fields can be added if backend supports them
      };
      await axios.put(`${API_BASE}/employees/${selectedEmployee.id}`, payload, getAuthHeaders());
      toast.success('Employee updated successfully!');
      setShowEditModal(false);
      loadEmployees();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || 'Update failed.');
    }
  };

  // Change password inside Account tab
  const handleChangePassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match.');
      return;
    }
    try {
      await axios.put(`${API_BASE}/users/${selectedEmployee.id}/reset-password`, {
        newPassword: newPassword.trim(),
      }, getAuthHeaders());
      toast.success('Password changed successfully!');
      setShowChangePassword(false);
      setNewPassword('');
      setConfirmPassword('');
      setPasswordError('');
    } catch (err) {
      setPasswordError('Network error.');
      toast.error('Failed to change password');
    }
  };

  // Generate employee ID (fallback if endpoint missing)
  const generateEmployeeId = async () => {
    try {
      const res = await axios.get(`${API_BASE}/employees/last-id`, getAuthHeaders());
      let lastNum = 0;
      if (res.data.lastId) {
        const match = res.data.lastId.match(/\d+/);
        if (match) lastNum = parseInt(match[0], 10);
      }
      const newNum = lastNum + 1;
      return `E${newNum.toString().padStart(3, '0')}`;
    } catch (err) {
      // fallback: count existing employees
      const newNum = employees.length + 1;
      return `E${newNum.toString().padStart(3, '0')}`;
    }
  };

  // Handle add employee with first/middle/last
  const handleAddEmployeeChange = (field, value) => {
    setNewEmployeeData(prev => {
      const updated = { ...prev, [field]: value };
      if (field === 'first_name' || field === 'last_name' || field === 'middle_initial') {
        updated.full_name = updateFullName(updated.first_name, updated.middle_initial, updated.last_name);
      }
      return updated;
    });
  };

  const handleAddEmployee = async () => {
  if (!newEmployeeData.first_name.trim() || !newEmployeeData.last_name.trim() || !newEmployeeData.email) {
    toast.warning('Please fill required fields: first name, last name, email');
    return;
  }
  try {
    await axios.post(`${API_BASE}/employees`, {
      employee_id: generatedEmpId,
      full_name: newEmployeeData.full_name,
      email: newEmployeeData.email,
      phone: newEmployeeData.phone,
      position_level: newEmployeeData.position,
      contract_type: newEmployeeData.employment_type,
      status: newEmployeeData.status,
      role: newEmployeeData.role,
      password: generatedPassword,
    }, getAuthHeaders());
    toast.success(`Employee added! ID: ${generatedEmpId}, Password: ${generatedPassword}`);
    setShowAddModal(false);
    // Reset form
    setNewEmployeeData({
      first_name: '',
      last_name: '',
      middle_initial: '',
      full_name: '',
      email: '',
      phone: '',
      position: 'Entry Level Simulationist',
      employment_type: 'Full-time',
      role: 'instructor',
      status: 'active',
    });
    setGeneratedEmpId('');
    setGeneratedPassword('');
    loadEmployees();
  } catch (err) {
    toast.error(err.response?.data?.error || 'Error adding employee');
  }
};

  // Soft delete
  const handleSoftDelete = (emp) => {
    setSoftDeleteTarget(emp);
    setShowSoftDeleteModal(true);
  };

  const confirmSoftDelete = async () => {
    if (!softDeleteTarget) return;
    try {
      await axios.put(`${API_BASE}/employees/${softDeleteTarget.id}`, { status: 'deleted' }, getAuthHeaders());
      toast.info('Employee moved to deleted accounts.');
      loadEmployees();
    } catch (err) {
      toast.error('Failed to move to deleted accounts.');
    } finally {
      setShowSoftDeleteModal(false);
      setSoftDeleteTarget(null);
    }
  };

  // Permanent delete
  const handlePermanentDelete = (emp) => {
    setPermanentDeleteTarget(emp);
    setShowPermanentDeleteModal(true);
  };

  const confirmPermanentDelete = async () => {
    if (!permanentDeleteTarget) return;
    try {
      await axios.delete(`${API_BASE}/employees/${permanentDeleteTarget.id}`, getAuthHeaders());
      toast.success('Employee permanently deleted.');
      loadEmployees();
    } catch (err) {
      toast.error('Delete failed.');
    } finally {
      setShowPermanentDeleteModal(false);
      setPermanentDeleteTarget(null);
    }
  };

  // Leave balance functions (unchanged, but use toasts)
  const openLeaveBalanceModal = async (emp) => {
    setBalanceEmployee(emp);
    setBalanceYear(new Date().getFullYear());
    setBalanceLoading(true);
    setShowLeaveBalanceModal(true);
    try {
      const res = await axios.get(`${API_BASE}/leave-balances/${emp.id}?year=${balanceYear}`, getAuthHeaders());
      const balances = res.data;
      const fullBalances = leaveTypes.map(lt => {
        const existing = balances.find(b => b.leave_type === lt.name);
        return {
          leave_type_id: lt.id,
          leave_type: lt.name,
          remaining_days: existing ? existing.remaining_days : lt.annual_quota,
          annual_quota: lt.annual_quota
        };
      });
      setLeaveBalances(fullBalances);
      setEditingBalance(null);
    } catch (err) {
      console.error('Failed to load balances', err);
      toast.error('Could not load leave balances');
    } finally {
      setBalanceLoading(false);
    }
  };

  const updateBalance = async (leaveTypeId, newValue) => {
    if (newValue < 0) {
      toast.warning('Remaining days cannot be negative');
      return;
    }
    try {
      await axios.put(`${API_BASE}/leave-balances/${balanceEmployee.id}`, {
        leave_type_id: leaveTypeId,
        remaining_days: newValue,
        year: balanceYear
      }, getAuthHeaders());
      setLeaveBalances(prev => prev.map(b =>
        b.leave_type_id === leaveTypeId ? { ...b, remaining_days: newValue } : b
      ));
      toast.success('Balance updated successfully');
    } catch (err) {
      console.error('Update failed', err);
      toast.error('Failed to update balance');
    }
  };

  // Filtering & pagination
  const getFilteredList = () => {
    let filtered = [];
    switch (activeTab) {
      case 'instructors':
        filtered = employees.filter(emp => emp.role === 'instructor' && emp.status === 'active');
        break;
      case 'staff':
        filtered = employees.filter(emp => emp.role !== 'instructor' && emp.status === 'active');
        break;
      case 'deactivated':
        filtered = employees.filter(emp => emp.status === 'inactive');
        break;
      case 'deleted':
        filtered = employees.filter(emp => emp.status === 'deleted');
        break;
      default:
        filtered = [];
    }
    return filtered.filter(emp =>
      (emp.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (emp.employee_id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (emp.email || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const filteredEmployees = getFilteredList();
  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);
  const paginatedEmployees = filteredEmployees.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchTerm]);

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;
    const maxVisible = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);
    if (endPage - startPage + 1 < maxVisible) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }
    const pages = [];
    for (let i = startPage; i <= endPage; i++) pages.push(i);
    return (
      <div className="pagination">
        <button className="page-arrow" onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1}>
          <ChevronLeft size={16} />
        </button>
        {pages.map(page => (
          <button key={page} className={`page-number ${currentPage === page ? 'active' : ''}`} onClick={() => goToPage(page)}>
            {page}
          </button>
        ))}
        <button className="page-arrow" onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages}>
          <ChevronRight size={16} />
        </button>
      </div>
    );
  };

  const renderTableInfo = () => {
    if (filteredEmployees.length === 0) return null;
    const start = (currentPage - 1) * itemsPerPage + 1;
    const end = Math.min(currentPage * itemsPerPage, filteredEmployees.length);
    return (
      <div className="table-info">
        Showing {start} to {end} of {filteredEmployees.length} entries
      </div>
    );
  };

  const getInitials = (name) => {
    if (!name) return '??';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  // Stats
  const activeEmployees = employees.filter(e => e.status === 'active');
  const instructorsCount = activeEmployees.filter(e => e.role === 'instructor').length;
  const staffCount = activeEmployees.filter(e => e.role !== 'instructor').length;
  const deactivatedCount = employees.filter(e => e.status === 'inactive').length;
  const deletedCount = employees.filter(e => e.status === 'deleted').length;

  const handleTooltip = (content, e) => {
    setTooltipContent(content);
    setShowTooltip(true);
    setTimeout(() => setShowTooltip(false), 3000);
  };

  return (
    <div className="em-container">
      <div className="em-header">
        <div>
          <h2>Employee Management</h2>
          <p>Manage and view all employees in the organization.</p>
        </div>
        <button className="btn-add" onClick={() => {
  generateNewEmployeeId();
  setShowAddModal(true);
}}>+ Add Employee</button>
      </div>

      {/* Stats Cards */}
      <div className="stats-cards">
        <div className="stat-card"><div className="stat-icon"><Users size={24} /></div><div className="stat-info"><span className="stat-value">{activeEmployees.length}</span><span className="stat-label">Active Employees</span></div></div>
        <div className="stat-card"><div className="stat-icon"><UserCheck size={24} /></div><div className="stat-info"><span className="stat-value">{instructorsCount}</span><span className="stat-label">Instructors</span></div></div>
        <div className="stat-card"><div className="stat-icon"><AlertCircle size={24} /></div><div className="stat-info"><span className="stat-value">{staffCount}</span><span className="stat-label">Staff</span></div></div>
      </div>

      {/* Filter Tabs */}
      <div className="filter-tabs">
        <button className={`filter-tab ${activeTab === 'instructors' ? 'active' : ''}`} onClick={() => setActiveTab('instructors')}>Instructors <span className="tab-count">{instructorsCount}</span></button>
        <button className={`filter-tab ${activeTab === 'staff' ? 'active' : ''}`} onClick={() => setActiveTab('staff')}>Staff <span className="tab-count">{staffCount}</span></button>
        <button className={`filter-tab ${activeTab === 'deactivated' ? 'active' : ''}`} onClick={() => setActiveTab('deactivated')}>Deactivated <span className="tab-count">{deactivatedCount}</span></button>
        <button className={`filter-tab ${activeTab === 'deleted' ? 'active' : ''}`} onClick={() => setActiveTab('deleted')}>Deleted <span className="tab-count">{deletedCount}</span></button>
      </div>

      {/* Search */}
      <div className="search-wrapper">
        <Search size={18} className="search-icon" />
        <input type="text" placeholder="Search employees..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
      </div>

      {/* Employee Table */}
      <div className="table-wrapper">
        <table className="employee-table">
          <thead>
            <tr><th>ID</th><th>Name</th><th>Email</th><th>Position</th><th>Contract</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {paginatedEmployees.length === 0 ? <tr className="empty-row"><td colSpan="7">No employees found.</td></tr> :
              paginatedEmployees.map(emp => (
                <tr key={emp.id}>
                  <td className="emp-id">{emp.employee_id}</td>
                  <td className="emp-name">{emp.full_name}</td>
                  <td className="emp-email">{emp.email}</td>
                  <td className="emp-position">{emp.position_level || '—'}</td>
                  <td className="emp-contract">{emp.contract_type || '—'}</td>
                  <td><span className={`status-badge ${emp.status === 'active' ? 'active' : 'inactive'}`}>{emp.status === 'active' ? 'Active' : emp.status === 'inactive' ? 'Deactivated' : 'Deleted'}</span></td>
                  <td className="actions">
                    <button className="action-icon" onClick={() => openEditModal(emp)} title="Edit"><Edit2 size={16} /></button>
                    {emp.status !== 'deleted' ? (
                      <button className="action-icon" onClick={() => handleSoftDelete(emp)} title="Soft Delete"><Trash2 size={16} /></button>
                    ) : (
                      <button className="action-icon" onClick={() => handlePermanentDelete(emp)} title="Permanently Delete"><Trash2 size={16} /></button>
                    )}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {renderPagination()}
      {renderTableInfo()}

      {/* Add Employee Modal with first/middle/last */}
      <FormalModal show={showAddModal} onClose={() => setShowAddModal(false)} title="Add New Employee" wide>
        <div className="form-row-grid">
          <div className="modal-form-group"><label>First Name </label><input value={newEmployeeData.first_name} onChange={e => handleAddEmployeeChange('first_name', e.target.value)} /></div>
          <div className="modal-form-group"><label>Middle Initial</label><input value={newEmployeeData.middle_initial} onChange={e => handleAddEmployeeChange('middle_initial', e.target.value)} maxLength={1} /></div>
          <div className="modal-form-group"><label>Last Name </label><input value={newEmployeeData.last_name} onChange={e => handleAddEmployeeChange('last_name', e.target.value)} /></div>
        </div>

        <div className="form-row-grid">
  <div className="modal-form-group">
    <label>Employee ID (auto)</label>
    <input value={generatedEmpId} disabled style={{ backgroundColor: '#f5f5f5' }} />
  </div>
  <div className="modal-form-group">
    <label>Default Password</label>
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <input value={generatedPassword} disabled style={{ backgroundColor: '#f5f5f5', flex: 1 }} />
      <button type="button" onClick={() => { navigator.clipboard.writeText(generatedPassword); toast.info('Password copied'); }} style={{ padding: '6px 10px' }}>Copy</button>
    </div>
  </div>
</div>
        <div className="modal-form-group"><label>Full Name (auto)</label><input value={newEmployeeData.full_name} disabled /></div>
        <div className="form-row-grid">
          <div className="modal-form-group"><label>Email *</label><input type="email" value={newEmployeeData.email} onChange={e => handleAddEmployeeChange('email', e.target.value)} /></div>
          <div className="modal-form-group"><label>Phone</label><input value={newEmployeeData.phone} onChange={e => handleAddEmployeeChange('phone', e.target.value)} /></div>
        </div>
        <div className="form-row-grid">
          <div className="modal-form-group"><label>Position</label><select value={newEmployeeData.position} onChange={e => handleAddEmployeeChange('position', e.target.value)}><option>Entry Level Simulationist</option><option>Senior Simulationist</option></select></div>
          <div className="modal-form-group"><label>Employment Type</label><select value={newEmployeeData.employment_type} onChange={e => handleAddEmployeeChange('employment_type', e.target.value)}><option>Full-time</option><option>Part-time</option><option>Contract</option></select></div>
        </div>
        <div className="form-row-grid">
          <div className="modal-form-group"><label>Role</label><select value={newEmployeeData.role} onChange={e => handleAddEmployeeChange('role', e.target.value)}><option value="instructor">Instructor</option><option value="admin">Admin</option><option value="hr_admin">HR</option><option value="security">Security</option></select></div>
          <div className="modal-form-group"><label>Status</label><select value={newEmployeeData.status} onChange={e => handleAddEmployeeChange('status', e.target.value)}><option value="active">Active</option><option value="inactive">Inactive</option></select></div>
        </div>
        <div className="modal-actions"><button className="btn-cancel" onClick={() => setShowAddModal(false)}>Cancel</button><button className="btn-save" onClick={handleAddEmployee}>Add Employee</button></div>
      </FormalModal>

      {/* Edit Employee Modal – tabs with auto full name */}
      <FormalModal show={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Employee" wide>
        <div className="edit-employee-layout">
          <div className="edit-sidebar">
            <div className="edit-avatar">{getInitials(selectedEmployee?.full_name || '')}</div>
            <h3>{selectedEmployee?.full_name}</h3>
            <p>{selectedEmployee?.employee_id}</p>
            <div className="edit-tabs">
              <button className={`tab-btn ${activeTabModal === 'general' ? 'active' : ''}`} onClick={() => setActiveTabModal('general')}>General</button>
              <button className={`tab-btn ${activeTabModal === 'account' ? 'active' : ''}`} onClick={() => setActiveTabModal('account')}>Account</button>
              <button className={`tab-btn ${activeTabModal === 'profile' ? 'active' : ''}`} onClick={() => setActiveTabModal('profile')}>Profile</button>
              <button className={`tab-btn ${activeTabModal === 'address' ? 'active' : ''}`} onClick={() => setActiveTabModal('address')}>Address</button>
            </div>
          </div>
          <div className="edit-content">
            {/* GENERAL TAB */}
            {activeTabModal === 'general' && (
              <>
                <div className="form-group"><label>Employee ID (read‑only)</label><input value={formData.employee_id} disabled /></div>
                <div className="form-row">
                  <div className="form-group"><label>First Name *</label><input name="first_name" value={formData.first_name} onChange={handleEditInputChange} /></div>
                  <div className="form-group"><label>Last Name *</label><input name="last_name" value={formData.last_name} onChange={handleEditInputChange} /></div>
                  <div className="form-group"><label>Middle Initial</label><input name="middle_initial" value={formData.middle_initial} onChange={handleEditInputChange} maxLength={1} /></div>
                </div>
                <div className="form-group"><label>Full Name (auto)</label><input value={formData.full_name} disabled /></div>
                <div className="form-row">
                  <div className="form-group"><label>Position</label><select name="position" value={formData.position} onChange={handleEditInputChange}><option>Entry Level Simulationist</option><option>Senior Simulationist</option></select></div>
                  <div className="form-group"><label>Employee Type <Info size={14} style={{ cursor: 'pointer' }} onClick={(e) => handleTooltip('Full-Time: Regular (>6 months) / Provisionary (first 6 months) / Project-Based', e)} /></label><select name="employment_type" value={formData.employment_type} onChange={handleEditInputChange}><option>Full-time</option><option>Part-time</option><option>Contract</option></select></div>
                </div>
                <div className="form-row">
                  <div className="form-group"><label>Date of Joining</label><input type="date" name="date_of_joining" value={formData.date_of_joining} onChange={handleEditInputChange} /></div>
                  <div className="form-group"><label>Account Expiration Date</label><input type="date" name="account_expiry" value={formData.account_expiry} onChange={handleEditInputChange} /></div>
                </div>
                <div className="form-group"><label>Status</label><select name="status" value={formData.status} onChange={handleEditInputChange}><option value="active">Active</option><option value="inactive">Deactivated</option></select></div>
              </>
            )}

            {/* ACCOUNT TAB */}
            {activeTabModal === 'account' && (
              <div className="account-tab-content">
                <div className="form-group"><label>Username</label><input name="username" value={formData.username} onChange={handleEditInputChange} /></div>
                <div className="form-group"><label>Email</label><input name="email" value={formData.email} onChange={handleEditInputChange} /></div>
                <div className="form-group"><label>Role</label><select name="role" value={formData.role} onChange={handleEditInputChange}><option value="instructor">Instructor</option><option value="admin">Admin</option><option value="hr_admin">HR</option><option value="security">Security</option></select></div>
                {!showChangePassword ? (
                  <button className="btn-change-password" onClick={() => setShowChangePassword(true)}>Change Password</button>
                ) : (
                  <div className="change-password-section">
                    <div className="form-group"><label>New Password</label><div className="password-wrapper"><input type={showPassword ? "text" : "password"} value={newPassword} onChange={e => setNewPassword(e.target.value)} /><button type="button" onClick={() => setShowPassword(!showPassword)}>{showPassword ? <Eye size={16} /> : <EyeOff size={16} />}</button></div></div>
                    <div className="form-group"><label>Confirm Password</label><div className="password-wrapper"><input type={showConfirmPassword ? "text" : "password"} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} /><button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>{showConfirmPassword ? <Eye size={16} /> : <EyeOff size={16} />}</button></div></div>
                    {passwordError && <p className="error-text">{passwordError}</p>}
                    <div className="password-actions"><button className="btn-save-password" onClick={handleChangePassword}>Save Password</button><button className="btn-cancel-password" onClick={() => { setShowChangePassword(false); setNewPassword(''); setConfirmPassword(''); setPasswordError(''); }}>Cancel</button></div>
                  </div>
                )}
              </div>
            )}

            {/* PROFILE TAB */}
            {activeTabModal === 'profile' && (
              <>
                <div className="form-row"><div className="form-group"><label>Date of Birth</label><input type="date" name="date_of_birth" value={formData.date_of_birth} onChange={handleEditInputChange} /></div><div className="form-group"><label>Gender</label><select name="gender" value={formData.gender} onChange={handleEditInputChange}><option>Male</option><option>Female</option><option>Prefer not to say</option></select></div></div>
                <div className="form-row"><div className="form-group"><label>Phone Number</label><input name="phone" value={formData.phone} onChange={handleEditInputChange} /></div><div className="form-group"><label>Salary (auto‑calculated)</label><input value={`₱${formData.salary.toLocaleString()}`} disabled /></div></div>
                <div className="form-row"><div className="form-group"><label>Emergency Contact Name</label><input name="emergency_contact_name" value={formData.emergency_contact_name} onChange={handleEditInputChange} /></div><div className="form-group"><label>Emergency Contact Phone</label><input name="emergency_contact_phone" value={formData.emergency_contact_phone} onChange={handleEditInputChange} /></div></div>
              </>
            )}

            {/* ADDRESS TAB */}
            {activeTabModal === 'address' && (
              <div className="address-tab-content">
                <div className="form-row"><div className="form-group"><label>Street Address</label><input name="street" value={formData.street} onChange={handleEditInputChange} /></div><div className="form-group"><label>City</label><input name="city" value={formData.city} onChange={handleEditInputChange} /></div></div>
                <div className="form-row"><div className="form-group"><label>State / Province</label><input name="state" value={formData.state} onChange={handleEditInputChange} /></div><div className="form-group"><label>Postal Code</label><input name="postal_code" value={formData.postal_code} onChange={handleEditInputChange} /></div></div>
                <div className="form-group"><label>Country</label><input name="country" value={formData.country} onChange={handleEditInputChange} /></div>
                <div className="form-group"><label>Additional Info</label><textarea name="additional_info" rows="4" value={formData.additional_info} onChange={handleEditInputChange} placeholder="Notes, housing allowance, relocation status, etc." /></div>
              </div>
            )}

            <div className="modal-actions"><button className="btn-cancel" onClick={() => setShowEditModal(false)}>Cancel</button><button className="btn-save" onClick={handleUpdateEmployee}>Save Changes</button></div>
          </div>
        </div>
      </FormalModal>

      {/* Leave Balance Modal (unchanged) */}
      <FormalModal show={showLeaveBalanceModal} onClose={() => setShowLeaveBalanceModal(false)} title={`Leave Balances – ${balanceEmployee?.full_name}`} wide>
        {balanceLoading ? <p>Loading balances...</p> : (
          <>
            <div className="balance-year-selector"><label>Year:</label><select value={balanceYear} onChange={e => setBalanceYear(parseInt(e.target.value))}>
              {[new Date().getFullYear() - 1, new Date().getFullYear(), new Date().getFullYear() + 1].map(y => <option key={y} value={y}>{y}</option>)}
            </select><button onClick={() => openLeaveBalanceModal(balanceEmployee)}>Refresh</button></div>
            <table className="balance-table"><thead><tr><th>Leave Type</th><th>Annual Quota</th><th>Remaining</th><th></th></tr></thead>
              <tbody>{leaveBalances.map(balance => (<tr key={balance.leave_type_id}>
                <td>{balance.leave_type}</td><td>{balance.annual_quota} days</td>
                <td>{editingBalance === balance.leave_type_id ? (<input type="number" step="0.5" value={balance.remaining_days} onChange={e => { const newVal = parseFloat(e.target.value); if (!isNaN(newVal)) setLeaveBalances(prev => prev.map(b => b.leave_type_id === balance.leave_type_id ? { ...b, remaining_days: newVal } : b)); }} />) : <span>{balance.remaining_days} days</span>}</td>
                <td>{editingBalance === balance.leave_type_id ? (<><button className="save-btn" onClick={() => updateBalance(balance.leave_type_id, balance.remaining_days)}>Save</button><button className="cancel-btn" onClick={() => setEditingBalance(null)}>Cancel</button></>) : <button className="edit-btn" onClick={() => setEditingBalance(balance.leave_type_id)}>Edit</button>}</td>
              </tr>))}</tbody>
            </table>
            <p className="info-note"><AlertCircle size={12} /> Leave requests automatically deduct from these balances upon approval.</p>
          </>
        )}
      </FormalModal>

      {/* Soft Delete Modal */}
      <FormalModal show={showSoftDeleteModal} onClose={() => setShowSoftDeleteModal(false)} title="Move to Deleted">
        <p>Are you sure you want to move <strong>{softDeleteTarget?.full_name}</strong> to <strong>Deleted Accounts</strong>?</p>
        <div className="modal-actions"><button className="btn-cancel" onClick={() => setShowSoftDeleteModal(false)}>Cancel</button><button className="btn-danger" onClick={confirmSoftDelete}>Yes, Move to Deleted</button></div>
      </FormalModal>

      {/* Permanent Delete Modal */}
      <FormalModal show={showPermanentDeleteModal} onClose={() => setShowPermanentDeleteModal(false)} title="Permanently Delete Employee">
        <p>Are you sure you want to <strong>permanently delete</strong> {permanentDeleteTarget?.full_name}? This action <strong>cannot be undone</strong>.</p>
        <div className="modal-actions"><button className="btn-cancel" onClick={() => setShowPermanentDeleteModal(false)}>Cancel</button><button className="btn-danger" onClick={confirmPermanentDelete}>Yes, Permanently Delete</button></div>
      </FormalModal>

      {/* Global Tooltip */}
      {showTooltip && <div className="global-tooltip">{tooltipContent}</div>}
    </div>
  );
};

export default EmployeeManagement;