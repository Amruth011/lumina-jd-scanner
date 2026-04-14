import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Mail, Phone, Loader2, ArrowLeft, Moon, Sun } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

type AuthMode = "select" | "email";
type AuthStep = "input" | "otp";

const Auth = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<AuthMode>("select");
  const [step, setStep] = useState<AuthStep>("input");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const handleEmailOtp = async () => {
    if (!email.trim()) return toast.error("Enter your email.");
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({ 
        email: email.trim(),
        options: {
          emailRedirectTo: window.location.origin,
        },
      });
      if (error) throw error;
      setStep("otp");
      toast.success("Check your email for the verification code.");
    } catch (err) {
      toast.error((err as Error).message || "Failed to send OTP.");
    } finally {
      setLoading(false);
    }
  };


  const handleVerifyOtp = async () => {
    if (otp.length < 6) return toast.error("Enter the 6-digit code.");
    setLoading(true);
    try {
      const params = { email: email.trim(), token: otp.trim(), type: "email" as const };

      const { error } = await supabase.auth.verifyOtp(params);
      if (error) throw error;
      toast.success("Signed in successfully!");
      navigate("/");
    } catch (err) {
      toast.error((err as Error).message || "Invalid code.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin,
        },
      });
      if (error) throw error;
    } catch (err) {
      toast.error((err as Error).message || "Google sign-in failed.");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setMode("select");
    setStep("input");
    setOtp("");
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
            {step === "otp" ? "Check Your Email" : "Sign in to continue"}
          </h2>
          <p className="text-sm text-muted-foreground text-center mb-6">
            {step === "otp"
              ? `We sent a magic link and code to ${email}`
              : "Track your applications and save your analyses"}
          </p>

          {/* Back button when not on select */}
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
                Continue with Email
              </button>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-card px-2 text-muted-foreground">or</span>
                </div>
              </div>

              <button
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="relative overflow-hidden w-full flex items-center justify-center gap-3 px-4 py-4 rounded-2xl border border-border bg-background hover:bg-muted/50 transition-all text-sm font-bold text-foreground disabled:opacity-40 liquid-glass-refraction premium-button-glow shadow-sm"
              >
                <div className="liquid-water-layer opacity-10" />
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                )}
                Continue with Google
              </button>
            </div>
          )}

          {/* Email input */}
          {mode === "email" && step === "input" && (
            <div className="space-y-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                autoFocus
                onKeyDown={(e) => e.key === "Enter" && handleEmailOtp()}
              />
              <button
                onClick={handleEmailOtp}
                disabled={loading}
                className="relative overflow-hidden w-full py-4 rounded-2xl bg-primary text-primary-foreground font-bold text-sm tracking-tight hover:opacity-90 transition-all disabled:opacity-40 flex items-center justify-center gap-2 liquid-glass-refraction premium-button-glow shadow-md shadow-primary/20"
              >
                <div className="liquid-water-layer opacity-20" />
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                Send Verification Code
              </button>
            </div>
          )}


          {/* OTP / Magic Link Help text */}
          {step === "otp" && (
            <div className="space-y-4">
              <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl text-center mb-2">
                 <p className="text-sm font-semibold text-emerald-600 mb-1">Click the Magic Link in your email</p>
                 <p className="text-xs text-muted-foreground">Or if you received a 6-digit code, enter it below:</p>
              </div>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="000000 (Optional)"
                maxLength={6}
                className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground text-sm text-center tracking-[0.2em] font-mono text-lg placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                autoFocus
                onKeyDown={(e) => e.key === "Enter" && handleVerifyOtp()}
              />
              <button
                onClick={handleVerifyOtp}
                disabled={loading}
                className="relative overflow-hidden w-full py-4 rounded-2xl bg-primary text-primary-foreground font-bold text-sm tracking-tight hover:opacity-90 transition-all disabled:opacity-40 flex items-center justify-center gap-2 liquid-glass-refraction premium-button-glow shadow-md shadow-primary/20"
              >
                <div className="liquid-water-layer opacity-20" />
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                Verify & Sign In
              </button>
              <button
                onClick={() => handleEmailOtp()}
                disabled={loading}
                className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Didn't receive a code? Resend
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;
