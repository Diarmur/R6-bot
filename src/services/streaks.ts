import fs from 'fs';

const file = 'data/streaks.json';

type UserStreak = {
  currentStreak: number;   // positive = win streak, reset to 0 on any loss
  lastWins: number;        // total wins at last snapshot
  lastLosses: number;      // total losses at last snapshot
};

type StreakStore = Record<string, UserStreak>; // keyed by discord id

let store: StreakStore = {};

if (fs.existsSync(file)) {
  store = JSON.parse(fs.readFileSync(file, 'utf-8'));
}

function save() {
  fs.mkdirSync('data', { recursive: true });
  fs.writeFileSync(file, JSON.stringify(store, null, 2));
}

/**
 * Update streak for a user based on new total wins/losses from the API.
 * Returns the updated streak count.
 */
export function updateStreak(discordId: string, totalWins: number, totalLosses: number): number {
  const prev = store[discordId];

  // First time we see this user — just store baseline, no streak yet
  if (!prev) {
    store[discordId] = { currentStreak: 0, lastWins: totalWins, lastLosses: totalLosses };
    save();
    return 0;
  }

  const newWins = totalWins - prev.lastWins;
  const newLosses = totalLosses - prev.lastLosses;

  let streak = prev.currentStreak;

  if (newWins === 0 && newLosses === 0) {
    // No games played since last check — streak unchanged
    return streak;
  }

  if (newLosses > 0) {
    // Any loss resets the streak
    streak = 0;
  }

  if (newWins > 0 && newLosses === 0) {
    // Pure win batch — add to streak
    streak += newWins;
  }

  store[discordId] = { currentStreak: streak, lastWins: totalWins, lastLosses: totalLosses };
  save();
  return streak;
}

export function getStreak(discordId: string): number {
  return store[discordId]?.currentStreak ?? 0;
}