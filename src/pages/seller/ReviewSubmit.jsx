import React from 'react';
import { ShieldCheck, User, Building, Landmark, FileText, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';

const ReviewSubmit = ({ formData, onSubmit, onPrev, onReset, isLoading, submitError, submitSuccess }) => {
  const maskAccountNumber = (num) => {
    if (!num) return '';
    return '•'.repeat(num.length - 4) + num.slice(-4);
  };

  if (submitSuccess) {
    return (
      <div className="seller-success-container">
        <div className="success-icon-badge animate-pop">
          <span style={{ fontSize: '42px' }}>🎉</span>
        </div>
        <h2 className="success-title" style={{ color: 'var(--secondary-color)', fontSize: '1.8rem', fontWeight: '850', marginBottom: '12px' }}>
          Application submitted successfully. Waiting for admin approval.
        </h2>
        <div className="status-badge-container" style={{ margin: '15px 0 20px 0', background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.15)', padding: '10px 20px', borderRadius: '99px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
          <span className="status-label" style={{ fontWeight: '600' }}>Current Status:</span>
          <span className="status-value pending-color" style={{ fontWeight: '800', color: '#f59e0b', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <span>🟡</span> Pending Approval
          </span>
        </div>
        <p className="success-description" style={{ fontSize: '14px', maxWidth: '480px', margin: '0 auto 30px auto', lineHeight: '1.5' }}>
          You will receive access to the Seller Dashboard once your application is approved.
        </p>
        <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button 
            type="button"
            onClick={() => window.location.href = '/seller/dashboard'}
            className="wizard-btn-primary"
            style={{ minWidth: '150px' }}
          >
            Go to Dashboard
          </button>
          <button 
            type="button"
            onClick={onReset}
            className="wizard-btn-secondary"
            style={{ minWidth: '180px', border: '1px solid var(--primary-color)', color: 'var(--primary-color)', background: 'rgba(79, 70, 229, 0.05)' }}
          >
            Register Another Seller
          </button>
          <button 
            type="button"
            onClick={() => window.location.href = '/'}
            className="wizard-btn-secondary"
            style={{ minWidth: '130px' }}
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="seller-step-form">
      <h3 className="step-title">Step 5: Review & Submit</h3>
      <p className="step-description">Verify that all your details and documents are correct before submitting your application.</p>

      {submitError && (
        <div className="step-error-banner">
          <AlertCircle size={18} />
          <span>{submitError}</span>
        </div>
      )}

      <div className="review-dashboard">
        {/* Section 1: Personal Details */}
        <div className="review-card glass-effect">
          <div className="review-card-header">
            <User size={18} className="review-icon-primary" />
            <h4>Personal Details</h4>
          </div>
          <div className="review-card-content">
            <div className="review-item">
              <span className="review-label">Full Name:</span>
              <span className="review-val">{formData.fullName}</span>
            </div>
            <div className="review-item">
              <span className="review-label">Email Address:</span>
              <span className="review-val">{formData.email}</span>
            </div>
            <div className="review-item">
              <span className="review-label">Phone Number:</span>
              <span className="review-val">{formData.phone}</span>
            </div>
          </div>
        </div>

        {/* Section 2: Business Details */}
        <div className="review-card glass-effect">
          <div className="review-card-header">
            <Building size={18} className="review-icon-primary" />
            <h4>Business Details</h4>
          </div>
          <div className="review-card-content">
            <div className="review-item">
              <span className="review-label">Business Name:</span>
              <span className="review-val">{formData.businessName}</span>
            </div>
            <div className="review-item">
              <span className="review-label">GST Number:</span>
              <span className="review-val uppercase">{formData.gstNumber}</span>
            </div>
            <div className="review-item">
              <span className="review-label">PAN Number:</span>
              <span className="review-val uppercase">{formData.panNumber}</span>
            </div>
            <div className="review-item">
              <span className="review-label">Address:</span>
              <span className="review-val">{formData.businessAddress}, {formData.city}, {formData.state} - {formData.pincode}</span>
            </div>
          </div>
        </div>

        {/* Section 3: Bank Details */}
        <div className="review-card glass-effect">
          <div className="review-card-header">
            <Landmark size={18} className="review-icon-primary" />
            <h4>Bank Account Details</h4>
          </div>
          <div className="review-card-content">
            <div className="review-item">
              <span className="review-label">Account Holder Name:</span>
              <span className="review-val">{formData.accountHolderName}</span>
            </div>
            <div className="review-item">
              <span className="review-label">Bank Name:</span>
              <span className="review-val">{formData.bankName}</span>
            </div>
            <div className="review-item">
              <span className="review-label">Account Number:</span>
              <span className="review-val">{maskAccountNumber(formData.accountNumber)}</span>
            </div>
            <div className="review-item">
              <span className="review-label">IFSC Code:</span>
              <span className="review-val uppercase">{formData.ifscCode}</span>
            </div>
            {formData.upiId && (
              <div className="review-item">
                <span className="review-label">UPI ID:</span>
                <span className="review-val">{formData.upiId}</span>
              </div>
            )}
          </div>
        </div>

        {/* Section 4: Uploaded Documents */}
        <div className="review-card glass-effect">
          <div className="review-card-header">
            <FileText size={18} className="review-icon-primary" />
            <h4>Uploaded Documents</h4>
          </div>
          <div className="review-card-content">
            <div className="review-item">
              <span className="review-label">Profile Photo:</span>
              <span className="review-val file-name-val">{formData.profilePhoto?.name}</span>
            </div>
            <div className="review-item">
              <span className="review-label">GST Certificate:</span>
              <span className="review-val file-name-val">{formData.gstCertificate?.name}</span>
            </div>
            <div className="review-item">
              <span className="review-label">PAN Card:</span>
              <span className="review-val file-name-val">{formData.panCard?.name}</span>
            </div>
            <div className="review-item">
              <span className="review-label">Cancelled Cheque:</span>
              <span className="review-val file-name-val">{formData.cancelledCheque?.name}</span>
            </div>
            {formData.businessLicense && (
              <div className="review-item">
                <span className="review-label">Business License:</span>
                <span className="review-val file-name-val">{formData.businessLicense.name}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="step-actions-footer">
        <button 
          type="button" 
          onClick={onPrev} 
          className="wizard-btn-secondary"
          disabled={isLoading}
        >
          <span>Previous</span>
        </button>
        <button 
          type="button" 
          onClick={onSubmit} 
          className="wizard-btn-primary btn-submit-seller"
          disabled={isLoading || submitSuccess}
        >
          {isLoading ? (
            <>
              <Loader2 size={16} className="spinning-icon" />
              <span>Submitting Application...</span>
            </>
          ) : submitSuccess ? (
            <>
              <CheckCircle2 size={16} />
              <span>Request Pending</span>
            </>
          ) : (
            <>
              <ShieldCheck size={16} />
              <span>Submit Application</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ReviewSubmit;
