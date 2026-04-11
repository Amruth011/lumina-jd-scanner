import { motion } from "framer-motion";
import { Sparkles, LogOut, LogIn, User } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { ThemeToggle } from "./ThemeToggle";
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
      <div className="liquid-glass rounded-full pill max-w-6xl mx-auto px-6 py-3 flex items-center justify-between pointer-events-auto shadow-2xl shadow-black/5">
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center gap-2">
            <Sparkles size={24} color="#3B82F6" />
            <span className="text-slate-800 font-semibold text-lg">Lumina JD</span>
          </Link>
          <span className="bg-blue-50 text-blue-600 text-[10px] px-2 py-0.5 rounded-full ml-2 font-bold uppercase tracking-wider">0.1% Strategist</span>
          
          <div className="hidden md:flex items-center gap-8 ml-8">
            {navLinks.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="text-slate-600 hover:text-slate-900 text-sm font-medium transition-colors"
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
          <ThemeToggle />
          
          {user ? (
            <div className="flex items-center gap-4">
              <span className="hidden lg:block text-xs text-slate-500 font-medium truncate max-w-[120px]">
                {user.email}
              </span>
              <button
                onClick={signOut}
                className="text-slate-600 hover:text-slate-900 text-sm font-medium transition-all p-2 hover:bg-slate-100 rounded-full"
                title="Sign Out"
              >
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <Link 
              to="/auth" 
              className="text-slate-600 hover:text-slate-900 text-sm font-medium transition-colors hidden sm:block"
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
            className="bg-blue-600 hover:bg-blue-700 rounded-full px-6 py-2 text-white text-sm font-medium transition-all shadow-lg shadow-blue-500/20 active:scale-95 whitespace-nowrap"
          >
            {user ? "Scan JD" : "Try Free"}
          </Link>
        </div>
      </div>
    </nav>
  );
};
