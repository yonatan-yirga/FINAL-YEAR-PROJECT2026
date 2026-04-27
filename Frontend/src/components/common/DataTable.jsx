/**
 * DataTable Component
 * Reusable table with sorting, searching, and pagination
 */
import React, { useState } from 'react';
import PropTypes from 'prop-types';

const DataTable = ({
  columns,
  data,
  onRowClick,
  loading,
  emptyMessage = 'No data available',
  searchable = true,
  searchPlaceholder = 'Search...',
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');

  // Filter data based on search
  const filteredData = searchTerm
    ? data.filter((row) =>
        Object.values(row).some((value) =>
          String(value).toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    : data;

  // Sort data
  const sortedData = sortColumn
    ? [...filteredData].sort((a, b) => {
        const aVal = a[sortColumn];
        const bVal = b[sortColumn];
        
        if (aVal === null || aVal === undefined) return 1;
        if (bVal === null || bVal === undefined) return -1;
        
        if (typeof aVal === 'string') {
          return sortDirection === 'asc'
            ? aVal.localeCompare(bVal)
            : bVal.localeCompare(aVal);
        }
        
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
      })
    : filteredData;

  const handleSort = (columnKey) => {
    if (sortColumn === columnKey) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(columnKey);
      setSortDirection('asc');
    }
  };

  const handleRowClick = (row) => {
    if (onRowClick) {
      onRowClick(row);
    }
  };

  return (
    <div style={styles.container}>
      {/* Search Bar */}
      {searchable && (
        <div style={styles.searchContainer}>
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.searchInput}
          />
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#718096"
            strokeWidth="2"
            style={styles.searchIcon}
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
        </div>
      )}

      {/* Table */}
      <div style={styles.tableWrapper}>
        {loading ? (
          <div style={styles.loadingContainer}>
            <div style={styles.spinner}></div>
            <p style={styles.loadingText}>Loading...</p>
          </div>
        ) : sortedData.length === 0 ? (
          <div style={styles.emptyContainer}>
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#cbd5e0"
              strokeWidth="2"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <line x1="9" y1="9" x2="15" y2="9" />
              <line x1="9" y1="15" x2="15" y2="15" />
            </svg>
            <p style={styles.emptyText}>{emptyMessage}</p>
          </div>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.key}
                    style={{
                      ...styles.th,
                      cursor: column.sortable !== false ? 'pointer' : 'default',
                    }}
                    onClick={() => column.sortable !== false && handleSort(column.key)}
                  >
                    <div style={styles.thContent}>
                      {column.label}
                      {column.sortable !== false && sortColumn === column.key && (
                        <span style={styles.sortIcon}>
                          {sortDirection === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sortedData.map((row, index) => (
                <tr
                  key={row.id || index}
                  onClick={() => handleRowClick(row)}
                  style={{
                    ...styles.tr,
                    cursor: onRowClick ? 'pointer' : 'default',
                  }}
                >
                  {columns.map((column) => (
                    <td key={column.key} style={styles.td}>
                      {column.render
                        ? column.render(row[column.key], row)
                        : row[column.key]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Results Info */}
      {!loading && sortedData.length > 0 && (
        <div style={styles.footer}>
          <p style={styles.footerText}>
            Showing {sortedData.length} of {data.length} results
            {searchTerm && ` (filtered from ${data.length})`}
          </p>
        </div>
      )}
    </div>
  );
};

// Styles
const styles = {
  container: {
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    overflow: 'hidden',
  },
  searchContainer: {
    position: 'relative',
    padding: '16px',
    borderBottom: '1px solid #e2e8f0',
  },
  searchInput: {
    width: '100%',
    padding: '10px 40px 10px 12px',
    fontSize: '14px',
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    outline: 'none',
  },
  searchIcon: {
    position: 'absolute',
    right: '28px',
    top: '50%',
    transform: 'translateY(-50%)',
    pointerEvents: 'none',
  },
  tableWrapper: {
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  th: {
    padding: '12px 16px',
    textAlign: 'left',
    fontSize: '12px',
    fontWeight: '600',
    color: '#4a5568',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    backgroundColor: '#f7fafc',
    borderBottom: '2px solid #e2e8f0',
  },
  thContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  sortIcon: {
    fontSize: '16px',
    color: '#667eea',
  },
  tr: {
    borderBottom: '1px solid #f7fafc',
    transition: 'background-color 0.2s',
  },
  td: {
    padding: '16px',
    fontSize: '14px',
    color: '#2d3748',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '64px 32px',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid #e2e8f0',
    borderTopColor: '#667eea',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  loadingText: {
    marginTop: '16px',
    color: '#718096',
    fontSize: '14px',
  },
  emptyContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '64px 32px',
  },
  emptyText: {
    marginTop: '16px',
    color: '#718096',
    fontSize: '14px',
  },
  footer: {
    padding: '12px 16px',
    borderTop: '1px solid #e2e8f0',
    backgroundColor: '#f7fafc',
  },
  footerText: {
    fontSize: '13px',
    color: '#718096',
    margin: 0,
  },
};

// Add keyframes for spinner animation
const styleSheet = document.styleSheets[0];
const keyframes = `
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;
styleSheet.insertRule(keyframes, styleSheet.cssRules.length);

// PropTypes
DataTable.propTypes = {
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      sortable: PropTypes.bool,
      render: PropTypes.func,
    })
  ).isRequired,
  data: PropTypes.array.isRequired,
  onRowClick: PropTypes.func,
  loading: PropTypes.bool,
  emptyMessage: PropTypes.string,
  searchable: PropTypes.bool,
  searchPlaceholder: PropTypes.string,
};

export default DataTable;