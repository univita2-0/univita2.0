import React from 'react';
import './VisitorHistory.css';

const VisitorHistory = () => {
  return (
    <div className="vh-container">
      <div className="card vh-card">
        <div className="table-container">
          <table className="custom-table">
            <thead className="vh-header">
              <tr>
                <th>VISITOR ID</th>
                <th>NAME</th>
                <th>PURPOSE</th>
                <th>DATE</th>
                <th>TIME IN</th>
                <th>TIME OUT</th>
              </tr>
            </thead>
            <tbody>
              {[...Array(12)].map((_, i) => (
                <tr key={i} className="vh-row-empty">
                  <td></td><td></td><td></td><td></td><td></td><td></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default VisitorHistory;