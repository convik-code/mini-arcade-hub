import { useState, useEffect, useCallback } from 'react';
import { soundEngine } from '../../core/SoundEngine';

export interface Tile {
  id: string;
  value: number;
  row: number;
  col: number;
  isNew?: boolean;
  isMerged?: boolean;
}

export interface MergeMission {
  id: string;
  desc: string;
  type: 'score' | 'merge' | 'tile';
  target: number;
  progress: number;
  rewardCoins: number;
  rewardXp: number;
  isDone: boolean;
}

const generate2048Mission = (): MergeMission => {
  const missions = [
    { desc: 'Score 1000 Pts', type: 'score' as const, target: 1000, rewardCoins: 80, rewardXp: 100 },
    { desc: 'Merge 20 Times', type: 'merge' as const, target: 20, rewardCoins: 50, rewardXp: 75 },
    { desc: 'Create a 128 Tile', type: 'tile' as const, target: 128, rewardCoins: 100, rewardXp: 200 },
  ];
  const t = missions[Math.floor(Math.random() * missions.length)];
  return { ...t, id: Math.random().toString(), progress: 0, isDone: false };
};

export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

const GRID_SIZE = 4;

export function useMerge2048(appState: any) {
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [score, setScore] = useState(0);
  const [comboStreak, setComboStreak] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isVictory, setIsVictory] = useState(false);
  const [keepPlaying, setKeepPlaying] = useState(false);

  // Juice & Progress
  const [floatingTexts, setFloatingTexts] = useState<{id: string, text: string, x: number, y: number, color: string}[]>([]);
  const [sessionStats, setSessionStats] = useState({ xp: 0, coins: 0, moves: 0, maxTileAdded: 0, missions: 0 });
  const [mission, setMission] = useState<MergeMission>(generate2048Mission());

  const spawnFloatingText = (text: string, x: number, y: number, color: string = '#fff') => {
    const id = Math.random().toString();
    setFloatingTexts(prev => [...prev, { id, text, x, y, color }]);
    setTimeout(() => {
      setFloatingTexts(prev => prev.filter(t => t.id !== id));
    }, 1500); 
  };

  const progressMission = (type: 'score' | 'merge' | 'tile', amount: number) => {
    setMission(prev => {
      if (prev.isDone || prev.type !== type) return prev;
      let newProgress = prev.progress;
      if (type === 'tile') {
         newProgress = Math.max(prev.progress, amount);
      } else {
         newProgress = prev.progress + amount;
      }
      
      const isDone = newProgress >= prev.target;
      if (isDone) {
        setTimeout(() => {
          appState.addCoins(prev.rewardCoins);
          appState.addXp(prev.rewardXp);
          setSessionStats(s => ({ 
             ...s, 
             coins: s.coins + prev.rewardCoins, 
             xp: s.xp + prev.rewardXp,
             missions: s.missions + 1 
          }));
          spawnFloatingText('MISSION COMPLETE!', window.innerWidth / 2, 200, 'var(--accent-success)');
        }, 300);
      }
      return { ...prev, progress: newProgress, isDone };
    });
  };

  const spawnRandomTile = (currentTiles: Tile[]) => {
    const emptyCells: {r: number, c: number}[] = [];
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (!currentTiles.some(t => t.row === r && t.col === c && t.value > 0)) {
          emptyCells.push({ r, c });
        }
      }
    }
    
    if (emptyCells.length === 0) return null;
    const { r, c } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    return {
      id: Math.random().toString(),
      value: Math.random() < 0.9 ? 2 : 4,
      row: r,
      col: c,
      isNew: true
    };
  };

  const initGame = useCallback(() => {
    const t1 = spawnRandomTile([]);
    const t2 = spawnRandomTile(t1 ? [t1 as Tile] : []);
    setTiles([t1, t2].filter(Boolean) as Tile[]);
    setScore(0);
    setIsGameOver(false);
    setIsVictory(false);
    setKeepPlaying(false);
    setFloatingTexts([]);
    setSessionStats({ xp: 0, coins: 0, moves: 0, maxTileAdded: 0, missions: 0 });
    setComboStreak(0);
    setMission(generate2048Mission());
  }, []);

  useEffect(() => {
    initGame();
  }, [initGame]);

  const resetGame = () => initGame();

  const continuePlaying = () => {
    setIsVictory(false);
    setKeepPlaying(true);
  };

  const checkGameOver = (currentTiles: Tile[]) => {
    if (currentTiles.length < 16) return false;
    
    // Check horizontal merges
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE - 1; c++) {
        const t1 = currentTiles.find(t => t.row === r && t.col === c);
        const t2 = currentTiles.find(t => t.row === r && t.col === c + 1);
        if (t1 && t2 && t1.value === t2.value) return false;
      }
    }
    // Check vertical merges
    for (let c = 0; c < GRID_SIZE; c++) {
      for (let r = 0; r < GRID_SIZE - 1; r++) {
        const t1 = currentTiles.find(t => t.row === r && t.col === c);
        const t2 = currentTiles.find(t => t.row === r + 1 && t.col === c);
        if (t1 && t2 && t1.value === t2.value) return false;
      }
    }
    return true;
  };

  const moveTiles = useCallback((direction: Direction) => {
    if (isGameOver || (isVictory && !keepPlaying)) return;

    let hasChanged = false;
    let newTiles = tiles.map(t => ({ ...t, isNew: false, isMerged: false }));
    let earnedScore = 0;
    let mergeCount = 0;
    let highestNewTile = 0;

    for (let i = 0; i < GRID_SIZE; i++) {
      let run: Tile[] = [];
      if (direction === 'LEFT' || direction === 'RIGHT') {
        run = newTiles.filter(t => t.row === i).sort((a, b) => direction === 'LEFT' ? a.col - b.col : b.col - a.col);
      } else {
        run = newTiles.filter(t => t.col === i).sort((a, b) => direction === 'UP' ? a.row - b.row : b.row - a.row);
      }

      let currPos = 0;
      for (let j = 0; j < run.length; j++) {
        const curr = run[j];
        if (j > 0 && run[j - 1].value === curr.value && !run[j - 1].isMerged && curr.value > 0) {
          // Merge
          run[j - 1].value *= 2;
          run[j - 1].isMerged = true;
          curr.row = run[j - 1].row;
          curr.col = run[j - 1].col;
          // Mark for deletion later
          curr.value = 0; 
          
          hasChanged = true;
          earnedScore += run[j - 1].value;
          mergeCount++;
          highestNewTile = Math.max(highestNewTile, run[j - 1].value);

        } else {
          // Slide
          const oldRow = curr.row;
          const oldCol = curr.col;
          
          if (direction === 'LEFT') curr.col = currPos;
          else if (direction === 'RIGHT') curr.col = GRID_SIZE - 1 - currPos;
          else if (direction === 'UP') curr.row = currPos;
          else if (direction === 'DOWN') curr.row = GRID_SIZE - 1 - currPos;
          
          if (oldRow !== curr.row || oldCol !== curr.col) {
            hasChanged = true;
          }
          currPos++;
        }
      }
    }

    if (hasChanged) {
       soundEngine.playSlide();
       const physicalGrid = newTiles.filter(t => t.value > 0);
       const newT = spawnRandomTile(physicalGrid);
       if (newT) newTiles.push({ ...newT, isMerged: false, isNew: true });

       let newCombo = comboStreak;
       // Every single successful swipe yields micro XP to maintain constant progression feeling!
       appState.addXp(1);
       setSessionStats(s => ({ ...s, xp: s.xp + 1, moves: s.moves + 1 }));

       if (mergeCount > 0) {
         newCombo++;
         const comboMulti = newCombo > 1 ? newCombo : 1;
         const finalScore = earnedScore * comboMulti;
         setScore(prev => prev + finalScore);
         
         appState.progressAchievement('m2_merge_multi', mergeCount);

         const xpGain = (mergeCount * 5) * comboMulti + 2; 
         const coinsGain = Math.floor(earnedScore / (50 / comboMulti)); // Combos drastically accelerate coin drops!

         appState.addXp(xpGain);
         if (xpGain > 0) setTimeout(() => spawnFloatingText(`+${xpGain} XP`, window.innerWidth/2, window.innerHeight/2 - 20, 'var(--accent-primary)'), 100);
         if (coinsGain > 0) appState.addCoins(coinsGain);

         setSessionStats(s => ({
            ...s, 
            xp: s.xp + xpGain, 
            coins: s.coins + coinsGain, 
            maxTileAdded: Math.max(s.maxTileAdded, highestNewTile)
         }));

         appState.updateMerge2048Stats(score + finalScore, Math.max(appState.stats.merge2048HighestTile, highestNewTile));

         appState.progressAchievement('m2_128', highestNewTile, true);
         appState.progressAchievement('m2_256', highestNewTile, true);
         appState.progressAchievement('m2_512', highestNewTile, true);
         appState.progressAchievement('m2_1024', highestNewTile, true);
         appState.progressAchievement('m2_2048', highestNewTile, true);

         if (mergeCount > 1) spawnFloatingText(`DOUBLE MERGE!`, window.innerWidth/2, window.innerHeight/2, 'var(--accent-warning)');
         if (newCombo > 2) spawnFloatingText(`COMBO x${newCombo}!`, window.innerWidth/2, window.innerHeight/2 + 50, 'var(--accent-danger)');
         
         soundEngine.playMerge(highestNewTile);

         // Milestone dopamine drops
         if (highestNewTile > sessionStats.maxTileAdded) {
            const milestones = [64, 128, 256, 512, 1024, 2048];
            if (milestones.includes(highestNewTile)) {
               soundEngine.playMilestone();
               setTimeout(() => spawnFloatingText(`UNLOCKED ${highestNewTile}!`, window.innerWidth/2, window.innerHeight/2 - 60, '#fff'), 300);
            }
         }

       } else {
         newCombo = 0;
       }
       setComboStreak(newCombo);
       setTiles(newTiles);

       // Execute progression
       if (earnedScore > 0) { progressMission('score', earnedScore); appState.progressQuest('reach_score', earnedScore); }
       if (mergeCount > 0) { progressMission('merge', mergeCount); appState.progressQuest('merge_tiles', mergeCount); }
       if (highestNewTile > 0) progressMission('tile', highestNewTile);
       
       // Cull absorbed tiles cleanly strictly after visual slide concludes
       if (mergeCount > 0) {
         setTimeout(() => {
            setTiles(curr => curr.filter(t => t.value > 0));
         }, 150);
       }

       if (!isVictory && newTiles.some(t => t.value === 2048)) {
         soundEngine.playMilestone();
         setIsVictory(true);
       } else if (!isGameOver && checkGameOver(newTiles.filter(t => t.value > 0))) {
         soundEngine.playGameOver();
         setIsGameOver(true);
         appState.progressQuest('play_rounds', 1);
       }
    } else {
       setComboStreak(0);
    }
  }, [tiles, isGameOver, isVictory, keepPlaying, comboStreak, score, appState, sessionStats]);

  return {
    tiles,
    score,
    comboStreak,
    isGameOver,
    isVictory,
    keepPlaying,
    floatingTexts,
    sessionStats,
    mission,
    generateNewMission: () => setMission(generate2048Mission()),
    moveTiles,
    resetGame,
    initGame,
    continuePlaying
  };
}
