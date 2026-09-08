import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { getEvent, claimCertificate, getDeviceToken } from '../lib/api';
import { generateCertificate, downloadCertificate } from '../lib/certificate';
import CertificateForm from '../components/CertificateForm';
import { Award, Download, CheckCircle2, AlertCircle, RefreshCw, Sparkles, AlertTriangle, ArrowLeft } from 'lucide-react';

export default function ClaimCertificate() {
  const { eventId } = useParams();

  // Event validation states
  const [eventInfo, setEventInfo] = useState(null);
  const [loadingEvent, setLoadingEvent] = useState(true);
  const [eventError, setEventError] = useState(null);

  // Form & submission states
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [claimError, setClaimError] = useState(null);

  // Result state
  const [claimResult, setClaimResult] = useState(null); // { certificate_number, name, event_name, already_claimed }
  const [certificateDataUrl, setCertificateDataUrl] = useState(null);
  const [renderingCanvas, setRenderingCanvas] = useState(false);

  // 1. Fetch & validate event on mount
  useEffect(() => {
    async function checkEvent() {
      setLoadingEvent(true);
      setEventError(null);
      try {
        const data = await getEvent(eventId);
        setEventInfo(data);
      } catch (err) {
        console.error('Failed to load event for claiming:', err);
        setEventError(err);
      } finally {
        setLoadingEvent(false);
      }
    }

    if (eventId) {
      checkEvent();
    }
  }, [eventId]);

  // Helper to trigger canvas render once certificate info is obtained
  const renderCanvasCertificate = async (certNum, participantName, eventName) => {
    setRenderingCanvas(true);
    try {
      const dataUrl = await generateCertificate({
        name: participantName,
        eventName: eventName,
        certificateNumber: certNum,
      });
      setCertificateDataUrl(dataUrl);
    } catch (err) {
      console.error('Failed to generate canvas certificate:', err);
    } finally {
      setRenderingCanvas(false);
    }
  };

  // 2. Handle form submission
  const handleSubmitClaim = async (e) => {
    if (e && e.preventDefault) e.preventDefault();

    const trimmedName = name.trim();
    if (!trimmedName) return;

    setSubmitting(true);
    setClaimError(null);

    try {
      const deviceToken = getDeviceToken();
      const response = await claimCertificate(eventId, {
        name: trimmedName,
        device_token: deviceToken,
      });

      // Handle claim result (Backend returns 200/201 with ClaimResponse)
      setClaimResult(response);

      const targetCertNum = response.certificate_number;
      const targetName = response.name || trimmedName;
      const targetEventName = response.event_name || eventInfo?.name || 'ACM Event';

      // Trigger Canvas render
      await renderCanvasCertificate(targetCertNum, targetName, targetEventName);

      // Trigger festive celebration if new claim
      if (!response.already_claimed) {
        try {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
          });
        } catch {
          // ignore if confetti fails
        }
      }
    } catch (err) {
      console.error('Claim error:', err);
      if (err.status === 409 || err.data?.already_claimed) {
        // Handle 409 duplicate status
        const duplicateData = err.data || {};
        setClaimResult({
          certificate_number: duplicateData.certificate_number || 'EXISTING-CERT',
          name: duplicateData.name || trimmedName,
          event_name: duplicateData.event_name || eventInfo?.name || 'ACM Event',
          already_claimed: true,
          message: err.message || "You've already claimed a certificate for this event.",
        });

        if (duplicateData.certificate_number) {
          renderCanvasCertificate(
            duplicateData.certificate_number,
            duplicateData.name || trimmedName,
            duplicateData.event_name || eventInfo?.name || 'ACM Event'
          );
        }
      } else {
        setClaimError(err.message || 'Failed to claim certificate. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownload = () => {
    if (!certificateDataUrl) return;
    const certNum = claimResult?.certificate_number || 'Certificate';
    const filename = `${certNum.replace(/\s+/g, '_')}_ACM.png`;
    downloadCertificate(certificateDataUrl, filename);
  };

  // State A: Loading event details
  if (loadingEvent) {
    return (
      <div className="claim-page-container center-content">
        <div className="loading-card glass-card">
          <RefreshCw className="spinner primary-spinner" size={40} />
          <h3>Validating Event Details</h3>
          <p>Connecting to ACM Certificate Registry...</p>
        </div>
      </div>
    );
  }

  // State B: Event 404 or inactive
  if (eventError || !eventInfo?.active) {
    return (
      <div className="claim-page-container center-content">
        <div className="error-card glass-card">
          <AlertTriangle className="error-hero-icon" size={48} />
          <h2>This Event is Not Available</h2>
          <p className="error-message-text">
            {eventError?.status === 404
              ? `Event ID "${eventId}" was not found.`
              : eventInfo && !eventInfo.active
              ? `Claims for "${eventInfo.name}" are currently closed or inactive.`
              : eventError?.message || 'Unable to access claim page for this event.'}
          </p>
          <div className="error-actions">
            <Link to="/dashboard" className="btn btn-secondary">
              <ArrowLeft size={18} />
              <span>Back to Dashboard</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="claim-page-container">
      <div className="claim-wrapper">
        {/* Event Header Banner */}
        <header className="claim-header glass-card">
          <div className="acm-badge">
            <img src="/acm_amtics_logo.png" alt="ACM Logo" className="badge-logo-img" />
            <span>Official ACM Certificate Portal</span>
          </div>
          <h1 className="claim-title">{eventInfo.name}</h1>
          <p className="claim-subtitle">
            {eventInfo.description || 'Enter your details below to generate your verified certificate.'}
          </p>
        </header>

        {/* State C: Success or Duplicate Claimed View */}
        {claimResult ? (
          <div className="claim-success-card glass-card">
            {claimResult.already_claimed ? (
              <div className="duplicate-alert-banner">
                <AlertCircle size={22} className="alert-icon" />
                <div>
                  <h4>Certificate Already Claimed</h4>
                  <p>You have already claimed a certificate for this event using this device.</p>
                </div>
              </div>
            ) : (
              <div className="success-alert-banner">
                <CheckCircle2 size={24} className="success-icon" />
                <div>
                  <h4>Certificate Successfully Generated!</h4>
                  <p>Congratulations, your official certificate has been issued.</p>
                </div>
              </div>
            )}

            <div className="cert-summary-grid">
              <div className="summary-item">
                <span className="summary-label">Issued To</span>
                <span className="summary-value font-bold">{claimResult.name}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Certificate Number</span>
                <span className="cert-code-tag">{claimResult.certificate_number}</span>
              </div>
            </div>

            {/* Live Canvas Certificate Preview */}
            <div className="canvas-preview-section">
              <h4 className="preview-heading">Certificate Preview</h4>
              {renderingCanvas ? (
                <div className="rendering-placeholder">
                  <RefreshCw className="spinner" size={28} />
                  <span>Rendering official canvas certificate...</span>
                </div>
              ) : certificateDataUrl ? (
                <div className="canvas-image-frame">
                  <img
                    src={certificateDataUrl}
                    alt="Official ACM Certificate"
                    className="canvas-rendered-img"
                  />
                </div>
              ) : (
                <div className="rendering-placeholder">
                  <span>Unable to render certificate canvas.</span>
                </div>
              )}
            </div>

            <div className="claim-actions">
              <button
                onClick={handleDownload}
                className="btn btn-primary btn-lg btn-download"
                disabled={!certificateDataUrl}
              >
                <Download size={20} />
                <span>Download PNG Certificate</span>
              </button>

              {claimResult.already_claimed && (
                <button
                  onClick={() => {
                    setClaimResult(null);
                    setCertificateDataUrl(null);
                  }}
                  className="btn btn-secondary"
                >
                  <Sparkles size={16} />
                  <span>Claim Again / Re-enter Name</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          /* State D: Initial Claim Form */
          <div className="claim-form-card glass-card">
            <CertificateForm
              name={name}
              onChangeName={setName}
              onSubmit={handleSubmitClaim}
              isLoading={submitting}
              error={claimError}
            />
          </div>
        )}
      </div>
    </div>
  );
}
