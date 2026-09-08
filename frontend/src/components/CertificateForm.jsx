import React, { useState } from 'react';
import { User, Award, Loader2, AlertCircle } from 'lucide-react';

/**
 * Presentational component for the Certificate Claim Form.
 */
export default function CertificateForm({
  name,
  onChangeName,
  onSubmit,
  isLoading = false,
  error = null,
  disabled = false,
}) {
  const [validationError, setValidationError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setValidationError('Please enter your full name before claiming.');
      return;
    }
    setValidationError('');
    onSubmit(e);
  };

  const handleInputChange = (e) => {
    if (validationError) setValidationError('');
    onChangeName(e.target.value);
  };

  const activeError = validationError || error;

  return (
    <form onSubmit={handleSubmit} className="certificate-form">
      <div className="form-group">
        <label htmlFor="participant-name" className="form-label">
          Full Name for Certificate
        </label>
        <div className="input-wrapper">
          <User className="input-icon" size={18} />
          <input
            id="participant-name"
            type="text"
            className={`form-input ${activeError ? 'input-error' : ''}`}
            placeholder="e.g. Alex Morgan"
            value={name}
            onChange={handleInputChange}
            disabled={isLoading || disabled}
            maxLength={80}
            autoFocus
            required
          />
        </div>
        <p className="form-help-text">
          Make sure your name is spelled correctly as it will be printed on your official certificate.
        </p>
      </div>

      {activeError && (
        <div className="form-error-banner" role="alert">
          <AlertCircle size={18} className="error-icon" />
          <span>{activeError}</span>
        </div>
      )}

      <button
        type="submit"
        className="btn btn-primary btn-block claim-btn"
        disabled={isLoading || disabled || !name.trim()}
      >
        {isLoading ? (
          <>
            <Loader2 className="spinner" size={20} />
            <span>Generating Certificate...</span>
          </>
        ) : (
          <>
            <Award size={20} />
            <span>Claim Certificate</span>
          </>
        )}
      </button>
    </form>
  );
}
