import { AuthLayout } from "@/components/layouts/auth-layout";
import { Signup } from "@/components/signup";

export default function SignupPage() {
  return (
    <AuthLayout
      title="Create an account"
      subtitle="Register below to join the PAC SGO platform"
    >
      <Signup />
    </AuthLayout>
  );
}
