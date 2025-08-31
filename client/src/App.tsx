import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { WalletProvider } from "@/hooks/use-wallet";
import Dashboard from "@/pages/dashboard";
import Admin from "@/pages/admin";
import Tokenomics from "@/pages/tokenomics";
import Pioneers from "@/pages/pioneers";
import AIModels from "@/pages/ai-models";
import TrainingPortal from "@/pages/training-portal";
import NotFound from "@/pages/not-found";
import Navigation from "@/components/navigation";
import MainApp from "@/pages/main-app";


function Router() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/admin" component={Admin} />
          <Route path="/tokenomics" component={Tokenomics} />
          <Route path="/pioneers" component={Pioneers} />
          <Route path="/ai-models" component={AIModels} />
          <Route path="/training-portal" component={TrainingPortal} />
          <Route path="/main" component={MainApp} />
          <Route component={NotFound} />
        </Switch>
      </main>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WalletProvider>
          <div className="dark">
            <Toaster />
            <Router />
          </div>
        </WalletProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;