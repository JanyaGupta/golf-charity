"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy, LayoutDashboard, Users, CreditCard, Target,
  Shuffle, Award, Heart, LogOut, Menu, ChevronRight, Shield
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const adminNavItems = [
  { href: "/admin", icon: LayoutDashboard, label: "Overview" },
  { href: "/admin/users", icon: Users, label: "Users" },
  { href: "/admin/subscriptions", icon: CreditCard, label: "Subscriptions" },
  { href: "/admin/scores", icon: Target, label: "Scores" },
  { href: "/admin/draw", icon: Shuffle, label: "Draw System" },
  { href: "/admin/winners", icon: Award, label: "Winners" },
  { href: "/admin/charities", icon: Heart, label: "Charities" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const Sidebar = () => (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-white/5">
        <Link href="/admin" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-500 to-orange-400 flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <div style={{ fontFamily: "var(--font-display)" }} className="font-bold text-base">Admin Panel</div>
            <div className="text-slate-600 text-xs">GolfCharity</div>
          </div>
        </Link>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {adminNavItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                active ? "bg-red-500/15 text-red-400 border border-red-500/20" : "text-slate-500 hover:text-slate-200 hover:bg-white/5"
              }`}
            >
              <item.icon className={`w-5 h-5 ${active ? "text-red-400" : "text-slate-500"}`} />
              <span className="text-sm font-medium">{item.label}</span>
              {active && <ChevronRight className="w-4 h-4 ml-auto text-red-500" />}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-white/5 space-y-2">
        <Link href="/dashboard" className="flex items-center gap-3 px-4 py-2 rounded-xl text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-all text-sm">
          <Trophy className="w-4 h-4" /> User Dashboard
        </Link>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-2 rounded-xl text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all text-sm"
        >
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#020617] text-white flex">
      <aside className="hidden lg:flex w-64 flex-col bg-dark-900/50 border-r border-white/5 fixed inset-y-0 left-0 z-40">
        <Sidebar />
      </aside>
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMobileOpen(false)} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden" />
            <motion.aside initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }} transition={{ type: "spring", stiffness: 300, damping: 30 }} className="fixed inset-y-0 left-0 w-64 bg-dark-900 border-r border-white/5 z-50 lg:hidden">
              <Sidebar />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
      <div className="flex-1 lg:ml-64">
        <header className="sticky top-0 z-30 glass border-b border-white/5 px-6 h-16 flex items-center gap-4">
          <button onClick={() => setMobileOpen(true)} className="lg:hidden p-2 rounded-xl glass border border-white/10">
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
            <span className="text-slate-400 text-sm font-medium">Admin Mode</span>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-500 to-orange-400 flex items-center justify-center text-xs font-bold">A</div>
          </div>
        </header>
        <main className="p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
