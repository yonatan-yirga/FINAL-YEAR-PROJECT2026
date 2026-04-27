/**
 * ConfirmModal Component
 * Reusable confirmation modal
 */
import React from 'react';
import PropTypes from 'prop-types';

const ConfirmModal = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  loading = false,
  danger = false,
}) => {
  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && !loading) {
      onCancel();
    }
  };

  return (
    <div style={styles.overlay} onClick={handleBackdropClick}>
      <div style={styles.modal}>
        {/* Header */}
        <div style={styles.header}>
          <h3 style={styles.title}>{title}</h3>
          {!loading && (
            <button onClick={onCancel} style={styles.closeButton}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>

        {/* Body */}
        <div style={styles.body}>
          <p style={styles.message}>{message}</p>
        </div>

        {/* Footer */}
        <div style={styles.footer}>
          <button
            onClick={onCancel}
            disabled={loading}
            style={{
              ...styles.button,
              ...styles.cancelButton,
              opacity: loading ? 0.5 : 1,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            style={{
              ...styles.button,
              ...(danger ? styles.dangerButton : styles.confirmButton),
              opacity: loading ? 0.7 : 1,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? (
              <div style={styles.loadingContainer}>
                <div style={styles.spinner}></div>
                <span>Processing...</span>
              </div>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// Styles
const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '20px',
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: '12px',
    maxWidth: '500px',
    width: '100%',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    animation: 'slideIn 0.2s ease-out',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 24px',
    borderBottom: '1px solid #e2e8f0',
  },
  title: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#1a202c',
    margin: 0,
  },
  closeButton: {
    background: 'none',
    border: 'none',
    padding: '4px',
    cursor: 'pointer',
    color: '#718096',
    borderRadius: '4px',
    transition: 'all 0.2s',
  },
  body: {
    padding: '24px',
  },
  message: {
    fontSize: '14px',
    color: '#4a5568',
    lineHeight: '1.6',
    margin: 0,
  },
  footer: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    padding: '16px 24px',
    borderTop: '1px solid #e2e8f0',
  },
  button: {
    padding: '10px 20px',
    fontSize: '14px',
    fontWeight: '600',
    borderRadius: '6px',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  cancelButton: {
    backgroundColor: '#f7fafc',
    color: '#4a5568',
  },
  confirmButton: {
    backgroundColor: '#667eea',
    color: 'white',
  },
  dangerButton: {
    backgroundColor: '#f56565',
    color: 'white',
  },
  loadingContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  spinner: {
    width: '16px',
    height: '16px',
    border: '2px solid rgba(255, 255, 255, 0.3)',
    borderTopColor: 'white',
    borderRadius: '50%',
    animation: 'spin 0.6s linear infinite',
  },
};

// Add keyframes for animations
const styleSheet = document.styleSheets[0];
if (styleSheet) {
  try {
    // Insert slideIn animation
    const slideInKeyframes = `
      @keyframes slideIn {
        from {
          opacity: 0;
          transform: translateY(-20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
    `;
    styleSheet.insertRule(slideInKeyframes, styleSheet.cssRules.length);
    
    // Insert spin animation
    const spinKeyframes = `
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
    `;
    styleSheet.insertRule(spinKeyframes, styleSheet.cssRules.length);
  } catch (e) {
    // Keyframes might already exist, ignore error
    console.log('Keyframes already defined');
  }
}

// PropTypes
ConfirmModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  title: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
  confirmText: PropTypes.string,
  cancelText: PropTypes.string,
  onConfirm: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  loading: PropTypes.bool,
  danger: PropTypes.bool,
};

export default ConfirmModal;