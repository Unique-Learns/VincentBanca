import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Authentication from "@/pages/Authentication";
import MainApp from "@/pages/MainApp";
import { AuthProvider } from "./contexts/AuthContext";
import { Suspense } from "react";

// Simple loaders that make sure context is available
const AuthPageLoader = () => (
  <AuthProvider>
    <Authentication />
  </AuthProvider>
);

const MainAppLoader = () => (
  <AuthProvider>
    <MainApp />
  </AuthProvider>
);

/**
 * Root App component that doesn't depend on any context
 */
function App() {
  return (
    <>
      <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading...</div>}>
        <Switch>
          <Route path="/" component={AuthPageLoader} />
          <Route path="/app" component={MainAppLoader} />
          <Route component={NotFound} />
        </Switch>
      </Suspense>
      <Toaster />
    </>
  );
}

export default App;
