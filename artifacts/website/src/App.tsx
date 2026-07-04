import { Route, Switch } from "wouter";
import { MarketingAuthModalProvider } from "@/components/auth/MarketingAuthModalContext";
import { HomePage } from "@/pages/HomePage";
import { ExistingAccountPage } from "@/pages/ExistingAccountPage";
import { TermsPage } from "@/pages/TermsPage";
import { AboutPage } from "@/pages/AboutPage";
import { ContactPage } from "@/pages/ContactPage";
import { FaqsPage } from "@/pages/FaqsPage";
import { PrivacyPage } from "@/pages/PrivacyPage";

export default function App() {
  return (
    <MarketingAuthModalProvider>
      <Switch>
        <Route path="/" component={HomePage} />
        <Route path="/login/existing/mock">
          <ExistingAccountPage mock />
        </Route>
        <Route path="/login/existing">
          <ExistingAccountPage />
        </Route>
        <Route path="/contact-us" component={ContactPage} />
        <Route path="/terms-and-conditions" component={TermsPage} />
        <Route path="/about-us" component={AboutPage} />
        <Route path="/faqs" component={FaqsPage} />
        <Route path="/privacy-policy" component={PrivacyPage} />
        <Route>
          <HomePage />
        </Route>
      </Switch>
    </MarketingAuthModalProvider>
  );
}
