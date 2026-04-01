"use client";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function SubscriptionSuccessPage() {
  const params = useSearchParams();
  const subscription = params.get("subscription");

  if (subscription !== "success") return null;

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass rounded-3xl p-12 border border-brand-500/30 text-center max-w-md glow-green"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
          className="w-20 h-20 bg-brand-500/20 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <CheckCircle className="w-10 h-10 text-brand-400" />
        </motion.div>
        <h1 style={{ fontFamily: "var(--font-display)" }} className="text-3xl font-bold mb-3">
          You're subscribed! 🎉
        </h1>
        <p className="text-slate-400 mb-8 leading-relaxed">
          Welcome to GolfCharity. Add your golf scores to generate your draw numbers and enter this month's prize draw.
        </p>
        <Link href="/dashboard/scores" className="btn-primary w-full justify-center py-3 text-base">
          Add Your Scores <ArrowRight className="w-5 h-5" />
        </Link>
        <Link href="/dashboard" className="block mt-3 text-slate-500 hover:text-slate-300 transition-colors text-sm">
          Go to Dashboard
        </Link>
      </motion.div>
    </div>
  );
}
