/** Price series behind the balance: climbs from the bottom-left to the peak. */
export const pointsSeries = [
  0.04, 0.06, 0.05, 0.09, 0.13, 0.12, 0.17, 0.22, 0.2, 0.26, 0.31, 0.29, 0.35, 0.4, 0.38, 0.45, 0.5,
  0.48, 0.55, 0.6, 0.58, 0.64, 0.69, 0.67, 0.73, 0.78, 0.76, 0.83, 0.89, 0.94,
] as const;

export type Task = {
  label: string;
  reward: string;
  /** Done tasks render a green check and dim their label. */
  done?: boolean;
  /** Fill ratio of the task's progress bar, 0-1. */
  progress: number;
};

export type Activity = {
  time: string;
  label: string;
  points: string;
};

export const platform = {
  heading: "You earned them. Now make your move.",
  lede: "Put your Points to work and see if you can call the market.",

  points: {
    label: "Your points",
    balance: "32,500",
    unit: "PTS",
    delta: "+240 this week",
    rank: "Rank 341",
    allTime: "All-time 124,820 PTS",
  },

  rank: {
    label: "Rank",
    /** Rendered at the design's 138x127; source art is 207x196. */
    badge: "/tier-3d-wolf.png",
    tier: "WOLF",
    tierPosition: "Tier 2 of 7",
    nextTier: "SHARK",
    /** Progress toward the next tier, 0-1 (design: 70 of 218px). */
    progress: 70 / 218,
    toNext: "21 spots to Shark",
    /**
     * The seven tier pips under the card. Colours sampled from the design:
     * tiers up to `current` render solid, the rest as a 30% outline.
     */
    current: 2,
    tiers: [
      { name: "Shrimp", color: "#FE9700" },
      { name: "Wolf", color: "#3FD08B" },
      { name: "Shark", color: "#2BB9F3" },
      { name: "Whale", color: "#8B5CF6" },
      { name: "Titan", color: "#EBBD4E" },
      { name: "Oracle", color: "#FF7578" },
      { name: "Legend", color: "#F4F5F6" },
    ],
  },

  badges: {
    label: "Badges",
    earned: 2,
    total: 12,
    /** In unlock order — the first `earned` entries render lit, the rest dimmed. */
    items: ["/tier-rekt-v1.png", "/tier-green-closer.png", "/tier-panic.png", "/tier-discord.png"],
    latest: "Green Closer unlocked",
  },

  rewardPool: {
    label: "Reward pool",
    amount: "1,000,000",
    unit: "PTS",
    /** design: 150.99 of 216px */
    progress: 150.99 / 216,
    countdownLabel: "Distributes in",
    countdown: "09d 04h 23m",
  },

  tasks: {
    label: "Complete tasks",
    resets: "Resets weekly",
    items: [
      { label: "Trade $10,000 volume", reward: "+500 PTS", progress: 96.36 / 140.43 },
      { label: "Close a position at +10% PnL", reward: "+250 PTS", done: true, progress: 1 },
      { label: "Complete 5 social tasks", reward: "+150 PTS", progress: 85.08 / 140.43 },
      { label: "Hold a position for 24h", reward: "+300 PTS", done: true, progress: 1 },
    ] satisfies Task[],
  },

  activity: {
    label: "Recent activity",
    liveLabel: "Live",
    items: [
      { time: "10:52", label: "Position closed · +21.8%", points: "+660" },
      { time: "10:37", label: "Maker rebate", points: "+96" },
      { time: "10:19", label: "Prediction · touch 6.3×", points: "+314" },
      { time: "09:48", label: "Social task · tier", points: "+500" },
    ] satisfies Activity[],
  },
} as const;
