/**
 * Document Viewer Component
 * Displays PDF documents with download option
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

    // Fetch the PDF with the auth token so Django serves it (authenticated endpoint),
    // then convert to a blob: URL. Blob URLs are treated as same-origin by the browser,
    // which bypasses both X-Frame-Options (SAMEORIGIN) and CORS restrictions that would
    // otherwise block the iframe from loading a cross-origin URL (port 8000 vs 5173).
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
      // to release memory.
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = null;
      }
    };
  }, [documentUrl]);

  const handleDownload = () => {
    window.open(documentUrl, '_blank');
  };

  if (loading) {
    return (
      <div className="document-viewer">
        <div className="document-error">
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
          <button onClick={handleDownload} className="btn-secondary">
            Download Document
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="document-viewer">
      <div className="document-preview">
        <iframe
          src={`${blobUrl}#toolbar=0`}
          title="Document Preview"
        />
      </div>
      <div className="document-actions">
        <button onClick={handleDownload} className="btn-download">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Download Document
        </button>
      </div>
    </div>
  );
};

DocumentViewer.propTypes = {
  documentUrl: PropTypes.string.isRequired,
};

export default DocumentViewer;