import React, { useState } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { generateUpiLink, generateAppSpecificUpiLink, copyToClipboard, openUpiPayment, formatAmount } from '../utils/donateHelper';
import { confirmDonation } from '../services/api';
import './Donate.css';

const Donate = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('upi'); // 'upi', 'bank', 'confirm'
  const [upiAmount, setUpiAmount] = useState('');
  const [upiName, setUpiName] = useState('');
  const [upiMobile, setUpiMobile] = useState('');
  const [upiMessage, setUpiMessage] = useState('');
  const [selectedUpiApp, setSelectedUpiApp] = useState('any'); // 'phonepe', 'gpay', 'paytm', 'bhim', 'any'
  const [copySuccess, setCopySuccess] = useState({});
  const [confirmForm, setConfirmForm] = useState({
    amount: '',
    method: 'UPI',
    utr: '',
    name: '',
    mobile: '',
    message: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const UPI_ID = 'boism-9931690581@boi';
  const PAYEE_NAME = 'Durga Maa Temple';
  const BANK_ACCOUNT = '498010110017772';
  const BANK_IFSC = 'BKID0004980';
  const BANK_NAME = 'BANK OF INDIA';
  const BANK_BRANCH = 'MAMGURA';

  const handleCopy = async (text, key) => {
    const success = await copyToClipboard(text);
    if (success) {
      setCopySuccess({ ...copySuccess, [key]: true });
      setTimeout(() => {
        setCopySuccess({ ...copySuccess, [key]: false });
      }, 2000);
    }
  };

  const handleUpiPay = (app = selectedUpiApp) => {
    if (!upiAmount || parseFloat(upiAmount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    const note = upiName || upiMobile 
      ? `Donation - ${upiName || upiMobile}` 
      : 'Donation';
    
    // Generate app-specific UPI link
    const upiLink = generateAppSpecificUpiLink(app, UPI_ID, PAYEE_NAME, upiAmount, note);
    
    try {
      openUpiPayment(upiLink, app);
      
      // Show instructions if UPI app doesn't open (best effort)
      setTimeout(() => {
        // This is just a fallback message - we can't reliably detect if app opened
      }, 1000);
    } catch (error) {
      alert('Unable to open UPI app. Please scan the QR code or copy the UPI ID manually.');
    }
  };

  const handleConfirmSubmit = async (e) => {
    e.preventDefault();
    
    if (!confirmForm.amount || parseFloat(confirmForm.amount) <= 0) {
      setSubmitError('Please enter a valid amount');
      return;
    }
    
    if (!confirmForm.utr || confirmForm.utr.trim() === '') {
      setSubmitError('Please enter UTR/Transaction ID');
      return;
    }
    
    if (!confirmForm.mobile || confirmForm.mobile.trim() === '') {
      setSubmitError('Please enter your mobile number');
      return;
    }
    
    // Validate mobile number format (10 digits starting with 6-9)
    const mobilePattern = /^[6-9]\d{9}$/;
    const cleanMobile = confirmForm.mobile.replace(/[^\d]/g, '');
    if (!mobilePattern.test(cleanMobile)) {
      setSubmitError('Please enter a valid 10-digit mobile number');
      return;
    }

    setSubmitting(true);
    setSubmitError('');
    setSubmitSuccess(false);

    try {
      // Clean mobile number - backend expects exactly 10 digits (no country code)
      let cleanMobile = confirmForm.mobile.replace(/[^\d]/g, '');
      // Remove country code (91) if present
      if (cleanMobile.length === 12 && cleanMobile.startsWith('91')) {
        cleanMobile = cleanMobile.substring(2);
      }
      // Ensure it's exactly 10 digits
      if (cleanMobile.length !== 10) {
        setSubmitError('Please enter a valid 10-digit mobile number');
        setSubmitting(false);
        return;
      }
      
      // Submit to backend
      const confirmationData = {
        amount: parseFloat(confirmForm.amount),
        method: confirmForm.method,
        utr: confirmForm.utr.trim(),
        name: confirmForm.name || null,
        mobile: cleanMobile, // Send only 10 digits to backend
        message: confirmForm.message || null,
        purpose: 'Donation' // Default purpose for Donate page
      };

      await confirmDonation(confirmationData);
      setSubmitSuccess(true);
      setConfirmForm({
        amount: '',
        method: 'UPI',
        utr: '',
        name: '',
        mobile: '',
        message: ''
      });
    } catch (error) {
      console.error('Error submitting donation:', error);
      // Extract error message from Axios error
      let errorMessage = 'Failed to submit. Please try again.';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 400) {
        errorMessage = 'Invalid data. Please check your mobile number (10 digits) and UTR.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      setSubmitError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="donate-page">
      <section className="donate-hero">
        <div className="donate-hero-content">
          <h1>🙏 Donate to Durga Maa Temple</h1>
          <p>Your contribution helps us serve the community and maintain the temple</p>
        </div>
      </section>

      <div className="donate-container">
        {/* Disclaimer */}
        <div className="donate-disclaimer">
          <p>⚠️ <strong>Note:</strong> No instant confirmation (no payment gateway). We verify UTR and confirm manually.</p>
        </div>

        {/* Tabs */}
        <div className="donate-tabs">
          <button
            className={`tab-button ${activeTab === 'upi' ? 'active' : ''}`}
            onClick={() => setActiveTab('upi')}
          >
            💳 Donate via UPI
          </button>
          <button
            className={`tab-button ${activeTab === 'bank' ? 'active' : ''}`}
            onClick={() => setActiveTab('bank')}
          >
            🏦 Donate via Bank Transfer
          </button>
          <button
            className={`tab-button ${activeTab === 'confirm' ? 'active' : ''}`}
            onClick={() => setActiveTab('confirm')}
          >
            ✅ Payment Confirmation
          </button>
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {/* Donate via UPI Tab */}
          {activeTab === 'upi' && (
          <section className="donate-section">
          <h2>💳 Donate via UPI</h2>
          <div className="donate-form">
            <div className="form-group">
              <label>Amount (₹) <span className="required">*</span></label>
              <input
                type="number"
                value={upiAmount}
                onChange={(e) => setUpiAmount(e.target.value)}
                placeholder="Enter amount"
                min="1"
                step="0.01"
                required
              />
            </div>
            <div className="form-group">
              <label>Name (Optional)</label>
              <input
                type="text"
                value={upiName}
                onChange={(e) => setUpiName(e.target.value)}
                placeholder="Your name"
              />
            </div>
            <div className="form-group">
              <label>Mobile (Optional)</label>
              <input
                type="tel"
                value={upiMobile}
                onChange={(e) => setUpiMobile(e.target.value)}
                placeholder="Your mobile number"
              />
            </div>
            <div className="form-group">
              <label>Message (Optional)</label>
              <textarea
                value={upiMessage}
                onChange={(e) => setUpiMessage(e.target.value)}
                placeholder="Your message or prayer"
                rows="3"
              />
            </div>

            <div className="upi-details">
              <div className="upi-info">
                <label>UPI ID:</label>
                <div className="copy-field">
                  <span className="upi-id">{UPI_ID}</span>
                  <button
                    className="copy-btn"
                    onClick={() => handleCopy(UPI_ID, 'upi')}
                  >
                    {copySuccess.upi ? '✓ Copied' : 'Copy'}
                  </button>
                </div>
              </div>

              <div className="qr-code-container">
                <label>Scan QR Code:</label>
                <div className="qr-code">
                  <img
                    src="/assets/upi_qr.png"
                    alt="UPI QR Code"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      const placeholder = e.target.parentElement.querySelector('.qr-placeholder');
                      if (placeholder) {
                        placeholder.style.display = 'block';
                      }
                    }}
                  />
                  <div className="qr-placeholder" style={{ display: 'none' }}>
                    <p>📱 QR Code</p>
                    <p className="qr-note">Add QR image at /assets/upi_qr.png</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="upi-app-buttons">
              <p className="upi-app-label">Choose your UPI app:</p>
              <div className="upi-app-grid">
                <button 
                  className="btn btn-upi-app" 
                  onClick={() => handleUpiPay('phonepe')}
                  title="Open in PhonePe"
                >
                  <span className="upi-app-icon">📱</span>
                  <span className="upi-app-name">PhonePe</span>
                </button>
                <button 
                  className="btn btn-upi-app" 
                  onClick={() => handleUpiPay('gpay')}
                  title="Open in Google Pay"
                >
                  <span className="upi-app-icon">💳</span>
                  <span className="upi-app-name">Google Pay</span>
                </button>
                <button 
                  className="btn btn-upi-app" 
                  onClick={() => handleUpiPay('paytm')}
                  title="Open in Paytm"
                >
                  <span className="upi-app-icon">💰</span>
                  <span className="upi-app-name">Paytm</span>
                </button>
                <button 
                  className="btn btn-upi-app" 
                  onClick={() => handleUpiPay('bhim')}
                  title="Open in BHIM UPI"
                >
                  <span className="upi-app-icon">🏦</span>
                  <span className="upi-app-name">BHIM</span>
                </button>
                <button 
                  className="btn btn-upi-app btn-upi-any" 
                  onClick={() => handleUpiPay('any')}
                  title="Open any UPI app"
                >
                  <span className="upi-app-icon">📲</span>
                  <span className="upi-app-name">Any UPI App</span>
                </button>
              </div>
            </div>
            <p className="help-text">
              If UPI app doesn't open, scan the QR code above or copy the UPI ID manually.
            </p>
          </div>
        </section>
          )}

          {/* Donate via Bank Transfer Tab */}
          {activeTab === 'bank' && (
          <section className="donate-section">
            <h2>🏦 Donate via Bank Transfer</h2>
            <div className="bank-details">
              <div className="bank-info-item">
                <label>Account Number:</label>
                <div className="copy-field">
                  <span>{BANK_ACCOUNT}</span>
                  <button
                    className="copy-btn"
                    onClick={() => handleCopy(BANK_ACCOUNT, 'account')}
                  >
                    {copySuccess.account ? '✓ Copied' : 'Copy'}
                  </button>
                </div>
              </div>
              <div className="bank-info-item">
                <label>IFSC Code:</label>
                <div className="copy-field">
                  <span>{BANK_IFSC}</span>
                  <button
                    className="copy-btn"
                    onClick={() => handleCopy(BANK_IFSC, 'ifsc')}
                  >
                    {copySuccess.ifsc ? '✓ Copied' : 'Copy'}
                  </button>
                </div>
              </div>
              <div className="bank-info-item">
                <label>Bank:</label>
                <span>{BANK_NAME}</span>
              </div>
              <div className="bank-info-item">
                <label>Branch:</label>
                <span>{BANK_BRANCH}</span>
              </div>
              <div className="bank-note">
                <p>📝 <strong>Note:</strong> After transfer, submit UTR below.</p>
              </div>
            </div>
          </section>
          )}

          {/* Payment Confirmation Tab */}
          {activeTab === 'confirm' && (
          <section className="donate-section">
            <h2>✅ Payment Confirmation (Manual)</h2>
            <p className="section-subtitle">I've Paid - Submit your payment details</p>
          
          {submitSuccess && (
            <div className="success-message">
              ✅ Submitted. Verification pending.
            </div>
          )}

          {submitError && (
            <div className="error-message">
              ❌ {submitError}
            </div>
          )}

          <form className="confirm-form" onSubmit={handleConfirmSubmit}>
            <div className="form-group">
              <label>Amount (₹) <span className="required">*</span></label>
              <input
                type="number"
                value={confirmForm.amount}
                onChange={(e) => setConfirmForm({ ...confirmForm, amount: e.target.value })}
                placeholder="Enter amount"
                min="1"
                step="0.01"
                required
              />
            </div>
            <div className="form-group">
              <label>Payment Method <span className="required">*</span></label>
              <select
                value={confirmForm.method}
                onChange={(e) => setConfirmForm({ ...confirmForm, method: e.target.value })}
                required
              >
                <option value="UPI">UPI</option>
                <option value="Bank Transfer">Bank Transfer</option>
              </select>
            </div>
            <div className="form-group">
              <label>UTR / Transaction ID <span className="required">*</span></label>
              <input
                type="text"
                value={confirmForm.utr}
                onChange={(e) => setConfirmForm({ ...confirmForm, utr: e.target.value })}
                placeholder="Enter UTR or Transaction ID"
                required
              />
            </div>
            <div className="form-group">
              <label>Name (Optional)</label>
              <input
                type="text"
                value={confirmForm.name}
                onChange={(e) => setConfirmForm({ ...confirmForm, name: e.target.value })}
                placeholder="Your name"
              />
            </div>
            <div className="form-group">
              <label>Mobile <span className="required">*</span></label>
              <input
                type="tel"
                value={confirmForm.mobile}
                onChange={(e) => setConfirmForm({ ...confirmForm, mobile: e.target.value })}
                placeholder="Your mobile number (10 digits)"
                required
                pattern="[6-9][0-9]{9}"
                title="Enter a valid 10-digit mobile number"
              />
              <small className="help-text">Required for verification and notifications</small>
            </div>
            <div className="form-group">
              <label>Message (Optional)</label>
              <textarea
                value={confirmForm.message}
                onChange={(e) => setConfirmForm({ ...confirmForm, message: e.target.value })}
                placeholder="Your message or prayer"
                rows="3"
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary btn-submit"
              disabled={submitting}
            >
              {submitting ? 'Submitting...' : 'Submit Payment Details'}
            </button>
          </form>
        </section>
          )}
        </div>
      </div>
    </div>
  );
};

export default Donate;

