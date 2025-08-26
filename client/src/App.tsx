import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LeagueProvider } from "@/context/LeagueContext";
import Navigation from "@/components/Navigation";
import Dashboard from "@/pages/Dashboard";
import StartSit from "@/pages/StartSit";
import Waivers from "@/pages/Waivers";
import Trade from "@/pages/Trade";
import Lineup from "@/pages/Lineup";
import SoS from "@/pages/SoS";
import News from "@/pages/News";
import Chatbot from "@/pages/Chatbot";
import Connect from "@/pages/Connect";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <div className="min-h-screen bg-background-page">
      <Navigation />
      <div className="max-w-6xl mx-auto p-4">
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/start-sit" component={StartSit} />
          <Route path="/waivers" component={Waivers} />
          <Route path="/trade" component={Trade} />
          <Route path="/lineup" component={Lineup} />
          <Route path="/sos" component={SoS} />
          <Route path="/news" component={News} />
          <Route path="/chatbot" component={Chatbot} />
          <Route path="/connect" component={Connect} />
          <Route component={NotFound} />
        </Switch>
      </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LeagueProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </LeagueProvider>
    </QueryClientProvider>
  );
}

export default App;
