import { Switch, Route, useLocation } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Authentication from "@/pages/Authentication";
import MainApp from "@/pages/MainApp";
import { useAuth } from "./contexts/AuthContext";
import { useEffect } from "react";

function App() {
  const { isAuthenticated } = useAuth();
  const [location, setLocation] = useLocation();
  
  useEffect(() => {
    // Redirect based on authentication state
    if (isAuthenticated && location === "/") {
      setLocation("/app");
    } else if (!isAuthenticated && location !== "/") {
      setLocation("/");
    }
  }, [isAuthenticated, location, setLocation]);
  
  return (
    <>
      <Switch>
        <Route path="/" component={Authentication} />
        <Route path="/app" component={MainApp} />
        <Route component={NotFound} />
      </Switch>
      <Toaster />
    </>
  );
}

export default App;
