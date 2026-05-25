import React from 'react';
import { X } from 'lucide-react';
import './FormalModal.css';   // we’ll create this next

const FormalModal = ({ show, onClose, title, children, footer, wide, small }) => {
  if (!show) return null;

  const sizeClass = wide ? 'modal-wide' : small ? 'modal-small' : '';

  return (
    <div className="formal-modal-overlay">
      <div className={`formal-modal-content ${sizeClass}`}>
        <div className="formal-modal-header">
          <h3 className="formal-modal-title">{title}</h3>
          <button className="formal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        <div className="formal-modal-body">
          {children}
        </div>
        {footer && (
          <div className="formal-modal-footer">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default FormalModal;