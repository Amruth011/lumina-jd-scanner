import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Loader2, ArrowLeft, CheckCircle2, TrendingUp, FileText, Zap, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

type AuthMode = "select" | "email" | "reset" | "update_password";
type AuthAction = "login" | "signup";

/* ── Animated ATS Score Widget ── */
const ATSScoreWidget = () => {
  const [score, setScore] = useState(34);
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimated(true);
      const interval = setInterval(() => {
        setScore((prev) => {
          if (prev >= 91) {
            clearInterval(interval);
            return 91;
          }
          return prev + 1;
        });
      }, 28);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  const bars = [
    { label: "ATS Score", value: animated ? 91 : 34, color: "#10B981" },
    { label: "Keyword Match", value: animated ? 87 : 52, color: "#10B981" },
    { label: "Bullet Impact", value: animated ? 94 : 61, color: "#10B981" },
  ];

  return (
    <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-5 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-4">
        <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">ATS Score</span>
        {animated && (
          <span className="text-[10px] font-bold uppercase tracking-widest text-lumina-teal bg-lumina-teal/15 px-2 py-0.5 rounded-full">
            +57 pts after Lumina
          </span>
        )}
      </div>

      {/* Before / After */}
      <div className="flex items-center gap-4 mb-5">
        <div className="text-center">
          <div className="text-3xl font-serif font-bold text-white/40 leading-none">34</div>
          <div className="text-[9px] text-white/30 uppercase tracking-widest mt-1">Before</div>
        </div>
        <TrendingUp className="w-5 h-5 text-lumina-teal mx-1 shrink-0" />
        <div className="text-center">
          <div
            className="text-3xl font-serif font-bold leading-none transition-all"
            style={{ color: "#10B981" }}
          >
            {score}
          </div>
          <div className="text-[9px] text-white/30 uppercase tracking-widest mt-1">After</div>
        </div>
      </div>

      {/* Progress bars */}
      <div className="space-y-3">
        {bars.map((bar) => (
          <div key={bar.label}>
            <div className="flex justify-between mb-1">
              <span className="text-[10px] text-white/40">{bar.label}</span>
              <span className="text-[10px] font-bold text-white/60">{bar.value}%</span>
            </div>
            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: bar.color }}
                initial={{ width: "0%" }}
                animate={{ width: `${bar.value}%` }}
                transition={{ duration: 1.4, delay: 1.4, ease: "easeOut" }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ── Feature List ── */
const features = [
  { icon: Zap, label: "AI-powered JD decoding & gap analysis" },
  { icon: FileText, label: "Precision-tailored resume bullet points" },
  { icon: TrendingUp, label: "Before & after ATS score tracking" },
  { icon: CheckCircle2, label: "PDF & DOCX export, ready to send" },
];

/* ── Main Auth Page ── */
const Auth = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [mode, setMode] = useState<AuthMode>("select");
  const [action, setAction] = useState<AuthAction>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && user) navigate("/dashboard");
  }, [user, authLoading, navigate]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setMode("update_password");
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
        const { error } = await supabase.auth.signUp({ email: email.trim(), password });
        if (error) throw error;
        toast.success("Account created! Welcome to Lumina.");
        navigate("/dashboard");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
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

  const panelTitle =
    mode === "reset" ? "Reset Password" :
    mode === "update_password" ? "Set New Password" :
    action === "signup" ? "Create your account" : "Welcome back";

  const panelSubtitle =
    mode === "reset" ? "We'll send a secure link to your inbox." :
    mode === "update_password" ? "Choose a strong new password." :
    action === "signup" ? "Start optimising your career trajectory today." : "Sign in to access your intelligence dashboard.";

  return (
    <div className="min-h-screen flex bg-[#060D14] overflow-hidden">

      {/* ── LEFT PANEL ── */}
      <div className="hidden lg:flex flex-col justify-between w-[52%] min-h-screen bg-lumina-navy relative overflow-hidden px-14 py-12">

        {/* Background mesh */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-lumina-teal/8 blur-[120px]" />
          <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-blue-600/6 blur-[100px]" />
          {/* Subtle dot grid */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: "radial-gradient(circle, #10B981 1px, transparent 1px)",
              backgroundSize: "32px 32px",
            }}
          />
        </div>

        {/* Top: Logo */}
        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-3 group">
            <img src="/logo.png" alt="Lumina" className="h-8 w-auto object-contain brightness-110" />
          </Link>
        </div>

        {/* Middle: Headline + Features */}
        <div className="relative z-10 flex-1 flex flex-col justify-center py-12 gap-10">
          <div>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-lumina-teal font-display font-bold text-xs uppercase tracking-[0.2em] mb-4"
            >
              Career Intelligence Platform
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="font-serif text-4xl xl:text-5xl text-white leading-[1.15] mb-4"
            >
              Land more interviews<br />
              <span className="text-lumina-teal">starting today.</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-white/50 text-base font-body leading-relaxed max-w-sm"
            >
              Lumina decodes every job description, closes your skill gaps, and engineers a resume that wins — in under 60 seconds.
            </motion.p>
          </div>

          {/* Feature list */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.45 }}
            className="space-y-3.5"
          >
            {features.map((f, i) => (
              <motion.div
                key={f.label}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.08 }}
                className="flex items-center gap-3"
              >
                <div className="w-8 h-8 rounded-xl bg-lumina-teal/15 flex items-center justify-center shrink-0">
                  <f.icon className="w-4 h-4 text-lumina-teal" />
                </div>
                <span className="text-sm text-white/65 font-body">{f.label}</span>
              </motion.div>
            ))}
          </motion.div>

          {/* ATS Score Widget */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
          >
            <ATSScoreWidget />
          </motion.div>
        </div>

        {/* Bottom: trust text */}
        <div className="relative z-10">
          <p className="text-[11px] text-white/20 font-body">
            Free to start — no credit card required.
          </p>
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="flex-1 flex flex-col items-center justify-center min-h-screen px-6 py-10 relative">

        {/* Subtle background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-lumina-teal/4 blur-[140px]" />
        </div>

        {/* Mobile logo */}
        <div className="lg:hidden mb-8 relative z-10">
          <Link to="/">
            <img src="/logo.png" alt="Lumina" className="h-7 w-auto object-contain brightness-110" />
          </Link>
        </div>

        <div className="w-full max-w-[400px] relative z-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={mode + action}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.28, ease: "easeOut" }}
            >

              {/* Header */}
              <div className="mb-8">
                {mode !== "select" && mode !== "update_password" && (
                  <button
                    onClick={() => mode === "reset" ? setMode("email") : reset()}
                    className="flex items-center gap-1.5 text-xs text-white/30 hover:text-white/70 mb-6 transition-colors"
                  >
                    <ArrowLeft className="w-3 h-3" /> Back
                  </button>
                )}
                <h2 className="font-serif text-3xl text-white mb-2 leading-tight">{panelTitle}</h2>
                <p className="text-sm text-white/40 font-body">{panelSubtitle}</p>
              </div>

              {/* ── SELECT MODE ── */}
              {mode === "select" && (
                <div className="space-y-3">
                  {/* Sign In / Sign Up tabs */}
                  <div className="flex gap-2 bg-white/[0.05] p-1 rounded-xl border border-white/8 mb-5">
                    {(["login", "signup"] as AuthAction[]).map((a) => (
                      <button
                        key={a}
                        onClick={() => setAction(a)}
                        className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ${
                          action === a
                            ? "bg-lumina-teal text-white shadow-sm"
                            : "text-white/40 hover:text-white/70"
                        }`}
                      >
                        {a === "login" ? "Sign In" : "Sign Up"}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => setMode("email")}
                    className="group relative w-full flex items-center gap-3 px-5 py-4 rounded-2xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] hover:border-lumina-teal/40 transition-all text-sm font-semibold text-white"
                  >
                    <div className="w-9 h-9 rounded-xl bg-white/8 flex items-center justify-center shrink-0 group-hover:bg-lumina-teal/20 transition-colors">
                      <Mail className="w-4 h-4 text-white/60 group-hover:text-lumina-teal transition-colors" />
                    </div>
                    Continue with Email & Password
                  </button>

                  {/* Benefit chips */}
                  <div className="pt-4 space-y-2.5">
                    {[
                      "ATS keyword matching for every job",
                      "Stronger bullet points with real impact",
                      "Before & after score — see the improvement",
                      "PDF & DOCX download, ready to send",
                    ].map((text) => (
                      <div key={text} className="flex items-center gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-lumina-teal shrink-0" />
                        <span className="text-[13px] text-white/45 font-body">{text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── EMAIL MODE ── */}
              {mode === "email" && (
                <div className="space-y-4">
                  {/* Login / Signup tab inside email mode */}
                  <div className="flex gap-2 bg-white/[0.05] p-1 rounded-xl border border-white/8 mb-2">
                    {(["login", "signup"] as AuthAction[]).map((a) => (
                      <button
                        key={a}
                        onClick={() => setAction(a)}
                        className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ${
                          action === a
                            ? "bg-lumina-teal text-white shadow-sm"
                            : "text-white/40 hover:text-white/70"
                        }`}
                      >
                        {a === "login" ? "Sign In" : "Sign Up"}
                      </button>
                    ))}
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="text-[11px] font-bold uppercase tracking-widest text-white/30 block mb-1.5">Email</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full px-4 py-3.5 rounded-xl border border-white/10 bg-white/[0.05] text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-lumina-teal/60 focus:bg-white/[0.08] transition-all"
                        autoFocus
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold uppercase tracking-widest text-white/30 block mb-1.5">Password</label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Min 6 characters"
                          className="w-full px-4 py-3.5 pr-12 rounded-xl border border-white/10 bg-white/[0.05] text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-lumina-teal/60 focus:bg-white/[0.08] transition-all"
                          onKeyDown={(e) => e.key === "Enter" && handleEmailAuth()}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/60 transition-colors"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {action === "login" && (
                      <div className="flex justify-end">
                        <button
                          onClick={() => setMode("reset")}
                          className="text-xs text-lumina-teal/70 hover:text-lumina-teal transition-colors"
                        >
                          Forgot password?
                        </button>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={handleEmailAuth}
                    disabled={loading}
                    className="w-full py-4 rounded-2xl bg-lumina-teal text-white font-bold text-sm tracking-tight hover:bg-lumina-teal/90 active:scale-[0.98] transition-all disabled:opacity-40 flex items-center justify-center gap-2 mt-2 shadow-[0_8px_32px_rgba(16,185,129,0.25)]"
                  >
                    {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                    {action === "login" ? "Sign In to Lumina" : "Create Free Account"}
                  </button>
                </div>
              )}

              {/* ── RESET PASSWORD ── */}
              {mode === "reset" && (
                <div className="space-y-4">
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-widest text-white/30 block mb-1.5">Email address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your account email"
                      className="w-full px-4 py-3.5 rounded-xl border border-white/10 bg-white/[0.05] text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-lumina-teal/60 focus:bg-white/[0.08] transition-all"
                      autoFocus
                      onKeyDown={(e) => e.key === "Enter" && handleResetPassword()}
                    />
                  </div>
                  <button
                    onClick={handleResetPassword}
                    disabled={loading}
                    className="w-full py-4 rounded-2xl bg-lumina-teal text-white font-bold text-sm tracking-tight hover:bg-lumina-teal/90 active:scale-[0.98] transition-all disabled:opacity-40 flex items-center justify-center gap-2 shadow-[0_8px_32px_rgba(16,185,129,0.25)]"
                  >
                    {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                    Send Reset Link
                  </button>
                </div>
              )}

              {/* ── UPDATE PASSWORD ── */}
              {mode === "update_password" && (
                <div className="space-y-4">
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-widest text-white/30 block mb-1.5">New Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Min 6 characters"
                        className="w-full px-4 py-3.5 pr-12 rounded-xl border border-white/10 bg-white/[0.05] text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-lumina-teal/60 focus:bg-white/[0.08] transition-all"
                        autoFocus
                        onKeyDown={(e) => e.key === "Enter" && handleUpdatePassword()}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/60 transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={handleUpdatePassword}
                    disabled={loading}
                    className="w-full py-4 rounded-2xl bg-lumina-teal text-white font-bold text-sm tracking-tight hover:bg-lumina-teal/90 active:scale-[0.98] transition-all disabled:opacity-40 flex items-center justify-center gap-2 shadow-[0_8px_32px_rgba(16,185,129,0.25)]"
                  >
                    {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                    Update Password
                  </button>
                </div>
              )}

              {/* Footer links */}
              <div className="mt-8 space-y-3 text-center">
                <p className="text-[11px] text-white/20 font-body leading-relaxed">
                  By continuing, you agree to our{" "}
                  <a href="#" className="underline underline-offset-2 hover:text-white/40 transition-colors">Terms</a>
                  {" "}and{" "}
                  <a href="#" className="underline underline-offset-2 hover:text-white/40 transition-colors">Privacy Policy</a>
                  .
                </p>
                <Link
                  to="/"
                  className="inline-block text-[11px] text-white/20 hover:text-white/50 transition-colors"
                >
                  ← Back to homepage
                </Link>
              </div>

            </motion.div>
          </AnimatePresence>
        </div>

        {/* Engine status – dev indicator */}
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 opacity-15 hover:opacity-60 transition-opacity z-50">
          <p className="text-[8px] font-mono uppercase tracking-widest text-white/40 whitespace-nowrap">
            Engine Signal: {supabase?.auth?.getSession ? "ACTIVE" : (import.meta.env.VITE_SUPABASE_URL ? `...${import.meta.env.VITE_SUPABASE_URL.slice(-12)}` : "OFFLINE")}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
