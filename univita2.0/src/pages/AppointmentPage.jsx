import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Mail, Phone, MapPin, Clock, Calendar, User, MessageSquare,
  Award, Users, Plus, Trash2, ShieldCheck, Info, Menu, X,
  Stethoscope, GraduationCap, Building2, Check, ArrowRight,
  Briefcase, FileText, Upload, Camera, BookOpen
} from 'lucide-react';
import { API_BASE } from '../api';
import './AppointmentPage.css';

const AppointmentPage = ({ onAdminLogin }) => {
  const [activePage, setActivePage] = useState('home');

  // ---- Appointment booking state ----
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', date: '', time: '', message: '' });
  const [isMultipleVisitors, setIsMultipleVisitors] = useState(false);
  const [additionalVisitors, setAdditionalVisitors] = useState([]);
  const [visitReasons, setVisitReasons] = useState([]);
  const [toastMessage, setToastMessage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // ---- Careers state ----
  const [jobs, setJobs] = useState([]);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [applicationForm, setApplicationForm] = useState({ full_name: '', email: '', phone: '', cover_letter: '', resume: null });
  const [submittingApplication, setSubmittingApplication] = useState(false);

  // ---- Fetch Fixed Visit Reasons (public) ----
  useEffect(() => {
    axios.get(`${API_BASE}/visit-reasons`)
      .then(res => setVisitReasons(res.data))
      .catch(console.error);
  }, []);

  // ---- Fetch open jobs (public) ----
  useEffect(() => {
    axios.get(`${API_BASE}/public/jobs`)
      .then(res => setJobs(res.data || []))
      .catch(console.error);
  }, []);

  const showToast = (message, isError = false) => {
    setToastMessage({ message, isError });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const scrollToSection = (id) => {
    setActivePage('home');
    setTimeout(() => {
      const element = document.getElementById(id);
      if (element) element.scrollIntoView({ behavior: 'smooth' });
    }, 100);
    setMobileMenuOpen(false);
  };

  const addVisitorRow = () => setAdditionalVisitors([...additionalVisitors, { name: '' }]);
  const removeVisitorRow = (index) => setAdditionalVisitors(additionalVisitors.filter((_, i) => i !== index));
  const updateVisitorField = (index, field, value) => {
    const updated = [...additionalVisitors];
    updated[index][field] = value;
    setAdditionalVisitors(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.date || !formData.time || !formData.message) {
      showToast('Please fill in all required fields.', true);
      return;
    }
    setIsSubmitting(true);
    try {
      const nameParts = formData.name.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      
      const payload = {
        firstName, lastName,
        email: formData.email, phone: formData.phone,
        date: formData.date, time: formData.time,
        reason: formData.message, 
        additionalVisitors: isMultipleVisitors ? additionalVisitors : []
        // Notice: BLE Data is entirely removed from the payload. The guard handles this upon arrival.
      };
      
      await axios.post(`${API_BASE}/appointments/book`, payload);
      showToast('Appointment request submitted! Check your email for confirmation.');
      setFormData({ name: '', email: '', phone: '', date: '', time: '', message: '' });
      setIsMultipleVisitors(false);
      setAdditionalVisitors([]);
      setShowAppointmentModal(false);
    } catch (err) {
      console.error(err);
      showToast('Submission failed. Please try again later.', true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openApplyModal = (job) => {
    setSelectedJob(job);
    setApplicationForm({ full_name: '', email: '', phone: '', cover_letter: '', resume: null });
    setShowApplyModal(true);
  };

  const handleApplicationChange = (e) => {
    setApplicationForm({ ...applicationForm, [e.target.name]: e.target.value });
  };

  const handleResumeChange = (e) => {
    setApplicationForm({ ...applicationForm, resume: e.target.files[0] });
  };

  const submitApplication = async (e) => {
    e.preventDefault();
    if (!applicationForm.full_name || !applicationForm.email || !applicationForm.resume) {
      showToast('Please fill all required fields and attach a resume.', true);
      return;
    }
    setSubmittingApplication(true);
    try {
      const fd = new FormData();
      fd.append('job_id', selectedJob.id);
      fd.append('full_name', applicationForm.full_name);
      fd.append('email', applicationForm.email);
      fd.append('phone', applicationForm.phone);
      fd.append('cover_letter', applicationForm.cover_letter);
      fd.append('resume', applicationForm.resume);

      const res = await axios.post(`${API_BASE}/jobs/apply`, fd);

      if (res.data.success) {
        showToast('Application submitted successfully!');
        setShowApplyModal(false);
        setApplicationForm({ full_name: '', email: '', phone: '', cover_letter: '', resume: null });
      } else {
        console.error('Server error:', res.data);
        showToast(res.data.error || 'Failed to submit application.', true);
      }
    } catch (err) {
      console.error('Submission error:', err);
      const msg = err.response?.data?.error || err.message || 'Network error';
      showToast(`Submission failed: ${msg}`, true);
    } finally {
      setSubmittingApplication(false);
    }
  };

  // ---- Sample course list (unchanged) ----
  const sampleCourses = [
    "Bachelor of Science in Nursing",
    "Bachelor of Science in Medical Technology",
    "Diploma in Midwifery",
    "Diploma in Practical Nursing",
    "Emergency Medical Technician (EMT)",
    "Healthcare Services NC II",
    "Pharmacy Assistant",
    "Caregiving NC II",
    "Health Care Services NC II",
    "Medical Transcription NC II",
    "Dental Technology",
    "Radiologic Technology",
    "Physical Therapy Assistant",
    "Occupational Therapy",
    "Clinical Research Coordinator"
  ];

  const facilities = [
    { name: 'Simulation Lab', img: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=500' },
    { name: 'Classrooms', img: 'https://images.unsplash.com/photo-1523240795612-9a054b0d6d53?w=500' },
    { name: 'Library', img: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=500' },
    { name: 'Skills Lab', img: 'https://images.unsplash.com/photo-1581078426770-6d35a8b0d29a?w=500' }
  ];

  return (
    <div className="app-landing">
      {/* HEADER */}
      <header className="main-header">
        <div className="header-container">
          <div className="brand">
            <Stethoscope size={28} className="brand-icon" />
            <div className="brand-text">
              <span className="brand-name">HCT Academy</span>
              <span className="brand-tagline">Healthcare Excellence</span>
            </div>
          </div>
          <nav className={`nav-menu ${mobileMenuOpen ? 'open' : ''}`}>
            <button className="nav-close" onClick={() => setMobileMenuOpen(false)}><X size={24} /></button>
            <a className="nav-item" onClick={() => { setActivePage('home'); setMobileMenuOpen(false); }}>Home</a>
            <a className="nav-item" onClick={() => scrollToSection('about')}>About</a>
            <a className="nav-item" onClick={() => { setActivePage('home'); scrollToSection('courses'); }}>Courses</a>
            <a className="nav-item" onClick={() => { setActivePage('home'); scrollToSection('facilities'); }}>Facilities</a>
            <a className="nav-item" onClick={() => setShowAppointmentModal(true)}>Appointment</a>
            <a className="nav-item" onClick={() => setActivePage('careers')}>Careers</a>
            <a className="nav-item" onClick={() => scrollToSection('contact')}>Contact</a>
            <button className="btn-outline-light" onClick={onAdminLogin}>Admin Portal</button>
          </nav>
          <button className="mobile-toggle" onClick={() => setMobileMenuOpen(true)}><Menu size={24} /></button>
        </div>
      </header>

      {/* HOME */}
      {activePage === 'home' && (
        <>
          {/* HERO */}
          <section id="home" className="hero-section">
            <div className="hero-bg-overlay"></div>
            <div className="hero-grid">
              <div className="hero-text">
                <span className="hero-badge">Philippines' Premier Healthcare Academy</span>
                <h1>Shaping Tomorrow's<br /><span className="text-accent">Healthcare Heroes</span></h1>
                <p>Experience world-class simulation-based training, expert instructors, and a curriculum designed to produce compassionate, competent professionals.</p>
                <div className="hero-actions">
                  <button className="btn-primary" onClick={() => setShowAppointmentModal(true)}>
                    <Calendar size={18} /> Schedule a Visit
                  </button>
                  <button className="btn-secondary" onClick={() => scrollToSection('about')}>
                    Learn More <ArrowRight size={16} />
                  </button>
                </div>
                <div className="hero-stats">
                  <div className="stat"><span className="stat-val">1,200+</span><span>Graduates</span></div>
                  <div className="stat"><span className="stat-val">98%</span><span>Board Pass Rate</span></div>
                  <div className="stat"><span className="stat-val">15+</span><span>Programs</span></div>
                </div>
              </div>
              <div className="hero-visual">
                <div className="hero-floating-panel">
                  <div className="floating-item"><ShieldCheck size={22} /><div><h4>Safe Campus</h4><p>BLE-powered visitor monitoring</p></div></div>
                  <div className="floating-item"><Users size={22} /><div><h4>Industry Experts</h4><p>Professional healthcare instructors</p></div></div>
                  <div className="floating-item"><GraduationCap size={22} /><div><h4>Career Ready</h4><p>Simulation-based healthcare training</p></div></div>
                </div>
              </div>
            </div>
          </section>

          {/* ABOUT */}
          <section id="about" className="about-section">
            <div className="section-header center">
              <span className="tag">Why HCT Academy</span>
              <h2>Building Careers in Healthcare</h2>
              <p>Our approach combines cutting-edge simulation labs, experienced medical educators, and strong industry ties.</p>
            </div>
            <div className="features-grid">
              <div className="feature-card"><div className="feature-icon"><Award size={28} /></div><h4>Accredited Programs</h4><p>CHED-recognized curricula aligned with global healthcare standards.</p></div>
              <div className="feature-card"><div className="feature-icon"><Users size={28} /></div><h4>Expert Instructors</h4><p>Learn from practicing doctors and nurses with decades of experience.</p></div>
              <div className="feature-card"><div className="feature-icon"><Building2 size={28} /></div><h4>Modern Facilities</h4><p>State-of-the-art simulation labs and smart classrooms.</p></div>
            </div>
          </section>

          {/* COURSES */}
          <section id="courses" className="courses-section">
            <div className="container">
              <div className="section-header center">
                <span className="tag">Our Programs</span>
                <h2>Healthcare Courses</h2>
                <p>We offer a wide range of accredited programs designed to prepare you for a successful career in the healthcare industry.</p>
              </div>
              <div className="course-list">
                {sampleCourses.map((course, idx) => (
                  <div key={idx} className="course-item">
                    <BookOpen size={20} className="course-icon" />
                    <span>{course}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* FACILITIES */}
          <section id="facilities" className="facilities-section">
            <div className="container">
              <div className="section-header center">
                <span className="tag">Campus</span>
                <h2>Our Facilities</h2>
                <p>Explore our modern learning environments designed for healthcare education.</p>
              </div>
              <div className="facilities-grid">
                {facilities.map((fac, idx) => (
                  <div key={idx} className="facility-card">
                    <img src={fac.img} alt={fac.name} className="facility-img" />
                    <div className="facility-name">
                      <Camera size={16} />
                      <span>{fac.name}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* CONTACT */}
          <section id="contact" className="contact-section-new">
            <div className="container">
              <div className="section-header center">
                <span className="tag">Get In Touch</span>
                <h2>Contact Us</h2>
                <p>Have questions? Reach out to our team and we'll get back to you promptly.</p>
              </div>
              <div className="contact-cards">
                <div className="contact-card">
                  <div className="contact-icon"><MapPin size={28} /></div>
                  <h3>Visit Our Campus</h3>
                  <p>123 Healthcare Avenue<br />Pasay City, Metro Manila</p>
                </div>
                <div className="contact-card">
                  <div className="contact-icon"><Phone size={28} /></div>
                  <h3>Call Us</h3>
                  <p>+63 (2) 1234 5678<br />+63 912 345 6789</p>
                </div>
                <div className="contact-card">
                  <div className="contact-icon"><Mail size={28} /></div>
                  <h3>Email Us</h3>
                  <p>admissions@hct.ph<br />info@hct.ph</p>
                </div>
                <div className="contact-card">
                  <div className="contact-icon"><Clock size={28} /></div>
                  <h3>Office Hours</h3>
                  <p>Mon - Fri: 8AM – 5PM<br />Saturday: 8AM – 12PM</p>
                </div>
              </div>
            </div>
          </section>
        </>
      )}

      {/* CAREERS PAGE */}
      {activePage === 'careers' && (
        <section id="careers" className="careers-section">
          <div className="container">
            <div className="section-header center">
              <span className="tag">Join Our Team</span>
              <h2>Careers at HCT Academy</h2>
              <p>Explore open positions and become part of a leading healthcare education institution.</p>
            </div>
            <div className="job-listings">
              {jobs.length === 0 ? (
                <div className="no-jobs"><Briefcase size={48} className="no-jobs-icon" /><p>No open positions at the moment. Please check back later.</p></div>
              ) : (
                <div className="job-cards-grid">
                  {jobs.map(job => (
                    <div key={job.id} className="job-card">
                      <div className="job-card-icon"><Briefcase size={24} /></div>
                      <h3>{job.title}</h3>
                      <div className="job-meta"><span><Building2 size={14} /> {job.department || 'General'}</span><span><Clock size={14} /> {job.employment_type}</span></div>
                      <p className="job-description">{job.description.substring(0, 120)}...</p>
                      <button className="btn-primary small" onClick={() => openApplyModal(job)}><FileText size={16} /> Apply Now</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* FOOTER */}
      <footer className="main-footer">
        <div className="footer-grid">
          <div className="footer-col brand-col"><Stethoscope size={28} /><h3>HCT Academy</h3><p>Leading healthcare education provider committed to excellence and innovation.</p></div>
          <div className="footer-col">
            <h4>Quick Links</h4>
            <a onClick={() => { setActivePage('home'); setTimeout(() => scrollToSection('home'), 100); }}>Home</a>
            <a onClick={() => { setActivePage('home'); setTimeout(() => scrollToSection('about'), 100); }}>About</a>
            <a onClick={() => { setActivePage('home'); setTimeout(() => scrollToSection('courses'), 100); }}>Courses</a>
            <a onClick={() => { setActivePage('home'); setTimeout(() => scrollToSection('facilities'), 100); }}>Facilities</a>
            <a onClick={() => setShowAppointmentModal(true)}>Appointment</a>
            <a onClick={() => setActivePage('careers')}>Careers</a>
            <a onClick={() => { setActivePage('home'); setTimeout(() => scrollToSection('contact'), 100); }}>Contact</a>
          </div>
          <div className="footer-col"><h4>Legal</h4><a href="#">Privacy Policy</a><a href="#">Terms of Service</a></div>
          <div className="footer-col"><h4>Connect</h4><p>📧 info@hct.ph</p><p>📞 +63 (2) 1234 5678</p></div>
        </div>
        <div className="footer-bottom"><p>© 2025 HCT Academy. All rights reserved.</p></div>
      </footer>

      {/* APPOINTMENT MODAL */}
      {showAppointmentModal && (
        <div className="modal-overlay" onClick={() => setShowAppointmentModal(false)}>
          <div className="appointment-modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Book an Appointment</h2>
              <button className="btn-close-modal" onClick={() => setShowAppointmentModal(false)}><X size={24} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              
              <div className="form-row">
                <div className="form-group"><label><User size={16} /> Full Name </label><input type="text" name="name" placeholder="Juan Dela Cruz" value={formData.name} onChange={handleChange} required /></div>
                <div className="form-group"><label><Mail size={16} /> Email </label><input type="email" name="email" placeholder="juan@example.com" value={formData.email} onChange={handleChange} required /></div>
              </div>
              
              <div className="form-row">
                <div className="form-group"><label><Phone size={16} /> Phone</label><input type="tel" name="phone" placeholder="+63 912 345 6789" value={formData.phone} onChange={handleChange} /></div>
                
                {/* NEW: Dynamic Reason Dropdown instead of BLE Tag */}
                <div className="form-group">
                  <label><MessageSquare size={16} /> Reason for Visit </label>
                  <select name="message" value={formData.message} onChange={handleChange} required>
                    <option value="">Select a reason...</option>
                    {visitReasons.map(r => (
                      <option key={r.id} value={r.reason_text}>{r.reason_text}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group"><label><Calendar size={16} /> Preferred Date </label><input type="date" name="date" value={formData.date} onChange={handleChange} min={new Date().toISOString().split('T')[0]} required /></div>
                <div className="form-group"><label><Clock size={16} /> Preferred Time </label><input type="time" name="time" value={formData.time} onChange={handleChange} required /></div>
              </div>
              
              <div className="checkbox-field">
                <label><input type="checkbox" checked={isMultipleVisitors} onChange={e => setIsMultipleVisitors(e.target.checked)} /> I'm visiting with companions</label>
              </div>
              
              {isMultipleVisitors && (
                <div className="companions-box">
                  <div className="companions-info"><Info size={16} />Please list the names of your companions.</div>
                  {additionalVisitors.map((v, idx) => (
                    <div key={idx} className="companion-row">
                      {/* ONLY NAME IS REQUESTED NOW, BLE TAG DROPDOWN REMOVED */}
                      <input type="text" placeholder="Companion Full Name" value={v.name} onChange={e => updateVisitorField(idx, 'name', e.target.value)} required style={{flex: 1}}/>
                      <button type="button" onClick={() => removeVisitorRow(idx)}><Trash2 size={16} /></button>
                    </div>
                  ))}
                  <button type="button" className="add-companion-btn" onClick={addVisitorRow}><Plus size={16} />Add Companion</button>
                </div>
              )}
              
              <button type="submit" className="btn-primary large" disabled={isSubmitting}>{isSubmitting ? 'Sending...' : 'Book Appointment'}</button>
            </form>
          </div>
        </div>
      )}

      {/* APPLICATION MODAL */}
      {showApplyModal && selectedJob && (
        <div className="modal-overlay" onClick={() => setShowApplyModal(false)}>
          <div className="apply-modal-content" onClick={e => e.stopPropagation()}>
            <div className="apply-modal-header"><h3>Apply for {selectedJob.title}</h3><button className="btn-close-modal" onClick={() => setShowApplyModal(false)}><X size={20} /></button></div>
            <form onSubmit={submitApplication} className="apply-form">
              <div className="form-group"><label>Full Name *</label><input type="text" name="full_name" value={applicationForm.full_name} onChange={handleApplicationChange} required /></div>
              <div className="form-row"><div className="form-group"><label>Email *</label><input type="email" name="email" value={applicationForm.email} onChange={handleApplicationChange} required /></div><div className="form-group"><label>Phone</label><input type="tel" name="phone" value={applicationForm.phone} onChange={handleApplicationChange} /></div></div>
              <div className="form-group"><label>Cover Letter</label><textarea name="cover_letter" rows="4" value={applicationForm.cover_letter} onChange={handleApplicationChange} /></div>
              <div className="form-group"><label>Resume * (PDF, DOC)</label><div className="file-upload-wrapper"><input type="file" id="resume-upload" accept=".pdf,.doc,.docx" onChange={handleResumeChange} required className="file-input" /><label htmlFor="resume-upload" className="file-upload-label"><Upload size={16} /> Choose File</label>{applicationForm.resume && <span className="file-name">{applicationForm.resume.name}</span>}</div></div>
              <div className="apply-modal-footer"><button type="button" className="btn-cancel" onClick={() => setShowApplyModal(false)}>Cancel</button><button type="submit" className="btn-primary" disabled={submittingApplication}>{submittingApplication ? 'Submitting...' : 'Submit Application'}</button></div>
            </form>
          </div>
        </div>
      )}

      {/* TOAST */}
      {toastMessage && (
        <div className={`toast ${toastMessage.isError ? 'error' : 'success'}`}>
          <Check size={18} /> {toastMessage.message}
        </div>
      )}
    </div>
  );
};

export default AppointmentPage;