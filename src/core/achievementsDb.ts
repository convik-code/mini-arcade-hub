export type AchievementCategory = 'General' | 'Block Blast' | '2048' | 'Match-3';

export interface AchievementDef {
  id: string;
  category: AchievementCategory;
  title: string;
  desc: string;
  target: number;
  rewardCoins: number;
  rewardXp: number;
}

export const ACHIEVEMENTS_DB: AchievementDef[] = [
  // GENERAL
  { id: 'gen_play_1', category: 'General', title: 'First Steps', desc: 'Play your first game', target: 1, rewardCoins: 50, rewardXp: 100 },
  { id: 'gen_play_5', category: 'General', title: 'Getting Warmed Up', desc: 'Play 5 games globally', target: 5, rewardCoins: 150, rewardXp: 200 },
  { id: 'gen_play_25', category: 'General', title: 'Avid Gamer', desc: 'Play 25 games globally', target: 25, rewardCoins: 500, rewardXp: 1000 },
  { id: 'gen_coins_100', category: 'General', title: 'Pocket Change', desc: 'Accumulate 100 coins total', target: 100, rewardCoins: 50, rewardXp: 50 },
  { id: 'gen_coins_1000', category: 'General', title: 'Treasure Hunter', desc: 'Accumulate 1000 coins total', target: 1000, rewardCoins: 300, rewardXp: 500 },
  { id: 'gen_login_3', category: 'General', title: 'Consistent', desc: 'Claim the Daily Reward 3 times', target: 3, rewardCoins: 200, rewardXp: 300 },
  { id: 'gen_spin_3', category: 'General', title: 'High Roller', desc: 'Use the Lucky Spin 3 times', target: 3, rewardCoins: 200, rewardXp: 300 },

  // BLOCK BLAST
  { id: 'bb_score_500', category: 'Block Blast', title: 'Block Novice', desc: 'Reach a score of 500', target: 500, rewardCoins: 100, rewardXp: 150 },
  { id: 'bb_score_1000', category: 'Block Blast', title: 'Block Master', desc: 'Reach a score of 1000', target: 1000, rewardCoins: 300, rewardXp: 400 },
  { id: 'bb_combo_3', category: 'Block Blast', title: 'Triple Threat', desc: 'Hit a 3x Combo', target: 3, rewardCoins: 150, rewardXp: 200 },
  { id: 'bb_combo_5', category: 'Block Blast', title: 'Unstoppable', desc: 'Hit a 5x Combo', target: 5, rewardCoins: 500, rewardXp: 800 },
  { id: 'bb_multi_line', category: 'Block Blast', title: 'Grid Wiper', desc: 'Clear 3+ lines in a single drop', target: 1, rewardCoins: 200, rewardXp: 300 },
  { id: 'bb_use_powerups', category: 'Block Blast', title: 'Arsenal', desc: 'Use 3 power-ups in Block Blast', target: 3, rewardCoins: 150, rewardXp: 200 },

  // 2048
  { id: 'm2_128', category: '2048', title: 'Growing Fast', desc: 'Create a 128 tile', target: 128, rewardCoins: 100, rewardXp: 150 },
  { id: 'm2_256', category: '2048', title: 'Double Up', desc: 'Create a 256 tile', target: 256, rewardCoins: 150, rewardXp: 250 },
  { id: 'm2_512', category: '2048', title: 'Halfway There', desc: 'Create a 512 tile', target: 512, rewardCoins: 200, rewardXp: 400 },
  { id: 'm2_1024', category: '2048', title: 'Kilo-Tile', desc: 'Create a 1024 tile', target: 1024, rewardCoins: 400, rewardXp: 800 },
  { id: 'm2_2048', category: '2048', title: '2048!', desc: 'Create the legendary 2048 tile!', target: 2048, rewardCoins: 1000, rewardXp: 2000 },
  { id: 'm2_merge_multi', category: '2048', title: 'Swipe Master', desc: 'Merge 20 times total globally', target: 20, rewardCoins: 100, rewardXp: 150 },

  // MATCH 3
  { id: 'm3_first_match', category: 'Match-3', title: 'Sweet Start', desc: 'Make your first match', target: 1, rewardCoins: 50, rewardXp: 50 },
  { id: 'm3_cascade', category: 'Match-3', title: 'Domino Effect', desc: 'Trigger a cascade reaction', target: 1, rewardCoins: 100, rewardXp: 150 },
  { id: 'm3_combo_3', category: 'Match-3', title: 'Sugar Rush', desc: 'Hit a 3x Combo', target: 3, rewardCoins: 200, rewardXp: 300 },
  { id: 'm3_special', category: 'Match-3', title: 'Tactician', desc: 'Trigger a special wrapped/striped tile', target: 1, rewardCoins: 150, rewardXp: 200 },
  { id: 'm3_clear_20', category: 'Match-3', title: 'Board Sweeper', desc: 'Clear 20 tiles in a single match session', target: 20, rewardCoins: 150, rewardXp: 200 },
  { id: 'm3_score_milestone', category: 'Match-3', title: 'Sugar Legend', desc: 'Score 5000 points total globally', target: 5000, rewardCoins: 400, rewardXp: 600 },
];
