import { Route, Switch } from "wouter";
import { HomePage } from "@/pages/HomePage";
import { TermsPage } from "@/pages/TermsPage";
import { AboutPage } from "@/pages/AboutPage";
import { ContactPage } from "@/pages/ContactPage";
import { FaqsPage } from "@/pages/FaqsPage";
import { PrivacyPage } from "@/pages/PrivacyPage";

export default function App() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/contact-us" component={ContactPage} />
      <Route path="/terms-and-conditions" component={TermsPage} />
      <Route path="/about-us" component={AboutPage} />
      <Route path="/faqs" component={FaqsPage} />
      <Route path="/privacy-policy" component={PrivacyPage} />
      <Route>
        <HomePage />
      </Route>
    </Switch>
  );
}
