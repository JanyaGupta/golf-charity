// Database Types

export type SubscriptionStatus = "active" | "canceled" | "past_due" | "trialing" | "inactive";
export type SubscriptionPlan = "monthly" | "yearly";
export type DrawStatus = "pending" | "running" | "completed";
export type WinnerStatus = "pending" | "verified" | "paid" | "rejected";
export type PrizeTier = "three_match" | "four_match" | "five_match";

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  amount_paid: number;
  created_at: string;
  updated_at: string;
}

export interface GolfScore {
  id: string;
  user_id: string;
  score: number;
  entered_at: string;
  round_date: string;
  notes: string | null;
}

export interface DrawEntry {
  id: string;
  user_id: string;
  draw_id: string;
  numbers: number[];
  entered_at: string;
}

export interface Draw {
  id: string;
  month: number;
  year: number;
  status: DrawStatus;
  winning_numbers: number[] | null;
  prize_pool: number;
  jackpot_rollover: number;
  five_match_pool: number;
  four_match_pool: number;
  three_match_pool: number;
  total_entries: number;
  run_at: string | null;
  created_at: string;
}

export interface Winner {
  id: string;
  draw_id: string;
  user_id: string;
  entry_id: string;
  matched_numbers: number[];
  tier: PrizeTier;
  prize_amount: number;
  status: WinnerStatus;
  verified_at: string | null;
  paid_at: string | null;
  created_at: string;
}

export interface Charity {
  id: string;
  name: string;
  description: string;
  logo_url: string | null;
  website: string | null;
  category: string;
  is_active: boolean;
  total_received: number;
  created_at: string;
}

export interface CharityAllocation {
  id: string;
  user_id: string;
  charity_id: string;
  percentage: number;
  created_at: string;
  updated_at: string;
  charity?: Charity;
}

export interface CharityDonation {
  id: string;
  draw_id: string;
  charity_id: string;
  amount: number;
  donated_at: string;
}

export interface DashboardStats {
  subscription: Subscription | null;
  scores: GolfScore[];
  totalWinnings: number;
  totalDonated: number;
  currentDraw: Draw | null;
  hasEnteredCurrentDraw: boolean;
  currentEntry: DrawEntry | null;
}

export interface AdminStats {
  totalUsers: number;
  activeSubscriptions: number;
  totalRevenue: number;
  totalDonations: number;
  currentPrizePool: number;
  pendingWinners: number;
}

export interface DrawSimulation {
  winningNumbers: number[];
  winners: {
    tier: PrizeTier;
    count: number;
    prizePerWinner: number;
    totalPrize: number;
  }[];
  totalPaidOut: number;
  jackpotRollover: number;
}
