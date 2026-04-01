"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Trophy, Mail, Lock, User, ArrowRight, Eye, EyeOff, Loader2, Check } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const perks = [
  "Monthly prize draws up to £10,000+",
  "Score-based algorithmic entries",
  "Support charities you love",
  "Full dashboard & history",
];

export default function SignupPage() {
  const router = useRouter();
  const supabase = createClient();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { error: err } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: { full_name: form.name },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (err) throw err;
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass rounded-3xl p-10 border border-brand-500/30 text-center"
      >
        <div className="w-16 h-16 bg-brand-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check className="w-8 h-8 text-brand-400" />
        </div>
        <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: "var(--font-display)" }}>Check your email!</h2>
        <p className="text-slate-400 mb-6">We sent a verification link to <strong className="text-white">{form.email}</strong>. Click it to activate your account.</p>
        <Link href="/auth/login" className="btn-primary justify-center">Back to Login</Link>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="text-center mb-8">
        <Link href="/" className="inline-flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-500 to-gold-400 flex items-center justify-center glow-green">
            <Trophy className="w-7 h-7 text-white" />
          </div>
          <span style={{ fontFamily: "var(--font-display)" }} className="text-2xl font-bold">GolfCharity</span>
        </Link>
        <p className="text-slate-400 mt-2">Start winning. Start giving.</p>
      </div>

      {/* Perks */}
      <div className="grid grid-cols-2 gap-2 mb-6">
        {perks.map((p) => (
          <div key={p} className="glass rounded-xl p-3 border border-white/5 flex items-start gap-2">
            <Check className="w-4 h-4 text-brand-400 flex-shrink-0 mt-0.5" />
            <span className="text-slate-400 text-xs leading-snug">{p}</span>
          </div>
        ))}
      </div>

      <div className="glass rounded-3xl p-8 border border-white/10">
        <h1 className="text-2xl font-bold mb-6" style={{ fontFamily: "var(--font-display)" }}>Create Account</h1>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl p-3 mb-4 text-sm"
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="text-sm text-slate-400 mb-2 block">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                placeholder="John Smith"
                className="w-full bg-dark-900/60 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/30 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="text-sm text-slate-400 mb-2 block">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                placeholder="you@example.com"
                className="w-full bg-dark-900/60 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/30 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="text-sm text-slate-400 mb-2 block">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type={showPass ? "text" : "password"}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                minLength={8}
                placeholder="Min. 8 characters"
                className="w-full bg-dark-900/60 border border-white/10 rounded-xl pl-10 pr-12 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/30 transition-all"
              />
              <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full justify-center py-3 disabled:opacity-50"
          >
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating account...</> : <>Create Account <ArrowRight className="w-4 h-4" /></>}
          </button>
        </form>

        <p className="text-center text-slate-500 text-sm mt-6">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-brand-400 hover:text-brand-300 font-medium transition-colors">Sign in</Link>
        </p>
        <p className="text-center text-slate-600 text-xs mt-3">
          By signing up, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </motion.div>
  );
}
