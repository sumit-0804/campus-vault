// Karma point values
export const KARMA_VALUES = {
    RETURN_LOST_ITEM: 50,
    SELL_ITEM: 10,
    BUY_ITEM: 5,
    FIVE_STAR_RATING: 10,
    DAILY_LOGIN: 1,
} as const

// Karma rank thresholds
export const KARMA_THRESHOLDS = {
    E_RANK: 0,
    D_RANK: 100,
    C_RANK: 300,
    B_RANK: 600,
    A_RANK: 1000,
    S_RANK: 2000,
    NATIONAL_LEVEL: 5000,
    SHADOW_MONARCH: 10000,
} as const

export const KARMA_BADGES = [
    { min: 0, max: 99, label: "E-Rank", icon: "🛡️", color: "text-zinc-500 border-zinc-500" },
    { min: 100, max: 299, label: "D-Rank", icon: "⚔️", color: "text-emerald-500 border-emerald-500" },
    { min: 300, max: 599, label: "C-Rank", icon: "🔷", color: "text-blue-500 border-blue-500" },
    { min: 600, max: 999, label: "B-Rank", icon: "🔶", color: "text-amber-500 border-amber-500" },
    { min: 1000, max: 1999, label: "A-Rank", icon: "🔴", color: "text-red-500 border-red-500" },
    { min: 2000, max: 4999, label: "S-Rank", icon: "🌟", color: "text-yellow-400 border-yellow-400 font-bold" },
    { min: 5000, max: 9999, label: "National Level", icon: "👑", color: "text-indigo-400 border-indigo-400 font-extrabold animate-pulse" },
    { min: 10000, max: Infinity, label: "Shadow Monarch", icon: "🌌", color: "text-purple-500 border-purple-500 font-black shadow-[0_0_15px_rgba(168,85,247,0.5)] animate-pulse" },
] as const
