/**
 * FileHub Component (FileUpload)
 * High-performance document up-link with drag-drop validation.
 */
import React, { useState, useRef } from 'react';
import PropTypes from 'prop-types';

const FileUpload = ({
  onFileSelect,
  onFileRemove,
  accept = '.pdf',
  maxSize = 5242880,
  label = 'Document Provision',
  required = true,
  error = null,
}) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const fileInputRef = useRef(null);

  const validateFile = (file) => {
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
    const acceptedExtensions = accept.split(',').map(ext => ext.trim().toLowerCase());
    if (!acceptedExtensions.includes(fileExtension)) return `Invalid protocol. Expected ${accept}.`;
    if (file.size > maxSize) return `Data volume exceeds limit of ${(maxSize / (1024 * 1024)).toFixed(0)}MB.`;
    return null;
  };

  const handleFileChange = (file) => {
    if (!file) return;
    const validationError = validateFile(file);
    if (validationError) {
      setUploadError(validationError); setSelectedFile(null); onFileSelect(null);
    } else {
      setUploadError(null); setSelectedFile(file); onFileSelect(file);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault(); e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault(); e.stopPropagation(); setDragActive(false);
    const file = e.dataTransfer.files[0]; handleFileChange(file);
  };

  const handleRemoveFile = () => {
    setSelectedFile(null); setUploadError(null); onFileRemove();
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const displayError = error || uploadError;

  return (
    <div style={{ marginBottom: 24 }}>
      <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>
        {label} {required && <span style={{ color: 'var(--status-error)' }}>*</span>}
      </label>

      {!selectedFile ? (
        <div
          onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          style={{
            border: `2px dashed ${displayError ? 'var(--status-error)' : dragActive ? 'var(--accent-navy)' : 'var(--border-subtle)'}`,
            borderRadius: 16, padding: '32px 24px', textAlign: 'center', cursor: 'pointer', transition: 'var(--transition)',
            background: dragActive ? 'rgba(15,45,94,0.05)' : 'var(--bg-root)',
            position: 'relative', overflow: 'hidden'
          }}
        >
          <input ref={fileInputRef} type="file" accept={accept} onChange={(e) => handleFileChange(e.target.files[0])} style={{ display: 'none' }} />
          
          <div style={{ fontSize: 32, marginBottom: 12, opacity: dragActive ? 1 : 0.4 }}>📤</div>
          <div style={{ fontSize: 14, color: 'var(--text-bright)', fontWeight: 700, marginBottom: 4 }}>
            {dragActive ? 'Drop signal data now' : <><span style={{ color: 'var(--accent-navy)' }}>Click to upload</span> or drag and drop</>}
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>
            {accept} up to {formatFileSize(maxSize)}
          </p>
        </div>
      ) : (
        <div style={{ 
          display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px', background: 'var(--bg-glass)', 
          border: '1px solid var(--accent-navy)', borderRadius: 14, animation: 'cardEnter 0.4s ease-out' 
        }}>
          <div style={{ fontSize: 24 }}>📄</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-bright)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{selectedFile.name}</p>
            <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', margin: 0 }}>{formatFileSize(selectedFile.size)} <span style={{ color: 'var(--status-success)', marginLeft: 8 }}>Ready for Uplink</span></p>
          </div>
          <button
            type="button" onClick={handleRemoveFile}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 18, padding: 8 }}
          >✕</button>
        </div>
      )}

      {displayError && (
        <div style={{ marginTop: 8, fontSize: 12, color: 'var(--status-error)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
          <span>⚠️</span> {displayError}
        </div>
      )}
    </div>
  );
};

FileUpload.propTypes = {
  onFileSelect: PropTypes.func.isRequired,
  onFileRemove: PropTypes.func.isRequired,
  accept: PropTypes.string,
  maxSize: PropTypes.number,
  label: PropTypes.string,
  required: PropTypes.bool,
  error: PropTypes.string,
};

export default FileUpload;