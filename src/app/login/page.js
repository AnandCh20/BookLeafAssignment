import { LoginForm } from "@/components/auth/LoginForm";

export const metadata = {
  title: "Sign In — BookLeaf Publishing",
  description: "Access BookLeaf Author Portal or Operations Admin Desk."
};

export default function LoginPage() {
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--bg-secondary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <LoginForm />
    </div>
  );
}
