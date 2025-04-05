import { Switch, Route, useLocation } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Authentication from "@/pages/Authentication";
import MainApp from "@/pages/MainApp";

function App() {
  // We'll handle auth-based redirects in the page components instead
  const [location, setLocation] = useLocation();
  
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
