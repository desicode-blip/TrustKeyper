import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Onboarding from "@/pages/Onboarding";
import BrokerDashboard from "@/pages/BrokerDashboard";
import BrokerProperties from "@/pages/BrokerProperties";
import BrokerTenants from "@/pages/BrokerTenants";
import BrokerDeals from "@/pages/BrokerDeals";
import BrokerCommission from "@/pages/BrokerCommission";
import BrokerDocuments from "@/pages/BrokerDocuments";
import AddTenant from "@/pages/AddTenant";
import AddProperty from "@/pages/AddProperty";
import PropertyDetails from "@/pages/PropertyDetails";
import GenerateAgreement from "@/pages/GenerateAgreement";
import AddProperty2 from "@/pages/AddProperty2";
import BrokerProfile from "@/pages/BrokerProfile";
import BrokerActivity from "@/pages/BrokerActivity";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Onboarding} />
      <Route path="/broker/dashboard" component={BrokerDashboard} />
      <Route path="/broker/properties" component={BrokerProperties} />
      <Route path="/broker/properties/add" component={AddProperty} />
      <Route path="/broker/properties/add2" component={AddProperty2} />
      <Route path="/broker/properties/:id" component={PropertyDetails} />
      <Route path="/broker/agreements/generate" component={GenerateAgreement} />
      <Route path="/broker/tenants" component={BrokerTenants} />
      <Route path="/broker/tenants/add" component={AddTenant} />
      <Route path="/broker/deals" component={BrokerDeals} />
      <Route path="/broker/commission" component={BrokerCommission} />
      <Route path="/broker/documents" component={BrokerDocuments} />
      <Route path="/broker/profile" component={BrokerProfile} />
      <Route path="/broker/activity" component={BrokerActivity} />
      <Route component={NotFound} />
    </Switch>
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
