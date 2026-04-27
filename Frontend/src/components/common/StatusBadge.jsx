/**
 * StatusBadge Component
 */
import React from 'react';
import PropTypes from 'prop-types';
import './StatusBadge.css';

const StatusBadge = ({ status }) => {
  const getBadgeClass = () => {
    switch (status) {
      case 'PENDING':
        return 'status-badge status-pending';
      case 'ACCEPTED':
        return 'status-badge status-accepted';
      case 'REJECTED':
        return 'status-badge status-rejected';
      case 'OPEN':
        return 'status-badge status-open';
      case 'CLOSED':
        return 'status-badge status-closed';
      case 'FILLED':
        return 'status-badge status-filled';
      default:
        return 'status-badge';
    }
  };

  const getBadgeText = () => {
    switch (status) {
      case 'PENDING':
        return 'Pending';
      case 'ACCEPTED':
        return 'Accepted';
      case 'REJECTED':
        return 'Rejected';
      case 'OPEN':
        return 'Open';
      case 'CLOSED':
        return 'Closed';
      case 'FILLED':
        return 'Filled';
      default:
        return status;
    }
  };

  return <span className={getBadgeClass()}>{getBadgeText()}</span>;
};

StatusBadge.propTypes = {
  status: PropTypes.string.isRequired,
};

export default StatusBadge;