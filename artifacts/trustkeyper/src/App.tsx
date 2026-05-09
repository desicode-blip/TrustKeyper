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
import BrokerSettings from "@/pages/BrokerProfile";
import BrokerActivity from "@/pages/BrokerActivity";
import OwnerAddProperty from "@/pages/OwnerAddProperty";
import OwnerDashboard from "@/pages/OwnerDashboard";
import OwnerProperties from "@/pages/OwnerProperties";
import OwnerPropertyDetails from "@/pages/OwnerPropertyDetails";
import OwnerTenants from "@/pages/OwnerTenants";
import OwnerTenantProfile from "@/pages/OwnerTenantProfile";
import OwnerTickets from "@/pages/OwnerTickets";
import OwnerAgreements from "@/pages/OwnerAgreements";
import OwnerFinances from "@/pages/OwnerFinances";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Onboarding} />
      <Route path="/owner/properties/add" component={OwnerAddProperty} />
      <Route path="/owner/dashboard" component={OwnerDashboard} />
      <Route path="/owner/properties" component={OwnerProperties} />
      <Route path="/owner/properties/:id" component={OwnerPropertyDetails} />
      <Route path="/owner/tenants" component={OwnerTenants} />
      <Route path="/owner/tenants/:id" component={OwnerTenantProfile} />
      <Route path="/owner/tickets" component={OwnerTickets} />
      <Route path="/owner/agreements" component={OwnerAgreements} />
      <Route path="/owner/finances" component={OwnerFinances} />
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
      <Route path="/broker/settings" component={BrokerSettings} />
      <Route path="/broker/profile" component={BrokerSettings} />
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
