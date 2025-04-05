import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import MainApp from "@/pages/MainApp";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./lib/protected-route";
import { Suspense } from "react";

/**
 * Root App component that doesn't depend on any context
 */
function App() {
  return (
    <>
      <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading...</div>}>
        <AuthProvider>
          <Switch>
            <Route path="/auth" component={AuthPage} />
            <Route path="/">
              <ProtectedRoute redirectTo="/auth" requireAuth>
                <MainApp />
              </ProtectedRoute>
            </Route>
            <Route component={NotFound} />
          </Switch>
        </AuthProvider>
      </Suspense>
      <Toaster />
    </>
  );
}

export default App;
