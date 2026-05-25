// src/pages/JobPostings.jsx
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
  Plus, Edit3, Trash2, Eye, Calendar as CalendarIcon,
  Users, FileText, CheckCircle, XCircle,
  MapPin, DollarSign, Search, Filter, ChevronLeft, ChevronRight
} from 'lucide-react';
import FormalModal from '../components/FormalModal';
import { API_BASE } from '../api';
import './JobPostings.css';

const getAuthHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('auth_token')}` }
});

const staticBase = API_BASE.replace(/\/api$/, '');

const JobPostings = () => {
  const [jobs, setJobs] = useState([]);
  const [activeTab, setActiveTab] = useState('active');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [showJobModal, setShowJobModal] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [jobForm, setJobForm] = useState({
    title: '', department: '', employment_type: 'Full-time',
    location_type: 'On-site', location: '', salary_min: '', salary_max: '',
    description: '', requirements: '', status: 'open'
  });

  const [showJobDetails, setShowJobDetails] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);

  const [showApplicantsModal, setShowApplicantsModal] = useState(false);
  const [currentJobForApplicants, setCurrentJobForApplicants] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [applicantFilter, setApplicantFilter] = useState('');
  const [applicantsPage, setApplicantsPage] = useState(1);
  const applicantsPerPage = 10;

  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [interviewApplicant, setInterviewApplicant] = useState(null);
  const [interviewForm, setInterviewForm] = useState({ date: '', time: '', notes: '' });

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteJobId, setDeleteJobId] = useState(null);

  const fetchJobs = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE}/jobs`, getAuthHeaders());
      setJobs(res.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load jobs');
    }
  }, []);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  const filteredJobs = jobs.filter(job => {
    if (activeTab === 'active' && job.status !== 'open') return false;
    if (activeTab === 'closed' && job.status !== 'closed') return false;
    if (searchTerm && !job.title.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });
  const totalPages = Math.ceil(filteredJobs.length / itemsPerPage);
  const paginatedJobs = filteredJobs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const openJobForm = (job = null) => {
    if (job) {
      setEditingJob(job);
      setJobForm({
        title: job.title,
        department: job.department || '',
        employment_type: job.employment_type || 'Full-time',
        location_type: job.location_type || 'On-site',
        location: job.location || '',
        salary_min: job.salary_min || '',
        salary_max: job.salary_max || '',
        description: job.description || '',
        requirements: job.requirements || '',
        status: job.status
      });
    } else {
      setEditingJob(null);
      setJobForm({
        title: '', department: '', employment_type: 'Full-time',
        location_type: 'On-site', location: '', salary_min: '', salary_max: '',
        description: '', requirements: '', status: 'open'
      });
    }
    setShowJobModal(true);
  };

  const handleSaveJob = async () => {
    if (!jobForm.title || !jobForm.description) {
      toast.warning('Title and description are required');
      return;
    }
    try {
      if (editingJob) {
        await axios.put(`${API_BASE}/jobs/${editingJob.id}`, jobForm, getAuthHeaders());
        toast.success('Job updated successfully');
      } else {
        await axios.post(`${API_BASE}/jobs`, jobForm, getAuthHeaders());
        toast.success('Job created successfully');
      }
      setShowJobModal(false);
      fetchJobs();
    } catch (err) {
      console.error(err);
      toast.error('Error saving job');
    }
  };

  const toggleJobStatus = async (job) => {
    const newStatus = job.status === 'open' ? 'closed' : 'open';
    try {
      await axios.put(`${API_BASE}/jobs/${job.id}`, { ...job, status: newStatus }, getAuthHeaders());
      toast.success(`Job ${newStatus === 'open' ? 'opened' : 'closed'}`);
      fetchJobs();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const confirmDelete = async () => {
    try {
      await axios.delete(`${API_BASE}/jobs/${deleteJobId}`, getAuthHeaders());
      toast.success('Job deleted');
      fetchJobs();
    } catch (err) {
      toast.error('Failed to delete job');
    } finally {
      setShowDeleteConfirm(false);
      setDeleteJobId(null);
    }
  };

  const viewApplicants = async (job) => {
  setCurrentJobForApplicants(job);
  setApplicantsPage(1);
  setApplicantFilter('');
  try {
    const res = await axios.get(`${API_BASE}/jobs/${job.id}/applicants`, getAuthHeaders());
    setApplicants(res.data);
    setShowApplicantsModal(true);
  } catch (err) {
    console.error(err);
    toast.error('Failed to load applicants');
  }
};

  const updateApplicantStatus = async (applicantId, newStatus) => {
    try {
      await axios.put(`${API_BASE}/applicants/${applicantId}`, { status: newStatus }, getAuthHeaders());
      const res = await axios.get(`${API_BASE}/jobs/${currentJobForApplicants.id}/applicants`, getAuthHeaders());
      setApplicants(res.data);
      toast.success('Status updated');
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const openScheduleInterview = (applicant) => {
    setInterviewApplicant(applicant);
    setInterviewForm({ date: '', time: '', notes: `Interview for ${currentJobForApplicants?.title}` });
    setShowInterviewModal(true);
  };

  const scheduleInterview = async () => {
    if (!interviewForm.date || !interviewForm.time) {
      toast.warning('Please select date and time');
      return;
    }
    try {
      const nameParts = interviewApplicant.full_name.split(' ');
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(' ') || '';

      await axios.post(`${API_BASE}/appointments/book`, {
        firstName, lastName,
        email: interviewApplicant.email,
        phone: interviewApplicant.phone || '',
        date: interviewForm.date,
        time: interviewForm.time,
        reason: interviewForm.notes,
        primaryBleId: null,
        additionalVisitors: []
      }, getAuthHeaders());

      toast.success('Interview scheduled! Candidate will receive an email.');
      setShowInterviewModal(false);
      if (interviewApplicant.status !== 'shortlisted') {
        await updateApplicantStatus(interviewApplicant.id, 'shortlisted');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to schedule interview');
    }
  };

  const filteredApplicants = applicantFilter ? applicants.filter(a => a.status === applicantFilter) : applicants;
  const totalApplicantPages = Math.ceil(filteredApplicants.length / applicantsPerPage);
  const paginatedApplicants = filteredApplicants.slice((applicantsPage - 1) * applicantsPerPage, applicantsPage * applicantsPerPage);

  const formatSalaryRange = (min, max) => {
    if (!min && !max) return 'Not specified';
    if (min && max) return `₱${Number(min).toLocaleString()} - ₱${Number(max).toLocaleString()}`;
    if (min) return `From ₱${Number(min).toLocaleString()}`;
    return `Up to ₱${Number(max).toLocaleString()}`;
  };

  const StatusBadge = ({ status }) => {
    if (status === 'open') return <span className="badge badge-approved">Open</span>;
    if (status === 'closed') return <span className="badge badge-rejected">Closed</span>;
    return <span className="badge">{status}</span>;
  };

  return (
    <div className="jp-container">
      {/* Header */}
      <div className="jp-header">
        <div>
          <h2>Job Postings</h2>
          <p className="jp-subtitle">Manage job openings and track applicants</p>
        </div>
        <button className="btn-add-schedule" onClick={() => openJobForm()}>
          <Plus size={18} /> New Job
        </button>
      </div>

      {/* Tabs */}
      <div className="jp-tabs">
        <button className={`jp-tab ${activeTab === 'active' ? 'active' : ''}`} onClick={() => { setActiveTab('active'); setCurrentPage(1); }}>
          Active Jobs <span className="tab-count">{jobs.filter(j => j.status === 'open').length}</span>
        </button>
        <button className={`jp-tab ${activeTab === 'closed' ? 'active' : ''}`} onClick={() => { setActiveTab('closed'); setCurrentPage(1); }}>
          Closed Jobs <span className="tab-count">{jobs.filter(j => j.status === 'closed').length}</span>
        </button>
      </div>

      {/* Search */}
      <div className="jp-search">
        <Search size={18} className="search-icon" />
        <input type="text" placeholder="Search by job title..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
      </div>

      {/* Jobs Table */}
      <div className="jp-table-wrapper">
        <table className="jp-table">
          <thead>
            <tr><th>Title</th><th>Department</th><th>Type</th><th>Location</th><th>Salary</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {paginatedJobs.length === 0 ? (
              <tr className="empty-row"><td colSpan="7">No job postings found.</td></tr>
            ) : (
              paginatedJobs.map(job => (
                <tr key={job.id}>
                  <td><strong>{job.title}</strong></td>
                  <td>{job.department || '—'}</td>
                  <td>{job.employment_type}</td>
                  <td>{job.location_type}{job.location ? ` (${job.location})` : ''}</td>
                  <td>{formatSalaryRange(job.salary_min, job.salary_max)}</td>
                  <td><StatusBadge status={job.status} /></td>
                  <td>
                    <div className="jp-actions">
                      <Eye size={16} onClick={() => { setSelectedJob(job); setShowJobDetails(true); }} title="View Details" />
                      <Users size={16} onClick={() => viewApplicants(job)} title="View Applicants" />
                      <Edit3 size={16} onClick={() => openJobForm(job)} title="Edit" />
                      <button onClick={() => toggleJobStatus(job)} title={job.status === 'open' ? 'Close Job' : 'Open Job'}>
                        {job.status === 'open' ? <XCircle size={16} color="#dc2626" /> : <CheckCircle size={16} color="#10b981" />}
                      </button>
                      <Trash2 size={16} onClick={() => { setDeleteJobId(job.id); setShowDeleteConfirm(true); }} title="Delete" />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="jp-pagination">
          <button className="page-arrow" onClick={() => setCurrentPage(p => Math.max(1, p-1))} disabled={currentPage === 1}>
            <ChevronLeft size={16} />
          </button>
          {[...Array(totalPages)].map((_, i) => (
            <button key={i} className={`page-number ${currentPage === i+1 ? 'active' : ''}`} onClick={() => setCurrentPage(i+1)}>{i+1}</button>
          ))}
          <button className="page-arrow" onClick={() => setCurrentPage(p => Math.min(totalPages, p+1))} disabled={currentPage === totalPages}>
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* Job Form Modal (same as your original, unchanged) */}
      <FormalModal
        show={showJobModal}
        onClose={() => setShowJobModal(false)}
        title={editingJob ? 'Edit Job Posting' : 'Create New Job Posting'}
        footer={
          <>
            <button className="btn-modal-cancel" onClick={() => setShowJobModal(false)}>Cancel</button>
            <button className="btn-modal-submit" onClick={handleSaveJob}>Save</button>
          </>
        }
        wide
      >
        <div className="jp-form-row">
          <div className="jp-form-group" style={{ flex: 2 }}>
            <label>Job Title *</label>
            <input className="jp-input" value={jobForm.title} onChange={e => setJobForm({...jobForm, title: e.target.value})} required />
          </div>
          <div className="jp-form-group" style={{ flex: 1 }}>
            <label>Department</label>
            <input className="jp-input" value={jobForm.department} onChange={e => setJobForm({...jobForm, department: e.target.value})} />
          </div>
        </div>
        <div className="jp-form-row">
          <div className="jp-form-group"><label>Employment Type</label><select className="jp-select" value={jobForm.employment_type} onChange={e => setJobForm({...jobForm, employment_type: e.target.value})}><option>Full-time</option><option>Part-time</option><option>Contract</option><option>Internship</option></select></div>
          <div className="jp-form-group"><label>Location Type</label><select className="jp-select" value={jobForm.location_type} onChange={e => setJobForm({...jobForm, location_type: e.target.value})}><option>On-site</option><option>Remote</option><option>Hybrid</option></select></div>
          <div className="jp-form-group"><label>Specific Location</label><input className="jp-input" value={jobForm.location} onChange={e => setJobForm({...jobForm, location: e.target.value})} placeholder="e.g., Makati, or remote" /></div>
        </div>
        <div className="jp-form-row">
          <div className="jp-form-group"><label>Monthly Salary (min)</label><input type="number" className="jp-input" value={jobForm.salary_min} onChange={e => setJobForm({...jobForm, salary_min: e.target.value})} placeholder="₱" /></div>
          <div className="jp-form-group"><label>Monthly Salary (max)</label><input type="number" className="jp-input" value={jobForm.salary_max} onChange={e => setJobForm({...jobForm, salary_max: e.target.value})} placeholder="₱" /></div>
        </div>
        <div className="jp-form-group"><label>Job Description *</label><textarea className="jp-textarea" rows="5" value={jobForm.description} onChange={e => setJobForm({...jobForm, description: e.target.value})} required /></div>
        <div className="jp-form-group"><label>Requirements / Qualifications</label><textarea className="jp-textarea" rows="4" value={jobForm.requirements} onChange={e => setJobForm({...jobForm, requirements: e.target.value})} /></div>
      </FormalModal>

      {/* Job Details Modal */}
      <FormalModal show={showJobDetails} onClose={() => setShowJobDetails(false)} title={selectedJob?.title} footer={<button className="btn-modal-submit" onClick={() => setShowJobDetails(false)}>Close</button>} wide>
        <div className="jp-details-grid">
          <p><strong>Department:</strong> {selectedJob?.department || '—'}</p>
          <p><strong>Employment Type:</strong> {selectedJob?.employment_type}</p>
          <p><strong>Location:</strong> {selectedJob?.location_type}{selectedJob?.location ? ` (${selectedJob.location})` : ''}</p>
          <p><strong>Salary:</strong> {formatSalaryRange(selectedJob?.salary_min, selectedJob?.salary_max)}</p>
          <p><strong>Status:</strong> <StatusBadge status={selectedJob?.status} /></p>
        </div>
        <hr />
        <h4>Description</h4><p style={{ whiteSpace: 'pre-wrap' }}>{selectedJob?.description}</p>
        <h4>Requirements</h4><p style={{ whiteSpace: 'pre-wrap' }}>{selectedJob?.requirements || 'No specific requirements listed.'}</p>
      </FormalModal>

      {/* Applicants Modal */}
      <FormalModal show={showApplicantsModal} onClose={() => setShowApplicantsModal(false)} title={`Applicants for ${currentJobForApplicants?.title}`} wide footer={<button className="btn-modal-submit" onClick={() => setShowApplicantsModal(false)}>Close</button>}>
        <div className="jp-applicants-controls">
          <div className="jp-filter-wrapper"><Filter size={16} className="filter-icon" /><select value={applicantFilter} onChange={e => { setApplicantFilter(e.target.value); setApplicantsPage(1); }}><option value="">All Statuses</option><option value="new">New</option><option value="reviewed">Reviewed</option><option value="shortlisted">Shortlisted</option><option value="rejected">Rejected</option><option value="hired">Hired</option></select></div>
          <span className="jp-total-count">Total: {applicants.length}</span>
        </div>
        <div className="jp-table-wrapper">
          <table className="jp-table">
            <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Resume</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {paginatedApplicants.length === 0 ? <tr className="empty-row"><td colSpan="6">No applicants found.</td></tr> :
                paginatedApplicants.map(app => (
                  <tr key={app.id}>
                    <td><strong>{app.full_name}</strong></td>
                    <td>{app.email}</td>
                    <td>{app.phone || '—'}</td>
                    <td>{app.resume_path ? <a href={`${staticBase}${app.resume_path}`} target="_blank" rel="noreferrer">View</a> : 'No file'}</td>
                    <td><select value={app.status} onChange={e => updateApplicantStatus(app.id, e.target.value)}><option value="new">New</option><option value="reviewed">Reviewed</option><option value="shortlisted">Shortlisted</option><option value="rejected">Rejected</option><option value="hired">Hired</option></select></td>
                    <td><button className="btn-schedule" onClick={() => openScheduleInterview(app)}><CalendarIcon size={12} /> Schedule Interview</button></td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
        {totalApplicantPages > 1 && (
          <div className="jp-pagination">
            <button className="page-arrow" onClick={() => setApplicantsPage(p => Math.max(1, p-1))} disabled={applicantsPage === 1}><ChevronLeft size={16} /></button>
            {[...Array(totalApplicantPages)].map((_, i) => (<button key={i} className={`page-number ${applicantsPage === i+1 ? 'active' : ''}`} onClick={() => setApplicantsPage(i+1)}>{i+1}</button>))}
            <button className="page-arrow" onClick={() => setApplicantsPage(p => Math.min(totalApplicantPages, p+1))} disabled={applicantsPage === totalApplicantPages}><ChevronRight size={16} /></button>
          </div>
        )}
      </FormalModal>

      {/* Interview Modal */}
      <FormalModal show={showInterviewModal} onClose={() => setShowInterviewModal(false)} title={`Schedule Interview for ${interviewApplicant?.full_name}`} footer={<><button className="btn-modal-cancel" onClick={() => setShowInterviewModal(false)}>Cancel</button><button className="btn-modal-submit" onClick={scheduleInterview}>Send Invitation</button></>}>
        <div className="jp-form-group"><label>Date *</label><input type="date" className="jp-input" value={interviewForm.date} onChange={e => setInterviewForm({...interviewForm, date: e.target.value})} min={new Date().toISOString().split('T')[0]} required /></div>
        <div className="jp-form-group"><label>Time *</label><input type="time" className="jp-input" value={interviewForm.time} onChange={e => setInterviewForm({...interviewForm, time: e.target.value})} required /></div>
        <div className="jp-form-group"><label>Notes / Reason</label><input type="text" className="jp-input" value={interviewForm.notes} onChange={e => setInterviewForm({...interviewForm, notes: e.target.value})} /></div>
        <p className="jp-info-note"><FileText size={12} /> The candidate will receive an email confirmation with the interview details.</p>
      </FormalModal>

      {/* Delete Confirmation Modal */}
      <FormalModal show={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)} title="Delete Job Posting" footer={<><button className="btn-modal-cancel" onClick={() => setShowDeleteConfirm(false)}>Cancel</button><button className="btn-modal-submit" onClick={confirmDelete} style={{ backgroundColor: '#dc2626' }}>Yes, Delete</button></>}>
        <p>Are you sure you want to permanently delete this job posting? This action cannot be undone. All associated applicant data will also be removed.</p>
      </FormalModal>
    </div>
  );
};

export default JobPostings;