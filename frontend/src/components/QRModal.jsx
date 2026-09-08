import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, Copy, Check, QrCode } from 'lucide-react';

export default function QRModal({ isOpen, onClose, claimUrl, eventName }) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(claimUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy URL:', err);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick} role="dialog" aria-modal="true">
      <div className="modal-content glass-card">
        <div className="modal-header">
          <div className="modal-title-group">
            <QrCode className="modal-icon" size={22} />
            <h3 className="modal-title">Event Claim QR Code</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <p className="modal-description">
            Participants can scan this QR code on their mobile devices to claim their official certificate for{' '}
            <strong>{eventName || 'this event'}</strong>.
          </p>

          <div className="qr-container">
            <QRCodeSVG
              value={claimUrl}
              size={220}
              bgColor="#FFFFFF"
              fgColor="#000000"
              level="H"
              includeMargin={true}
              imageSettings={{
                src: "/acm_amtics_logo.png",
                x: undefined,
                y: undefined,
                height: 32,
                width: 32,
                excavate: true,
              }}
            />
          </div>

          <div className="url-copy-box">
            <input
              type="text"
              readOnly
              value={claimUrl}
              className="url-input"
              onClick={(e) => e.target.select()}
            />
            <button
              onClick={handleCopyUrl}
              className={`btn btn-secondary btn-copy ${copied ? 'copied' : ''}`}
              title="Copy URL to clipboard"
            >
              {copied ? (
                <>
                  <Check size={16} />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy size={16} />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
