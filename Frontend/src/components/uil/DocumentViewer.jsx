/**
 * Document Viewer Component
 * Automatically opens PDF documents in new tab
 */
import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import '../../pages/uil/UIL.css';

const DocumentViewer = ({ documentUrl }) => {
  const [blobUrl, setBlobUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const blobUrlRef = useRef(null);

  useEffect(() => {
    if (!documentUrl) {
      setLoading(false);
      setError(true);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(false);

    // Fetch the PDF with the auth token for blob URL
    const token = localStorage.getItem('authToken');
    const headers = token ? { Authorization: `Token ${token}` } : {};

    fetch(documentUrl, { headers })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.blob();
      })
      .then((blob) => {
        if (cancelled) return;
        const url = URL.createObjectURL(blob);
        blobUrlRef.current = url;
        setBlobUrl(url);
        setLoading(false);
      })
      .catch(() => {
        if (!cancelled) {
          setError(true);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
      // Revoke the blob URL when the component unmounts or documentUrl changes
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = null;
      }
    };
  }, [documentUrl]);

  const handleOpenDocument = () => {
    if (blobUrl) {
      window.open(blobUrl, '_blank');
    } else {
      window.open(documentUrl, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="document-viewer">
        <div className="document-info">
          <div className="spinner-large"></div>
          <p>Loading document...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="document-viewer">
        <div className="document-error">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p>Unable to load document</p>
          <button onClick={handleOpenDocument} className="btn-secondary">
            Try Opening Document
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="document-viewer">
      <div className="document-info">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" style={{ color: '#667eea' }}>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h3>Document Ready</h3>
        <p>Click the button below to view the uploaded document.</p>
      </div>
      <div className="document-actions">
        <button onClick={handleOpenDocument} className="btn-primary">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          Open Document
        </button>
      </div>
    </div>
  );
};

DocumentViewer.propTypes = {
  documentUrl: PropTypes.string.isRequired,
};

export default DocumentViewer;