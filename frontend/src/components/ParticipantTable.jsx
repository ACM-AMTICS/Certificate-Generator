import React from 'react';
import { Award, Calendar, User, Search, FileX, Download } from 'lucide-react';

function formatDate(isoString) {
  if (!isoString) return 'N/A';
  try {
    const date = new Date(isoString);
    return new Intl.DateTimeFormat('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(date);
  } catch {
    return isoString;
  }
}

export default function ParticipantTable({ registrations = [], eventId = 'certificates' }) {
  const [searchTerm, setSearchTerm] = React.useState('');

  const filteredRegistrations = registrations.filter((reg) => {
    const term = searchTerm.toLowerCase();
    return (
      reg.name?.toLowerCase().includes(term) ||
      reg.certificate_number?.toLowerCase().includes(term)
    );
  });

  const handleExportExcel = () => {
    if (!registrations || registrations.length === 0) return;

    const dataToExport = filteredRegistrations.length > 0 ? filteredRegistrations : registrations;
    const headers = ['Participant Name', 'Certificate Number', 'Issued Date'];
    const rows = dataToExport.map((reg) => [
      `"${(reg.name || '').replace(/"/g, '""')}"`,
      `"${(reg.certificate_number || '').replace(/"/g, '""')}"`,
      `"${formatDate(reg.created_at).replace(/"/g, '""')}"`,
    ]);

    // UTF-8 BOM (\uFEFF) ensures Excel automatically recognizes encoding and formats correctly
    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${eventId}_certificates.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return (
    <div className="participant-table-wrapper">
      <div className="table-header-bar">
        <div className="table-title-group">
          <h3 className="table-title">Issued Certificates</h3>
          <span className="badge badge-primary">{registrations.length} Total</span>
        </div>

        {registrations.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <div className="search-input-wrapper">
              <Search size={16} className="search-icon" />
              <input
                type="text"
                placeholder="Filter participant or cert ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>

            <button
              onClick={handleExportExcel}
              className="btn btn-secondary"
              title="Download certificates as Excel file (.csv)"
            >
              <Download size={16} />
              <span>Export Excel</span>
            </button>
          </div>
        )}
      </div>

      {registrations.length === 0 ? (
        <div className="empty-state">
          <FileX size={44} className="empty-icon" />
          <h4>No Participants Yet</h4>
          <p>No certificates have been claimed for this event yet. Share the QR code to get started!</p>
        </div>
      ) : filteredRegistrations.length === 0 ? (
        <div className="empty-state">
          <Search size={40} className="empty-icon" />
          <h4>No Matching Results</h4>
          <p>No certificates found matching "{searchTerm}".</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="participant-table">
            <thead>
              <tr>
                <th>
                  <div className="th-content">
                    <User size={15} />
                    <span>Participant Name</span>
                  </div>
                </th>
                <th>
                  <div className="th-content">
                    <Award size={15} />
                    <span>Certificate Number</span>
                  </div>
                </th>
                <th>
                  <div className="th-content">
                    <Calendar size={15} />
                    <span>Issued Date</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredRegistrations.map((item, idx) => (
                <tr key={item.certificate_number || idx}>
                  <td className="font-semibold name-cell">{item.name}</td>
                  <td>
                    <span className="cert-code-badge">{item.certificate_number}</span>
                  </td>
                  <td className="text-muted text-sm">{formatDate(item.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
