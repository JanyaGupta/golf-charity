/**
 * GOLF CHARITY DRAW ENGINE
 * Supports both random and algorithm-based draws
 */

import type { DrawEntry, DrawSimulation, PrizeTier } from "@/types";

// ============================================================
// RANDOM DRAW ENGINE
// ============================================================

export function generateRandomNumbers(count = 5, max = 45): number[] {
  const numbers = new Set<number>();
  while (numbers.size < count) {
    numbers.add(Math.floor(Math.random() * max) + 1);
  }
  return Array.from(numbers).sort((a, b) => a - b);
}

// ============================================================
// ALGORITHM-BASED DRAW ENGINE
// ============================================================

type DrawMode = "random" | "most_common" | "least_common" | "balanced";

export function generateAlgorithmicNumbers(
  allEntries: DrawEntry[],
  mode: DrawMode = "balanced",
  count = 5,
  max = 45
): number[] {
  if (allEntries.length === 0 || mode === "random") {
    return generateRandomNumbers(count, max);
  }

  // Build frequency map of all submitted numbers
  const frequency: Record<number, number> = {};
  for (let i = 1; i <= max; i++) frequency[i] = 0;

  for (const entry of allEntries) {
    for (const num of entry.numbers) {
      if (num >= 1 && num <= max) {
        frequency[num] = (frequency[num] || 0) + 1;
      }
    }
  }

  const sorted = Object.entries(frequency)
    .map(([num, freq]) => ({ num: parseInt(num), freq }))
    .sort((a, b) => b.freq - a.freq);

  let pool: number[];

  switch (mode) {
    case "most_common":
      // Bias toward commonly picked numbers → harder to win
      pool = sorted.slice(0, Math.min(20, max)).map((x) => x.num);
      break;

    case "least_common":
      // Bias toward rarely picked numbers → easier to win
      pool = sorted.slice(-20).map((x) => x.num);
      break;

    case "balanced":
    default:
      // Mix of common and rare
      const topHalf = sorted.slice(0, 15).map((x) => x.num);
      const bottomHalf = sorted.slice(-15).map((x) => x.num);
      pool = [...topHalf, ...bottomHalf];
      break;
  }

  // Weighted random selection from pool
  const selected = new Set<number>();
  const shuffled = pool.sort(() => Math.random() - 0.5);

  for (const num of shuffled) {
    if (selected.size >= count) break;
    selected.add(num);
  }

  // Fill remaining with random if needed
  while (selected.size < count) {
    const r = Math.floor(Math.random() * max) + 1;
    selected.add(r);
  }

  return Array.from(selected).sort((a, b) => a - b);
}

// ============================================================
// MATCH & PRIZE CALCULATION
// ============================================================

export function countMatches(entry: number[], winning: number[]): number {
  const winSet = new Set(winning);
  return entry.filter((n) => winSet.has(n)).length;
}

export function getMatchedNumbers(entry: number[], winning: number[]): number[] {
  const winSet = new Set(winning);
  return entry.filter((n) => winSet.has(n));
}

export interface PrizePool {
  prizePool: number;
  jackpotRollover: number;
  fiveMatchPool: number;
  fourMatchPool: number;
  threeMatchPool: number;
}

export function calculatePrizePools(totalPool: number, jackpotRollover: number): PrizePool {
  const combinedPool = totalPool + jackpotRollover;

  return {
    prizePool: totalPool,
    jackpotRollover,
    fiveMatchPool: Math.floor(combinedPool * 0.40), // 40%
    fourMatchPool: Math.floor(combinedPool * 0.35), // 35%
    threeMatchPool: Math.floor(combinedPool * 0.25), // 25%
  };
}

export interface DrawResult {
  winningNumbers: number[];
  winners: {
    entryId: string;
    userId: string;
    tier: PrizeTier;
    matchedNumbers: number[];
    matchCount: number;
  }[];
  fiveMatchCount: number;
  fourMatchCount: number;
  threeMatchCount: number;
  prizePerFiveMatch: number;
  prizePerFourMatch: number;
  prizePerThreeMatch: number;
  newJackpotRollover: number;
  totalPaidOut: number;
}

export function runDraw(
  entries: DrawEntry[],
  totalPoolPence: number,
  existingJackpot: number,
  mode: DrawMode = "balanced"
): DrawResult {
  const winningNumbers = mode === "random"
    ? generateRandomNumbers(5, 45)
    : generateAlgorithmicNumbers(entries, mode);

  const pools = calculatePrizePools(totalPoolPence, existingJackpot);

  const fiveMatchers: typeof entries = [];
  const fourMatchers: typeof entries = [];
  const threeMatchers: typeof entries = [];

  for (const entry of entries) {
    const matches = countMatches(entry.numbers, winningNumbers);
    if (matches === 5) fiveMatchers.push(entry);
    else if (matches === 4) fourMatchers.push(entry);
    else if (matches === 3) threeMatchers.push(entry);
  }

  // Calculate per-winner prizes
  const prizePerFiveMatch = fiveMatchers.length > 0
    ? Math.floor(pools.fiveMatchPool / fiveMatchers.length)
    : 0;
  const prizePerFourMatch = fourMatchers.length > 0
    ? Math.floor(pools.fourMatchPool / fourMatchers.length)
    : 0;
  const prizePerThreeMatch = threeMatchers.length > 0
    ? Math.floor(pools.threeMatchPool / threeMatchers.length)
    : 0;

  // Rollover jackpot if no 5-match winners
  const newJackpotRollover = fiveMatchers.length === 0 ? pools.fiveMatchPool : 0;

  const totalPaidOut = (fiveMatchers.length * prizePerFiveMatch)
    + (fourMatchers.length * prizePerFourMatch)
    + (threeMatchers.length * prizePerThreeMatch);

  const winners = [
    ...fiveMatchers.map((e) => ({
      entryId: e.id,
      userId: e.user_id,
      tier: "five_match" as PrizeTier,
      matchedNumbers: getMatchedNumbers(e.numbers, winningNumbers),
      matchCount: 5,
    })),
    ...fourMatchers.map((e) => ({
      entryId: e.id,
      userId: e.user_id,
      tier: "four_match" as PrizeTier,
      matchedNumbers: getMatchedNumbers(e.numbers, winningNumbers),
      matchCount: 4,
    })),
    ...threeMatchers.map((e) => ({
      entryId: e.id,
      userId: e.user_id,
      tier: "three_match" as PrizeTier,
      matchedNumbers: getMatchedNumbers(e.numbers, winningNumbers),
      matchCount: 3,
    })),
  ];

  return {
    winningNumbers,
    winners,
    fiveMatchCount: fiveMatchers.length,
    fourMatchCount: fourMatchers.length,
    threeMatchCount: threeMatchers.length,
    prizePerFiveMatch,
    prizePerFourMatch,
    prizePerThreeMatch,
    newJackpotRollover,
    totalPaidOut,
  };
}

// ============================================================
// SIMULATION MODE
// ============================================================

export function simulateDraw(
  entries: DrawEntry[],
  totalPoolPence: number,
  existingJackpot: number,
  iterations = 1000
): DrawSimulation & { winProbabilities: Record<PrizeTier, number> } {
  let fiveMatchWins = 0;
  let fourMatchWins = 0;
  let threeMatchWins = 0;

  for (let i = 0; i < iterations; i++) {
    const winning = generateRandomNumbers(5, 45);
    for (const entry of entries) {
      const matches = countMatches(entry.numbers, winning);
      if (matches === 5) fiveMatchWins++;
      else if (matches === 4) fourMatchWins++;
      else if (matches === 3) threeMatchWins++;
    }
  }

  const totalEntries = entries.length * iterations;
  const result = runDraw(entries, totalPoolPence, existingJackpot, "random");

  return {
    winningNumbers: result.winningNumbers,
    winners: [
      { tier: "five_match", count: result.fiveMatchCount, prizePerWinner: result.prizePerFiveMatch, totalPrize: result.fiveMatchCount * result.prizePerFiveMatch },
      { tier: "four_match", count: result.fourMatchCount, prizePerWinner: result.prizePerFourMatch, totalPrize: result.fourMatchCount * result.prizePerFourMatch },
      { tier: "three_match", count: result.threeMatchCount, prizePerWinner: result.prizePerThreeMatch, totalPrize: result.threeMatchCount * result.prizePerThreeMatch },
    ],
    totalPaidOut: result.totalPaidOut,
    jackpotRollover: result.newJackpotRollover,
    winProbabilities: {
      five_match: totalEntries > 0 ? fiveMatchWins / totalEntries : 0,
      four_match: totalEntries > 0 ? fourMatchWins / totalEntries : 0,
      three_match: totalEntries > 0 ? threeMatchWins / totalEntries : 0,
    },
  };
}
