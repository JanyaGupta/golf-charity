"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Trophy, Lock, Eye, EyeOff, Loader2, Check } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

export default function ResetPasswordPage() {
  const supabase = createClient();
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) { setError("Passwords don't match"); return; }
    if (password.length < 8) { setError("Password must be at least 8 characters"); return; }
    setLoading(true);
    setError("");
    try {
      const { error: err } = await supabase.auth.updateUser({ password });
      if (err) throw err;
      setDone(true);
      setTimeout(() => router.push("/dashboard"), 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="text-center mb-8">
        <Link href="/" className="inline-flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-500 to-gold-400 flex items-center justify-center">
            <Trophy className="w-7 h-7 text-white" />
          </div>
          <span style={{ fontFamily: "var(--font-display)" }} className="text-2xl font-bold">GolfCharity</span>
        </Link>
      </div>

      <div className="glass rounded-3xl p-8 border border-white/10">
        {done ? (
          <div className="text-center py-4">
            <div className="w-14 h-14 bg-brand-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-7 h-7 text-brand-400" />
            </div>
            <h2 className="text-xl font-bold mb-2">Password updated!</h2>
            <p className="text-slate-400 text-sm">Redirecting to your dashboard...</p>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-bold mb-6" style={{ fontFamily: "var(--font-display)" }}>Set New Password</h1>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl p-3 mb-4 text-sm">{error}</div>
            )}

            <form onSubmit={handleReset} className="space-y-4">
              {[
                { label: "New Password", value: password, setter: setPassword, placeholder: "Min. 8 characters" },
                { label: "Confirm Password", value: confirm, setter: setConfirm, placeholder: "Repeat password" },
              ].map((f) => (
                <div key={f.label}>
                  <label className="text-sm text-slate-400 mb-2 block">{f.label}</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type={showPass ? "text" : "password"}
                      value={f.value}
                      onChange={(e) => f.setter(e.target.value)}
                      required
                      placeholder={f.placeholder}
                      className="w-full bg-dark-900/60 border border-white/10 rounded-xl pl-10 pr-12 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-brand-500 transition-all"
                    />
                  </div>
                </div>
              ))}
              <button type="button" onClick={() => setShowPass(!showPass)} className="text-slate-500 hover:text-slate-300 text-xs">
                {showPass ? "Hide" : "Show"} passwords
              </button>
              <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Update Password"}
              </button>
            </form>
          </>
        )}
      </div>
    </motion.div>
  );
}
