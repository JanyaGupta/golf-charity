import Link from "next/link";
import { Trophy } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#020617] text-white">
      <nav className="border-b border-white/5 px-6 h-16 flex items-center">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-gold-400 flex items-center justify-center">
            <Trophy className="w-4 h-4 text-white" />
          </div>
          <span style={{ fontFamily: "var(--font-display)" }} className="font-bold text-xl">GolfCharity</span>
        </Link>
      </nav>
      <div className="max-w-3xl mx-auto px-6 py-16">
        <h1 style={{ fontFamily: "var(--font-display)" }} className="text-4xl font-bold mb-8">Privacy Policy</h1>
        <div className="prose prose-invert max-w-none space-y-6 text-slate-300 leading-relaxed">
          <p>Last updated: January 2024</p>
          <h2 className="text-xl font-bold text-white">1. Data We Collect</h2>
          <p>We collect your email address, name, golf scores, and payment information processed by Stripe. We do not store payment card details.</p>
          <h2 className="text-xl font-bold text-white">2. How We Use Data</h2>
          <p>Your data is used to operate the draw system, process payments, notify you of winnings, and distribute charitable donations.</p>
          <h2 className="text-xl font-bold text-white">3. Data Sharing</h2>
          <p>We share minimal data with Stripe (payments) and Supabase (database hosting). We do not sell personal data to third parties.</p>
          <h2 className="text-xl font-bold text-white">4. Your Rights</h2>
          <p>You may request deletion of your account and data at any time by contacting support@golfcharity.com.</p>
          <h2 className="text-xl font-bold text-white">5. Cookies</h2>
          <p>We use session cookies for authentication only. No third-party advertising cookies are used.</p>
          <h2 className="text-xl font-bold text-white">6. Contact</h2>
          <p>Questions? Email us at privacy@golfcharity.com</p>
        </div>
      </div>
    </div>
  );
}
