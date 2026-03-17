import { AuthLayout } from "@/components/layouts/auth-layout";
import { Login } from "@/components/login";

export default function LoginPage() {
  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Enter your credentials to access your account"
    >
      <Login />
    </AuthLayout>
  );
}
