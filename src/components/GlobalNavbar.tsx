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
    { name: "Scanner", href: "#scanner" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-6 w-full pointer-events-none">
      <div className="liquid-glass-refractive rounded-full pill max-w-6xl mx-auto px-6 py-3 flex items-center justify-between pointer-events-auto border-white/40 shadow-2xl shadow-black/5">
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center gap-2 group">
            <Sparkles size={24} className="text-accent-blue drop-shadow-[0_0_8px_rgba(var(--accent-blue-rgb),0.5)] transition-transform group-hover:rotate-12" />
            <span className="text-foreground font-display font-bold text-xl tracking-tight">Lumina JD</span>
          </Link>
          <span className="bg-accent-blue/10 text-accent-blue text-[10px] px-3 py-0.5 rounded-full ml-4 font-bold uppercase tracking-widest border border-accent-blue/20 shadow-sm shadow-accent-blue/5">0.1% Strategist</span>
          
          <div className="hidden md:flex items-center gap-8 ml-8">
            {navLinks.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="text-muted-foreground hover:text-foreground text-[13px] font-display font-bold transition-all tracking-tight"
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

        <div className="flex items-center gap-4 lg:gap-6">
          
          {user ? (
            <div className="flex items-center gap-4">
              <span className="hidden lg:block text-[10px] text-muted-foreground/60 font-bold uppercase tracking-wider truncate max-w-[120px]">
                {user.email}
              </span>
              <button
                onClick={signOut}
                className="text-muted-foreground hover:text-foreground text-sm transition-all p-2 hover:bg-muted/50 rounded-full"
                title="Sign Out"
              >
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <Link 
              to="/auth" 
              className="text-muted-foreground hover:text-foreground text-sm font-semibold transition-colors hidden sm:block tracking-tight"
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
            className="bg-accent-blue hover:opacity-90 rounded-full px-6 py-2.5 text-white text-sm font-bold transition-all shadow-lg shadow-accent-blue/20 active:scale-95 whitespace-nowrap"
          >
            {user ? "Scan JD" : "Try Free"}
          </Link>
        </div>
      </div>
    </nav>
  );
};
