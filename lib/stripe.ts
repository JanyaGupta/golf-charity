import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
  typescript: true,
});

export const PLANS = {
  monthly: {
    priceId: process.env.STRIPE_MONTHLY_PRICE_ID!,
    amount: 999, // £9.99/month in pence
    interval: "month" as const,
    label: "Monthly",
  },
  yearly: {
    priceId: process.env.STRIPE_YEARLY_PRICE_ID!,
    amount: 8988, // £89.88/year in pence (save 25%)
    interval: "year" as const,
    label: "Yearly",
  },
};

export async function createOrRetrieveCustomer(
  userId: string,
  email: string
): Promise<string> {
  const customers = await stripe.customers.list({ email, limit: 1 });

  if (customers.data.length > 0) {
    return customers.data[0].id;
  }

  const customer = await stripe.customers.create({
    email,
    metadata: { supabase_uid: userId },
  });

  return customer.id;
}

export function formatPrice(pence: number): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(pence / 100);
}
