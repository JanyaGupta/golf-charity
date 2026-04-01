"use client";

import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  color: string;
  life: number;
  maxLife: number;
}

export function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    const particles: Particle[] = [];
    const colors = ["#22c55e", "#4ade80", "#f59e0b", "#fbbf24", "#16a34a"];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const spawn = () => {
      if (particles.length > 80) return;
      const maxLife = 120 + Math.random() * 180;
      particles.push({
        x: Math.random() * canvas.width,
        y: canvas.height + 20,
        vx: (Math.random() - 0.5) * 0.8,
        vy: -(0.3 + Math.random() * 0.8),
        size: 1 + Math.random() * 3,
        opacity: 0,
        color: colors[Math.floor(Math.random() * colors.length)],
        life: 0,
        maxLife,
      });
    };

    let frame = 0;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      frame++;
      if (frame % 4 === 0) spawn();

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life++;

        const progress = p.life / p.maxLife;
        p.opacity = progress < 0.2 ? progress / 0.2 : progress > 0.8 ? (1 - progress) / 0.2 : 1;
        p.opacity *= 0.6;

        if (p.life >= p.maxLife || p.y < -20) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = p.size * 3;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      animId = requestAnimationFrame(animate);
    };

    animate();
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 0.5 }}
    />
  );
}

// ─── Animated number draw component ──────────────────────
export function DrawBallsAnimation({ numbers }: { numbers: number[] }) {
  return (
    <div className="flex items-center gap-3 flex-wrap justify-center">
      {numbers.map((n, i) => (
        <div
          key={n}
          className="number-ball number-ball-gold animate-float"
          style={{
            animationDelay: `${i * 0.3}s`,
            width: "3.5rem",
            height: "3.5rem",
            fontSize: "1.1rem",
          }}
        >
          {n.toString().padStart(2, "0")}
        </div>
      ))}
    </div>
  );
}

// ─── Spinning 3D-like ring ───────────────────────────────
export function SpinningRing({ size = 300 }: { size?: number }) {
  return (
    <div
      className="relative"
      style={{ width: size, height: size }}
    >
      {/* Outer ring */}
      <div
        className="absolute inset-0 rounded-full border-2 border-dashed border-brand-500/20 animate-spin-slow"
      />
      {/* Middle ring */}
      <div
        className="absolute inset-8 rounded-full border border-gold-500/20"
        style={{ animation: "spin 15s linear infinite reverse" }}
      />
      {/* Inner glow */}
      <div className="absolute inset-16 rounded-full bg-brand-500/5 backdrop-blur-sm border border-brand-500/10" />

      {/* Orbiting dots */}
      {[0, 72, 144, 216, 288].map((deg, i) => (
        <div
          key={i}
          className="absolute w-3 h-3 rounded-full"
          style={{
            top: "50%",
            left: "50%",
            transform: `rotate(${deg}deg) translateX(${size / 2 - 20}px) translateY(-50%)`,
            background: i % 2 === 0 ? "#22c55e" : "#f59e0b",
            boxShadow: `0 0 8px ${i % 2 === 0 ? "#22c55e" : "#f59e0b"}`,
            animation: `spin ${12 + i}s linear infinite`,
          }}
        />
      ))}
    </div>
  );
}
