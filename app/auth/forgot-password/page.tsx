"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Trophy, Mail, ArrowRight, Loader2, Check } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });
      if (err) throw err;
      setSent(true);
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
        {sent ? (
          <div className="text-center py-4">
            <div className="w-14 h-14 bg-brand-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-7 h-7 text-brand-400" />
            </div>
            <h2 className="text-xl font-bold mb-2">Email sent!</h2>
            <p className="text-slate-400 text-sm mb-6">Check your inbox for a password reset link.</p>
            <Link href="/auth/login" className="text-brand-400 hover:text-brand-300 transition-colors text-sm">
              Back to login
            </Link>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-bold mb-2" style={{ fontFamily: "var(--font-display)" }}>Reset Password</h1>
            <p className="text-slate-400 text-sm mb-6">Enter your email and we'll send you a reset link.</p>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl p-3 mb-4 text-sm">{error}</div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm text-slate-400 mb-2 block">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="you@example.com"
                    className="w-full bg-dark-900/60 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-brand-500 transition-all"
                  />
                </div>
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3">
                {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</> : <>Send Reset Link <ArrowRight className="w-4 h-4" /></>}
              </button>
            </form>

            <p className="text-center text-slate-500 text-sm mt-6">
              <Link href="/auth/login" className="text-brand-400 hover:text-brand-300 transition-colors">Back to login</Link>
            </p>
          </>
        )}
      </div>
    </motion.div>
  );
}
