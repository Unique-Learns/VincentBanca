import { useState } from "react";
import { Redirect } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { LoginForm } from "@/components/auth/LoginForm";
import { RegisterForm } from "@/components/auth/RegisterForm";

type AuthMode = "login" | "register";

export default function AuthPage() {
  const { isAuthenticated } = useAuth();
  const [mode, setMode] = useState<AuthMode>("login");

  // Redirect to main app if already authenticated
  if (isAuthenticated) {
    return <Redirect to="/" />;
  }

  return (
    <div className="flex min-h-screen">
      {/* Auth Form Section */}
      <div className="flex w-full items-center justify-center p-4 md:w-1/2">
        <div className="w-full max-w-md">
          {mode === "login" ? (
            <LoginForm
              onRegisterClick={() => setMode("register")}
            />
          ) : (
            <RegisterForm
              onLoginClick={() => setMode("login")}
            />
          )}
        </div>
      </div>

      {/* Hero Section - Only visible on larger screens */}
      <div className="hidden bg-primary/10 md:flex md:w-1/2 md:flex-col md:items-center md:justify-center md:p-8">
        <div className="max-w-md text-center">
          <h1 className="mb-4 text-4xl font-bold text-primary">BancaMessenger</h1>
          <p className="mb-6 text-xl">
            Connect with friends and family securely with our real-time messaging platform.
          </p>
          <div className="space-y-4 text-left">
            <div className="flex items-center gap-2">
              <div className="rounded-full bg-primary/20 p-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-primary"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m22 2-7 20-4-9-9-4Z" />
                  <path d="M22 2 11 13" />
                </svg>
              </div>
              <span>Instant messaging with real-time delivery</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="rounded-full bg-primary/20 p-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-primary"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <span>Find friends automatically through contact sync</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="rounded-full bg-primary/20 p-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-primary"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
              <span>Secure, end-to-end messaging platform</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}