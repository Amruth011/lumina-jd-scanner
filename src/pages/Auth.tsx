import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Mail, Loader2, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

type AuthMode = "select" | "email";
type AuthAction = "login" | "signup";

const Auth = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<AuthMode>("select");
  const [action, setAction] = useState<AuthAction>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleEmailAuth = async () => {
    if (!email.trim() || password.length < 6) {
      return toast.error("Enter a valid email and a password (min 6 chars).");
    }
    setLoading(true);
    try {
      if (action === "signup") {
        const { error } = await supabase.auth.signUp({ 
          email: email.trim(), 
          password 
        });
        if (error) throw error;
        toast.success("Account created! You are now signed in.");
        navigate("/");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ 
          email: email.trim(), 
          password 
        });
        if (error) throw error;
        toast.success("Signed in successfully!");
        navigate("/");
      }
    } catch (err) {
      toast.error((err as Error).message || "Authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setMode("select");
    setPassword("");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 relative">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="glass-strong rounded-2xl p-8 glow-border">
          {/* Logo */}
          <div className="flex items-center justify-center gap-2 mb-6">
            <Sparkles className="w-6 h-6 text-primary" />
            <h1 className="font-display font-bold text-xl text-foreground">
              Lumina <span className="text-primary">JD</span>
            </h1>
          </div>

          <h2 className="font-display font-semibold text-xl text-foreground text-center mb-1">
            Sign in to continue
          </h2>
          <p className="text-sm text-muted-foreground text-center mb-6">
            Track your applications and save your analyses
          </p>

          {/* Back button */}
          {mode !== "select" && (
            <button
              onClick={reset}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mb-4 transition-colors"
            >
              <ArrowLeft className="w-3 h-3" /> Back
            </button>
          )}

          {/* Select mode */}
          {mode === "select" && (
            <div className="space-y-3">
              <button
                onClick={() => setMode("email")}
                className="relative overflow-hidden w-full flex items-center gap-3 px-4 py-4 rounded-2xl border border-border bg-background hover:bg-muted/50 transition-all text-sm font-bold text-foreground liquid-glass-refraction premium-button-glow"
              >
                <div className="liquid-water-layer opacity-10" />
                <Mail className="w-5 h-5 text-primary fill-current/10" />
                Continue with Email & Password
              </button>
            </div>
          )}

          {/* Email input */}
          {mode === "email" && (
            <div className="space-y-4">
              <div className="flex bg-muted/50 p-1 rounded-xl mb-4">
                <button
                  onClick={() => setAction("login")}
                  className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${action === "login" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                >
                  Log In
                </button>
                <button
                  onClick={() => setAction("signup")}
                  className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${action === "signup" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                >
                  Sign Up
                </button>
              </div>

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                autoFocus
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password (min 6 characters)"
                className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                onKeyDown={(e) => e.key === "Enter" && handleEmailAuth()}
              />
              <button
                onClick={handleEmailAuth}
                disabled={loading}
                className="relative overflow-hidden w-full py-4 rounded-2xl bg-primary text-primary-foreground font-bold text-sm tracking-tight hover:opacity-90 transition-all disabled:opacity-40 flex items-center justify-center gap-2 liquid-glass-refraction premium-button-glow shadow-md shadow-primary/20 mt-2"
              >
                <div className="liquid-water-layer opacity-20" />
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {action === "login" ? "Sign In" : "Create Account"}
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;

