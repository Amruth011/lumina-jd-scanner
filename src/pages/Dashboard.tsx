import { useState } from "react";
import { GlobalNavbar } from "@/components/GlobalNavbar";
import { ScannerView } from "@/components/ScannerView";

export type Tab = "decode" | "analysis" | "profile" | "generator" | "guide";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState<Tab>("decode");

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
