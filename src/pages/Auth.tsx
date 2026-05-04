import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Sparkles, Mail, Loader2, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

type AuthMode = "select" | "email" | "reset" | "update_password";
type AuthAction = "login" | "signup";

const Auth = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [mode, setMode] = useState<AuthMode>("select");
  const [action, setAction] = useState<AuthAction>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && user) {
      navigate("/dashboard");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    // Check if user arrived via a password reset link
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY") {
        setMode("update_password");
      }
    });
    return () => subscription.unsubscribe();
  }, []);

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
        navigate("/dashboard");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ 
          email: email.trim(), 
          password 
        });
        if (error) throw error;
        toast.success("Signed in successfully!");
        navigate("/dashboard");
      }
    } catch (err) {
      toast.error((err as Error).message || "Authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!email.trim()) return toast.error("Enter your email first.");
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: window.location.origin + "/auth",
      });
      if (error) throw error;
      toast.success("Password reset link sent! Check your email.");
      setMode("email");
    } catch (err) {
      toast.error((err as Error).message || "Failed to send reset link.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (password.length < 6) return toast.error("Password must be at least 6 characters.");
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      toast.success("Password updated successfully!");
      navigate("/dashboard");
    } catch (err) {
      toast.error((err as Error).message || "Failed to update password.");
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
        <div className="glass-strong rounded-2xl p-8">
          {/* Logo */}
          <div className="flex items-center justify-center mb-0">
            <img src="/logo.png" alt="Lumina" className="w-[120px] h-auto object-contain" />
          </div>

          <h2 className="font-display font-semibold text-xl text-foreground text-center mb-1">
            {mode === "reset" ? "Reset Password" : mode === "update_password" ? "New Password" : "Sign in to continue"}
          </h2>
          <p className="text-sm text-muted-foreground text-center mb-6">
            {mode === "reset" ? "Enter your email to receive a reset link" : mode === "update_password" ? "Enter your new strong password" : "Track your applications and save your analyses"}
          </p>

          {/* Back button */}
          {mode !== "select" && mode !== "update_password" && (
            <button
              onClick={() => mode === 'reset' ? setMode('email') : reset()}
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
                className="relative overflow-hidden w-full flex items-center gap-3 px-4 py-4 rounded-2xl border border-border bg-background hover:bg-muted/50 transition-all text-sm font-bold text-foreground"
              >
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
                  className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${action === "login" ? "bg-background text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                >
                  Log In
                </button>
                <button
                  onClick={() => setAction("signup")}
                  className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${action === "signup" ? "bg-background text-foreground" : "text-muted-foreground hover:text-foreground"}`}
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
              
              {action === "login" && (
                <div className="flex justify-end">
                  <button
                    onClick={() => setMode("reset")}
                    className="text-xs text-primary hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
              )}

              <button
                onClick={handleEmailAuth}
                disabled={loading}
                className="relative overflow-hidden w-full py-4 rounded-2xl bg-primary text-primary-foreground font-bold text-sm tracking-tight hover:opacity-90 transition-all disabled:opacity-40 flex items-center justify-center gap-2 mt-2"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {action === "login" ? "Sign In" : "Create Account"}
              </button>
            </div>
          )}

          {/* Reset Password */}
          {mode === "reset" && (
            <div className="space-y-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                autoFocus
                onKeyDown={(e) => e.key === "Enter" && handleResetPassword()}
              />
              <button
                onClick={handleResetPassword}
                disabled={loading}
                className="relative overflow-hidden w-full py-4 rounded-2xl bg-primary text-primary-foreground font-bold text-sm tracking-tight hover:opacity-90 transition-all disabled:opacity-40 flex items-center justify-center gap-2"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                Send Reset Link
              </button>
            </div>
          )}

          {/* Update Password */}
          {mode === "update_password" && (
            <div className="space-y-4">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter new password"
                className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                autoFocus
                onKeyDown={(e) => e.key === "Enter" && handleUpdatePassword()}
              />
              <button
                onClick={handleUpdatePassword}
                disabled={loading}
                className="relative overflow-hidden w-full py-4 rounded-2xl bg-primary text-primary-foreground font-bold text-sm tracking-tight hover:opacity-90 transition-all disabled:opacity-40 flex items-center justify-center gap-2"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                Update Password
              </button>
            </div>
          )}
        </div>
      </motion.div>
      
      {/* Infrastructure Diagnostic - Only visible in dev or if connection fails */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 opacity-20 hover:opacity-100 transition-opacity">
        <p className="text-[8px] font-mono uppercase tracking-widest text-muted-foreground whitespace-nowrap">
          Engine Signal: {supabase.auth.getSession ? "HARDCODED ACTIVE" : (import.meta.env.VITE_SUPABASE_URL ? `...${import.meta.env.VITE_SUPABASE_URL.slice(-12)}` : "OFFLINE")}
        </p>
      </div>
    </div>
  );
};

export default Auth;
