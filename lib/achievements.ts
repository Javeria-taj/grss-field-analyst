export interface Achievement {
  id: string;
  name: string;
  desc: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic';
}

export const ACHIEVEMENTS: Record<string, Achievement> = {
  SPEED_DEMON: {
    id: 'SPEED_DEMON',
    name: 'Speed Demon',
    desc: 'Answered a question in under 2 seconds',
    icon: '⚡',
    rarity: 'rare'
  },
  STREAK_5: {
    id: 'STREAK_5',
    name: 'High Frequency',
    desc: 'Achieved a 5x answer streak',
    icon: '🔥',
    rarity: 'epic'
  },
  PERFECT_LEVEL: {
    id: 'PERFECT_LEVEL',
    name: 'Perfect Telemetry',
    desc: 'Completed a level with 100% accuracy',
    icon: '🎯',
    rarity: 'epic'
  },
  SURVIVOR: {
    id: 'SURVIVOR',
    name: 'Lone Survivor',
    desc: 'Won Level 3 with only 1 life remaining',
    icon: '🩹',
    rarity: 'rare'
  },
  AUCTION_MASTER: {
    id: 'AUCTION_MASTER',
    name: 'Market Specialist',
    desc: 'Spent 100% of your budget effectively',
    icon: '💰',
    rarity: 'common'
  }
};
