"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { ArrowRight, Trophy, Heart, Users, Zap, ChevronDown, Star, Check, Play } from "lucide-react";

// ─── Animated Counter ──────────────────────────────────────
function AnimatedCounter({ value, prefix = "", suffix = "", duration = 2 }: {
  value: number; prefix?: string; suffix?: string; duration?: number;
}) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting && !started) setStarted(true); },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;
    let startTime: number;
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * value));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [started, value, duration]);

  return <span ref={ref}>{prefix}{count.toLocaleString()}{suffix}</span>;
}

// ─── Floating Orb ─────────────────────────────────────────
function FloatingOrb({ className }: { className?: string }) {
  return (
    <div className={`absolute rounded-full blur-3xl pointer-events-none ${className}`} />
  );
}

// ─── Number Ball ──────────────────────────────────────────
function NumberBall({ n, delay }: { n: number; delay: number }) {
  return (
    <motion.div
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ delay, type: "spring", stiffness: 200, damping: 15 }}
      className="number-ball number-ball-gold text-lg font-bold"
    >
      {n.toString().padStart(2, "0")}
    </motion.div>
  );
}

// ─── Charity Card ─────────────────────────────────────────
const charities = [
  { name: "Children's Cancer Fund", category: "Health", raised: "£128,400", img: "https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=400&q=80", color: "from-rose-500/20" },
  { name: "Golf For Good", category: "Youth & Sports", raised: "£94,200", img: "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=400&q=80", color: "from-brand-500/20" },
  { name: "Clean Water Initiative", category: "Environment", raised: "£76,800", img: "https://images.unsplash.com/photo-1559825481-12a05cc00344?w=400&q=80", color: "from-blue-500/20" },
];

// ─── Testimonials ─────────────────────────────────────────
const testimonials = [
  { name: "James Hargreaves", role: "Monthly Member · 14 months", text: "Won £3,200 in March and donated half to Children's Cancer Fund. Golf has never felt so meaningful.", avatar: "JH", stars: 5 },
  { name: "Sarah Chen", role: "Yearly Member · 2 years", text: "The platform is beautifully designed. I love tracking my scores and knowing my subscription helps charities.", avatar: "SC", stars: 5 },
  { name: "Michael Torres", role: "Monthly Member · 8 months", text: "Three-match win last month! £450 into my account, £150 went straight to Golf for Good. Love this platform.", avatar: "MT", stars: 5 },
];

// ─── Steps ────────────────────────────────────────────────
const steps = [
  { icon: "🏌️", title: "Subscribe & Play", desc: "Join from £9.99/month. Enter your last 5 golf scores to generate your monthly draw numbers." },
  { icon: "🎰", title: "Monthly Draw", desc: "Every month, 5 winning numbers (1–45) are drawn. Match 3, 4, or all 5 to win prizes." },
  { icon: "💚", title: "Win & Give", desc: "Prizes hit your account instantly. A portion of every subscription goes to your chosen charity." },
];

export default function HomePage() {
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 600], [0, -100]);
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0]);
  const [demoNumbers] = useState([7, 14, 23, 31, 42]);
  const [showVideo, setShowVideo] = useState(false);

  return (
    <div className="min-h-screen bg-[#020617] text-white overflow-hidden">

      {/* ── NAVIGATION ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-gold-400 flex items-center justify-center">
              <Trophy className="w-4 h-4 text-white" />
            </div>
            <span style={{ fontFamily: "var(--font-display)" }} className="font-bold text-xl">GolfCharity</span>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm text-slate-400">
            <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
            <a href="#charities" className="hover:text-white transition-colors">Charities</a>
            <a href="#prizes" className="hover:text-white transition-colors">Prizes</a>
            <a href="#testimonials" className="hover:text-white transition-colors">Winners</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/auth/login" className="text-sm text-slate-400 hover:text-white transition-colors px-4 py-2">Sign In</Link>
            <Link href="/auth/signup" className="btn-primary text-sm px-5 py-2.5">
              Get Started <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden">
        {/* Background orbs */}
        <FloatingOrb className="w-[600px] h-[600px] bg-brand-600/20 -top-32 -left-48" />
        <FloatingOrb className="w-[400px] h-[400px] bg-gold-500/10 top-1/4 -right-32" />
        <FloatingOrb className="w-[300px] h-[300px] bg-brand-500/10 bottom-0 left-1/3" />

        {/* Animated grid */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "60px 60px"
          }}
        />

        <motion.div
          style={{ y: heroY, opacity: heroOpacity }}
          className="relative z-10 text-center max-w-5xl mx-auto px-6"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 mb-8 border border-brand-500/30"
          >
            <span className="w-2 h-2 bg-brand-400 rounded-full animate-pulse" />
            <span className="text-sm text-brand-400 font-medium">Monthly Draw Now Open · £8,400 Prize Pool</span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            style={{ fontFamily: "var(--font-display)" }}
            className="text-6xl md:text-8xl font-bold leading-[1.05] mb-6"
          >
            Play Golf.{" "}
            <span className="gradient-text">Win Rewards.</span>
            <br />
            Change{" "}
            <span className="relative">
              Lives.
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.8, duration: 0.6 }}
                className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-brand-500 to-gold-400 rounded-full origin-left"
              />
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Join thousands of golfers in the UK's most exciting charity draw. 
            Enter your scores, match the numbers, win life-changing prizes — and give back automatically.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
          >
            <Link href="/auth/signup" className="btn-primary text-base px-8 py-4 glow-green">
              Subscribe Now — £9.99/mo
              <ArrowRight className="w-5 h-5" />
            </Link>
            <button
              onClick={() => setShowVideo(true)}
              className="flex items-center gap-3 glass border border-white/10 rounded-xl px-6 py-4 text-sm font-medium hover:border-white/20 transition-all group"
            >
              <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center group-hover:bg-white/20 transition-colors">
                <Play className="w-3 h-3 text-white ml-0.5" />
              </div>
              See How It Works
            </button>
          </motion.div>

          {/* Demo draw balls */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="flex items-center justify-center gap-3 mb-12"
          >
            <span className="text-slate-500 text-sm">This month's draw:</span>
            {demoNumbers.map((n, i) => (
              <NumberBall key={n} n={n} delay={0.8 + i * 0.1} />
            ))}
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.7 }}
            className="grid grid-cols-3 gap-6 max-w-2xl mx-auto"
          >
            {[
              { label: "Total Donated", value: 428000, prefix: "£", suffix: "+" },
              { label: "Active Members", value: 12400, suffix: "+" },
              { label: "Prize Pool", value: 8400, prefix: "£" },
            ].map((stat) => (
              <div key={stat.label} className="glass rounded-2xl p-4 border border-white/5">
                <div className="text-2xl md:text-3xl font-bold gradient-text mb-1" style={{ fontFamily: "var(--font-mono)" }}>
                  <AnimatedCounter value={stat.value} prefix={stat.prefix} suffix={stat.suffix} />
                </div>
                <div className="text-xs text-slate-500">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-slate-600"
        >
          <span className="text-xs">Scroll to explore</span>
          <ChevronDown className="w-4 h-4" />
        </motion.div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="py-32 relative">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <span className="text-brand-500 text-sm font-semibold tracking-widest uppercase mb-4 block">Simple by design</span>
            <h2 style={{ fontFamily: "var(--font-display)" }} className="text-5xl md:text-6xl font-bold mb-6">
              Three steps to <span className="gradient-text">impact</span>
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto text-lg">From your first round to your first win, we've made every step effortless.</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connector line */}
            <div className="hidden md:block absolute top-16 left-1/3 right-1/3 h-px bg-gradient-to-r from-brand-500/0 via-brand-500/50 to-brand-500/0" />

            {steps.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                whileHover={{ y: -8 }}
                className="glass rounded-3xl p-8 border border-white/5 card-hover relative group"
              >
                <div className="absolute top-4 right-4 text-slate-800 font-bold text-6xl font-mono select-none">
                  {String(i + 1).padStart(2, "0")}
                </div>
                <div className="text-5xl mb-6">{step.icon}</div>
                <h3 style={{ fontFamily: "var(--font-display)" }} className="text-2xl font-bold mb-3">{step.title}</h3>
                <p className="text-slate-400 leading-relaxed">{step.desc}</p>
                <div className="mt-6 h-1 bg-gradient-to-r from-brand-500 to-gold-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRIZE POOLS ── */}
      <section id="prizes" className="py-32 relative overflow-hidden">
        <FloatingOrb className="w-[500px] h-[500px] bg-gold-500/5 -right-48 top-1/2 -translate-y-1/2" />
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <span className="text-gold-400 text-sm font-semibold tracking-widest uppercase mb-4 block">Monthly prizes</span>
              <h2 style={{ fontFamily: "var(--font-display)" }} className="text-5xl font-bold mb-6">
                Match the numbers,<br /><span className="gradient-text-gold">win big</span>
              </h2>
              <p className="text-slate-400 mb-8 text-lg leading-relaxed">
                Every month, five winning numbers between 1 and 45 are drawn. Match 3, 4, or all 5 to claim your share of the prize pool.
              </p>
              <div className="space-y-4">
                {[
                  { matches: 5, pct: "40%", label: "Jackpot", color: "from-gold-400 to-gold-600", glow: "shadow-gold-500/30" },
                  { matches: 4, pct: "35%", label: "Second Prize", color: "from-brand-400 to-brand-600", glow: "shadow-brand-500/30" },
                  { matches: 3, pct: "25%", label: "Third Prize", color: "from-slate-400 to-slate-600", glow: "shadow-slate-500/20" },
                ].map((tier) => (
                  <motion.div
                    key={tier.matches}
                    whileHover={{ x: 4 }}
                    className="flex items-center gap-4 glass rounded-2xl p-4 border border-white/5"
                  >
                    <div className={`flex gap-1`}>
                      {Array.from({ length: 5 }).map((_, j) => (
                        <div
                          key={j}
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${j < tier.matches ? `bg-gradient-to-br ${tier.color} text-white` : "bg-slate-800 text-slate-600"}`}
                        >
                          ✓
                        </div>
                      ))}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold">{tier.matches} Numbers Matched</div>
                      <div className="text-slate-500 text-sm">{tier.label} — split equally</div>
                    </div>
                    <div className={`text-2xl font-bold bg-gradient-to-r ${tier.color} bg-clip-text text-transparent`}>
                      {tier.pct}
                    </div>
                  </motion.div>
                ))}
              </div>
              <p className="mt-4 text-slate-600 text-sm">
                ★ Jackpot rolls over to next month if no 5-match winner
              </p>
            </motion.div>

            {/* Prize pool visual */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="relative w-full aspect-square max-w-md mx-auto">
                {/* Outer ring */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 rounded-full border border-brand-500/20 border-dashed"
                />
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-8 rounded-full border border-gold-500/20 border-dashed"
                />

                {/* Center card */}
                <div className="absolute inset-16 glass rounded-full flex flex-col items-center justify-center border border-white/10">
                  <div className="text-4xl font-bold gradient-text-gold" style={{ fontFamily: "var(--font-mono)" }}>£8,400</div>
                  <div className="text-slate-400 text-sm mt-1">This Month's Pool</div>
                </div>

                {/* Orbiting number balls */}
                {demoNumbers.map((n, i) => {
                  const angle = (i / 5) * 2 * Math.PI - Math.PI / 2;
                  const r = 42;
                  const x = 50 + r * Math.cos(angle);
                  const y = 50 + r * Math.sin(angle);
                  return (
                    <motion.div
                      key={n}
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1, type: "spring" }}
                      animate={{ scale: [1, 1.1, 1] }}
                      style={{ position: "absolute", left: `${x}%`, top: `${y}%`, transform: "translate(-50%, -50%)" }}
                      className="number-ball number-ball-gold w-12 h-12 text-sm"
                    >
                      {n}
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── FEATURED CHARITIES ── */}
      <section id="charities" className="py-32">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-brand-500 text-sm font-semibold tracking-widest uppercase mb-4 block">Your impact</span>
            <h2 style={{ fontFamily: "var(--font-display)" }} className="text-5xl font-bold mb-4">
              Charities you <span className="gradient-text">love</span>
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto">Choose where your contribution goes. Every subscription powers real change.</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {charities.map((c, i) => (
              <motion.div
                key={c.name}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -6 }}
                className="group relative glass rounded-3xl overflow-hidden border border-white/5 card-hover"
              >
                <div
                  className="h-48 bg-cover bg-center relative"
                  style={{ backgroundImage: `url(${c.img})` }}
                >
                  <div className={`absolute inset-0 bg-gradient-to-t ${c.color} to-transparent`} />
                  <div className="absolute top-4 left-4">
                    <span className="glass rounded-full px-3 py-1 text-xs font-medium text-brand-400 border border-brand-500/30">
                      {c.category}
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="font-bold text-lg mb-1">{c.name}</h3>
                  <div className="flex items-center gap-2 text-slate-400 text-sm">
                    <Heart className="w-4 h-4 text-rose-400" />
                    <span>{c.raised} raised so far</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mt-10"
          >
            <p className="text-slate-500">+ 5 more charities available to members</p>
          </motion.div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section id="testimonials" className="py-32 relative overflow-hidden">
        <FloatingOrb className="w-[400px] h-[400px] bg-brand-600/10 -left-24 top-1/2" />
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-brand-500 text-sm font-semibold tracking-widest uppercase mb-4 block">Real winners</span>
            <h2 style={{ fontFamily: "var(--font-display)" }} className="text-5xl font-bold">
              Stories of <span className="gradient-text">impact</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -4 }}
                className="glass rounded-3xl p-8 border border-white/5 card-hover"
              >
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.stars }).map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-gold-400 text-gold-400" />
                  ))}
                </div>
                <p className="text-slate-300 leading-relaxed mb-6">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-500 to-gold-400 flex items-center justify-center text-sm font-bold">
                    {t.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-sm">{t.name}</div>
                    <div className="text-slate-500 text-xs">{t.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section className="py-32">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 style={{ fontFamily: "var(--font-display)" }} className="text-5xl font-bold mb-4">
              Simple, honest <span className="gradient-text">pricing</span>
            </h2>
            <p className="text-slate-400">No hidden fees. Cancel anytime.</p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                plan: "Monthly",
                price: "£9.99",
                period: "/month",
                desc: "Perfect for trying it out",
                features: ["Monthly draw entry", "Score tracking (5 rolling)", "Charity selection", "Winner notifications"],
                cta: "Start Monthly",
                highlight: false,
              },
              {
                plan: "Yearly",
                price: "£89.88",
                period: "/year",
                desc: "Save 25% vs monthly",
                features: ["Everything in Monthly", "Priority draw processing", "Yearly stats report", "Exclusive badge + perks", "Early jackpot access"],
                cta: "Start Yearly — Best Value",
                highlight: true,
              },
            ].map((plan, i) => (
              <motion.div
                key={plan.plan}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className={`relative rounded-3xl p-8 border ${plan.highlight ? "gradient-border glow-green" : "glass border-white/5"}`}
              >
                {plan.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-brand-500 to-gold-400 text-white text-xs font-bold px-4 py-1 rounded-full">
                    MOST POPULAR
                  </div>
                )}
                {!plan.highlight && <div className="glass rounded-3xl p-8 -m-8 h-[calc(100%+64px)]" />}
                <div className="relative z-10">
                  <div className="text-slate-400 text-sm mb-1">{plan.plan}</div>
                  <div className="flex items-baseline gap-1 mb-1">
                    <span className="text-5xl font-bold" style={{ fontFamily: "var(--font-display)" }}>{plan.price}</span>
                    <span className="text-slate-500">{plan.period}</span>
                  </div>
                  <div className="text-slate-500 text-sm mb-8">{plan.desc}</div>
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-3 text-sm">
                        <Check className="w-4 h-4 text-brand-400 flex-shrink-0" />
                        <span className="text-slate-300">{f}</span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/auth/signup"
                    className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold transition-all ${plan.highlight ? "btn-primary glow-green" : "glass border border-white/10 hover:border-white/20"}`}
                  >
                    {plan.cta}
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="py-32 relative overflow-hidden">
        <FloatingOrb className="w-[600px] h-[600px] bg-brand-600/20 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />
        <div className="max-w-3xl mx-auto px-6 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <h2 style={{ fontFamily: "var(--font-display)" }} className="text-6xl md:text-7xl font-bold mb-6 leading-tight">
              Ready to make every round <span className="gradient-text">count?</span>
            </h2>
            <p className="text-slate-400 text-xl mb-10">Join 12,400+ golfers already playing for prizes and purpose.</p>
            <Link href="/auth/signup" className="btn-primary text-lg px-10 py-5 glow-green inline-flex">
              Start Your Journey
              <ArrowRight className="w-5 h-5" />
            </Link>
            <p className="mt-4 text-slate-600 text-sm">No commitment · Cancel anytime · First draw free</p>
          </motion.div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-white/5 py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-gradient-to-br from-brand-500 to-gold-400 flex items-center justify-center">
              <Trophy className="w-3 h-3 text-white" />
            </div>
            <span style={{ fontFamily: "var(--font-display)" }} className="font-bold">GolfCharity</span>
          </div>
          <div className="text-slate-600 text-sm">© 2024 GolfCharity Ltd. Registered in England & Wales. Gambling Commission Licensed.</div>
          <div className="flex gap-6 text-sm text-slate-500">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
            <Link href="/support" className="hover:text-white transition-colors">Support</Link>
          </div>
        </div>
      </footer>

      {/* Video modal placeholder */}
      <AnimatePresence>
        {showVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowVideo(false)}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="glass rounded-3xl p-8 max-w-2xl w-full mx-4 border border-white/10"
            >
              <div className="aspect-video bg-dark-900 rounded-2xl flex items-center justify-center mb-4">
                <div className="text-center">
                  <div className="text-5xl mb-4">🎬</div>
                  <p className="text-slate-400">Video demo would play here</p>
                </div>
              </div>
              <button onClick={() => setShowVideo(false)} className="w-full glass py-3 rounded-xl text-slate-400 hover:text-white transition-colors">
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
