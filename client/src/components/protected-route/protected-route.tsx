import { useMainStore } from "@/store";
import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = () => {
  const user = useMainStore((state) => state.user);
  const token = useMainStore((state) => state.token);

  if (!user || !token) {
    return <Navigate to="/login" />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
