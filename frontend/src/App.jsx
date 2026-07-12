import { useEffect, lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchCurrentUser } from "./features/authSlice";
import { setTheme } from "./features/uiSlice";
import AppLayout from "./components/layout/AppLayout";
import ProtectedRoute from "./routes/ProtectedRoute";
import LoadingScreen from "./components/shared/LoadingScreen";

// Auth pages (eager loaded)
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import OAuthCallbackPage from "./pages/auth/OAuthCallbackPage";

// App pages (lazy loaded for code splitting)
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const ProjectsPage = lazy(() => import("./pages/projects/ProjectsPage"));
const ProjectDetailPage = lazy(() => import("./pages/projects/ProjectDetailPage"));
const TasksPage = lazy(() => import("./pages/tasks/TasksPage"));
const TaskDetailPage = lazy(() => import("./pages/tasks/TaskDetailPage"));
const KanbanPage = lazy(() => import("./pages/kanban/KanbanPage"));
const TeamsPage = lazy(() => import("./pages/teams/TeamsPage"));
const EmployeesPage = lazy(() => import("./pages/employees/EmployeesPage"));
const EmployeeDetailPage = lazy(() => import("./pages/employees/EmployeeDetailPage"));
const AttendancePage = lazy(() => import("./pages/attendance/AttendancePage"));
const LeavePage = lazy(() => import("./pages/leave/LeavePage"));
const CalendarPage = lazy(() => import("./pages/calendar/CalendarPage"));
const ChatPage = lazy(() => import("./pages/chat/ChatPage"));
const NotificationsPage = lazy(() => import("./pages/NotificationsPage"));
const ReportsPage = lazy(() => import("./pages/reports/ReportsPage"));
const AuditLogsPage = lazy(() => import("./pages/AuditLogsPage"));
const SettingsPage = lazy(() => import("./pages/settings/SettingsPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));

function App() {
  const dispatch = useDispatch();
  const { isAuthenticated, isInitialized } = useSelector((state) => state.auth);
  const { theme } = useSelector((state) => state.ui);

  // Initialize theme
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light";
    dispatch(setTheme(savedTheme));
    document.documentElement.classList.toggle("dark", savedTheme === "dark");
  }, []);

  // Bootstrap: check if user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchCurrentUser());
    }
  }, [isAuthenticated]);

  if (!isInitialized && isAuthenticated) {
    return <LoadingScreen />;
  }

  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />} />
        <Route path="/register" element={isAuthenticated ? <Navigate to="/" replace /> : <RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/oauth-callback" element={<OAuthCallbackPage />} />

        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/projects/:id" element={<ProjectDetailPage />} />
            <Route path="/tasks" element={<TasksPage />} />
            <Route path="/tasks/:id" element={<TaskDetailPage />} />
            <Route path="/kanban" element={<KanbanPage />} />
            <Route path="/teams" element={<TeamsPage />} />
            <Route path="/employees" element={<EmployeesPage />} />
            <Route path="/employees/:id" element={<EmployeeDetailPage />} />
            <Route path="/attendance" element={<AttendancePage />} />
            <Route path="/leave" element={<LeavePage />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/audit-logs" element={<AuditLogsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}

export default App;
