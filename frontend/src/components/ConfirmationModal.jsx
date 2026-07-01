import React from 'react';
import { Trash2 } from 'lucide-react';

const ConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  productName, 
  title, 
  message, 
  confirmText, 
  cancelText, 
  icon 
}) => {
  if (!isOpen) return null;

  const displayTitle = title || "Remove Item?";
  const displayMessage = message || (
    <span>
      Are you sure you want to remove <strong>"{productName}"</strong> from your wishlist?
    </span>
  );
  const displayConfirmText = confirmText || "Remove";
  const displayCancelText = cancelText || "Cancel";
  const displayIcon = icon || <Trash2 size={48} strokeWidth={1.5} />;

  return (
    <div className="wish-modal-overlay" onClick={onClose}>
      <div className="confirm-modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="confirm-modal-icon">
          {displayIcon}
        </div>
        <h3>{displayTitle}</h3>
        <div className="confirm-modal-body-text" style={{ margin: '12px 0 24px 0', color: 'var(--text-muted)', fontSize: '15px' }}>
          {displayMessage}
        </div>
        <div className="confirm-modal-actions">
          <button className="confirm-cancel-btn" onClick={onClose}>
            {displayCancelText}
          </button>
          <button className="confirm-delete-btn" onClick={onConfirm}>
            {displayConfirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
