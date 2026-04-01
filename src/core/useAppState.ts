import { useLocalStorage } from 'usehooks-ts';
import { useState } from 'react';
import { ACHIEVEMENTS_DB } from './achievementsDb';

export type ThemeName = 'neon' | 'candy' | 'dark-pro' | 'classic' | 'space' | 'lava' | 'ice' | 'crystal' | 'gold-elite';

export interface Quest {
  id: string;
  desc: string;
  type: 'play_rounds' | 'clear_lines' | 'merge_tiles' | 'reach_score' | 'use_powerup';
  target: number;
  progress: number;
  rewardCoins: number;
  rewardXp: number;
  isDone: boolean;
}

export interface UserStats {
  coins: number;
  lifetimeCoinsEarned: number;
  totalGamesPlayed: number;
  xp: number;
  blockBlastBestScore: number;
  merge2048BestScore: number;
  merge2048HighestTile: number;
  match3BestScore: number;
  unlockedThemes: ThemeName[];
  lastDailyRewardTime: number; 
  loginTrack: number; // 1 to 7
  lastLuckySpinTime: number;
  luckySpinStreak: number;
  comebackEligible: boolean;
  highestLevelReached: number;
  inventory: { hammer: number; bomb: number; shuffle: number; };
  activeQuests: Quest[];
  questChainProgress: number; // 0 to 3
  achievements: Record<string, { progress: number, isUnlocked: boolean, isClaimed: boolean }>;
}

const generateDailyQuests = (): Quest[] => {
  return [
    { id: 'q1', desc: 'Play 3 Rounds', type: 'play_rounds', target: 3, progress: 0, rewardCoins: 50, rewardXp: 100, isDone: false },
    { id: 'q2', desc: 'Clear 15 Lines', type: 'clear_lines', target: 15, progress: 0, rewardCoins: 80, rewardXp: 150, isDone: false },
    { id: 'q3', desc: 'Merge 50 Tiles', type: 'merge_tiles', target: 50, progress: 0, rewardCoins: 60, rewardXp: 120, isDone: false }
  ];
};

export function useAppState() {
  const [stats, setStats] = useLocalStorage<UserStats>('antigravity_hub_stats', {
    coins: 200,
    lifetimeCoinsEarned: 200,
    totalGamesPlayed: 0,
    xp: 0,
    blockBlastBestScore: 0,
    merge2048BestScore: 0,
    merge2048HighestTile: 0,
    match3BestScore: 0,
    unlockedThemes: ['dark-pro'],
    lastDailyRewardTime: 0,
    loginTrack: 1,
    lastLuckySpinTime: 0,
    luckySpinStreak: 0,
    comebackEligible: false,
    highestLevelReached: 1,
    inventory: { hammer: 3, bomb: 3, shuffle: 3 },
    activeQuests: generateDailyQuests(),
    questChainProgress: 0,
    achievements: {}
  });

  const [recentAchievements, setRecentAchievements] = useState<string[]>([]);

  const [settings, setSettings] = useLocalStorage('antigravity_hub_settings', {
    soundOn: true,
    musicOn: true,
    vibrationOn: true,
    vfxQuality: 'high' as 'low' | 'medium' | 'high',
    theme: 'dark-pro' as ThemeName,
    tutorialSeen: false,
  });

  const addCoins = (amount: number) => {
    setStats((prev) => {
       const newTotal = prev.coins + amount;
       return { ...prev, coins: newTotal, lifetimeCoinsEarned: (prev.lifetimeCoinsEarned || prev.coins) + amount };
    });
    progressAchievement('gen_coins_100', amount);
    progressAchievement('gen_coins_1000', amount);
  };

  const incrementGamesPlayed = () => {
    setStats(prev => ({
       ...prev,
       totalGamesPlayed: (prev.totalGamesPlayed || 0) + 1
    }));
  };

  const addXp = (amount: number) => {
    setStats((prev) => {
      const newXp = prev.xp + amount;
      const newLevel = Math.floor(Math.sqrt(newXp / 100)) + 1;
      const nextHighest = Math.max(prev.highestLevelReached || 1, newLevel);
      
      let bonusCoins = 0;
      if (nextHighest > prev.highestLevelReached) {
         bonusCoins = (nextHighest - prev.highestLevelReached) * 100; // 100 coins per level mapped
      }
      
      return { 
         ...prev, 
         xp: newXp,
         coins: prev.coins + bonusCoins,
         lifetimeCoinsEarned: (prev.lifetimeCoinsEarned || prev.coins) + bonusCoins,
         highestLevelReached: nextHighest
      };
    });
  };

  const updateBlockBlastBestScore = (score: number) => {
    setStats((prev) => {
      if (score > prev.blockBlastBestScore) {
         return { ...prev, blockBlastBestScore: score };
      }
      return prev;
    });
  };

  const updateMerge2048Stats = (score: number, highestTile: number) => {
    setStats((prev) => {
      let updated = false;
      const next = { ...prev };
      if (score > prev.merge2048BestScore) {
         next.merge2048BestScore = score;
         updated = true;
      }
      if (highestTile > prev.merge2048HighestTile) {
         next.merge2048HighestTile = highestTile;
         updated = true;
      }
      return updated ? next : prev;
    });
  };

  const updateMatch3BestScore = (score: number) => {
    setStats((prev) => {
      if (score > (prev.match3BestScore || 0)) {
         return { ...prev, match3BestScore: score };
      }
      return prev;
    });
  };

  const progressAchievement = (id: string, amount: number, absolute: boolean = false) => {
    setStats((prev) => {
       const achDef = ACHIEVEMENTS_DB.find(a => a.id === id);
       if (!achDef) return prev;

       const currentProgress = prev.achievements?.[id]?.progress || 0;
       const isUnlocked = prev.achievements?.[id]?.isUnlocked || false;
       
       if (isUnlocked) return prev;

       const nextProgress = absolute ? amount : currentProgress + amount;
       if (nextProgress === currentProgress) return prev; // No change

       const newlyUnlocked = nextProgress >= achDef.target;
       
       if (newlyUnlocked) {
          setRecentAchievements(r => [...r, id]); // Queue for Toast
       }

       return {
          ...prev,
          achievements: {
             ...(prev.achievements || {}),
             [id]: {
                ...((prev.achievements || {})[id] || { isClaimed: false }),
                progress: Math.min(nextProgress, achDef.target),
                isUnlocked: newlyUnlocked
             }
          }
       };
    });
  };

  const claimAchievement = (id: string) => {
    let success = false;
    let payload = { coins: 0, xp: 0 };

    setStats(prev => {
       const achDef = ACHIEVEMENTS_DB.find(a => a.id === id);
       const state = prev.achievements?.[id];
       if (!achDef || !state || !state.isUnlocked || state.isClaimed) return prev;

       success = true;
       payload = { coins: achDef.rewardCoins, xp: achDef.rewardXp };

       return {
          ...prev,
          achievements: {
             ...prev.achievements,
             [id]: { ...state, isClaimed: true }
          }
       };
    });

    if (success) {
       addCoins(payload.coins);
       addXp(payload.xp);
       return true;
    }
    return false;
  };

  const clearRecentAchievement = (id: string) => {
     setRecentAchievements(r => r.filter(x => x !== id));
  };

  const progressQuest = (type: Quest['type'], amount: number) => {
    setStats(prev => {
       let chainAdvanced = false;
       const safeQuests = prev.activeQuests || generateDailyQuests();
       const nextQuests = safeQuests.map(q => {
          if (q.type === type && !q.isDone) {
             const newProgress = q.progress + amount;
             if (newProgress >= q.target) {
                // Quest Completed
                chainAdvanced = true;
                return { ...q, progress: q.target, isDone: true };
             }
             return { ...q, progress: newProgress };
          }
          return q;
       });
       
       let newChain = prev.questChainProgress || 0;
       if (chainAdvanced) newChain += 1;

       return { ...prev, activeQuests: nextQuests, questChainProgress: newChain };
    });
  };

  const claimQuestReward = (questId: string) => {
    setStats(prev => {
       const safeQuests = prev.activeQuests || generateDailyQuests();
       const q = safeQuests.find(uq => uq.id === questId);
       if (!q || !q.isDone) return prev;
       return {
         ...prev,
         coins: prev.coins + q.rewardCoins,
         xp: prev.xp + q.rewardXp,
         // We do not remove it, just keep it as 'isDone' to show in the UI for the day
       };
    });
  };

  const claimQuestChainChest = () => {
    // Only claimable if at least 3 quests done
    if ((stats.questChainProgress || 0) >= 3) {
      setStats(prev => {
        const safeInventory = prev.inventory || { hammer: 3, bomb: 3, shuffle: 3 };
        return {
          ...prev,
          coins: (prev.coins || 0) + 500,
          xp: (prev.xp || 0) + 1000,
          inventory: { ...safeInventory, hammer: safeInventory.hammer + 1, shuffle: safeInventory.shuffle + 1 },
          questChainProgress: 0, // Reset chain
          activeQuests: generateDailyQuests() // Generate new quests
        };
      });
      return true;
    }
    return false;
  };

  const getRank = (currentXp: number) => {
    const level = Math.floor(Math.sqrt(currentXp / 100)) + 1;
    if (level < 3) return 'Rookie';
    if (level < 6) return 'Casual';
    if (level < 10) return 'Skilled';
    if (level < 15) return 'Puzzle Pro';
    if (level < 25) return 'Combo Master';
    if (level < 50) return 'Elite';
    return 'Legend';
  };

  const getLevelInfo = (currentXp: number) => {
    const level = Math.floor(Math.sqrt(currentXp / 100)) + 1;
    const nextLevelXp = Math.pow(level, 2) * 100;
    const prevLevelXp = Math.pow(level - 1, 2) * 100;
    const progressPercent = Math.max(0, Math.min(100, ((currentXp - prevLevelXp) / (nextLevelXp - prevLevelXp)) * 100));
    return { level, nextLevelXp, prevLevelXp, progressPercent, rank: getRank(currentXp) };
  };

  const checkLoginTriggers = () => {
    const now = Date.now();
    const DAY_MS = 24 * 60 * 60 * 1000;
    
    setStats(prev => {
      if (prev.lastDailyRewardTime === 0) return prev; // First play
      const timeSinceLast = now - prev.lastDailyRewardTime;
      
      // If away for more than 48 hours, trigger comeback welcome
      if (timeSinceLast > DAY_MS * 2 && !prev.comebackEligible) {
         return { ...prev, comebackEligible: true };
      }
      return prev;
    });
  };

  // Run login trigger check on boot
  // eslint-disable-next-line react-hooks/exhaustive-deps
  // useEffect(() => { checkLoginTriggers(); }, []);

  const claimComebackReward = () => {
    setStats(prev => ({
      ...prev,
      comebackEligible: false,
      coins: prev.coins + 300,
      xp: prev.xp + 500,
      inventory: { ...prev.inventory, bomb: prev.inventory.bomb + 2 }
    }));
  };

  const claimDailyReward = () => {
    const now = Date.now();
    const DAY_MS = 24 * 60 * 60 * 1000;
    
    let payload = { coins: 0, xp: 0, item: null as string | null, day: 1 };

    setStats(prev => {
       const timeSinceLast = now - prev.lastDailyRewardTime;
       let nextTrack = prev.loginTrack;
       
       if (timeSinceLast < DAY_MS && prev.lastDailyRewardTime !== 0) return prev; 
       
       if (timeSinceLast > DAY_MS * 2.5) {
          nextTrack = 1; // Resets completely if missed a day
       } else {
          nextTrack = prev.loginTrack >= 7 ? 1 : prev.loginTrack + 1; // Cycles 1-7
       }
       if (prev.lastDailyRewardTime === 0) nextTrack = 1; // First claim ever

       const rewardMap = {
         1: { coins: 150, xp: 50, item: null },
         2: { coins: 200, xp: 100, item: null },
         3: { coins: 250, xp: 150, item: 'hammer' },
         4: { coins: 300, xp: 300, item: null },
         5: { coins: 400, xp: 500, item: null }, // Theme unlock logic can be tied to day 5 globally
         6: { coins: 600, xp: 800, item: 'bomb' },
         7: { coins: 1500, xp: 2000, item: 'shuffle' } // Mega chest
       };
       
       const reward = rewardMap[nextTrack as keyof typeof rewardMap] || rewardMap[1];

       payload = { coins: reward.coins, xp: reward.xp, item: reward.item, day: nextTrack };

       const nextLevel = Math.floor(Math.sqrt((prev.xp + reward.xp) / 100)) + 1;

       return {
         ...prev,
         coins: prev.coins + reward.coins,
         xp: prev.xp + reward.xp,
         highestLevelReached: Math.max(prev.highestLevelReached || 1, nextLevel),
         lastDailyRewardTime: now,
         loginTrack: nextTrack,
         activeQuests: prev.activeQuests && Date.now() - prev.lastDailyRewardTime < DAY_MS * 2.5 
           ? prev.activeQuests 
           : generateDailyQuests(), // Generate new quests completely on next distinct claim sequence!
         questChainProgress: 0,
         inventory: reward.item ? {
            ...(prev.inventory || { hammer: 3, bomb: 3, shuffle: 3 }),
            [reward.item]: (prev.inventory ? prev.inventory[reward.item as keyof typeof prev.inventory] : 0) + (nextTrack === 7 ? 3 : 1)
         } : (prev.inventory || { hammer: 3, bomb: 3, shuffle: 3 })
       };
    });

    progressAchievement('gen_login_3', 1);

    return payload;
  };

  const spinLuckyWheel = () => {
     let payload = { type: 'coins' as 'coins' | 'item' | 'xp' | 'jackpot', amount: 0, itemId: null as string | null };
     
     setStats(prev => {
        const now = Date.now();
        const DAY_MS = 24 * 60 * 60 * 1000;
        
        // Anti-cheat / cooldown strict check
        if (now - (prev.lastLuckySpinTime || 0) < DAY_MS && (prev.lastLuckySpinTime || 0) !== 0) return prev;

        const timeSinceLast = now - (prev.lastLuckySpinTime || 0);
        let nextStreak = prev.luckySpinStreak || 0;
        if (timeSinceLast < DAY_MS * 2.5) nextStreak++; else nextStreak = 0; // Break streak

        // Defined Wheel Slices (8 slices)
        const slices = [
           { id: 0, type: 'coins', amount: 50, itemId: null, weight: 100 },
           { id: 1, type: 'item', amount: 1, itemId: 'hammer', weight: 40 },
           { id: 2, type: 'coins', amount: 150, itemId: null, weight: 60 },
           { id: 3, type: 'item', amount: 1, itemId: 'bomb', weight: 30 },
           { id: 4, type: 'xp', amount: 200, itemId: null, weight: 80 },
           { id: 5, type: 'item', amount: 1, itemId: 'shuffle', weight: 20 },
           { id: 6, type: 'coins', amount: 500, itemId: null, weight: 10 },
           { id: 7, type: 'jackpot', amount: 2000, itemId: null, weight: 2 } // RARE
        ];

        // Weighted random selection
        const totalWeight = slices.reduce((acc, slice) => acc + slice.weight, 0);
        let random = Math.random() * totalWeight;
        let selectedSlice = slices[0];
        
        for (const slice of slices) {
           if (random < slice.weight) {
              selectedSlice = slice;
              break;
           }
           random -= slice.weight;
        }

        // Apply streak bonus
        let finalAmount = selectedSlice.amount;
        if (selectedSlice.type === 'coins' && nextStreak > 0) {
           finalAmount += (nextStreak * 20); // Bonus coins per streak
        }

        payload = { type: selectedSlice.type as any, amount: finalAmount, itemId: selectedSlice.itemId };

        const safeInventory = prev.inventory || { hammer: 3, bomb: 3, shuffle: 3 };

        return {
           ...prev,
           coins: prev.coins + (payload.type === 'coins' || payload.type === 'jackpot' ? payload.amount : 0),
           xp: prev.xp + (payload.type === 'xp' ? payload.amount : 50), // base 50 XP just for spinning
           inventory: payload.type === 'item' && payload.itemId ? {
              ...safeInventory,
              [payload.itemId]: (safeInventory[payload.itemId as keyof typeof safeInventory] || 0) + payload.amount
           } : safeInventory,
           lastLuckySpinTime: now,
           luckySpinStreak: nextStreak
        };
     });
     
     progressAchievement('gen_spin_3', 1);

     return payload;
  };

  const canClaimDaily = () => {
    return Date.now() - stats.lastDailyRewardTime > 86400000;
  };

  const canSpinLuckyWheel = () => {
    return Date.now() - (stats.lastLuckySpinTime || 0) > 86400000;
  };

  const unlockTheme = (theme: ThemeName, cost: number) => {
    if (stats.coins >= cost && !stats.unlockedThemes.includes(theme)) {
      setStats((prev) => ({
        ...prev,
        coins: prev.coins - cost,
        unlockedThemes: [...prev.unlockedThemes, theme],
      }));
      return true;
    }
    return false;
  };

  const resetSave = () => {
    setStats({
      coins: 200,
      lifetimeCoinsEarned: 200,
      totalGamesPlayed: 0,
      xp: 0,
      blockBlastBestScore: 0,
      merge2048BestScore: 0,
      merge2048HighestTile: 0,
      match3BestScore: 0,
      unlockedThemes: ['dark-pro'],
      lastDailyRewardTime: 0,
      loginTrack: 1,
      lastLuckySpinTime: 0,
      luckySpinStreak: 0,
      comebackEligible: false,
      highestLevelReached: 1,
      inventory: { hammer: 3, bomb: 3, shuffle: 3 },
      activeQuests: generateDailyQuests(),
      questChainProgress: 0,
      achievements: {}
    });
  };

  const consumeItem = (itemType: 'hammer' | 'bomb' | 'shuffle') => {
    let success = false;
    setStats(prev => {
      if (prev.inventory[itemType] > 0) {
        success = true;
        return {
          ...prev,
          inventory: {
            ...prev.inventory,
            [itemType]: prev.inventory[itemType] - 1
          }
        };
      }
      return prev;
    });
    return success;
  };

  const buyItem = (itemType: 'hammer' | 'bomb' | 'shuffle', cost: number) => {
    if (stats.coins >= cost) {
      setStats(prev => ({
        ...prev,
        coins: prev.coins - cost,
        inventory: {
          ...prev.inventory,
          [itemType]: prev.inventory[itemType] + 1
        }
      }));
      return true;
    }
    return false;
  };

  return {
    stats,
    settings,
    setSettings,
    addCoins,
    incrementGamesPlayed,
    addXp,
    updateBlockBlastBestScore,
    updateMerge2048Stats,
    updateMatch3BestScore,
    unlockTheme,
    claimDailyReward,
    claimComebackReward,
    canClaimDaily,
    spinLuckyWheel,
    canSpinLuckyWheel,
    checkLoginTriggers,
    progressQuest,
    claimQuestReward,
    claimQuestChainChest,
    resetSave,
    consumeItem,
    buyItem,
    getLevelInfo,
    progressAchievement,
    claimAchievement,
    recentAchievements,
    clearRecentAchievement
  };
}
