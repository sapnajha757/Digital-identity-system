"use client";

import { FormEvent, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabaseClient } from "@/lib/supabase";
import { HudFrame } from "@/components/HudFrame";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export default function ResetPasswordPage() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Optionally check if we are in a recovery session
    const checkSession = async () => {
      const { data: { session } } = await supabaseClient.auth.getSession();
      // Even if session is missing initially, Supabase handles the #access_token in the URL.
    };
    checkSession();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    try {
      const { error: updateError } = await supabaseClient.auth.updateUser({
        password: newPassword,
      });

      if (updateError) throw updateError;
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update password");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center px-6 bg-void overflow-hidden">
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
            // UPDATE_CREDENTIALS
          </p>
        </div>

        <HudFrame accent="cyan" className="bg-panel/40 backdrop-blur-md p-6 rounded-xl border border-panel-raised shadow-2xl">
          <AnimatePresence mode="wait">
            {!success ? (
              <motion.form
                key="reset-form"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                onSubmit={handleSubmit}
                className="space-y-4"
              >
                <div className="flex justify-between items-center border-b border-panel-raised/50 pb-2 mb-4">
                  <span className="text-[9px] text-cyan font-bold uppercase">// CHOOSE NEW PASSWORD</span>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block font-mono text-[9px] uppercase tracking-widest text-mist">
                      New Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="font-mono text-[8px] uppercase tracking-wider text-mist hover:text-cyan"
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-void border border-panel-raised rounded px-4 py-2.5 font-mono text-xs text-fog placeholder:text-mist/40 focus:border-cyan focus:outline-none"
                    placeholder="••••••••"
                  />
                  {newPassword && (
                    <div className="mt-1 flex justify-between items-center text-[8px] font-mono">
                      <span className="text-mist">Strength:</span>
                      <span className={newPassword.length >= 8 ? "text-cyan font-bold" : "text-amber"}>
                        {newPassword.length >= 8 ? "STRONG" : "MEDIUM"}
                      </span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="mb-1.5 block font-mono text-[9px] uppercase tracking-widest text-mist">
                    Confirm Password
                  </label>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`w-full rounded border bg-void px-4 py-2.5 font-mono text-xs text-fog placeholder:text-mist/40 focus:outline-none ${
                      confirmPassword && newPassword !== confirmPassword ? "border-red-500" : "border-panel-raised focus:border-cyan"
                    }`}
                    placeholder="••••••••"
                  />
                </div>

                {error && <p className="font-mono text-[10px] text-red-500">[ERROR] {error}</p>}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full mt-4 rounded border border-cyan/50 bg-cyan/10 hover:bg-cyan/20 px-5 py-2.5 font-mono text-xs uppercase tracking-widest text-cyan shadow-glow-cyan transition-all duration-200"
                >
                  {submitting ? "UPDATING..." : "UPDATE PASSWORD"}
                </button>
              </motion.form>
            ) : (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-4 text-center py-6"
              >
                <span className="text-3xl block">✨</span>
                <h4 className="font-display text-sm font-bold text-cyan uppercase tracking-wider">Password Updated</h4>
                <p className="text-[10px] text-mist px-4 leading-relaxed">
                  Your password has been changed successfully.
                </p>
                <div className="pt-4">
                  <Link
                    href="/login"
                    className="inline-block w-full py-2.5 bg-cyan/10 border border-cyan/50 text-cyan rounded hover:bg-cyan/20 transition-all font-mono text-[10px] shadow-glow-cyan tracking-widest uppercase text-center"
                  >
                    GO TO LOGIN
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </HudFrame>
      </div>
    </div>
  );
}
