import React, { useState } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, Trash2 } from 'lucide-react';

const DocumentsUpload = ({ defaultValues, onNext, onPrev }) => {
  // Save local state for selected files
  const [files, setFiles] = useState(() => {
    return defaultValues || {
      gstCertificate: null,
      panCard: null,
      cancelledCheque: null,
      businessLicense: null,
      profilePhoto: null
    };
  });

  const [errors, setErrors] = useState({});

  const handleFileChange = (field, e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate size (5MB = 5 * 1024 * 1024 bytes)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setErrors(prev => ({
        ...prev,
        [field]: 'File size exceeds 5MB limit'
      }));
      return;
    }

    // Validate file type (jpg, jpeg, png, pdf)
    const allowedExtensions = ['jpg', 'jpeg', 'png', 'pdf'];
    const fileExtension = file.name.split('.').pop().toLowerCase();
    if (!allowedExtensions.includes(fileExtension)) {
      setErrors(prev => ({
        ...prev,
        [field]: 'Unsupported format. Use JPG, JPEG, PNG, or PDF'
      }));
      return;
    }

    // Clear error & save file
    setErrors(prev => {
      const updated = { ...prev };
      delete updated[field];
      return updated;
    });

    setFiles(prev => ({
      ...prev,
      [field]: file
    }));
  };

  const handleRemoveFile = (field) => {
    setFiles(prev => ({
      ...prev,
      [field]: null
    }));
    setErrors(prev => {
      const updated = { ...prev };
      delete updated[field];
      return updated;
    });
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();

    // Verify required files
    const required = ['gstCertificate', 'panCard', 'cancelledCheque', 'profilePhoto'];
    const newErrors = {};

    required.forEach(field => {
      if (!files[field]) {
        newErrors[field] = 'This document is required';
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onNext(files);
  };

  const renderUploadField = (field, label, isOptional = false) => {
    const file = files[field];
    const error = errors[field];

    return (
      <div className="document-upload-card" key={field}>
        <div className="upload-header-meta">
          <label className="upload-label-txt">
            {label} {!isOptional && <span className="req-star">*</span>}
          </label>
          {file && (
            <button 
              type="button" 
              className="btn-remove-doc" 
              onClick={() => handleRemoveFile(field)}
              title="Remove File"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>

        {file ? (
          <div className="uploaded-file-row">
            <FileText size={24} className="file-icon-doc" />
            <div className="uploaded-file-info">
              <span className="file-name">{file.name}</span>
              <span className="file-size">{(file.size / (1024 * 1024)).toFixed(2)} MB</span>
            </div>
            <CheckCircle size={20} className="text-success-green" />
          </div>
        ) : (
          <div className={`upload-drop-area ${error ? 'border-error' : ''}`}>
            <Upload size={22} className="upload-icon-arrow" />
            <span className="upload-hint-txt">Click to upload doc</span>
            <span className="upload-formats-txt">PDF, PNG, JPG or JPEG (Max 5MB)</span>
            <input
              type="file"
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={(e) => handleFileChange(field, e)}
              className="hidden-file-input"
            />
          </div>
        )}
        {error && (
          <div className="upload-error-row">
            <AlertCircle size={14} />
            <span>{error}</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <form onSubmit={handleFormSubmit} className="seller-step-form">
      <h3 className="step-title">Step 4: Document Upload</h3>
      <p className="step-description">Upload scanned copies of your official registry documents and a profile image.</p>

      <div className="documents-grid-layout">
        {renderUploadField('profilePhoto', 'Profile Photo')}
        {renderUploadField('gstCertificate', 'GST Certificate')}
        {renderUploadField('panCard', 'PAN Card')}
        {renderUploadField('cancelledCheque', 'Cancelled Cheque')}
        {renderUploadField('businessLicense', 'Business License', true)}
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

export default DocumentsUpload;
