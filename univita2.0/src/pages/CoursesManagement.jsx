import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Plus, Edit3, Trash2 } from 'lucide-react';
import FormalModal from '../components/FormalModal';
import { API_BASE } from '../api';

// Helper to get auth headers (admin endpoints require token)
const getAuthHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('auth_token')}` }
});

const CoursesManagement = () => {
  const [courses, setCourses] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [courseName, setCourseName] = useState('');

  const loadCourses = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE}/courses`, getAuthHeaders());
      setCourses(res.data || []);
    } catch (err) {
      console.error("Failed to load courses", err);
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

  const handleDelete = async (id) => {
    if (window.confirm("Delete this course?")) {
      try {
        await axios.delete(`${API_BASE}/courses/${id}`, getAuthHeaders());
        loadCourses();
      } catch (err) {
        alert("Failed to delete course");
      }
    }
  };

  const handleSave = async () => {
    if (!courseName.trim()) {
      alert("Course name required");
      return;
    }
    try {
      if (editingCourse) {
        await axios.put(`${API_BASE}/courses/${editingCourse.id}`, { name: courseName.trim() }, getAuthHeaders());
      } else {
        await axios.post(`${API_BASE}/courses`, { name: courseName.trim() }, getAuthHeaders());
      }
      setShowModal(false);
      resetForm();
      loadCourses();
    } catch (err) {
      alert(err.response?.data?.error || "Error saving course");
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
                  <Trash2 size={16} style={{ cursor: 'pointer', color: '#ef4444' }} onClick={() => handleDelete(course.id)} />
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
    </div>
  );
};

export default CoursesManagement;