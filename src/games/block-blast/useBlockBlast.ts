import { useState, useCallback, useEffect } from 'react';
import { getSmartShapes } from './shapes';
import { soundEngine } from '../../core/SoundEngine';
import type { Shape } from './shapes';

export const GRID_SIZE = 8;
const INITIAL_PIECE_COUNT = 3;

export type PowerUpType = 'hammer' | 'bomb' | 'shuffle' | null;

export interface Mission {
  id: string;
  desc: string;
  type: 'lines' | 'score' | 'combo' | 'blocks';
  target: number;
  progress: number;
  rewardCoins: number;
  isDone: boolean;
}

export interface FloatingText {
  id: string;
  text: string;
  x: number;
  y: number;
  color: string;
}

const generateRandomMission = (): Mission => {
  const missions = [
    { desc: 'Clear 3 Lines', type: 'lines' as const, target: 3, rewardCoins: 50 },
    { desc: 'Clear 5 Lines', type: 'lines' as const, target: 5, rewardCoins: 100 },
    { desc: 'Reach Combo x3', type: 'combo' as const, target: 3, rewardCoins: 120 },
    { desc: 'Score 500 Pts', type: 'score' as const, target: 500, rewardCoins: 100 },
    { desc: 'Place 12 Blocks', type: 'blocks' as const, target: 12, rewardCoins: 40 },
  ];
  const template = missions[Math.floor(Math.random() * missions.length)];
  return { ...template, id: Math.random().toString(), progress: 0, isDone: false };
};

export function useBlockBlast(appState: any) {
  const [grid, setGrid] = useState<number[][]>(() => 
    Array(GRID_SIZE).fill(0).map(() => Array(GRID_SIZE).fill(0))
  );
  
  const [pieces, setPieces] = useState<(Shape | null)[]>([null, null, null]);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [mission, setMission] = useState<Mission>(generateRandomMission());
  const [activePowerUp, setActivePowerUp] = useState<PowerUpType>(null);
  
  // Juice state & Retentions
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);
  const [boardShakeTimer, setBoardShakeTimer] = useState(0);
  const [sessionStats, setSessionStats] = useState({ xp: 0, coins: 0, missions: 0 });
  const [chainClearCount, setChainClearCount] = useState(0);

  // Initialize
  useEffect(() => {
    setPieces(getSmartShapes(INITIAL_PIECE_COUNT));
  }, []);

  const spawnFloatingText = (text: string, x: number, y: number, color: string = '#fff') => {
    const id = Math.random().toString();
    setFloatingTexts(prev => [...prev, { id, text, x, y, color }]);
    setTimeout(() => {
      setFloatingTexts(prev => prev.filter(t => t.id !== id));
    }, 1500);
  };

  const shakeBoard = () => {
    setBoardShakeTimer(Date.now());
  };

  const progressMission = useCallback((type: string, amount: number) => {
    setMission(prev => {
      if (prev.isDone || prev.type !== type) return prev;
      let newProgress = prev.progress;
      if (type === 'combo') {
         newProgress = Math.max(prev.progress, amount);
      } else {
         newProgress = prev.progress + amount;
      }
      
      const isDone = newProgress >= prev.target;
      if (isDone) {
        setTimeout(() => {
          appState.addCoins(prev.rewardCoins);
          setSessionStats(s => ({ ...s, coins: s.coins + prev.rewardCoins, missions: s.missions + 1 }));
          spawnFloatingText('MISSION COMPLETE!', window.innerWidth / 2, 200, 'var(--accent-success)');
        }, 300);
      }
      return { ...prev, progress: newProgress, isDone };
    });
  }, [appState]);

  const useShuffle = () => {
    if (appState.consumeItem('shuffle')) {
      soundEngine.playShuffle();
      setPieces(getSmartShapes(INITIAL_PIECE_COUNT, grid));
      spawnFloatingText('SHUFFLED!', window.innerWidth/2, window.innerHeight/2, 'var(--accent-warning)');
    }
  };

  const handleGridClick = (r: number, c: number, clientX: number, clientY: number) => {
    if (!activePowerUp) return;
    
    if (activePowerUp === 'hammer' && grid[r][c] !== 0) {
      if (appState.consumeItem('hammer')) {
        const newGrid = grid.map(row => [...row]);
        newGrid[r][c] = 0;
        setGrid(newGrid);
        setActivePowerUp(null);
        soundEngine.playExplosion();
        spawnFloatingText('SMASH!', clientX, clientY, 'var(--accent-danger)');
        appState.progressQuest('use_powerup', 1);
        shakeBoard();
      }
    } else if (activePowerUp === 'bomb') {
      if (appState.consumeItem('bomb')) {
        const newGrid = grid.map(row => [...row]);
        let hit = 0;
        for (let ir = Math.max(0, r - 1); ir <= Math.min(GRID_SIZE - 1, r + 1); ir++) {
          for (let ic = Math.max(0, c - 1); ic <= Math.min(GRID_SIZE - 1, c + 1); ic++) {
            if (newGrid[ir][ic] > 0) hit++;
            newGrid[ir][ic] = 0;
          }
        }
        setGrid(newGrid);
        setActivePowerUp(null);
        if (hit > 0) {
           soundEngine.playExplosion();
        } else {
           soundEngine.playError();
        }
        spawnFloatingText(hit > 0 ? 'BOOM!' : 'MISS!', clientX, clientY, 'var(--accent-danger)');
        if (hit > 0) shakeBoard();
        appState.progressQuest('use_powerup', 1);
        appState.progressAchievement('bb_use_powerups', 1);
      }
    }
  };

  const clearLines = useCallback((testGrid: number[][]) => {
    const rowsToClear: number[] = [];
    const colsToClear: number[] = [];

    for (let r = 0; r < GRID_SIZE; r++) {
      if (testGrid[r].every(cell => cell > 0)) rowsToClear.push(r);
    }
    for (let c = 0; c < GRID_SIZE; c++) {
      let full = true;
      for (let r = 0; r < GRID_SIZE; r++) {
        if (testGrid[r][c] === 0) { full = false; break; }
      }
      if (full) colsToClear.push(c);
    }
    return { rowsToClear, colsToClear };
  }, []);

  const placePiece = (pieceIndex: number, row: number, col: number, dropX: number, dropY: number) => {
    const piece = pieces[pieceIndex];
    if (!piece) return false;

    // Check bounds & collision
    for (let r = 0; r < piece.grid.length; r++) {
      for (let c = 0; c < piece.grid[r].length; c++) {
        if (piece.grid[r][c] > 0) {
          const tr = row + r;
          const tc = col + c;
          if (tr < 0 || tr >= GRID_SIZE || tc < 0 || tc >= GRID_SIZE || grid[tr][tc] > 0) {
            return false;
          }
        }
      }
    }

    // Place it
    const newGrid = grid.map(r => [...r]);
    let blocksPlaced = 0;
    for (let r = 0; r < piece.grid.length; r++) {
      for (let c = 0; c < piece.grid[r].length; c++) {
        if (piece.grid[r][c] > 0) {
          newGrid[row + r][col + c] = piece.type;
          blocksPlaced++;
        }
      }
    }
    progressMission('blocks', blocksPlaced);

    // Check clears
    const { rowsToClear, colsToClear } = clearLines(newGrid);
    const linesCleared = rowsToClear.length + colsToClear.length;

    let earnedScore = blocksPlaced * 10;
    let earnedXp = blocksPlaced * 5; // boosted XP slightly

    if (linesCleared > 0) {
      soundEngine.playLineClear(linesCleared, combo + 1);
      shakeBoard();
      const newChain = chainClearCount + 1;
      setChainClearCount(newChain);

      rowsToClear.forEach(r => { for (let i = 0; i < GRID_SIZE; i++) newGrid[r][i] = 0; });
      colsToClear.forEach(c => { for (let i = 0; i < GRID_SIZE; i++) newGrid[i][c] = 0; });
      
      if (linesCleared > 0) { // This condition is redundant here, but kept from the snippet
        setCombo(c => c + 1);
        const comboMultiplier = combo + 1 > 1 ? combo + 1 : 1;
        const pts = (linesCleared * 100) * comboMultiplier;
        earnedScore += pts; // Add to existing earnedScore

        const xpEarned = (linesCleared * 5) * comboMultiplier;
        earnedXp += xpEarned; // Add to existing earnedXp

        const coinsEarned = linesCleared > 1 ? linesCleared * 2 : 0;
        if (coinsEarned > 0) appState.addCoins(coinsEarned);

        setSessionStats(s => ({
           ...s, 
           xp: s.xp + xpEarned, 
           coins: s.coins + coinsEarned 
        }));

        setBoardShakeTimer(Date.now());
        
        if (linesCleared === 2) spawnFloatingText('DOUBLE CLEAR!', dropX, dropY - 40, 'var(--accent-primary)');
        else if (linesCleared === 3) spawnFloatingText('TRIPLE BLAST!', dropX, dropY - 60, 'var(--accent-warning)');
        else if (linesCleared >= 4) spawnFloatingText('MEGA BLAST!!!', dropX, dropY - 80, 'var(--accent-danger)');
        
        if (combo + 1 > 2) {
          setTimeout(() => {
            spawnFloatingText(`COMBO x${combo + 1}!`, dropX, dropY - 20, 'var(--accent-danger)');
          }, 200);
        }
      }
      
      progressMission('combo', combo + 1);
      appState.progressQuest('clear_lines', linesCleared);
      
      if (linesCleared >= 3) appState.progressAchievement('bb_multi_line', 1);
      if (combo + 1 >= 3) appState.progressAchievement('bb_combo_3', 1);
      if (combo + 1 >= 5) appState.progressAchievement('bb_combo_5', 1);
      
    } else {
      setCombo(0);
      setChainClearCount(0);
      
      if (blocksPlaced >= 5) {
         spawnFloatingText(`NICE MOVE!`, dropX, dropY - 30, 'var(--accent-secondary)');
      }
      soundEngine.playDrop();
      spawnFloatingText(`+${earnedScore}`, dropX, dropY, 'var(--text-main)');
    }
    
    setScore(prev => prev + earnedScore);
    progressMission('score', earnedScore);
    appState.progressAchievement('bb_score_500', score + earnedScore, true);
    appState.progressAchievement('bb_score_1000', score + earnedScore, true);
    
    // Add XP globally
    appState.addXp(earnedXp);
    setSessionStats(s => ({ ...s, xp: s.xp + earnedXp }));
    if (earnedXp > 0) {
      setTimeout(() => spawnFloatingText(`+${earnedXp} XP`, dropX + 40, dropY - 20, 'var(--accent-primary)'), 100);
    }

    setGrid(newGrid);

    // Remove piece
    const newPieces = [...pieces];
    newPieces[pieceIndex] = null;
    
    if (newPieces.every(p => p === null)) {
      setPieces(getSmartShapes(3, newGrid)); // Pass newGrid to guarantee a fit
    } else {
      setPieces(newPieces);
    }

    return true;
  };

  const resetGame = () => {
    setGrid(Array(GRID_SIZE).fill(0).map(() => Array(GRID_SIZE).fill(0)));
    setPieces(getSmartShapes(INITIAL_PIECE_COUNT));
    setScore(0);
    setCombo(0);
    setIsGameOver(false);
    setMission(generateRandomMission());
    setActivePowerUp(null);
    setFloatingTexts([]);
    setSessionStats({ xp: 0, coins: 0, missions: 0 });
    setChainClearCount(0);
  };

  useEffect(() => {
    if (pieces.every(p => p === null)) return; 
    let canPlaceAny = false;
    for (let piece of pieces) {
      if (!piece) continue;
      for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
          let valid = true;
          for (let pr = 0; pr < piece.grid.length; pr++) {
            for (let pc = 0; pc < piece.grid[pr].length; pc++) {
              if (piece.grid[pr][pc] > 0) {
                const tr = r + pr;
                const tc = c + pc;
                if (tr >= GRID_SIZE || tc >= GRID_SIZE || grid[tr][tc] > 0) {
                  valid = false;
                  break;
                }
              }
            }
            if (!valid) break;
          }
          if (valid) { canPlaceAny = true; break; }
        }
        if (canPlaceAny) break;
      }
      if (canPlaceAny) break;
    }

    if (!canPlaceAny && !isGameOver) {
      if (activePowerUp) return;
      soundEngine.playGameOver();
      setIsGameOver(true);
      appState.progressQuest('play_rounds', 1);
    }
  }, [grid, pieces, activePowerUp, isGameOver]);

  return {
    grid,
    pieces,
    score,
    combo,
    isGameOver,
    mission,
    activePowerUp,
    floatingTexts,
    boardShakeTimer,
    sessionStats,
    setActivePowerUp,
    useShuffle,
    handleGridClick,
    placePiece,
    resetGame,
    generateNewMission: () => setMission(generateRandomMission()),
  };
}
