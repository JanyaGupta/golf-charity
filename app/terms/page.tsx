import Link from "next/link";
import { Trophy } from "lucide-react";

export default function TermsPage() {
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
        <h1 style={{ fontFamily: "var(--font-display)" }} className="text-4xl font-bold mb-8">Terms of Service</h1>
        <div className="space-y-6 text-slate-300 leading-relaxed">
          <p>Last updated: January 2024</p>
          <h2 className="text-xl font-bold text-white">1. Eligibility</h2>
          <p>You must be 18+ and a UK resident to participate. GolfCharity operates under a Gambling Commission licence.</p>
          <h2 className="text-xl font-bold text-white">2. Subscriptions</h2>
          <p>Subscriptions auto-renew. Cancel anytime via the billing portal. No refunds on partial months.</p>
          <h2 className="text-xl font-bold text-white">3. Draw Rules</h2>
          <p>One entry per member per month. Numbers generated from your golf scores. Winning numbers drawn at month end. Results are final.</p>
          <h2 className="text-xl font-bold text-white">4. Prize Claims</h2>
          <p>Winners must verify identity within 30 days. Prizes paid via bank transfer within 14 days of verification.</p>
          <h2 className="text-xl font-bold text-white">5. Charitable Contributions</h2>
          <p>10% of subscriptions are donated to selected charities quarterly. Allocation based on member preferences.</p>
          <h2 className="text-xl font-bold text-white">6. Responsible Gambling</h2>
          <p>GolfCharity supports responsible play. Use GamStop or contact BeGambleAware at 0808 8020 133 if needed.</p>
          <h2 className="text-xl font-bold text-white">7. Contact</h2>
          <p>legal@golfcharity.com</p>
        </div>
      </div>
    </div>
  );
}
