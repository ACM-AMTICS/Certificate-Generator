import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getEvent, getRegistrations } from '../lib/api';
import ParticipantTable from '../components/ParticipantTable';
import QRModal from '../components/QRModal';
import { QrCode, RefreshCw, Award, Calendar, AlertTriangle, ExternalLink, Sparkles } from 'lucide-react';

export default function Dashboard() {
  const { eventId: routeEventId } = useParams();
  const eventId = routeEventId || import.meta.env.VITE_DEFAULT_EVENT_ID || 'gsoc-2026';

  const [eventData, setEventData] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [totalIssued, setTotalIssued] = useState(0);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const [isQRModalOpen, setIsQRModalOpen] = useState(false);

  const claimUrl = `${window.location.origin}/claim/${eventId}`;

  const fetchDashboardData = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const [eventRes, regRes] = await Promise.all([
        getEvent(eventId),
        getRegistrations(eventId),
      ]);

      setEventData(eventRes);
      setRegistrations(regRes.registrations || []);
      setTotalIssued(regRes.total_issued ?? (regRes.registrations ? regRes.registrations.length : 0));
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [eventId]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  if (loading) {
    return (
      <div className="dashboard-container center-content">
        <div className="loading-card glass-card">
          <RefreshCw className="spinner primary-spinner" size={40} />
          <h3>Loading Dashboard</h3>
          <p>Fetching event details and participant records...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container center-content">
        <div className="error-card glass-card">
          <AlertTriangle className="error-hero-icon" size={48} />
          <h2>Unable to Load Dashboard</h2>
          <p className="error-message-text">{error.message || 'Could not connect to backend service.'}</p>
          {error.status === 404 && (
            <p className="error-subtext">Event ID "<strong>{eventId}</strong>" was not found in the database.</p>
          )}
          <div className="error-actions">
            <button className="btn btn-primary" onClick={() => fetchDashboardData(false)}>
              <RefreshCw size={18} />
              <span>Retry Connection</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Top Banner / Header */}
      <header className="dashboard-header glass-card">
        <div className="header-info">
          <div className="badge-row">
            <span className={`status-badge ${eventData?.active ? 'active' : 'inactive'}`}>
              {eventData?.active ? '• Active Event' : '• Inactive Event'}
            </span>
            <span className="badge badge-secondary">ID: {eventId}</span>
          </div>
          <h1 className="event-heading">{eventData?.name || 'ACM Event'}</h1>
          {eventData?.description && (
            <p className="event-description">{eventData.description}</p>
          )}
          {eventData?.date && (
            <div className="event-meta-item">
              <Calendar size={16} />
              <span>{eventData.date}</span>
            </div>
          )}
        </div>

        <div className="header-actions">
          <button
            className="btn btn-primary btn-lg"
            onClick={() => setIsQRModalOpen(true)}
          >
            <QrCode size={20} />
            <span>Show Claim QR Code</span>
          </button>

          <button
            className="btn btn-secondary"
            onClick={() => fetchDashboardData(true)}
            disabled={refreshing}
            title="Refresh participant table"
          >
            <RefreshCw size={18} className={refreshing ? 'spinner' : ''} />
            <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>
        </div>
      </header>

      {/* Metrics Row */}
      <div className="stats-grid">
        <div className="stat-card glass-card">
          <div className="stat-icon-wrapper blue">
            <Award size={28} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Total Certificates Issued</span>
            <span className="stat-value">{totalIssued}</span>
          </div>
        </div>

        <div className="stat-card glass-card">
          <div className="stat-icon-wrapper gold">
            <Sparkles size={28} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Participant Claim URL</span>
            <Link to={`/claim/${eventId}`} target="_blank" className="claim-url-link">
              <span>Open Claim Page</span>
              <ExternalLink size={14} />
            </Link>
          </div>
        </div>
      </div>

      {/* Participant Table */}
      <main className="dashboard-main glass-card">
        <ParticipantTable registrations={registrations} eventId={eventId} />
      </main>

      {/* QR Modal */}
      <QRModal
        isOpen={isQRModalOpen}
        onClose={() => setIsQRModalOpen(false)}
        claimUrl={claimUrl}
        eventName={eventData?.name}
      />
    </div>
  );
}
