import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
const GlobalNavbar = lazy(() => import("@/components/GlobalNavbar").then(m => ({ default: m.GlobalNavbar })));
const ScannerView = lazy(() => import("@/components/ScannerView").then(m => ({ default: m.ScannerView })));
const WelcomeScreen = lazy(() => import("@/components/onboarding/WelcomeScreen").then(m => ({ default: m.WelcomeScreen })));
const TooltipTour = lazy(() => import("@/components/onboarding/TooltipTour").then(m => ({ default: m.TooltipTour })));
const HistoryPanel = lazy(() => import("@/components/dashboard/HistoryPanel").then(m => ({ default: m.HistoryPanel })));

import { lazy, Suspense } from "react";
import type { Tab } from "@/types/tabs";

const Dashboard = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<Tab>((location.state?.activeTab as Tab) || "decode");

  useEffect(() => {
    if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab as Tab);
    }
  }, [location.state]);

  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <Suspense fallback={null}>
        <WelcomeScreen />
        <TooltipTour />
        <HistoryPanel />
        <GlobalNavbar activeTab={activeTab} onTabChange={setActiveTab} />
        <section id="scanner" className="relative pt-24 pb-12 bg-background min-h-screen">
          <ScannerView activeTab={activeTab} onTabChange={setActiveTab} />
        </section>
      </Suspense>
    </div>
  );
};

export default Dashboard;
