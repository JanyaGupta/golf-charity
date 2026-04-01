"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy, LayoutDashboard, Target, Heart, Gift, History,
  LogOut, Menu, X, ChevronRight, Settings, Bell
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Overview" },
  { href: "/dashboard/scores", icon: Target, label: "My Scores" },
  { href: "/dashboard/draw", icon: Trophy, label: "Draw Entry" },
  { href: "/dashboard/charity", icon: Heart, label: "Charity" },
  { href: "/dashboard/winnings", icon: Gift, label: "Winnings" },
  { href: "/dashboard/history", icon: History, label: "History" },
  { href: "/dashboard/settings", icon: Settings, label: "Settings" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
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
      {/* Logo */}
      <div className="p-6 border-b border-white/5">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-gold-400 flex items-center justify-center">
            <Trophy className="w-5 h-5 text-white" />
          </div>
          <span style={{ fontFamily: "var(--font-display)" }} className="font-bold text-lg">GolfCharity</span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${
                active
                  ? "bg-brand-500/15 text-brand-400 border border-brand-500/20"
                  : "text-slate-500 hover:text-slate-200 hover:bg-white/5"
              }`}
            >
              <item.icon className={`w-5 h-5 ${active ? "text-brand-400" : "text-slate-500 group-hover:text-slate-300"}`} />
              <span className="text-sm font-medium">{item.label}</span>
              {active && <ChevronRight className="w-4 h-4 ml-auto text-brand-500" />}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="p-4 border-t border-white/5">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-sm font-medium">Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#020617] text-white flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 flex-col bg-dark-900/50 border-r border-white/5 fixed inset-y-0 left-0 z-40">
        <Sidebar />
      </aside>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed inset-y-0 left-0 w-64 bg-dark-900 border-r border-white/5 z-50 lg:hidden"
            >
              <Sidebar />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 lg:ml-64">
        {/* Top bar */}
        <header className="sticky top-0 z-30 glass border-b border-white/5 px-6 h-16 flex items-center justify-between">
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden p-2 rounded-xl glass border border-white/10 hover:border-white/20 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="hidden lg:block text-slate-500 text-sm">
            {navItems.find((n) => n.href === pathname)?.label ?? "Dashboard"}
          </div>
          <div className="flex items-center gap-3 ml-auto">
            <button className="relative p-2 rounded-xl glass border border-white/10 hover:border-white/20 transition-colors">
              <Bell className="w-5 h-5 text-slate-400" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-500 rounded-full" />
            </button>
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-500 to-gold-400 flex items-center justify-center text-sm font-bold cursor-pointer">
              U
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
