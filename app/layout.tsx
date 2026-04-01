import type { Metadata } from "next";
import "./globals.css";
import { ToastProvider } from "@/components/ui/toast-provider";

export const metadata: Metadata = {
  title: "GolfCharity — Play Golf. Win Rewards. Change Lives.",
  description: "Join the monthly golf charity draw. Subscribe, enter your scores, win prizes, and donate to charities you love.",
  keywords: ["golf", "charity", "subscription", "draw", "prize", "donate"],
  openGraph: {
    title: "GolfCharity",
    description: "Play Golf. Win Rewards. Change Lives.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700;800;900&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&family=DM+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="noise">
        {children}
        <ToastProvider />
      </body>
    </html>
  );
}
