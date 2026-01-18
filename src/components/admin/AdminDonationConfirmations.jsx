import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDonationConfirmations, verifyDonationConfirmation, rejectDonationConfirmation, logout } from '../../services/api';
import { 
  buildWhatsAppUrl, 
  buildSmsUrl, 
  copyToClipboard, 
  formatWhatsAppMessage, 
  formatSmsMessage,
  isValidMobile 
} from '../../utils/messagingHelper';
import './AdminDonationConfirmations.css';

const AdminDonationConfirmations = () => {
  const navigate = useNavigate();
  const [confirmations, setConfirmations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('PENDING'); // PENDING, VERIFIED, REJECTED
  const [selectedConfirmation, setSelectedConfirmation] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [actionType, setActionType] = useState(''); // 'verify' or 'reject'
  const [adminNote, setAdminNote] = useState('');
  const [processing, setProcessing] = useState(false);
  const [actionCompleted, setActionCompleted] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [screenshotModalOpen, setScreenshotModalOpen] = useState(false);
  const [screenshotUrl, setScreenshotUrl] = useState(null);
  
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/admin/login');
    } catch (error) {
      navigate('/admin/login');
    }
  };

  useEffect(() => {
    loadConfirmations();
  }, [activeTab]);

  const loadConfirmations = async () => {
    try {
      setLoading(true);
      const data = await getDonationConfirmations(activeTab);
      setConfirmations(data);
    } catch (error) {
      console.error('Error loading confirmations:', error);
      setConfirmations([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = (confirmation, type) => {
    setSelectedConfirmation(confirmation);
    setActionType(type);
    setAdminNote('');
    setActionCompleted(false);
    setShowModal(true);
  };

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleSubmitAction = async () => {
    if (!selectedConfirmation) return;

    // Validate admin note is required
    if (!adminNote || adminNote.trim() === '') {
      alert('Admin Note is required. Please add a note before verifying or rejecting.');
      return;
    }

    setProcessing(true);
    try {
      let updatedConfirmation;
      if (actionType === 'verify') {
        updatedConfirmation = await verifyDonationConfirmation(selectedConfirmation.id, adminNote);
      } else if (actionType === 'reject') {
        updatedConfirmation = await rejectDonationConfirmation(selectedConfirmation.id, adminNote);
      }
      
      // Update selected confirmation with latest data
      if (updatedConfirmation) {
        setSelectedConfirmation(updatedConfirmation);
      }
      
      // Show messaging step
      setActionCompleted(true);
      loadConfirmations();
    } catch (error) {
      console.error('Error processing action:', error);
      alert('Failed to process action. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const handleSendWhatsApp = () => {
    if (!selectedConfirmation || !isValidMobile(selectedConfirmation.mobile)) {
      return;
    }
    
    const message = formatWhatsAppMessage(selectedConfirmation, actionType === 'verify' ? 'VERIFIED' : 'REJECTED', adminNote);
    const whatsappUrl = buildWhatsAppUrl(selectedConfirmation.mobile, message);
    
    if (whatsappUrl) {
      showToast('Opening WhatsApp…');
      window.location.href = whatsappUrl;
    }
  };

  const handleSendSms = () => {
    if (!selectedConfirmation || !isValidMobile(selectedConfirmation.mobile)) {
      return;
    }
    
    const message = formatSmsMessage(selectedConfirmation, actionType === 'verify' ? 'VERIFIED' : 'REJECTED', adminNote);
    const smsUrl = buildSmsUrl(selectedConfirmation.mobile, message);
    
    if (smsUrl) {
      showToast('Opening SMS…');
      window.location.href = smsUrl;
    }
  };

  const handleCopyMessage = async () => {
    if (!selectedConfirmation) {
      return;
    }
    
    const message = formatWhatsAppMessage(selectedConfirmation, actionType === 'verify' ? 'VERIFIED' : 'REJECTED', adminNote);
    const success = await copyToClipboard(message);
    
    if (success) {
      showToast('Message copied');
    } else {
      showToast('Failed to copy message');
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedConfirmation(null);
    setActionCompleted(false);
    setAdminNote('');
    setActionType('');
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="admin-confirmations">
      {/* Header - Responsive */}
      <div className="bg-saffron-600 text-white p-4">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-xl md:text-2xl font-bold">Donation Confirmations</h1>
              <p className="text-sm md:text-base text-saffron-100 mt-1">
                Verify donations by checking UTR/Transaction ID in bank/UPI records
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => navigate('/admin/dashboard')}
                className="px-3 md:px-4 py-2 bg-white text-saffron-600 rounded hover:bg-gray-100 text-sm md:text-base"
              >
                Dashboard
              </button>
              <button
                onClick={() => navigate('/admin/donations')}
                className="px-3 md:px-4 py-2 bg-white text-saffron-600 rounded hover:bg-gray-100 text-sm md:text-base"
              >
                Donations
              </button>
              <button
                onClick={() => navigate('/admin/updates')}
                className="px-3 md:px-4 py-2 bg-white text-saffron-600 rounded hover:bg-gray-100 text-sm md:text-base"
              >
                Updates
              </button>
              <button
                onClick={() => navigate('/admin/expenses')}
                className="px-3 md:px-4 py-2 bg-white text-saffron-600 rounded hover:bg-gray-100 text-sm md:text-base"
              >
                Expenses
              </button>
              <button
                onClick={handleLogout}
                className="px-3 md:px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 text-sm md:text-base"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">

      {/* Tabs */}
      <div className="confirmations-tabs">
        <button
          className={`tab-btn ${activeTab === 'PENDING' ? 'active' : ''}`}
          onClick={() => setActiveTab('PENDING')}
        >
          Pending
        </button>
        <button
          className={`tab-btn ${activeTab === 'VERIFIED' ? 'active' : ''}`}
          onClick={() => setActiveTab('VERIFIED')}
        >
          Verified
        </button>
        <button
          className={`tab-btn ${activeTab === 'REJECTED' ? 'active' : ''}`}
          onClick={() => setActiveTab('REJECTED')}
        >
          Rejected
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <div className="loading">Loading...</div>
      ) : confirmations.length === 0 ? (
        <div className="no-data">No {activeTab.toLowerCase()} confirmations found</div>
      ) : (
        <div className="confirmations-table-container">
          <table className="confirmations-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Name</th>
                <th>Mobile</th>
                <th>Amount</th>
                <th>Purpose</th>
                <th>Method</th>
                <th>UTR/Transaction ID / Screenshot</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {confirmations.map((confirmation) => (
                <tr key={confirmation.id}>
                  <td>{formatDate(confirmation.createdAt)}</td>
                  <td>{confirmation.name || 'N/A'}</td>
                  <td>{confirmation.mobile || 'N/A'}</td>
                  <td className="amount-cell">{formatAmount(confirmation.amount)}</td>
                  <td>
                    <span className={confirmation.purpose && confirmation.purpose.includes('Seva Booking') ? 'purpose-seva' : 'purpose-donation'}>
                      {confirmation.purpose || 'Donation'}
                    </span>
                  </td>
                  <td>{confirmation.method}</td>
                  <td className="utr-cell">
                    {confirmation.utr ? (
                      <code>{confirmation.utr}</code>
                    ) : (
                      <span className="no-utr">N/A</span>
                    )}
                    {confirmation.transactionScreenshot && (
                      <div className="screenshot-link" style={{ marginTop: '4px' }}>
                        <button
                          onClick={() => {
                            const fullUrl = `${process.env.REACT_APP_API_URL ? process.env.REACT_APP_API_URL.replace('/api', '') : 'http://localhost:8081'}${confirmation.transactionScreenshot}`;
                            setScreenshotUrl(fullUrl);
                            setScreenshotModalOpen(true);
                          }}
                          className="view-screenshot-btn"
                        >
                          📷 View Screenshot
                        </button>
                      </div>
                    )}
                  </td>
                  <td>
                    <span className={`status-badge status-${confirmation.status.toLowerCase()}`}>
                      {confirmation.status}
                    </span>
                  </td>
                  <td>
                    {confirmation.status === 'PENDING' && (
                      <div className="action-buttons">
                        <button
                          className="btn-verify"
                          onClick={() => handleAction(confirmation, 'verify')}
                        >
                          ✓ Verify
                        </button>
                        <button
                          className="btn-reject"
                          onClick={() => handleAction(confirmation, 'reject')}
                        >
                          ✗ Reject
                        </button>
                      </div>
                    )}
                    {confirmation.status !== 'PENDING' && (
                      <div className="verified-info">
                        <div className="verified-by">
                          By: {confirmation.verifiedBy || 'N/A'}
                        </div>
                        <div className="verified-at">
                          {formatDate(confirmation.verifiedAt)}
                        </div>
                        {confirmation.adminNote && (
                          <div className="admin-note">
                            Note: {confirmation.adminNote}
                          </div>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

        {/* Toast Notification */}
        {toastMessage && (
          <div className="toast-notification">
            {toastMessage}
          </div>
        )}

        {/* Modal */}
        {showModal && selectedConfirmation && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            {!actionCompleted ? (
              <>
                <h2>
                  {actionType === 'verify' ? 'Verify' : 'Reject'} Donation
                </h2>
                <div className="modal-details">
                  <p><strong>Name:</strong> {selectedConfirmation.name || 'N/A'}</p>
                  <p><strong>Mobile:</strong> {selectedConfirmation.mobile || 'N/A'}</p>
                  <p><strong>Amount:</strong> {formatAmount(selectedConfirmation.amount)}</p>
                  <p><strong>Purpose:</strong> 
                    <span className={selectedConfirmation.purpose && selectedConfirmation.purpose.includes('Seva Booking') ? 'purpose-seva' : 'purpose-donation'} style={{ marginLeft: '8px' }}>
                      {selectedConfirmation.purpose || 'Donation'}
                    </span>
                  </p>
                  <p><strong>Method:</strong> {selectedConfirmation.method}</p>
                  <p><strong>UTR:</strong> <code>{selectedConfirmation.utr || 'N/A'}</code></p>
                  {selectedConfirmation.transactionScreenshot && (
                    <div style={{ marginTop: '12px' }}>
                      <p><strong>Transaction Screenshot:</strong></p>
                      <div style={{ marginTop: '8px' }}>
                        <button
                          onClick={() => {
                            const fullUrl = `${process.env.REACT_APP_API_URL ? process.env.REACT_APP_API_URL.replace('/api', '') : 'http://localhost:8081'}${selectedConfirmation.transactionScreenshot}`;
                            setScreenshotUrl(fullUrl);
                            setScreenshotModalOpen(true);
                          }}
                          style={{ 
                            display: 'inline-block',
                            padding: '8px 16px',
                            backgroundColor: '#ea580c',
                            color: 'white',
                            borderRadius: '6px',
                            border: 'none',
                            cursor: 'pointer',
                            marginRight: '8px',
                            fontWeight: '600'
                          }}
                        >
                          📷 View Full Size
                        </button>
                        <img 
                          src={`${process.env.REACT_APP_API_URL ? process.env.REACT_APP_API_URL.replace('/api', '') : 'http://localhost:8081'}${selectedConfirmation.transactionScreenshot}`}
                          alt="Transaction Screenshot"
                          style={{
                            maxWidth: '100%',
                            maxHeight: '300px',
                            border: '2px solid #e5e7eb',
                            borderRadius: '8px',
                            marginTop: '8px',
                            cursor: 'pointer'
                          }}
                          onClick={() => {
                            const fullUrl = `${process.env.REACT_APP_API_URL ? process.env.REACT_APP_API_URL.replace('/api', '') : 'http://localhost:8081'}${selectedConfirmation.transactionScreenshot}`;
                            setScreenshotUrl(fullUrl);
                            setScreenshotModalOpen(true);
                          }}
                        />
                      </div>
                    </div>
                  )}
                  {selectedConfirmation.message && (
                    <p><strong>Message:</strong> {selectedConfirmation.message}</p>
                  )}
                </div>
                <div className="modal-form">
                  <label>
                    Admin Note <span className="required">*</span>:
                    <textarea
                      value={adminNote}
                      onChange={(e) => setAdminNote(e.target.value)}
                      placeholder="Add a note about verification (this will be sent to the donor)..."
                      rows="4"
                      required
                    />
                    <small className="help-text">This message will be sent to the donor</small>
                  </label>
                </div>
                <div className="modal-actions">
                  <button
                    className="btn-cancel"
                    onClick={handleCloseModal}
                    disabled={processing}
                  >
                    Cancel
                  </button>
                  <button
                    className={actionType === 'verify' ? 'btn-confirm-verify' : 'btn-confirm-reject'}
                    onClick={handleSubmitAction}
                    disabled={processing || !adminNote.trim()}
                  >
                    {processing ? 'Processing...' : (actionType === 'verify' ? 'Verify' : 'Reject')}
                  </button>
                </div>
              </>
            ) : (
              <>
                <h2>
                  ✅ {actionType === 'verify' ? 'Donation Verified' : 'Donation Rejected'}
                </h2>
                <div className="modal-details">
                  <p><strong>Name:</strong> {selectedConfirmation.name || 'N/A'}</p>
                  <p><strong>Mobile:</strong> {selectedConfirmation.mobile || 'N/A'}</p>
                  <p><strong>Amount:</strong> {formatAmount(selectedConfirmation.amount)}</p>
                  <p><strong>Status:</strong> 
                    <span className={`status-badge status-${selectedConfirmation.status.toLowerCase()}`}>
                      {selectedConfirmation.status}
                    </span>
                  </p>
                </div>
                
                {isValidMobile(selectedConfirmation.mobile) ? (
                  <div className="messaging-section">
                    <h3>Send Notification to Donor</h3>
                    <p className="messaging-info">Choose how to send the notification:</p>
                    <div className="messaging-buttons">
                      <button
                        className="btn-message btn-whatsapp"
                        onClick={handleSendWhatsApp}
                      >
                        📱 Send WhatsApp
                      </button>
                      <button
                        className="btn-message btn-sms"
                        onClick={handleSendSms}
                      >
                        💬 Send SMS
                      </button>
                      <button
                        className="btn-message btn-copy"
                        onClick={handleCopyMessage}
                      >
                        📋 Copy Message
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="messaging-section">
                    <div className="no-mobile-warning">
                      <p>⚠️ Donor mobile not available</p>
                      <p className="warning-text">Cannot send notification. Mobile number is missing or invalid.</p>
                    </div>
                  </div>
                )}
                
                <div className="modal-actions">
                  <button
                    className="btn-close"
                    onClick={handleCloseModal}
                  >
                    Close
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
        )}

        {/* Screenshot Lightbox Modal */}
        {screenshotModalOpen && screenshotUrl && (
          <div 
            className="screenshot-lightbox-overlay" 
            onClick={() => {
              setScreenshotModalOpen(false);
              setScreenshotUrl(null);
            }}
          >
            <div 
              className="screenshot-lightbox-content" 
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="screenshot-lightbox-close"
                onClick={() => {
                  setScreenshotModalOpen(false);
                  setScreenshotUrl(null);
                }}
                aria-label="Close"
              >
                ×
              </button>
              <img 
                src={screenshotUrl}
                alt="Transaction Screenshot"
                className="screenshot-lightbox-image"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDonationConfirmations;

