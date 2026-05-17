import { motion } from "framer-motion";
import { LogOut, User, Search, ShieldCheck, Zap, Info, Mail } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { LuminaLogo } from "./LuminaLogo";
import type { Tab } from "@/types/tabs";

interface GlobalNavbarProps {
  activeTab?: Tab;
  onTabChange?: (tab: Tab) => void;
}

export const GlobalNavbar = ({ activeTab, onTabChange }: GlobalNavbarProps) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isHomePage = location.pathname === "/";

  const handleTabClick = (tabKey: Tab) => {
    if (!user) {
      toast.info("Please sign in to access Lumina services.");
      navigate("/auth");
      return;
    }

    if (isHomePage) {
      navigate("/dashboard", { state: { activeTab: tabKey } });
    } else {
      if (onTabChange) {
        onTabChange(tabKey);
      }
    }
  };

  const tabs = [
    { key: "decode" as Tab, icon: Search, label: "JD Decode" },
    { key: "analysis" as Tab, icon: ShieldCheck, label: "Analysis" },
    { key: "profile" as Tab, icon: User, label: "Profile" },
    { key: "generator" as Tab, icon: Zap, label: "Generator" },
    { key: "cover-letter" as Tab, icon: Mail, label: "Cover Letter" },
    { key: "guide" as Tab, icon: Info, label: "Guide" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-[100] px-6 py-2 w-full pointer-events-none">
      <div className="h-[50px] rounded-full max-w-5xl mx-auto px-0 py-0 flex items-center justify-between pointer-events-auto relative overflow-visible">
        {/* The Brand Pill Backdrop */}
        <div className="absolute inset-0 rounded-full bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-border/10 -z-10" />
        
          <Link to="/" className="flex items-center group pl-4 transition-transform hover:scale-105">
            <LuminaLogo size={120} className="object-contain" />
          </Link>

        {/* Global Tactical Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-50 p-1 rounded-full border border-border/10 shadow-inner overflow-x-auto no-scrollbar flex-1 md:flex-none">
          {tabs.map((tab) => (
            <button 
              key={tab.key} 
              onClick={() => handleTabClick(tab.key)} 
              className={`relative flex items-center gap-2 px-5 py-2.5 rounded-full text-[12px] font-display font-bold transition-all duration-500 whitespace-nowrap ${
                activeTab === tab.key
                  ? "text-white"
                  : "text-muted-foreground hover:text-foreground hover:bg-foreground/5"
              }`}
            >
              {activeTab === tab.key && (
                <motion.div
                  layoutId="globalActiveTab"
                  className="absolute inset-0 bg-lumina-teal rounded-full shadow-lg shadow-teal-500/20"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-2">
                <tab.icon size={14} className={activeTab === tab.key ? 'text-white' : 'text-primary/40'} />
                <span className="tracking-tight">{tab.label}</span>
              </span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 pr-1 py-1">
          {user ? (
            <div className="hidden sm:flex items-center gap-3 px-4">
              <div className="flex flex-col items-end">
                <span className="text-[10px] text-foreground font-black uppercase tracking-widest leading-none">Strategist</span>
                <span className="text-[12px] text-muted-foreground font-semibold truncate max-w-[150px]">
                  {user.email?.split('@')[0]}
                </span>
              </div>
              <button
                onClick={signOut}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-red-50 hover:bg-red-100 border border-red-200 text-red-500 transition-all"
                title="Sign Out"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link 
                to="/auth" 
                className="px-6 py-2.5 text-foreground/60 hover:text-foreground text-[12px] font-bold transition-colors hidden sm:block tracking-tight"
              >
                Sign In
              </Link>
              <Link
                to="/auth"
                className="group relative rounded-full px-8 py-3.5 bg-primary text-primary-foreground text-[11px] font-black uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-95 overflow-hidden"
              >
                <span className="relative z-10">Get Started</span>
                <div className="absolute inset-0 bg-accent-emerald translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};
