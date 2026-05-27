import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Plus, Edit3, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import FormalModal from '../components/FormalModal';
import { API_BASE } from '../api';

const getAuthHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('auth_token')}` }
});

const CoursesManagement = () => {
  const [courses, setCourses] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [deleteTargetName, setDeleteTargetName] = useState('');
  const [editingCourse, setEditingCourse] = useState(null);
  const [courseName, setCourseName] = useState('');

  const loadCourses = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE}/courses`, getAuthHeaders());
      setCourses(res.data || []);
    } catch (err) {
      console.error("Failed to load courses", err);
      toast.error("Failed to load courses");
    }
  }, []);

  useEffect(() => { loadCourses(); }, [loadCourses]);

  const resetForm = () => {
    setCourseName('');
    setEditingCourse(null);
  };

  const handleEdit = (course) => {
    setEditingCourse(course);
    setCourseName(course.name);
    setShowModal(true);
  };

  const handleDeleteClick = (id, name) => {
    setDeleteTargetId(id);
    setDeleteTargetName(name);
    setShowConfirm(true);
  };

  const confirmDelete = async () => {
    if (!deleteTargetId) return;
    try {
      await axios.delete(`${API_BASE}/courses/${deleteTargetId}`, getAuthHeaders());
      toast.success("Course deleted successfully");
      loadCourses();
    } catch (err) {
      const errorMsg = err.response?.data?.error || "Failed to delete course";
      toast.error(errorMsg);
    } finally {
      setShowConfirm(false);
      setDeleteTargetId(null);
      setDeleteTargetName('');
    }
  };

  const handleSave = async () => {
    if (!courseName.trim()) {
      toast.warning("Course name required");
      return;
    }
    try {
      if (editingCourse) {
        await axios.put(`${API_BASE}/courses/${editingCourse.id}`, { name: courseName.trim() }, getAuthHeaders());
        toast.success("Course updated successfully");
      } else {
        await axios.post(`${API_BASE}/courses`, { name: courseName.trim() }, getAuthHeaders());
        toast.success("Course added successfully");
      }
      setShowModal(false);
      resetForm();
      loadCourses();
    } catch (err) {
      const errorMsg = err.response?.data?.error || "Error saving course";
      toast.error(errorMsg);
    }
  };

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Courses</h3>
        <button className="btn-add-schedule" onClick={() => { resetForm(); setShowModal(true); }}>
          <Plus size={20} /> Add Course
        </button>
      </div>

      <table className="custom-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>Course Name</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {courses.map(course => (
            <tr key={course.id}>
              <td>{course.name}</td>
              <td>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <Edit3 size={16} style={{ cursor: 'pointer', color: '#00897B' }} onClick={() => handleEdit(course)} />
                  <Trash2 size={16} style={{ cursor: 'pointer', color: '#ef4444' }} onClick={() => handleDeleteClick(course.id, course.name)} />
                </div>
              </td>
            </tr>
          ))}
          {courses.length === 0 && (
            <tr><td colSpan="2" className="empty-row">No courses found.</td></tr>
          )}
        </tbody>
      </table>

      {/* Add/Edit Modal */}
      <FormalModal
        show={showModal}
        onClose={() => { setShowModal(false); resetForm(); }}
        title={editingCourse ? 'Edit Course' : 'Add Course'}
        footer={
          <>
            <button className="btn-modal-cancel" onClick={() => { setShowModal(false); resetForm(); }}>Cancel</button>
            <button className="btn-modal-submit" onClick={handleSave}>{editingCourse ? 'Update' : 'Save'}</button>
          </>
        }
      >
        <div className="modal-form-group">
          <label className="modal-label">Course Name</label>
          <input type="text" className="modal-input" value={courseName} onChange={e => setCourseName(e.target.value)} placeholder="e.g. Web Development" />
        </div>
      </FormalModal>

      {/* Delete Confirmation Modal */}
      <FormalModal
        show={showConfirm}
        onClose={() => setShowConfirm(false)}
        title="Delete Course"
        footer={
          <>
            <button className="btn-modal-cancel" onClick={() => setShowConfirm(false)}>Cancel</button>
            <button className="btn-modal-submit" onClick={confirmDelete} style={{ backgroundColor: '#dc2626' }}>Delete</button>
          </>
        }
      >
        <p>Are you sure you want to delete the course <strong>"{deleteTargetName}"</strong>?</p>
        <p className="text-sm text-gray-500 mt-2">This action cannot be undone.</p>
      </FormalModal>
    </div>
  );
};

export default CoursesManagement;