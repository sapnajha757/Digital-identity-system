"use client";

import { FormEvent, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/api-client";
import { HudFrame } from "@/components/HudFrame";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export default function LoginPage() {
  const [mode, setMode] = useState<"login" | "signup" | "forgot">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // Register additional fields
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Forgot password flow wizard steps: 1 to 5
  const [forgotStep, setForgotStep] = useState<number>(1);
  const [recoveryMethod, setRecoveryMethod] = useState<"email" | "phone">("email");
  const [otpVal, setOtpVal] = useState("");
  const [otpError, setOtpError] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Read direct signup link from parameters
  useEffect(() => {
    const initMode = searchParams.get("mode");
    if (initMode === "signup") {
      setMode("signup");
    }
  }, [searchParams]);

  // Passwords validator match
  const isPasswordValid = password.length >= 6;
  const isConfirmMatch = mode === "signup" ? password === confirmPassword : true;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (mode === "signup" && !isConfirmMatch) {
      setError("Passwords do not match");
      return;
    }

    setSubmitting(true);
    setError(null);
    setInfo(null);

    try {
      if (mode === "login") {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;
        router.replace("/dashboard");
      } else {
        const { error: signUpError } = await supabase.auth.signUp({ email, password });
        if (signUpError) throw signUpError;
        setInfo("Account created — check your inbox to confirm your email, then log in.");
        setMode("login");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  const handleExploreDemo = () => {
    localStorage.setItem("dis_demo_mode", "true");
    localStorage.setItem("dis_session", JSON.stringify({
      access_token: "mock-token",
      user: { email: "demo@identityos.local" }
    }));
    window.dispatchEvent(new Event("storage"));
    window.dispatchEvent(new Event("demo-mode-changed"));
    router.replace("/dashboard");
  };

  // Handle forgot password mock wizard
  const handleForgotFlow = (e: FormEvent) => {
    e.preventDefault();
    setOtpError("");
    setError(null);

    if (forgotStep === 1) {
      // Recovery method chosen
      setForgotStep(2);
    } else if (forgotStep === 2) {
      // OTP simulated delivery
      setForgotStep(3);
    } else if (forgotStep === 3) {
      // Verification of simulated OTP (let user enter '1234' or any code)
      if (!otpVal) {
        setOtpError("Please enter the verification OTP code.");
        return;
      }
      setForgotStep(4);
    } else if (forgotStep === 4) {
      // Password update
      if (newPassword.length < 6) {
        setError("New password must be at least 6 characters.");
        return;
      }
      if (newPassword !== confirmNewPassword) {
        setError("Passwords do not match.");
        return;
      }
      setForgotStep(5);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center px-6 bg-void overflow-hidden">
      {/* Dynamic background styling */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-[20%] left-[10%] w-[35vw] h-[35vw] bg-cyan/5 rounded-full filter blur-[80px]" />
        <div className="absolute bottom-[20%] right-[10%] w-[40vw] h-[40vw] bg-magenta/5 rounded-full filter blur-[90px]" />
      </div>

      <div className="relative z-10 w-full max-w-md space-y-6">
        <div className="text-center">
          <Link href="/" className="font-display text-2xl font-black tracking-widest text-fog select-none">
            IDENTITY<span className="text-cyan">OS</span>
          </Link>
          <p className="mt-2 font-mono text-[9px] uppercase tracking-widest text-mist">
            {mode === "login"
              ? "// AUTHENTICATE_USER"
              : mode === "signup"
              ? "// CREATE_CREDENTIALS"
              : `// PASSWORD_RECOVERY_STEP_0${forgotStep}`}
          </p>
        </div>

        <HudFrame accent="cyan" className="bg-panel/40 backdrop-blur-md p-6 rounded-xl border border-panel-raised shadow-2xl">
          <AnimatePresence mode="wait">
            {mode !== "forgot" ? (
              <motion.form
                key="auth-form"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                onSubmit={handleSubmit}
                className="space-y-4"
              >
                {mode === "signup" && (
                  <div>
                    <label className="mb-1.5 block font-mono text-[9px] uppercase tracking-widest text-mist">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full rounded border border-panel-raised bg-void/50 px-4 py-2.5 font-mono text-xs text-fog placeholder:text-mist/40 focus:border-cyan focus:outline-none"
                      placeholder="Jane Doe"
                    />
                  </div>
                )}

                <div>
                  <label className="mb-1.5 block font-mono text-[9px] uppercase tracking-widest text-mist">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded border border-panel-raised bg-void/50 px-4 py-2.5 font-mono text-xs text-fog placeholder:text-mist/40 focus:border-cyan focus:outline-none"
                    placeholder="you@example.com"
                  />
                </div>

                {mode === "signup" && (
                  <div>
                    <label className="mb-1.5 block font-mono text-[9px] uppercase tracking-widest text-mist">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full rounded border border-panel-raised bg-void/50 px-4 py-2.5 font-mono text-xs text-fog placeholder:text-mist/40 focus:border-cyan focus:outline-none"
                      placeholder="+91 99999 99999"
                    />
                  </div>
                )}

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block font-mono text-[9px] uppercase tracking-widest text-mist">
                      Password
                    </label>
                    {mode === "login" && (
                      <button
                        type="button"
                        onClick={() => {
                          setMode("forgot");
                          setForgotStep(1);
                        }}
                        className="font-mono text-[8px] uppercase tracking-wider text-cyan hover:underline"
                      >
                        Forgot?
                      </button>
                    )}
                  </div>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded border border-panel-raised bg-void/50 px-4 py-2.5 font-mono text-xs text-fog placeholder:text-mist/40 focus:border-cyan focus:outline-none"
                    placeholder="••••••••"
                  />
                  {mode === "signup" && password && (
                    <div className="mt-1 flex justify-between items-center text-[8px] font-mono">
                      <span className="text-mist">Strength:</span>
                      <span className={password.length >= 8 ? "text-cyan font-bold" : "text-amber"}>
                        {password.length >= 8 ? "STRONG" : "MEDIUM"}
                      </span>
                    </div>
                  )}
                </div>

                {mode === "signup" && (
                  <div>
                    <label className="mb-1.5 block font-mono text-[9px] uppercase tracking-widest text-mist">
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={`w-full rounded border bg-void/50 px-4 py-2.5 font-mono text-xs text-fog placeholder:text-mist/40 focus:outline-none ${
                        confirmPassword && !isConfirmMatch ? "border-red-500" : "border-panel-raised focus:border-cyan"
                      }`}
                      placeholder="••••••••"
                    />
                  </div>
                )}

                {error && <p className="font-mono text-[10px] text-red-500">[ERROR] {error}</p>}
                {info && <p className="font-mono text-[10px] text-cyan">{info}</p>}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full rounded border border-cyan/50 bg-cyan/10 hover:bg-cyan/20 px-5 py-2.5 font-mono text-xs uppercase tracking-widest text-cyan shadow-glow-cyan transition-all duration-200"
                >
                  {submitting ? "Processing Request..." : mode === "login" ? "LOG IN" : "CREATE ACCOUNT"}
                </button>

                {mode === "login" && (
                  <button
                    type="button"
                    onClick={handleExploreDemo}
                    className="w-full mt-2 rounded border border-magenta/40 bg-magenta/5 hover:bg-magenta/15 px-5 py-2.5 font-mono text-xs uppercase tracking-widest text-magenta shadow-glow-magenta transition-all duration-200"
                  >
                    ⚡ EXPLORE DEMO PORTFOLIO
                  </button>
                )}
              </motion.form>
            ) : (
              <motion.form
                key="forgot-form"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                onSubmit={handleForgotFlow}
                className="space-y-4 font-mono text-xs"
              >
                <div className="flex justify-between items-center border-b border-panel-raised/50 pb-2 mb-3">
                  <span className="text-[9px] text-cyan font-bold uppercase">// RECOVERY STEPS</span>
                  <span className="text-[9px] text-mist/60">Step {forgotStep} of 5</span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-panel-raised h-1 rounded overflow-hidden">
                  <div
                    className="bg-cyan h-full transition-all duration-300"
                    style={{ width: `${(forgotStep / 5) * 100}%` }}
                  />
                </div>

                {/* STEP 1: Recovery target option */}
                {forgotStep === 1 && (
                  <div className="space-y-3">
                    <p className="text-[11px] text-mist leading-relaxed">Select how you want to receive the recovery OTP credential code:</p>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setRecoveryMethod("email")}
                        className={`p-3 border rounded text-center transition-colors ${recoveryMethod === "email" ? "border-cyan bg-cyan/5 text-cyan" : "border-panel-raised text-mist"}`}
                      >
                        📧 Email Address
                      </button>
                      <button
                        type="button"
                        onClick={() => setRecoveryMethod("phone")}
                        className={`p-3 border rounded text-center transition-colors ${recoveryMethod === "phone" ? "border-cyan bg-cyan/5 text-cyan" : "border-panel-raised text-mist"}`}
                      >
                        📱 Phone Number
                      </button>
                    </div>
                    {recoveryMethod === "email" ? (
                      <div>
                        <label className="mb-1 block text-[9px] text-mist uppercase">Email address</label>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full bg-void border border-panel-raised rounded px-3 py-2 text-xs text-fog"
                          placeholder="jane.doe@example.com"
                        />
                      </div>
                    ) : (
                      <div>
                        <label className="mb-1 block text-[9px] text-mist uppercase">Phone number</label>
                        <input
                          type="tel"
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full bg-void border border-panel-raised rounded px-3 py-2 text-xs text-fog"
                          placeholder="+91 99999 99999"
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* STEP 2: Delivery notification */}
                {forgotStep === 2 && (
                  <div className="space-y-3 text-center py-4">
                    <p className="text-[11px] text-mist">
                      A recovery OTP security code was generated for:<br />
                      <span className="text-cyan font-bold">{recoveryMethod === "email" ? email : phone}</span>
                    </p>
                    <div className="border border-panel-raised bg-void/50 p-2.5 rounded text-[10px] text-mist/60 italic">
                      💡 Simulated OTP dispatch complete.
                    </div>
                  </div>
                )}

                {/* STEP 3: OTP verification */}
                {forgotStep === 3 && (
                  <div className="space-y-3">
                    <p className="text-[11px] text-mist">Input the 6-digit OTP verification code received:</p>
                    <input
                      type="text"
                      required
                      value={otpVal}
                      onChange={(e) => setOtpVal(e.target.value)}
                      className="w-full bg-void border border-panel-raised rounded px-4 py-2.5 text-center text-sm font-bold text-fog tracking-widest"
                      placeholder="000000"
                    />
                    {otpError && <p className="text-[9px] text-red-500">{otpError}</p>}
                  </div>
                )}

                {/* STEP 4: Password creation */}
                {forgotStep === 4 && (
                  <div className="space-y-3">
                    <div>
                      <label className="mb-1 block text-[9px] text-mist uppercase">New Password</label>
                      <input
                        type="password"
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full bg-void border border-panel-raised rounded px-3 py-2 text-xs text-fog"
                        placeholder="••••••••"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-[9px] text-mist uppercase">Confirm New Password</label>
                      <input
                        type="password"
                        required
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                        className="w-full bg-void border border-panel-raised rounded px-3 py-2 text-xs text-fog"
                        placeholder="••••••••"
                      />
                    </div>
                    {error && <p className="text-[9px] text-red-500">{error}</p>}
                  </div>
                )}

                {/* STEP 5: Success celebration */}
                {forgotStep === 5 && (
                  <div className="space-y-3 text-center py-6">
                    <span className="text-3xl block">✨</span>
                    <h4 className="font-display text-sm font-bold text-cyan uppercase">Password Updated</h4>
                    <p className="text-[10px] text-mist">Your security credentials have been synchronized. You can now log in safely.</p>
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  {forgotStep < 5 ? (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          if (forgotStep === 1) {
                            setMode("login");
                          } else {
                            setForgotStep(forgotStep - 1);
                          }
                        }}
                        className="w-1/3 py-2 border border-panel-raised text-mist rounded hover:bg-panel-raised/30 transition-all font-mono text-[10px]"
                      >
                        BACK
                      </button>
                      <button
                        type="submit"
                        className="w-2/3 py-2 bg-cyan text-void rounded font-bold hover:scale-[1.02] transition-all font-mono text-[10px] shadow-glow-cyan"
                      >
                        {forgotStep === 4 ? "RESET" : "CONTINUE"}
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setMode("login");
                        setForgotStep(1);
                      }}
                      className="w-full py-2 bg-cyan text-void rounded font-bold hover:scale-[1.02] transition-all font-mono text-[10px] shadow-glow-cyan"
                    >
                      RETURN TO LOGIN
                    </button>
                  )}
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </HudFrame>

        {mode !== "forgot" && (
          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                setMode(mode === "login" ? "signup" : "login");
                setError(null);
                setInfo(null);
              }}
              className="font-mono text-xs text-mist hover:text-cyan transition-colors"
            >
              {mode === "login" ? "New here? Create an account" : "Already have an account? Log in"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
