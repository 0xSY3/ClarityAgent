import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from "@/components/ui/toaster";
import { Navbar } from "@/components/ui/navbar";
import Home from "./pages/Home";
import ContractBuilder from "./pages/ContractBuilder";
import Decoder from "./pages/Decoder";
import AuditorAgent from "./pages/AuditorAgent";
import MNTAIAssistant from "@/components/AIAssistant";
import ContractExplorer from "./pages/ContractExplorer";
import TestSuiteGenerator from "./pages/TestSuiteGenerator";
import { Switch, Route } from "wouter";

const queryClient = new QueryClient();

function Router() {
  return (
    <div className="min-h-screen bg-black">
      <Switch>
        <Route path="/" component={Home} />
        <Route>
          <div className="min-h-screen bg-black">
            <Navbar isScrolled={false} />
            <main className="px-4 py-8">
              <Switch>
                <Route path="/contract-builder" component={ContractBuilder} />
                <Route path="/decoder" component={Decoder} />
                <Route path="/auditor" component={AuditorAgent} />
                <Route path="/assistant" component={MNTAIAssistant} />
                <Route path="/explorer" component={ContractExplorer} />
                <Route path="/test-suite" component={TestSuiteGenerator} />
                <Route>
                  <div className="flex items-center justify-center min-h-[60vh]">
                    <h1 className="text-2xl text-white">404 Page Not Found</h1>
                  </div>
                </Route>
              </Switch>
            </main>
          </div>
        </Route>
      </Switch>
    </div>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  </StrictMode>
);