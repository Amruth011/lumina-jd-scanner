import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { GlobalNavbar } from "@/components/GlobalNavbar";
import { ScannerView } from "@/components/ScannerView";

export type Tab = "decode" | "analysis" | "profile" | "generator" | "guide";

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
      <GlobalNavbar activeTab={activeTab} onTabChange={setActiveTab} />
      <section id="scanner" className="relative pt-24 pb-12 bg-background min-h-screen">
        <ScannerView activeTab={activeTab} onTabChange={setActiveTab} />
      </section>
    </div>
  );
};

export default Dashboard;
