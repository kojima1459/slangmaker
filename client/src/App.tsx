import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Guide from "./pages/Guide";
import Reader from "./pages/Reader";
import About from "./pages/About";
import History from "./pages/History";
import Compare from "./pages/Compare";
import FAQ from "./pages/FAQ";
import Gallery from "./pages/Gallery";
import LandingPage from "./pages/LandingPage";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/lp"} component={LandingPage} />
      <Route path={"/about"} component={About} />
      <Route path={"/guide"} component={Guide} />
      <Route path={"/reader"} component={Reader} />
      <Route path={"/history"} component={History} />
      <Route path={"/compare"} component={Compare} />
      <Route path={"/faq"} component={FAQ} />
      <Route path={"/gallery"} component={Gallery} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

import { HelmetProvider } from 'react-helmet-async';

function App() {
  return (
    <ErrorBoundary>
      <HelmetProvider>
        <ThemeProvider defaultTheme="light">
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </ThemeProvider>
      </HelmetProvider>
    </ErrorBoundary>
  );
}

export default App;
