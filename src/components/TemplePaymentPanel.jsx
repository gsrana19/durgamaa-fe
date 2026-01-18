import React, { useState } from 'react';
import { generateUpiLink, copyToClipboard, openUpiPayment } from '../utils/donateHelper';
import { isValidMobile } from '../utils/messagingHelper';
import './TemplePaymentPanel.css';

const TemplePaymentPanel = ({ amount, purpose, donorName = '', donorMobile = '', onPaymentConfirmed }) => {
  const [copySuccess, setCopySuccess] = useState({});
  const [confirmForm, setConfirmForm] = useState({
    amount: amount || '',
    method: 'UPI',
    utr: '',
    name: donorName || '',
    mobile: donorMobile || '',
    purpose: purpose || '',
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

  const handleUpiPay = () => {
    const payAmount = amount || confirmForm.amount;
    if (!payAmount || parseFloat(payAmount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    const note = purpose || confirmForm.purpose || 'Payment';
    const upiLink = generateUpiLink(UPI_ID, PAYEE_NAME, payAmount, note);
    
    try {
      openUpiPayment(upiLink);
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

    if (!confirmForm.mobile || !isValidMobile(confirmForm.mobile)) {
      setSubmitError('Please enter a valid mobile number');
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

      const paymentData = {
        amount: parseFloat(confirmForm.amount),
        method: confirmForm.method,
        utr: confirmForm.utr.trim(),
        name: confirmForm.name || null,
        mobile: cleanMobile, // Send only 10 digits to backend
        purpose: confirmForm.purpose || purpose || 'Payment',
        message: confirmForm.message || null,
      };

      // Try backend API first (use existing donation-confirmations endpoint), fallback to localStorage
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8081/api'}/donation-confirmations`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            amount: paymentData.amount,
            method: paymentData.method,
            utr: paymentData.utr,
            name: paymentData.name,
            mobile: paymentData.mobile,
            message: paymentData.message || null,
            purpose: paymentData.purpose || 'Payment'
          }),
        });

        if (response.ok) {
          setSubmitSuccess(true);
          // Call callback if provided (for SevaBooking)
          if (onPaymentConfirmed) {
            setTimeout(() => {
              onPaymentConfirmed();
            }, 1000);
          }
        } else {
          throw new Error('Backend not available');
        }
      } catch (apiError) {
        console.warn('Backend not available, storing in localStorage:', apiError);
        const payments = JSON.parse(localStorage.getItem('pendingPayments') || '[]');
        payments.push({
          ...paymentData,
          id: Date.now(),
          timestamp: new Date().toISOString(),
          status: 'PENDING'
        });
        localStorage.setItem('pendingPayments', JSON.stringify(payments));
        setSubmitSuccess(true);
        // Call callback if provided (for SevaBooking)
        if (onPaymentConfirmed) {
          setTimeout(() => {
            onPaymentConfirmed();
          }, 1000);
        }
      }

      // Reset form
      setConfirmForm({
        amount: amount || '',
        method: 'UPI',
        utr: '',
        name: donorName || '',
        mobile: donorMobile || '',
        purpose: purpose || '',
        message: ''
      });
    } catch (error) {
      console.error('Error submitting payment:', error);
      setSubmitError('Failed to submit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="temple-payment-panel">
      {/* Disclaimer */}
      <div className="payment-disclaimer">
        <p>⚠️ <strong>Note:</strong> Payment is verified manually. Please submit UTR/Transaction ID after paying.</p>
      </div>

      {/* UPI Section */}
      <section className="payment-section">
        <h3 className="section-title">💳 Pay via UPI</h3>
        
        <div className="amount-display">
          {amount ? (
            <div className="amount-value">
              <label>Amount:</label>
              <span className="amount-text">₹{parseFloat(amount).toLocaleString('en-IN')}</span>
            </div>
          ) : (
            <div className="form-group">
              <label>Amount (₹) <span className="required">*</span></label>
              <input
                type="number"
                value={confirmForm.amount}
                onChange={(e) => setConfirmForm({ ...confirmForm, amount: e.target.value })}
                placeholder="Enter amount"
                min="1"
                step="0.01"
                className="form-input"
                required
              />
            </div>
          )}
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
                    placeholder.style.display = 'flex';
                  }
                }}
              />
              <div className="qr-placeholder" style={{ display: 'none' }}>
                <p>📱 QR Code</p>
                <p className="qr-note">Add QR image at /assets/upi_qr.png</p>
              </div>
            </div>
          </div>

          <div className="payee-info">
            <label>Payee Name:</label>
            <span>{PAYEE_NAME}</span>
          </div>
        </div>

        <button
          className="btn btn-upi"
          onClick={handleUpiPay}
        >
          Pay via UPI App
        </button>
      </section>

      {/* Bank Transfer Section */}
      <section className="payment-section">
        <h3 className="section-title">🏦 Bank Transfer</h3>
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
        </div>
      </section>

      {/* Manual Confirmation Section */}
      <section className="payment-section">
        <h3 className="section-title">✅ Payment Confirmation</h3>
        <p className="section-subtitle">I've Paid - Submit your payment details</p>

        {submitSuccess && (
          <div className="success-message">
            ✅ Thank you. Your payment confirmation is submitted and will be verified manually.
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
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label>Payment Method <span className="required">*</span></label>
            <select
              value={confirmForm.method}
              onChange={(e) => setConfirmForm({ ...confirmForm, method: e.target.value })}
              className="form-input"
              required
            >
              <option value="UPI">UPI</option>
              <option value="BANK">Bank Transfer</option>
            </select>
          </div>

          <div className="form-group">
            <label>UTR / Transaction ID <span className="required">*</span></label>
            <input
              type="text"
              value={confirmForm.utr}
              onChange={(e) => setConfirmForm({ ...confirmForm, utr: e.target.value })}
              placeholder="Enter UTR or Transaction ID"
              className="form-input"
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
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label>Mobile <span className="required">*</span></label>
            <input
              type="tel"
              value={confirmForm.mobile}
              onChange={(e) => setConfirmForm({ ...confirmForm, mobile: e.target.value })}
              placeholder="Your mobile number (e.g., 9876543210)"
              pattern="[6-9]\d{9}"
              title="Please enter a valid 10-digit Indian mobile number (starts with 6-9)"
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label>Purpose</label>
            <input
              type="text"
              value={confirmForm.purpose}
              readOnly
              className="form-input form-input-readonly"
            />
          </div>

          <div className="form-group">
            <label>Message (Optional)</label>
            <textarea
              value={confirmForm.message}
              onChange={(e) => setConfirmForm({ ...confirmForm, message: e.target.value })}
              placeholder="Your message or prayer"
              rows="3"
              className="form-input"
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
    </div>
  );
};

export default TemplePaymentPanel;

