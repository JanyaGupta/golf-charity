"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#020617] text-white flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center glass rounded-3xl p-12 border border-red-500/20 max-w-md"
      >
        <AlertTriangle className="w-16 h-16 text-red-400/50 mx-auto mb-6" />
        <h1 style={{ fontFamily: "var(--font-display)" }} className="text-3xl font-bold mb-3">
          Something went wrong
        </h1>
        <p className="text-slate-500 mb-8">An unexpected error occurred. Please try again.</p>
        <button
          onClick={reset}
          className="btn-primary inline-flex"
        >
          <RefreshCw className="w-4 h-4" />
          Try Again
        </button>
      </motion.div>
    </div>
  );
}
