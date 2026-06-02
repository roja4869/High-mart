import React from 'react';
import { Trash2, AlertTriangle } from 'lucide-react';

const ConfirmationModal = ({ isOpen, onClose, onConfirm, productName }) => {
  if (!isOpen) return null;

  return (
    <div className="wish-modal-overlay" onClick={onClose}>
      <div className="confirm-modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="confirm-modal-icon">
          <Trash2 size={48} strokeWidth={1.5} />
        </div>
        <h3>Remove Item?</h3>
        <p>
          Are you sure you want to remove <strong>"{productName}"</strong> from your wishlist?
        </p>
        <div className="confirm-modal-actions">
          <button className="confirm-cancel-btn" onClick={onClose}>
            Cancel
          </button>
          <button className="confirm-delete-btn" onClick={onConfirm}>
            Remove
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
