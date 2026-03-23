import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import { Layout } from "@/components/layout";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Jobs from "@/pages/jobs";
import JobPipeline from "@/pages/job-pipeline";
import Costs from "@/pages/costs";
import Metrics from "@/pages/metrics";
import Benchmarking from "@/pages/benchmarking";
import Assistant from "@/pages/assistant";
import Emails from "@/pages/emails";
import JobDescription from "@/pages/job-description";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Assistant} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/vagas" component={Jobs} />
        <Route path="/vagas/:id" component={JobPipeline} />
        <Route path="/custo" component={Costs} />
        <Route path="/metricas" component={Metrics} />
        <Route path="/benchmarking" component={Benchmarking} />
        <Route path="/assistente" component={Assistant} />
        <Route path="/emails" component={Emails} />
        <Route path="/descricao-vaga" component={JobDescription} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
