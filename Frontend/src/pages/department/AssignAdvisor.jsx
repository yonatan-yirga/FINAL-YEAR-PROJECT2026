/**
 * Assign Advisor Page
 * Interface for assigning advisors to students
 */
import React, { useState, useEffect } from 'react';
import Header from '../../components/common/Header';
import ConfirmModal from '../../components/common/ConfirmModal';
import departmentService from '../../services/departmentService';

const AssignAdvisor = () => {
  const [unassignedStudents, setUnassignedStudents] = useState([]);
  const [advisors, setAdvisors] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedAdvisor, setSelectedAdvisor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

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
      }

      if (advisorsResponse.success) {
        // Sort advisors by workload (least busy first)
        const sortedAdvisors = advisorsResponse.data.sort(
          (a, b) => a.active_students - b.active_students
        );
        setAdvisors(sortedAdvisors);
      }

      setError(null);
    } catch (err) {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

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
                    <p>No students awaiting assignment</p>
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
                <span style={styles.badge}>{advisors.length}</span>
              </div>
              <div style={styles.panelContent}>
                {advisors.length === 0 ? (
                  <div style={styles.emptyState}>
                    <p>No advisors available</p>
                  </div>
                ) : (
                  <div style={styles.list}>
                    {advisors.map((advisor) => (
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
    backgroundColor: '#f7fafc',
  },
  content: {
    padding: '40px',
    maxWidth: '1400px',
    margin: '0 auto',
  },
  successAlert: {
    backgroundColor: '#c6f6d5',
    color: '#22543d',
    padding: '12px 16px',
    borderRadius: '8px',
    marginBottom: '24px',
    border: '1px solid #9ae6b4',
  },
  errorAlert: {
    backgroundColor: '#fed7d7',
    color: '#c53030',
    padding: '12px 16px',
    borderRadius: '8px',
    marginBottom: '24px',
    border: '1px solid #fc8181',
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
  gridContainer: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '24px',
    marginBottom: '24px',
  },
  panel: {
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    overflow: 'hidden',
  },
  panelHeader: {
    padding: '20px',
    borderBottom: '2px solid #e2e8f0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  panelTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#2d3748',
    margin: 0,
  },
  badge: {
    padding: '4px 12px',
    backgroundColor: '#e9d8fd',
    color: '#667eea',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '600',
  },
  panelContent: {
    maxHeight: '500px',
    overflowY: 'auto',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px 20px',
    color: '#cbd5e0',
  },
  list: {
    padding: '12px',
  },
  listItem: {
    padding: '16px',
    marginBottom: '12px',
    border: '2px solid #e2e8f0',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  selectedItem: {
    borderColor: '#667eea',
    backgroundColor: '#edf2f7',
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
    color: '#2d3748',
    margin: 0,
  },
  itemBadge: {
    padding: '2px 8px',
    backgroundColor: '#edf2f7',
    color: '#4a5568',
    borderRadius: '8px',
    fontSize: '11px',
    fontWeight: '600',
  },
  itemText: {
    fontSize: '13px',
    color: '#4a5568',
    margin: '4px 0',
  },
  workloadBar: {
    width: '100%',
    height: '8px',
    backgroundColor: '#e2e8f0',
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
    backgroundColor: 'white',
    padding: '24px',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectionSummary: {
    flex: 1,
  },
  summaryText: {
    fontSize: '14px',
    color: '#2d3748',
    margin: 0,
  },
  instructionText: {
    fontSize: '14px',
    color: '#718096',
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