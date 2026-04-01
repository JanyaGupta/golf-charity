"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Trophy, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#020617] text-white flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <div className="text-[10rem] leading-none font-bold opacity-5 select-none" style={{ fontFamily: "var(--font-display)" }}>
          404
        </div>
        <div className="mt-[-4rem] relative z-10">
          <Trophy className="w-16 h-16 text-brand-500/50 mx-auto mb-6" />
          <h1 style={{ fontFamily: "var(--font-display)" }} className="text-4xl font-bold mb-3">
            Missed this one
          </h1>
          <p className="text-slate-500 text-lg mb-8">This page doesn't exist. But your next win might!</p>
          <Link href="/" className="btn-primary inline-flex">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
