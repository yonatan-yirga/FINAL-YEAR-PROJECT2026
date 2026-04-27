/**
 * App Routes Configuration
 * Defines all application routes with authentication and role-based access
 */
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import { NotificationProvider } from '../context/NotificationContext';
import { DepartmentProvider } from '../context/DepartmentContext';
import { ThemeProvider } from '../context/ThemeContext';

// Route Components
import PrivateRoute from './PrivateRoute';
import RoleRoute from './RoleRoute';

// Auth Pages
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';

// Public Pages
import LandingPage from '../pages/public/LandingPage';
import CompanyDetail from '../pages/public/CompanyDetail';

// Dashboard Pages
import {
  StudentDashboard,
  CompanyDashboard,
  AdvisorDashboard,
} from '../pages/Dashboards';
import AdminDashboard from '../pages/admin/AdminDashboard';
import AdminUserList from '../pages/admin/AdminUserList';
import AdminStudentDetail from '../pages/admin/StudentDetail';
import StudentSettings from '../pages/admin/StudentSettings';

// UIL Pages
import UILDashboard from '../pages/uil/UILDashboard';
import PendingRegistrations from '../pages/uil/PendingRegistrations';
import ManageUsers from '../pages/uil/ManageUsers';
import SystemOverview from '../pages/uil/SystemOverview';

// PHASE 2.4: Notification Pages
import NotificationsPage from '../pages/common/NotificationsPage';

// Messaging
import Messages from '../pages/common/MessagesModern';

// PHASE 3.2: Department Head Pages
import DepartmentDashboard from '../pages/department/DepartmentDashboard';
import Students from '../pages/department/Students';
import Advisors from '../pages/department/Advisors';
import AddAdvisor from '../pages/department/AddAdvisor';
import Companies from '../pages/department/Companies';
import AssignAdvisor from '../pages/department/AssignAdvisor';
import AssignCompany from '../pages/department/AssignCompany';
import Reports from '../pages/department/Reports';
import StudentsValidation from '../pages/department/StudentsValidation';
import Escalations from '../pages/department/Escalations';
import DepartmentCycles from '../pages/department/DepartmentCycles';

// Company Pages
import PostInternship from '../pages/company/PostInternship';
import MyInternships from '../pages/company/MyInternships';
import Applications from '../pages/company/Applications';
// PHASE 8: Company report submission
import ReportSubmission from '../pages/company/ReportSubmission';

// Student Pages
import SearchInternships from '../pages/student/SearchInternships';
import MyApplications from '../pages/student/MyApplications';
import InternshipDetail from '../pages/student/InternshipDetail';
import ActiveInternship from '../pages/student/ActiveInternship';
import Profile from '../pages/student/Profile';
import StudentReports from '../pages/student/StudentReports';

// PHASE 6: Advisor Pages
import MyStudents from '../pages/advisor/MyStudents';
import StudentDetail from '../pages/advisor/StudentDetail';
// PHASE 8: Advisor reports page
import AdvisorReports from '../pages/advisor/AdvisorReports';

// Phase 9 — Final Reports
import SubmitFinalReport from '../pages/company/SubmitFinalReport';
import AdvisorFinalReports from '../pages/advisor/AdvisorFinalReports';
import AdvisorEvaluationForm from '../pages/advisor/AdvisorEvaluationForm';
import DepartmentFinalReports from '../pages/department/DepartmentFinalReports';
import StudentFinalSubmission from '../pages/student/StudentFinalSubmission';

// PHASE 10: Certificate Pages
import Congratulations from '../pages/student/Congratulations';
import StudentsCompletion from '../pages/department/StudentsCompletion';
import VerifyCertificate from '../pages/public/VerifyCertificate';
import VerifyLanding      from '../pages/public/VerifyLanding';
import ForgotPassword     from '../pages/auth/ForgotPassword';
import ResetPassword      from '../pages/auth/ResetPassword';
import ChangePassword     from '../pages/settings/ChangePassword';
import Settings           from '../pages/settings/Settings';
import { Satellite } from 'lucide-react';

/**
 * Placeholder components for routes not yet implemented
 */

const NotFound = () => (
  <div style={{
    minHeight: '100vh',
    background: '#0F2D5E',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
    fontFamily: "'Inter', sans-serif"
  }}>
    <div style={{
      maxWidth: '500px', width: '100%',
      background: 'rgba(15, 45, 94, 0.4)',
      borderRadius: '32px', border: '1px solid rgba(255, 255, 255, 0.1)',
      padding: '60px 40px', textAlign: 'center',
      backdropFilter: 'blur(20px)',
      boxShadow: '0 24px 80px rgba(0,0,0,0.4)'
    }}>
      <div style={{
        marginBottom: '32px', filter: 'drop-shadow(0 0 20px rgba(201,168,76,0.3))', display: 'flex', justifyContent: 'center'
      }}>
        <Satellite size={80} color="#C9A84C" strokeWidth={1.5} />
      </div>
      <h1 style={{ color: '#FFFFFF', fontSize: '32px', fontWeight: 800, marginBottom: '16px' }}>
        Node Not Found
      </h1>
      <p style={{ color: '#B0C4DE', fontSize: '16px', lineHeight: 1.6, marginBottom: '40px' }}>
        The coordinates you requested do not map to any active sector in the DMU linkage system.
      </p>
      <a href="/login" style={{
        display: 'inline-block', padding: '16px 40px', background: '#C9A84C',
        color: '#0F2D5E', borderRadius: '16px', textDecoration: 'none',
        fontWeight: 800, fontSize: '15px', textTransform: 'uppercase',
        letterSpacing: '1px', boxShadow: '0 8px 25px rgba(201,168,76,0.3)'
      }}>
        Return to Terminal
      </a>
    </div>
  </div>
);

/**
 * AppRoutes Component
 * Main routing configuration wrapped with AuthProvider, NotificationProvider, and DepartmentProvider
 */

/**
 * StudentCompletionGuard - DISABLED
 * Previously redirected students with certificates to /student/congratulations
 * Now students can access their dashboard and see certificate card there
 * Keeping this code commented for reference
 */
/*
const StudentCompletionGuard = ({ children }) => {
  const [checking, setChecking] = React.useState(true);
  const [hasCert,  setHasCert]  = React.useState(false);

  React.useEffect(() => {
    import('../services/certificateService').then(({ default: certificateService }) => {
      certificateService.getMyCertificate().then(res => {
        setHasCert(!!(res.success && res.data));
      }).catch(() => {
        setHasCert(false);
      }).finally(() => setChecking(false));
    });
  }, []);

  if (checking) return (
    <div style={{ display: 'flex', justifyContent: 'center',
                  alignItems: 'center', height: '100vh', color: '#666' }}>
      Loading…
    </div>
  );

  if (hasCert) {
    return <Navigate to="/student/congratulations" replace />;
  }

  return children;
};
*/

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <NotificationProvider>
            <DepartmentProvider>
              <Routes>
                {/* ... existing routes ... */}
                {/* I will use a simple wrap here, but I need to be careful with the existing content */}
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/company/:id" element={<CompanyDetail />} /> {/* :id is company name */}
              <Route path="/login"                       element={<Login />} />
              <Route path="/register"                    element={<Register />} />
              <Route path="/forgot-password"             element={<ForgotPassword />} />
              <Route path="/reset-password/:token"       element={<ResetPassword />} />
              <Route path="/verify"                      element={<VerifyLanding />} />
              <Route path="/verify-certificate/:code?"   element={<VerifyCertificate />} />

              {/* Settings Routes — all authenticated roles */}
              <Route
                path="/settings"
                element={
                  <PrivateRoute>
                    <Settings />
                  </PrivateRoute>
                }
              />
              <Route
                path="/settings/change-password"
                element={
                  <PrivateRoute>
                    <ChangePassword />
                  </PrivateRoute>
                }
              />

              {/* PHASE 2.4: Notifications Route (All Authenticated Users) */}
              <Route
                path="/notifications"
                element={
                  <PrivateRoute>
                    <NotificationsPage />
                  </PrivateRoute>
                }
              />

              {/* ── Student Routes ── */}
              <Route
                path="/student/dashboard"
                element={
                  <PrivateRoute>
                    <RoleRoute allowedRoles="STUDENT">
                      <StudentDashboard />
                    </RoleRoute>
                  </PrivateRoute>
                }
              />
              <Route
                path="/student/search-internships"
                element={
                  <PrivateRoute>
                    <RoleRoute allowedRoles="STUDENT">
                      <SearchInternships />
                    </RoleRoute>
                  </PrivateRoute>
                }
              />
              <Route
                path="/student/applications"
                element={
                  <PrivateRoute>
                    <RoleRoute allowedRoles="STUDENT">
                      <MyApplications />
                    </RoleRoute>
                  </PrivateRoute>
                }
              />
              <Route
                path="/student/internships/:id"
                element={
                  <PrivateRoute>
                    <RoleRoute allowedRoles="STUDENT">
                      <InternshipDetail />
                    </RoleRoute>
                  </PrivateRoute>
                }
              />
              <Route
                path="/student/active-internship"
                element={
                  <PrivateRoute>
                    <RoleRoute allowedRoles="STUDENT">
                      <ActiveInternship />
                    </RoleRoute>
                  </PrivateRoute>
                }
              />
              <Route
                path="/student/profile"
                element={
                  <PrivateRoute>
                    <RoleRoute allowedRoles="STUDENT">
                      <Profile />
                    </RoleRoute>
                  </PrivateRoute>
                }
              />
              <Route
                path="/student/reports"
                element={
                  <PrivateRoute>
                    <RoleRoute allowedRoles="STUDENT">
                      <StudentReports />
                    </RoleRoute>
                  </PrivateRoute>
                }
              />
              <Route
                path="/student/final-submission"
                element={
                  <PrivateRoute>
                    <RoleRoute allowedRoles="STUDENT">
                      <StudentFinalSubmission />
                    </RoleRoute>
                  </PrivateRoute>
                }
              />

              {/* PHASE 10: Congratulations / Certificate page — terminal state for completed students */}
              <Route
                path="/student/congratulations"
                element={
                  <PrivateRoute>
                    <RoleRoute allowedRoles="STUDENT">
                      <Congratulations />
                    </RoleRoute>
                  </PrivateRoute>
                }
              />
              {/* Alias route for certificates - same as congratulations */}
              <Route
                path="/student/certificates"
                element={
                  <PrivateRoute>
                    <RoleRoute allowedRoles="STUDENT">
                      <Congratulations />
                    </RoleRoute>
                  </PrivateRoute>
                }
              />

              {/* Student Messages */}
              <Route
                path="/student/messages"
                element={
                  <PrivateRoute>
                    <RoleRoute allowedRoles="STUDENT">
                      <Messages />
                    </RoleRoute>
                  </PrivateRoute>
                }
              />

              {/* ── Company Routes ── */}
              <Route
                path="/company/dashboard"
                element={
                  <PrivateRoute>
                    <RoleRoute allowedRoles="COMPANY">
                      <CompanyDashboard />
                    </RoleRoute>
                  </PrivateRoute>
                }
              />
              <Route
                path="/company/post-internship"
                element={
                  <PrivateRoute>
                    <RoleRoute allowedRoles="COMPANY">
                      <PostInternship />
                    </RoleRoute>
                  </PrivateRoute>
                }
              />
              <Route
                path="/company/my-internships"
                element={
                  <PrivateRoute>
                    <RoleRoute allowedRoles="COMPANY">
                      <MyInternships />
                    </RoleRoute>
                  </PrivateRoute>
                }
              />
              <Route
                path="/company/applications"
                element={
                  <PrivateRoute>
                    <RoleRoute allowedRoles="COMPANY">
                      <Applications />
                    </RoleRoute>
                  </PrivateRoute>
                }
              />
              {/* PHASE 8: Monthly report submission */}
              <Route
                path="/company/report-submission"
                element={
                  <PrivateRoute>
                    <RoleRoute allowedRoles="COMPANY">
                      <ReportSubmission />
                    </RoleRoute>
                  </PrivateRoute>
                }
              />

              <Route
                path="/company/submit-final-report"
                element={
                  <PrivateRoute>
                    <RoleRoute allowedRoles="COMPANY">
                      <SubmitFinalReport />
                    </RoleRoute>
                  </PrivateRoute>
                }
              />

              {/* ── Advisor Routes ── */}
              <Route
                path="/advisor/dashboard"
                element={
                  <PrivateRoute>
                    <RoleRoute allowedRoles="ADVISOR">
                      <AdvisorDashboard />
                    </RoleRoute>
                  </PrivateRoute>
                }
              />
              {/* PHASE 6 */}
              <Route
                path="/advisor/my-students"
                element={
                  <PrivateRoute>
                    <RoleRoute allowedRoles="ADVISOR">
                      <MyStudents />
                    </RoleRoute>
                  </PrivateRoute>
                }
              />
              <Route
                path="/advisor/students/:id"
                element={
                  <PrivateRoute>
                    <RoleRoute allowedRoles="ADVISOR">
                      <StudentDetail />
                    </RoleRoute>
                  </PrivateRoute>
                }
              />
              {/* PHASE 8: Monthly reports view */}
              <Route
                path="/advisor/reports"
                element={
                  <PrivateRoute>
                    <RoleRoute allowedRoles="ADVISOR">
                      <AdvisorReports />
                    </RoleRoute>
                  </PrivateRoute>
                }
              />

              {/* PHASE 9: Final reports */}
              <Route
                path="/advisor/final-reports"
                element={
                  <PrivateRoute>
                    <RoleRoute allowedRoles="ADVISOR">
                      <AdvisorFinalReports />
                    </RoleRoute>
                  </PrivateRoute>
                }
              />
              <Route
                path="/advisor/evaluation/:reportId"
                element={
                  <PrivateRoute>
                    <RoleRoute allowedRoles="ADVISOR">
                      <AdvisorEvaluationForm />
                    </RoleRoute>
                  </PrivateRoute>
                }
              />

              {/* Advisor Messages */}
              <Route
                path="/advisor/messages"
                element={
                  <PrivateRoute>
                    <RoleRoute allowedRoles="ADVISOR">
                      <Messages />
                    </RoleRoute>
                  </PrivateRoute>
                }
              />

              {/* ── Department Head Routes ── */}
              <Route
                path="/department/dashboard"
                element={
                  <PrivateRoute>
                    <RoleRoute allowedRoles="DEPARTMENT_HEAD">
                      <DepartmentDashboard />
                    </RoleRoute>
                  </PrivateRoute>
                }
              />
              <Route
                path="/department/students"
                element={
                  <PrivateRoute>
                    <RoleRoute allowedRoles="DEPARTMENT_HEAD">
                      <Students />
                    </RoleRoute>
                  </PrivateRoute>
                }
              />
              <Route
                path="/department/advisors"
                element={
                  <PrivateRoute>
                    <RoleRoute allowedRoles="DEPARTMENT_HEAD">
                      <Advisors />
                    </RoleRoute>
                  </PrivateRoute>
                }
              />
              <Route
                path="/department/add-advisor"
                element={
                  <PrivateRoute>
                    <RoleRoute allowedRoles="DEPARTMENT_HEAD">
                      <AddAdvisor />
                    </RoleRoute>
                  </PrivateRoute>
                }
              />
              <Route
                path="/department/companies"
                element={
                  <PrivateRoute>
                    <RoleRoute allowedRoles="DEPARTMENT_HEAD">
                      <Companies />
                    </RoleRoute>
                  </PrivateRoute>
                }
              />
              <Route
                path="/department/assign-advisor"
                element={
                  <PrivateRoute>
                    <RoleRoute allowedRoles="DEPARTMENT_HEAD">
                      <AssignAdvisor />
                    </RoleRoute>
                  </PrivateRoute>
                }
              />
              <Route
                path="/department/assign-company"
                element={
                  <PrivateRoute>
                    <RoleRoute allowedRoles="DEPARTMENT_HEAD">
                      <AssignCompany />
                    </RoleRoute>
                  </PrivateRoute>
                }
              />
              <Route
                path="/department/reports"
                element={
                  <PrivateRoute>
                    <RoleRoute allowedRoles="DEPARTMENT_HEAD">
                      <Reports />
                    </RoleRoute>
                  </PrivateRoute>
                }
              />

              {/* PHASE 9: Department final reports */}
              <Route
                path="/department/final-reports"
                element={
                  <PrivateRoute>
                    <RoleRoute allowedRoles="DEPARTMENT_HEAD">
                      <DepartmentFinalReports />
                    </RoleRoute>
                  </PrivateRoute>
                }
              />

              <Route
                path="/department/students-completion"
                element={
                  <PrivateRoute>
                    <RoleRoute allowedRoles="DEPARTMENT_HEAD">
                      <StudentsCompletion />
                    </RoleRoute>
                  </PrivateRoute>
                }
              />

              <Route
                path="/department/validate-students"
                element={
                  <PrivateRoute>
                    <RoleRoute allowedRoles="DEPARTMENT_HEAD">
                      <StudentsValidation />
                    </RoleRoute>
                  </PrivateRoute>
                }
              />

              <Route
                path="/department/escalations"
                element={
                  <PrivateRoute>
                    <RoleRoute allowedRoles="DEPARTMENT_HEAD">
                      <Escalations />
                    </RoleRoute>
                  </PrivateRoute>
                }
              />

              <Route
                path="/department/cycles"
                element={
                  <PrivateRoute>
                    <RoleRoute allowedRoles="DEPARTMENT_HEAD">
                      <DepartmentCycles />
                    </RoleRoute>
                  </PrivateRoute>
                }
              />

              {/* ── UIL Routes ── */}
              <Route
                path="/uil/dashboard"
                element={
                  <PrivateRoute>
                    <RoleRoute allowedRoles="UIL">
                      <UILDashboard />
                    </RoleRoute>
                  </PrivateRoute>
                }
              />
              <Route
                path="/uil/pending-registrations"
                element={
                  <PrivateRoute>
                    <RoleRoute allowedRoles="UIL">
                      <PendingRegistrations />
                    </RoleRoute>
                  </PrivateRoute>
                }
              />
              <Route
                path="/uil/manage-users"
                element={
                  <PrivateRoute>
                    <RoleRoute allowedRoles="UIL">
                      <ManageUsers />
                    </RoleRoute>
                  </PrivateRoute>
                }
              />
              <Route
                path="/uil/system-overview"
                element={
                  <PrivateRoute>
                    <RoleRoute allowedRoles="UIL">
                      <SystemOverview />
                    </RoleRoute>
                  </PrivateRoute>
                }
              />

              {/* ── Admin Routes ── */}
              <Route
                path="/admin/dashboard"
                element={
                  <PrivateRoute>
                    <RoleRoute allowedRoles="ADMIN">
                      <AdminDashboard />
                    </RoleRoute>
                  </PrivateRoute>
                }
              />
              <Route
                path="/admin/users"
                element={
                  <PrivateRoute>
                    <RoleRoute allowedRoles="ADMIN">
                      <AdminUserList />
                    </RoleRoute>
                  </PrivateRoute>
                }
              />
              <Route
                path="/admin/student/:id"
                element={
                  <PrivateRoute>
                    <RoleRoute allowedRoles="ADMIN">
                      <AdminStudentDetail />
                    </RoleRoute>
                  </PrivateRoute>
                }
              />
              <Route
                path="/admin/student/:id/settings"
                element={
                  <PrivateRoute>
                    <RoleRoute allowedRoles="ADMIN">
                      <StudentSettings />
                    </RoleRoute>
                  </PrivateRoute>
                }
              />

              {/* 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </DepartmentProvider>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  </BrowserRouter>
  );
};

export default AppRoutes;