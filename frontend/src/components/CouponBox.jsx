import React, { useState } from 'react';
import { Tag, Check, AlertCircle } from 'lucide-react';

const CouponBox = ({ onApplyCoupon, couponStatus, couponMessage }) => {
  const [inputCode, setInputCode] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputCode.trim()) {
      onApplyCoupon(inputCode.trim().toUpperCase());
    }
  };

  return (
    <div className="coupon-box-wrapper">
      <span className="coupon-box-title">
        <Tag size={16} />
        <span>Apply Promo Code</span>
      </span>
      <form onSubmit={handleSubmit} className="coupon-input-group">
        <input
          type="text"
          placeholder="Enter code (e.g. HIGHMART10)"
          value={inputCode}
          onChange={(e) => setInputCode(e.target.value)}
          disabled={couponStatus === 'applied'}
        />
        <button 
          type="submit" 
          className="coupon-apply-btn"
          disabled={couponStatus === 'applied' || !inputCode.trim()}
        >
          {couponStatus === 'applied' ? 'Applied' : 'Apply'}
        </button>
      </form>

      {couponStatus === 'applied' && (
        <div className="coupon-msg success">
          <Check size={14} />
          <span>{couponMessage || 'Coupon applied successfully!'}</span>
        </div>
      )}

      {couponStatus === 'error' && (
        <div className="coupon-msg error">
          <AlertCircle size={14} />
          <span>{couponMessage || 'Invalid coupon code.'}</span>
        </div>
      )}
    </div>
  );
};

export default CouponBox;
