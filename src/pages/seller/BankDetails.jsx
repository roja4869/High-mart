import React from 'react';
import { useForm } from 'react-hook-form';
import { CreditCard, Landmark, Hash, CheckCircle, Smartphone } from 'lucide-react';

const BankDetails = ({ defaultValues, onNext, onPrev }) => {
  const { register, handleSubmit, formState: { errors }, getValues } = useForm({
    defaultValues: defaultValues || {}
  });

  const onSubmit = (data) => {
    onNext(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="seller-step-form">
      <h3 className="step-title">Step 3: Bank Account Details</h3>
      <p className="step-description">Provide your bank credentials where payment settlements will be processed.</p>

      <div className="form-grid">
        {/* Account Holder Name */}
        <div className="form-group">
          <label className="form-label" htmlFor="accountHolderName">Account Holder Name *</label>
          <div className="input-with-icon">
            <CreditCard size={18} className="input-icon" />
            <input
              id="accountHolderName"
              type="text"
              placeholder="John Doe"
              className={`form-input ${errors.accountHolderName ? 'input-error' : ''}`}
              {...register('accountHolderName', { required: 'Account Holder Name is required' })}
            />
          </div>
          {errors.accountHolderName && <span className="error-text">{errors.accountHolderName.message}</span>}
        </div>

        {/* Bank Name */}
        <div className="form-group">
          <label className="form-label" htmlFor="bankName">Bank Name *</label>
          <div className="input-with-icon">
            <Landmark size={18} className="input-icon" />
            <input
              id="bankName"
              type="text"
              placeholder="State Bank of India"
              className={`form-input ${errors.bankName ? 'input-error' : ''}`}
              {...register('bankName', { required: 'Bank Name is required' })}
            />
          </div>
          {errors.bankName && <span className="error-text">{errors.bankName.message}</span>}
        </div>

        {/* Account Number */}
        <div className="form-group">
          <label className="form-label" htmlFor="accountNumber">Account Number *</label>
          <div className="input-with-icon">
            <Hash size={18} className="input-icon" />
            <input
              id="accountNumber"
              type="password"
              placeholder="••••••••••••"
              className={`form-input ${errors.accountNumber ? 'input-error' : ''}`}
              {...register('accountNumber', {
                required: 'Account Number is required',
                minLength: {
                  value: 9,
                  message: 'Must be at least 9 digits'
                },
                maxLength: {
                  value: 18,
                  message: 'Cannot exceed 18 digits'
                }
              })}
            />
          </div>
          {errors.accountNumber && <span className="error-text">{errors.accountNumber.message}</span>}
        </div>

        {/* Confirm Account Number */}
        <div className="form-group">
          <label className="form-label" htmlFor="confirmAccountNumber">Confirm Account Number *</label>
          <div className="input-with-icon">
            <CheckCircle size={18} className="input-icon" />
            <input
              id="confirmAccountNumber"
              type="text"
              placeholder="123456789012"
              className={`form-input ${errors.confirmAccountNumber ? 'input-error' : ''}`}
              {...register('confirmAccountNumber', {
                required: 'Please confirm your Account Number',
                validate: (value) => value === getValues('accountNumber') || 'Account Numbers do not match'
              })}
            />
          </div>
          {errors.confirmAccountNumber && <span className="error-text">{errors.confirmAccountNumber.message}</span>}
        </div>

        {/* IFSC Code */}
        <div className="form-group">
          <label className="form-label" htmlFor="ifscCode">IFSC Code *</label>
          <div className="input-with-icon">
            <Hash size={18} className="input-icon" />
            <input
              id="ifscCode"
              type="text"
              placeholder="SBIN0001234"
              className={`form-input uppercase-input ${errors.ifscCode ? 'input-error' : ''}`}
              style={{ textTransform: 'uppercase' }}
              {...register('ifscCode', {
                required: 'IFSC Code is required',
                pattern: {
                  value: /^[A-Z]{4}0[A-Z0-9]{6}$/,
                  message: 'Must be a valid 11-character IFSC Code (e.g. SBIN0001234)'
                }
              })}
            />
          </div>
          {errors.ifscCode && <span className="error-text">{errors.ifscCode.message}</span>}
        </div>

        {/* UPI ID */}
        <div className="form-group">
          <label className="form-label" htmlFor="upiId">UPI ID (Optional)</label>
          <div className="input-with-icon">
            <Smartphone size={18} className="input-icon" />
            <input
              id="upiId"
              type="text"
              placeholder="john@upi"
              className={`form-input ${errors.upiId ? 'input-error' : ''}`}
              {...register('upiId', {
                pattern: {
                  value: /^[\w.-]+@[\w.-]+$/,
                  message: 'Must be a valid UPI ID (e.g. john@okaxis)'
                }
              })}
            />
          </div>
          {errors.upiId && <span className="error-text">{errors.upiId.message}</span>}
        </div>
      </div>

      <div className="step-actions-footer">
        <button type="button" onClick={onPrev} className="wizard-btn-secondary">
          <span>Previous</span>
        </button>
        <button type="submit" className="wizard-btn-primary">
          <span>Continue</span>
        </button>
      </div>
    </form>
  );
};

export default BankDetails;
