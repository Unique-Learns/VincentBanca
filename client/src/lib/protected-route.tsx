import { ReactNode, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";

type ProtectedRouteProps = {
  children: ReactNode;
  redirectTo?: string;
  requireAuth?: boolean;
};

/**
 * A component wrapper that handles authentication-based routing
 * If requireAuth is true, redirects to redirectTo if not authenticated
 * If requireAuth is false, redirects to redirectTo if authenticated
 */
export function ProtectedRoute({ 
  children, 
  redirectTo = "/", 
  requireAuth = true 
}: ProtectedRouteProps) {
  const { isAuthenticated } = useAuth();
  const [_, setLocation] = useLocation();

  useEffect(() => {
    // If we require authentication and user is not authenticated, redirect
    if (requireAuth && !isAuthenticated) {
      setLocation(redirectTo);
    } 
    // If we require user NOT to be authenticated and they are, redirect
    else if (!requireAuth && isAuthenticated) {
      setLocation(redirectTo);
    }
  }, [isAuthenticated, redirectTo, requireAuth, setLocation]);

  return <>{children}</>;
}