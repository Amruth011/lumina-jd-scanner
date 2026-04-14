import { motion } from "framer-motion";
import { Sparkles, LogOut, LogIn, User } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export const GlobalNavbar = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const navLinks = [
    { name: "Features", href: "#features" },
    { name: "How It Works", href: "#how-it-works" },
    { name: "Master Vault", href: "#master-vault" },
    { name: "AI Scanner", href: "#scanner" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-[100] px-6 py-8 w-full pointer-events-none">
      <div className="rounded-full max-w-6xl mx-auto px-1 py-1 flex items-center justify-between pointer-events-auto relative">
        {/* The Glasspill Backdrop */}
        <div className="absolute inset-0 rounded-full liquid-glass-refractive border border-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.12)] -z-10" />
        
        {/* Specular Top Edge */}
        <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent -z-10" />

        <div className="flex items-center gap-2 pl-6 py-2">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 rounded-xl bg-accent-blue/10 flex items-center justify-center border border-accent-blue/20 transition-all group-hover:bg-accent-blue group-hover:border-accent-blue/50">
               <Sparkles size={18} className="text-accent-blue transition-colors group-hover:text-white" />
            </div>
            <span className="text-foreground font-display font-black text-xl tracking-tighter">Lumina</span>
          </Link>
          
          <div className="hidden md:flex items-center gap-1 ml-12 bg-white/5 rounded-full p-1 border border-white/5">
            {navLinks.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="px-5 py-2 text-muted-foreground hover:text-foreground hover:bg-white/10 rounded-full text-[12px] font-bold transition-all tracking-tight"
                onClick={(e) => {
                  if (item.href.startsWith("#")) {
                    e.preventDefault();
                    document.querySelector(item.href)?.scrollIntoView({ behavior: "smooth" });
                  }
                }}
              >
                {item.name}
              </a>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 pr-1 py-1">
          {user ? (
            <div className="flex items-center gap-3 px-4">
              <div className="flex flex-col items-end">
                <span className="text-[10px] text-foreground font-black uppercase tracking-widest leading-none">Strategist</span>
                <span className="text-[9px] text-muted-foreground font-medium truncate max-w-[80px]">
                  {user.email?.split('@')[0]}
                </span>
              </div>
              <button
                onClick={signOut}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-accent-red/5 hover:bg-accent-red/10 border border-accent-red/10 text-accent-red transition-all"
                title="Sign Out"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <Link 
              to="/auth" 
              className="px-6 py-2.5 text-foreground/60 hover:text-foreground text-[12px] font-bold transition-colors hidden sm:block tracking-tight"
            >
              Sign In
            </Link>
          )}

          <Link
            to={user ? "/#scanner" : "/auth"}
            onClick={(e) => {
              if (user) {
                e.preventDefault();
                document.querySelector("#scanner")?.scrollIntoView({ behavior: "smooth" });
              }
            }}
            className="group relative rounded-full px-8 py-3.5 bg-foreground text-background text-[12px] font-black uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-95 shadow-2xl shadow-black/20 overflow-hidden"
          >
            <span className="relative z-10">{user ? "Analyze Job" : "Get Started"}</span>
            <div className="absolute inset-0 bg-accent-blue translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
          </Link>
        </div>
      </div>
    </nav>
  );
};
