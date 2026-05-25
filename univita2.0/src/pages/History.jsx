import React, { useState, useEffect } from 'react';
import './History.css';
import { ChevronDown, Filter } from 'lucide-react';
import axios from 'axios';

const History = () => {
  const [historyData, setHistoryData] = useState([]);
  const [filterDay, setFilterDay] = useState('All');
  const [filterMonth, setFilterMonth] = useState('All');

  const fetchHistory = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/appointments/history');
      setHistoryData(res.data);
    } catch (err) {
      console.error("Error fetching history:", err);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const filteredData = historyData.filter(item => {
    const dateObj = new Date(item.visit_date);
    const day = dateObj.getDate().toString();
    const month = (dateObj.getMonth() + 1).toString();
    const matchDay = filterDay === 'All' || day === filterDay;
    const matchMonth = filterMonth === 'All' || month === filterMonth;
    return matchDay && matchMonth;
  });

  return (
    <div className="history-container">
      <div className="history-card">
        <div className="history-header">
          <h2 className="history-title">Visit History</h2>
          <div className="filter-group">
            <div className="filter-dropdown">
              <span>Day</span>
              <select value={filterDay} onChange={(e) => setFilterDay(e.target.value)}>
                <option value="All">All</option>
                {[...Array(31)].map((_, i) => (
                  <option key={i+1} value={i+1}>{i+1}</option>
                ))}
              </select>
              <ChevronDown size={14} className="dropdown-icon" />
            </div>
            <div className="filter-dropdown">
              <span>Month</span>
              <select value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)}>
                <option value="All">All</option>
                <option value="1">January</option><option value="2">February</option>
                <option value="3">March</option><option value="4">April</option>
                <option value="5">May</option><option value="6">June</option>
                <option value="7">July</option><option value="8">August</option>
                <option value="9">September</option><option value="10">October</option>
                <option value="11">November</option><option value="12">December</option>
              </select>
              <ChevronDown size={14} className="dropdown-icon" />
            </div>
          </div>
        </div>

        <div className="table-wrapper">
          <table className="history-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Reason</th>
                <th>Date</th>
                <th>Time</th>
                <th>Status</th>
                <th>Processed By</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length === 0 ? (
                <tr className="empty-row">
                  <td colSpan="7">No visit history found.</td>
                </tr>
              ) : (
                filteredData.map((item) => (
                  <tr key={item.id}>
                    <td className="guest-name">{item.first_name} {item.last_name}</td>
                    <td className="guest-email">{item.email}</td>
                    <td className="purpose-cell">{item.reason}</td>
                    <td>{new Date(item.visit_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                    <td>{item.visit_time.substring(0,5)}</td>
                    <td>
                      <span className={`status-badge ${item.status.toLowerCase()}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="admin-name">{item.admin_name ? `Admin ${item.admin_name}` : 'System'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default History;