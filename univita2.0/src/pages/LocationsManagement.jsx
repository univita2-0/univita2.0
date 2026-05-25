import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Plus, Edit3, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import FormalModal from '../components/FormalModal';
import { API_BASE } from '../api';

// Helper to get auth headers (most admin endpoints require token)
const getAuthHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('auth_token')}` }
});

// Confirmation dialog using toast confirm (custom implementation)
const confirmAction = (message, onConfirm) => {
  // You can use window.confirm for simplicity, or create a custom modal.
  // For better UX with toast, I'll keep window.confirm but replace alerts with toasts.
  // The user specifically wanted to replace alerts, not necessarily confirm.
  if (window.confirm(message)) {
    onConfirm();
  }
};

const LocationsManagement = () => {
  const [locations, setLocations] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingLocation, setEditingLocation] = useState(null);
  const [locationForm, setLocationForm] = useState({ name: '', latitude: 0, longitude: 0, radius: 200 });

  const loadLocations = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE}/school-locations`, getAuthHeaders());
      setLocations(res.data || []);
    } catch (err) {
      console.error("Failed to load locations", err);
      toast.error("Failed to load locations");
    }
  }, []);

  useEffect(() => { loadLocations(); }, [loadLocations]);

  const resetForm = () => {
    setLocationForm({ name: '', latitude: 0, longitude: 0, radius: 200 });
    setEditingLocation(null);
  };

  const handleEdit = (loc) => {
    setEditingLocation(loc);
    setLocationForm({ name: loc.name, latitude: loc.latitude, longitude: loc.longitude, radius: loc.radius });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this location? It may affect existing schedules.")) {
      try {
        await axios.delete(`${API_BASE}/school-locations/${id}`, getAuthHeaders());
        toast.success("Location deleted successfully");
        loadLocations();
      } catch (err) {
        const errorMsg = err.response?.data?.error || "Failed to delete location";
        toast.error(errorMsg);
      }
    }
  };

  const handleSave = async () => {
    if (!locationForm.name.trim()) {
      toast.warning("Location name required");
      return;
    }
    try {
      if (editingLocation) {
        await axios.put(`${API_BASE}/school-locations/${editingLocation.id}`, locationForm, getAuthHeaders());
        toast.success("Location updated successfully");
      } else {
        await axios.post(`${API_BASE}/school-locations`, locationForm, getAuthHeaders());
        toast.success("Location added successfully");
      }
      setShowModal(false);
      resetForm();
      loadLocations();
    } catch (err) {
      const errorMsg = err.response?.data?.error || "Error saving location";
      toast.error(errorMsg);
    }
  };

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>School Locations</h3>
        <button className="btn-add-schedule" onClick={() => { resetForm(); setShowModal(true); }}>
          <Plus size={20} /> Add Location
        </button>
      </div>

      <table className="custom-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Latitude</th>
            <th>Longitude</th>
            <th>Radius (m)</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {locations.map(loc => (
            <tr key={loc.id}>
              <td>{loc.name}</td>
              <td>{loc.latitude}</td>
              <td>{loc.longitude}</td>
              <td>{loc.radius}</td>
              <td>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <Edit3 size={16} style={{ cursor: 'pointer', color: '#00897B' }} onClick={() => handleEdit(loc)} />
                  <Trash2 size={16} style={{ cursor: 'pointer', color: '#ef4444' }} onClick={() => handleDelete(loc.id)} />
                </div>
              </td>
            </tr>
          ))}
          {locations.length === 0 && (
            <tr><td colSpan="5" className="empty-row">No locations found.</td></tr>
          )}
        </tbody>
      </table>

      {/* Add/Edit Modal */}
      <FormalModal
        show={showModal}
        onClose={() => { setShowModal(false); resetForm(); }}
        title={editingLocation ? 'Edit Location' : 'Add Location'}
        footer={
          <>
            <button className="btn-modal-cancel" onClick={() => { setShowModal(false); resetForm(); }}>Cancel</button>
            <button className="btn-modal-submit" onClick={handleSave}>{editingLocation ? 'Update' : 'Save'}</button>
          </>
        }
      >
        <div className="modal-form-group">
          <label className="modal-label">Location Name</label>
          <input type="text" className="modal-input" value={locationForm.name} onChange={e => setLocationForm(prev => ({ ...prev, name: e.target.value }))} placeholder="e.g. S Residence Tower 3" />
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <div className="modal-form-group" style={{ flex: 1 }}>
            <label className="modal-label">Latitude</label>
            <input type="number" className="modal-input" value={Number(locationForm.latitude).toString()} onChange={e => setLocationForm(prev => ({ ...prev, latitude: parseFloat(e.target.value) || 0 }))} step="any" />
          </div>
          <div className="modal-form-group" style={{ flex: 1 }}>
            <label className="modal-label">Longitude</label>
            <input type="number" className="modal-input" value={Number(locationForm.longitude).toString()} onChange={e => setLocationForm(prev => ({ ...prev, longitude: parseFloat(e.target.value) || 0 }))} step="any" />
          </div>
          <div className="modal-form-group" style={{ flex: 1 }}>
            <label className="modal-label">Radius (m)</label>
            <input type="number" className="modal-input" value={locationForm.radius} onChange={e => setLocationForm(prev => ({ ...prev, radius: parseInt(e.target.value) || 200 }))} />
          </div>
        </div>
      </FormalModal>
    </div>
  );
};

export default LocationsManagement;