import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
} from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { useMainStore } from "./store";
import { Toaster } from "./components/ui/sonner";
import { useQuery } from "@tanstack/react-query";
import { coleAPI } from "./lib/utils";
import { useEffect } from "react";

import LoginPage from "@/pages/auth/login";
import SignupPage from "@/pages/auth/signup";
import ProtectedRoute from "./components/protected-route/protected-route";
import DashboardLayout from "./components/layouts/dashboard-layout";
import AdminDashboard from "./pages/admin/admin-dashboard";
import StudentDashboard from "./pages/student/student-dashboard";
import ManageElections from "./pages/admin/manage-elections";
import ManageCandidates from "./pages/admin/manage-candidates";
import ManageStudents from "./pages/admin/manage-students";
import ManageAdmins from "./pages/admin/manage-admins";
import ElectionBallotForm from "./pages/student/election-ballot";
import ElectionResults from "./pages/admin/election-results";
import LoadingAnimation from "./components/loading-animation/loading";

const RoleAccess = () => {
  const user = useMainStore((state) => state.user);

  if (user?.adminId) {
    return <Navigate to="/dashboard" />;
  }
  return <Navigate to="/student" />;
};

export function App() {
  const loading = useMainStore((state) => state.loading);

  const { data, error } = useQuery({
    queryKey: ["me"],
    queryFn: coleAPI("/api/auth/me"),
  });

  useEffect(() => {
    if (data && !error) {
      useMainStore.getState().setUser(data.user);
      useMainStore.getState().setLoading(false);
    }

    if (error) {
      useMainStore.getState().setLoading(false);
    }
  }, [data, error]);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <LoadingAnimation />
      </div>
    );
  }

  return (
    <ThemeProvider>
      <Toaster richColors position="bottom-right" />
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<RoleAccess />} />

            <Route
              path="/dashboard"
              element={
                <DashboardLayout>
                  <AdminDashboard />
                </DashboardLayout>
              }
            />
            <Route
              path="/dashboard/elections"
              element={
                <DashboardLayout>
                  <ManageElections />
                </DashboardLayout>
              }
            />
            <Route
              path="/dashboard/elections/:id/candidates"
              element={
                <DashboardLayout>
                  <ManageCandidates />
                </DashboardLayout>
              }
            />
            <Route
              path="/dashboard/elections/:id/results"
              element={
                <DashboardLayout>
                  <ElectionResults />
                </DashboardLayout>
              }
            />
            <Route
              path="/dashboard/students"
              element={
                <DashboardLayout>
                  <ManageStudents />
                </DashboardLayout>
              }
            />
            <Route
              path="/dashboard/admins"
              element={
                <DashboardLayout>
                  <ManageAdmins />
                </DashboardLayout>
              }
            />
            <Route
              path="/student"
              element={
                <DashboardLayout>
                  <StudentDashboard />
                </DashboardLayout>
              }
            />
            <Route
              path="/student/election/:id/vote"
              element={
                <DashboardLayout>
                  <ElectionBallotForm />
                </DashboardLayout>
              }
            />
            <Route
              path="/student/election/:id/results"
              element={
                <DashboardLayout>
                  <ElectionResults />
                </DashboardLayout>
              }
            />
          </Route>
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
