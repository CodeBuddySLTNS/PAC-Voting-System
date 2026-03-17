import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
} from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import LoginPage from "@/pages/auth/login";
import SignupPage from "@/pages/auth/signup";
import ProtectedRoute from "./components/protected-route/protected-route";
import { useMainStore } from "./store";

const RoleAccess = () => {
  if (useMainStore.getState().user?.adminId) {
    return <Navigate to="/dashboard" />;
  }
  return <Navigate to="/student" />;
};

export function App() {
  return (
    <ThemeProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<RoleAccess />} />

            <Route path="/dashboard" element={<div>Dashboard</div>} />
            <Route path="/student" element={<div>Student</div>} />
          </Route>
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
