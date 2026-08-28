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
    /** Formatted for the server render; `balanceValue` is what counts up to it. */
    balance: "32,500",
    balanceValue: 32_500,
    unit: "PTS",
    delta: "+240 this week",
    rank: "Rank 341",
    allTime: "All-time 124,820 PTS",
  },

  rank: {
    label: "Rank",
    /** Rendered at the design's 138x127; source art is 207x196. */
    badge: "/tiers/3d-wolf.png",
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
    items: [
      "/tiers/rekt-v1.png",
      "/tiers/green-closer.png",
      "/tiers/panic.png",
      "/tiers/discord.png",
    ],
    latest: "Green Closer unlocked",
  },

  rewardPool: {
    label: "Reward pool",
    amount: "1,000,000",
    amountValue: 1_000_000,
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

  /**
   * Phone layout: the dashboard's six cards do not survive a 358px column, so
   * the mobile design prints the same story as a points receipt instead.
   */
  receipt: {
    title: "PERPTOOLS",
    subtitle: "POINTS RECEIPT · SESSION 4",
    lines: [
      { label: "TRADING VOLUME $10K", points: "+600" },
      { label: "PROFITABLE CLOSE", points: "+250" },
      { label: "POSITION HELD 24H", points: "+300" },
      { label: "WEEKLY QUEST ×2", points: "+300" },
      { label: "PREDICTION WON ×4.8", points: "+1,900" },
    ],
    totalLabel: "TOTAL",
    /** Rendered on the server; `totalValue` is what the count-up runs to. */
    total: "3,350",
    totalValue: 3_350,
    unit: "PTS",
    rankLabel: "RANK PROGRESS",
    rank: "WOLF · TIER 3/7 ▲",
    disclaimer: "EXAMPLE VALUES · NOT A GUARANTEE OF FUTURE VALUE",
    stats: [
      { value: "1M", label: "REWARD POOL", color: "#83D4FB" },
      { value: "7", label: "RANK TIERS", color: "#FFFFFF" },
      { value: "×9.6", label: "MAX MULTIPLIER", color: "#E9C87A" },
    ],
    cta: "Start Earning",
    /**
     * Barcode bars as `[left, width]` in a 122x32 box, straight from the design
     * file — a real encoding would print something the numbers above do not say.
     */
    barcode: [
      [0, 2],
      [4, 1],
      [8, 3],
      [13, 1],
      [17, 2],
      [21, 2],
      [26, 1],
      [29, 3],
      [35, 2],
      [39, 1],
      [43, 2],
      [47, 3],
      [53, 1],
      [56, 2],
      [61, 1],
      [64, 3],
      [70, 2],
      [74, 1],
      [78, 2],
      [82, 2],
      [87, 3],
      [92, 1],
      [96, 2],
      [100, 1],
      [104, 3],
      [109, 2],
      [114, 1],
      [117, 2],
    ],
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
