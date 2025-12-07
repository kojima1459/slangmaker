import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Guide from "./pages/Guide";
import Share from "./pages/Share";
import Reader from "./pages/Reader";
import History from "./pages/History";

import About from "./pages/About";
import FeedbackDashboard from "./pages/FeedbackDashboard";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/about"} component={About} />
      <Route path={"/guide"} component={Guide} />
      <Route path={"/reader"} component={Reader} />
      <Route path={"/share/:id"} component={Share} />
      <Route path={"/history"} component={History} />

      <Route path={"/feedback"} component={FeedbackDashboard} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
