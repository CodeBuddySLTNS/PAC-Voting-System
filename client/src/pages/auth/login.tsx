import { AuthLayout } from "@/components/layouts/auth-layout";
import { Login } from "@/components/login";
import { useMainStore } from "@/store";
import { Navigate } from "react-router-dom";

export default function LoginPage() {
  const user = useMainStore((state) => state.user);

  if (user) {
    return <Navigate to="/" />;
  }

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Enter your credentials to access your account"
    >
      <Login />
    </AuthLayout>
  );
}
