/**
 * Assign Advisor Page
 * Interface for assigning advisors to students
 */
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Header from '../../components/common/Header';
import ConfirmModal from '../../components/common/ConfirmModal';
import departmentService from '../../services/departmentService';

const AssignAdvisor = () => {
  const [searchParams] = useSearchParams();
  const preSelectedStudentId = searchParams.get('studentId');
  
  const [unassignedStudents, setUnassignedStudents] = useState([]);
  const [advisors, setAdvisors] = useState([]);
  const [filteredAdvisors, setFilteredAdvisors] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedAdvisor, setSelectedAdvisor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [availableLocations, setAvailableLocations] = useState([]); // New: list of advisor locations

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [studentsResponse, advisorsResponse] = await Promise.all([
        departmentService.getUnassignedStudents(),
        departmentService.getAdvisors(),
      ]);

      if (studentsResponse.success) {
        setUnassignedStudents(studentsResponse.data);
        
        // Auto-select student if studentId is provided in URL
        if (preSelectedStudentId && studentsResponse.data.length > 0) {
          const studentToSelect = studentsResponse.data.find(
            s => s.student_id === parseInt(preSelectedStudentId)
          );
          if (studentToSelect) {
            setSelectedStudent(studentToSelect);
          }
        }
      }

      if (advisorsResponse.success) {
        // Sort advisors by workload (least busy first)
        const sortedAdvisors = advisorsResponse.data.sort(
          (a, b) => a.active_students - b.active_students
        );
        setAdvisors(sortedAdvisors);
        setFilteredAdvisors(sortedAdvisors);
        
        // Extract unique locations from advisors
        const locations = [...new Set(sortedAdvisors.map(a => a.advising_location).filter(Boolean))].sort();
        setAvailableLocations(locations);
      }

      setError(null);
    } catch (err) {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  // Filter advisors based on search term and location
  useEffect(() => {
    let filtered = advisors;

    if (searchTerm) {
      filtered = filtered.filter(advisor =>
        advisor.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (locationFilter) {
      // Exact match for dropdown selection
      filtered = filtered.filter(advisor =>
        advisor.advising_location === locationFilter
      );
    }

    setFilteredAdvisors(filtered);
  }, [searchTerm, locationFilter, advisors]);

  const handleAssignClick = () => {
    if (!selectedStudent || !selectedAdvisor) {
      setError('Please select both a student and an advisor');
      return;
    }
    setShowConfirmModal(true);
  };

  const handleConfirmAssignment = async () => {
    try {
      setAssigning(true);
      setError(null);

      const response = await departmentService.assignAdvisor({
        application_id: selectedStudent.application_id,
        advisor_id: selectedAdvisor.id,
      });

      if (response.success) {
        setSuccess('Advisor assigned successfully!');
        setSelectedStudent(null);
        setSelectedAdvisor(null);
        setShowConfirmModal(false);
        
        // Refresh data
        await fetchData();

        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(response.error);
        setShowConfirmModal(false);
      }
    } catch (err) {
      setError('Failed to assign advisor');
      setShowConfirmModal(false);
    } finally {
      setAssigning(false);
    }
  };

  return (
    <div style={styles.container}>
      <Header
        title="Assign Advisors"
        subtitle="Assign advisors to students with accepted applications"
      />

      <div style={styles.content}>
        {/* Success Alert */}
        {success && (
          <div style={styles.successAlert}>
            <p>{success}</p>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div style={styles.errorAlert}>
            <p>{error}</p>
          </div>
        )}

        {loading ? (
          <div style={styles.loadingContainer}>
            <div style={styles.spinner}></div>
            <p style={styles.loadingText}>Loading...</p>
          </div>
        ) : (
          <div style={styles.gridContainer}>
            {/* Left Panel - Students */}
            <div style={styles.panel}>
              <div style={styles.panelHeader}>
                <h3 style={styles.panelTitle}>Students Awaiting Assignment</h3>
                <span style={styles.badge}>{unassignedStudents.length}</span>
              </div>
              <div style={styles.panelContent}>
                {unassignedStudents.length === 0 ? (
                  <div style={styles.emptyState}>
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#cbd5e0" strokeWidth="2">
                      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                      <circle cx="8.5" cy="7" r="4" />
                      <line x1="20" y1="8" x2="20" y2="14" />
                      <line x1="23" y1="11" x2="17" y2="11" />
                    </svg>
                    <p style={{ fontWeight: 600, color: '#4a5568', marginTop: '12px' }}>No students awaiting assignment</p>
                    <p style={{ fontSize: '13px', textAlign: 'center', maxWidth: '250px' }}>
                      Ensure companies have accepted students and students have 
                      <strong> accepted their internship offers</strong>.
                    </p>
                  </div>
                ) : (
                  <div style={styles.list}>
                    {unassignedStudents.map((student) => (
                      <div
                        key={student.student_id}
                        style={{
                          ...styles.listItem,
                          ...(selectedStudent?.student_id === student.student_id
                            ? styles.selectedItem
                            : {}),
                        }}
                        onClick={() => setSelectedStudent(student)}
                      >
                        <div style={styles.itemHeader}>
                          <h4 style={styles.itemTitle}>{student.student_name}</h4>
                          <span style={styles.itemBadge}>{student.university_id}</span>
                        </div>
                        <p style={styles.itemText}>
                          <strong>Internship:</strong> {student.internship_title}
                        </p>
                        <p style={styles.itemText}>
                          <strong>Company:</strong> {student.company_name}
                        </p>
                        <p style={styles.itemText}>
                          <strong>Start Date:</strong> {student.start_date}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right Panel - Advisors */}
            <div style={styles.panel}>
              <div style={styles.panelHeader}>
                <h3 style={styles.panelTitle}>Available Advisors</h3>
                <span style={styles.badge}>{filteredAdvisors.length}</span>
              </div>
              
              {/* Search Filters */}
              <div style={styles.searchContainer}>
                <div style={styles.searchBox}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#718096" strokeWidth="2" style={{ marginRight: '8px' }}>
                    <circle cx="11" cy="11" r="8"/>
                    <path d="m21 21-4.35-4.35"/>
                  </svg>
                  <input
                    type="text"
                    placeholder="Search by name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={styles.searchInput}
                  />
                </div>
                <div style={styles.searchBox}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#718096" strokeWidth="2" style={{ marginRight: '8px' }}>
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                  <select
                    value={locationFilter}
                    onChange={(e) => setLocationFilter(e.target.value)}
                    style={{
                      ...styles.searchInput,
                      cursor: 'pointer',
                      paddingRight: '30px',
                      backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 12 12\'%3E%3Cpath fill=\'%23718096\' d=\'M6 9L1 4h10z\'/%3E%3C/svg%3E")',
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 10px center',
                      appearance: 'none'
                    }}
                  >
                    <option value="">All Locations ({advisors.length} advisors)</option>
                    {availableLocations.map(location => {
                      const count = advisors.filter(a => a.advising_location === location).length;
                      return (
                        <option key={location} value={location}>
                          📍 {location} ({count} {count === 1 ? 'advisor' : 'advisors'})
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>
              
              <div style={styles.panelContent}>
                {filteredAdvisors.length === 0 ? (
                  <div style={styles.emptyState}>
                    <p>{searchTerm || locationFilter ? 'No advisors match your search' : 'No advisors available'}</p>
                  </div>
                ) : (
                  <div style={styles.list}>
                    {filteredAdvisors.map((advisor) => (
                      <div
                        key={advisor.id}
                        style={{
                          ...styles.listItem,
                          ...(selectedAdvisor?.id === advisor.id
                            ? styles.selectedItem
                            : {}),
                        }}
                        onClick={() => setSelectedAdvisor(advisor)}
                      >
                        <div style={styles.itemHeader}>
                          <h4 style={styles.itemTitle}>{advisor.full_name}</h4>
                          {advisor.active_students === 0 && (
                            <span style={{ ...styles.itemBadge, backgroundColor: '#c6f6d5', color: '#48bb78' }}>
                              Available
                            </span>
                          )}
                        </div>
                        <p style={styles.itemText}>
                          <strong>Staff ID:</strong> {advisor.staff_id}
                        </p>
                        {advisor.advising_location && (
                          <p style={styles.itemText}>
                            <strong>📍 Location:</strong> {advisor.advising_location}
                          </p>
                        )}
                        <p style={styles.itemText}>
                          <strong>Workload:</strong> {advisor.active_students} active students
                        </p>
                        <div style={styles.workloadBar}>
                          <div
                            style={{
                              ...styles.workloadFill,
                              width: `${Math.min((advisor.active_students / 10) * 100, 100)}%`,
                              backgroundColor:
                                advisor.active_students > 8
                                  ? '#f56565'
                                  : advisor.active_students > 5
                                  ? '#ed8936'
                                  : '#48bb78',
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Assignment Button */}
        {!loading && (
          <div style={styles.assignmentSection}>
            {selectedStudent && selectedAdvisor ? (
              <div style={styles.selectionSummary}>
                <p style={styles.summaryText}>
                  <strong>Assigning:</strong> {selectedStudent.student_name} →{' '}
                  {selectedAdvisor.full_name}
                </p>
              </div>
            ) : (
              <p style={styles.instructionText}>
                Select a student and an advisor to make an assignment
              </p>
            )}

            <button
              onClick={handleAssignClick}
              disabled={!selectedStudent || !selectedAdvisor}
              style={{
                ...styles.assignButton,
                opacity: !selectedStudent || !selectedAdvisor ? 0.5 : 1,
                cursor: !selectedStudent || !selectedAdvisor ? 'not-allowed' : 'pointer',
              }}
            >
              Assign Advisor
            </button>
          </div>
        )}
      </div>

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={showConfirmModal}
        title="Confirm Advisor Assignment"
        message={`Are you sure you want to assign ${selectedAdvisor?.full_name} as the advisor for ${selectedStudent?.student_name}?`}
        confirmText="Confirm Assignment"
        cancelText="Cancel"
        onConfirm={handleConfirmAssignment}
        onCancel={() => setShowConfirmModal(false)}
        loading={assigning}
      />
    </div>
  );
};

// Styles
const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: 'var(--bg-root)',
    transition: 'var(--transition)',
  },
  content: {
    padding: '24px 32px 60px',
    maxWidth: '1400px',
    margin: '0 auto',
  },
  alert: {
    padding: '16px 20px',
    borderRadius: '8px',
    marginBottom: '24px',
    borderWidth: '1px',
    borderStyle: 'solid',
    fontSize: '14px',
    fontWeight: '500',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '80px 32px',
  },
  spinner: {
    width: '48px',
    height: '48px',
    border: '4px solid var(--border-subtle)',
    borderTopColor: '#667eea',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  loadingText: {
    marginTop: '16px',
    color: 'var(--text-muted)',
    fontSize: '14px',
  },
  gridContainer: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '24px',
    marginBottom: '24px',
  },
  panel: {
    backgroundColor: 'var(--bg-surface)',
    borderRadius: '12px',
    boxShadow: 'var(--shadow-sm)',
    overflow: 'hidden',
    border: '1px solid var(--border-subtle)',
  },
  panelHeader: {
    padding: '20px',
    borderBottom: '2px solid var(--border-subtle)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  panelTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: 'var(--text-bright)',
    margin: 0,
  },
  badge: {
    padding: '4px 12px',
    backgroundColor: 'rgba(102, 126, 234, 0.15)',
    color: '#667eea',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '600',
  },
  panelContent: {
    maxHeight: '500px',
    overflowY: 'auto',
  },
  searchContainer: {
    padding: '16px',
    borderBottom: '1px solid var(--border-subtle)',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  searchBox: {
    display: 'flex',
    alignItems: 'center',
    padding: '10px 12px',
    border: '1px solid var(--border-subtle)',
    borderRadius: '8px',
    backgroundColor: 'var(--bg-root)',
    transition: 'all 0.2s',
  },
  searchInput: {
    flex: 1,
    border: 'none',
    outline: 'none',
    backgroundColor: 'transparent',
    fontSize: '14px',
    color: 'var(--text-main)',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px 20px',
    color: 'var(--text-muted)',
  },
  list: {
    padding: '12px',
  },
  listItem: {
    padding: '16px',
    marginBottom: '12px',
    borderWidth: '2px',
    borderStyle: 'solid',
    borderColor: 'var(--border-subtle)',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  selectedItem: {
    borderColor: '#667eea',
    backgroundColor: 'rgba(102, 126, 234, 0.05)',
  },
  itemHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
  },
  itemTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: 'var(--text-bright)',
    margin: 0,
  },
  itemBadge: {
    padding: '2px 8px',
    backgroundColor: 'var(--bg-root)',
    color: 'var(--text-main)',
    borderRadius: '8px',
    fontSize: '11px',
    fontWeight: '600',
  },
  itemText: {
    fontSize: '13px',
    color: 'var(--text-main)',
    margin: '4px 0',
  },
  workloadBar: {
    width: '100%',
    height: '8px',
    backgroundColor: 'var(--border-subtle)',
    borderRadius: '4px',
    overflow: 'hidden',
    marginTop: '8px',
  },
  workloadFill: {
    height: '100%',
    borderRadius: '4px',
    transition: 'width 0.3s',
  },
  assignmentSection: {
    backgroundColor: 'var(--bg-surface)',
    padding: '24px',
    borderRadius: '12px',
    boxShadow: 'var(--shadow-sm)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    border: '1px solid var(--border-subtle)',
  },
  selectionSummary: {
    flex: 1,
  },
  summaryText: {
    fontSize: '14px',
    color: 'var(--text-bright)',
    margin: 0,
  },
  instructionText: {
    fontSize: '14px',
    color: 'var(--text-muted)',
    margin: 0,
  },
  assignButton: {
    padding: '12px 32px',
    backgroundColor: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    transition: 'all 0.2s',
  },
};

// Add keyframes for spinner animation
const styleSheet = document.styleSheets[0];
if (styleSheet) {
  try {
    const keyframes = `
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
    `;
    styleSheet.insertRule(keyframes, styleSheet.cssRules.length);
  } catch (e) {
    // Keyframe might already exist, ignore error
    console.log('Spin keyframe already defined');
  }
}

export default AssignAdvisor;