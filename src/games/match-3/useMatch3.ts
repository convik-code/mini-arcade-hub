import { useState, useCallback, useEffect } from 'react';
import { soundEngine } from '../../core/SoundEngine';

export const GRID_SIZE = 8;

export type CandyColor = 'red' | 'blue' | 'green' | 'yellow' | 'purple' | 'orange';
export type SpecialType = 'none' | 'striped-h' | 'striped-v' | 'bomb' | 'cross';

export interface TileData {
  id: string;
  color: CandyColor;
  special: SpecialType;
}

const COLORS: CandyColor[] = ['red', 'blue', 'green', 'yellow', 'purple', 'orange'];

export interface FloatingText {
  id: string;
  text: string;
  x: number;
  y: number;
  color: string;
}

function generateId() {
  return Math.random().toString(36).substring(2, 9);
}

function getRandomColor(): CandyColor {
  return COLORS[Math.floor(Math.random() * COLORS.length)];
}

export function useMatch3(appState: any) {
  const [grid, setGrid] = useState<(TileData | null)[][]>(() => Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(null)));
  const [score, setScore] = useState(0);
  const [moves, setMoves] = useState(30);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);
  const [sessionStats, setSessionStats] = useState({ xp: 0, coins: 0, tilesCleared: 0 });

  const spawnFloatingText = (text: string, x: number, y: number, color: string = '#fff') => {
    const id = generateId();
    setFloatingTexts(prev => [...prev, { id, text, x, y, color }]);
    setTimeout(() => {
      setFloatingTexts(prev => prev.filter(t => t.id !== id));
    }, 1500);
  };

  const findMatches = (currentGrid: (TileData | null)[][], activeSwaps: {r:number, c:number}[] = []) => {
    const hMatches = new Set<string>();
    const vMatches = new Set<string>();
    const spawnsByPos: Record<string, { r: number, c: number, type: SpecialType, color: CandyColor }> = {};

    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE - 2; c++) {
        const t1 = currentGrid[r][c];
        if (!t1) continue;
        const color = t1.color;
        let matchLen = 1;
        while (c + matchLen < GRID_SIZE && currentGrid[r][c + matchLen]?.color === color) matchLen++;
        if (matchLen >= 3) {
          const matchCoords = [];
          for (let i = 0; i < matchLen; i++) {
             hMatches.add(`${r},${c + i}`);
             matchCoords.push(`${r},${c + i}`);
          }
          let spawnTarget = `${r},${c}`;
          const activeHit = matchCoords.find(mc => activeSwaps.some(swap => `${swap.r},${swap.c}` === mc));
          if (activeHit) spawnTarget = activeHit;
          
          const [tr, tc] = spawnTarget.split(',').map(Number);
          if (matchLen === 4) spawnsByPos[spawnTarget] = { r: tr, c: tc, type: 'striped-v', color };
          if (matchLen >= 5) spawnsByPos[spawnTarget] = { r: tr, c: tc, type: 'bomb', color };
          c += matchLen - 1; 
        }
      }
    }

    for (let c = 0; c < GRID_SIZE; c++) {
      for (let r = 0; r < GRID_SIZE - 2; r++) {
        const t1 = currentGrid[r][c];
        if (!t1) continue;
        const color = t1.color;
        let matchLen = 1;
        while (r + matchLen < GRID_SIZE && currentGrid[r + matchLen][c]?.color === color) matchLen++;
        if (matchLen >= 3) {
          const matchCoords = [];
          for (let i = 0; i < matchLen; i++) {
             vMatches.add(`${r + i},${c}`);
             matchCoords.push(`${r + i},${c}`);
          }
          let spawnTarget = `${r},${c}`;
          const activeHit = matchCoords.find(mc => activeSwaps.some(swap => `${swap.r},${swap.c}` === mc));
          if (activeHit) spawnTarget = activeHit;

          const [tr, tc] = spawnTarget.split(',').map(Number);
          if (matchLen === 4) spawnsByPos[spawnTarget] = { r: tr, c: tc, type: 'striped-h', color };
          if (matchLen >= 5) spawnsByPos[spawnTarget] = { r: tr, c: tc, type: 'bomb', color };
          r += matchLen - 1;
        }
      }
    }

    const allMatches = new Set([...hMatches, ...vMatches]);

    // Cross-match detection 
    hMatches.forEach(pos => {
      if (vMatches.has(pos)) {
        const [r, c] = pos.split(',').map(Number);
        const t1 = currentGrid[r][c];
        if (t1 && spawnsByPos[pos]?.type !== 'bomb') { // Bomb overrides Cross
           spawnsByPos[pos] = { r, c, type: 'cross', color: t1.color };
        }
      }
    });

    const specialSpawns = Object.values(spawnsByPos);
    return { matches: Array.from(allMatches).map(s => { const [r,c] = s.split(',').map(Number); return { r, c }; }), specialSpawns };
  };

  const fillBoard = (currentGrid: (TileData | null)[][]) => {
    let newGrid = currentGrid.map(row => [...row]);
    let hasChanges = false;

    // Gravity
    for (let c = 0; c < GRID_SIZE; c++) {
      for (let r = GRID_SIZE - 1; r >= 0; r--) {
        if (newGrid[r][c] === null) {
          // Pull down from above
          for (let k = r - 1; k >= 0; k--) {
            if (newGrid[k][c] !== null) {
              newGrid[r][c] = newGrid[k][c];
              newGrid[k][c] = null;
              hasChanges = true;
              break;
            }
          }
        }
      }
    }

    // Spawn new
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (newGrid[r][c] === null) {
          newGrid[r][c] = {
            id: generateId(),
            color: getRandomColor(),
            special: 'none'
          };
          hasChanges = true;
        }
      }
    }
    return { newGrid, hasChanges };
  };

  // Initial board gen strictly prevents matches
  const initBoard = useCallback(() => {
    let validGrid = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(null));
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        let attempts = 0;
        let color: CandyColor;
        do {
          color = getRandomColor();
          attempts++;
        } while (
           attempts < 20 &&
           ((c >= 2 && validGrid[r][c-1]?.color === color && validGrid[r][c-2]?.color === color) ||
            (r >= 2 && validGrid[r-1][c]?.color === color && validGrid[r-2][c]?.color === color))
        );
        validGrid[r][c] = { id: generateId(), color, special: 'none' };
      }
    }
    setGrid(validGrid);
    setScore(0);
    setMoves(30); // Or endless? Let's go Endless basically, but provide moves for a goal if needed. We'll stick to 30 moves limit to force game overs.
    setIsGameOver(false);
    setSessionStats({ xp: 0, coins: 0, tilesCleared: 0 });
  }, []);

  useEffect(() => {
    initBoard();
  }, [initBoard]);

  const destroyTiles = async (r: number, c: number, type: SpecialType, colorData: CandyColor, gridRef: (TileData | null)[][], swept: Set<string>) => {
     if (type === 'none') return;
     const mark = (tr: number, tc: number) => {
        if (tr >= 0 && tr < GRID_SIZE && tc >= 0 && tc < GRID_SIZE && gridRef[tr][tc] && !swept.has(`${tr},${tc}`)) {
           swept.add(`${tr},${tc}`);
           const child = gridRef[tr][tc];
           if (child && child.special !== 'none') {
              destroyTiles(tr, tc, child.special, child.color, gridRef, swept);
           }
        }
     };

     if (type === 'striped-h') {
        for (let i = 0; i < GRID_SIZE; i++) mark(r, i);
     } else if (type === 'striped-v') {
        for (let i = 0; i < GRID_SIZE; i++) mark(i, c);
     } else if (type === 'cross') {
        for (let ir = r - 1; ir <= r + 1; ir++) {
           for (let ic = c - 1; ic <= c + 1; ic++) {
              mark(ir, ic);
           }
        }
     } else if (type === 'bomb') {
        for (let ir = 0; ir < GRID_SIZE; ir++) {
           for (let ic = 0; ic < GRID_SIZE; ic++) {
              if (gridRef[ir][ic]?.color === colorData) mark(ir, ic);
           }
        }
     }
  };

  const processCascades = async (startingGrid: (TileData | null)[][], comboCount: number = 1, activeSwaps: {r:number, c:number}[] = []) => {
    const { matches, specialSpawns } = findMatches(startingGrid, activeSwaps);
    if (matches.length === 0) {
      setIsAnimating(false);
      // Check for Game Over condition
      setMoves(m => {
        if (m <= 0) {
          soundEngine.playGameOver();
          setIsGameOver(true);
          appState.progressQuest('play_rounds', 1);
        }
        return m;
      });
      return;
    }

    const swept = new Set<string>();
    matches.forEach(m => swept.add(`${m.r},${m.c}`));

    // Trigger specials within matches
    matches.forEach(m => {
       const t = startingGrid[m.r][m.c];
       if (t && t.special !== 'none') {
          destroyTiles(m.r, m.c, t.special, t.color, startingGrid, swept);
       }
    });

    let nextGrid = startingGrid.map(row => [...row]);
    
    // Calculate scoring
    let pts = swept.size * 10 * comboCount;
    let earnedCoins = comboCount > 1 ? comboCount * 2 : 0;
    
    soundEngine.playMatch(comboCount);
    if (specialSpawns.length > 0) setTimeout(() => soundEngine.playLaser(), 100);

    setScore(s => s + pts);
    const xpEarned = Math.floor(pts / 2);
    appState.addXp(xpEarned);
    if (xpEarned > 0) spawnFloatingText(`+${xpEarned} XP`, window.innerWidth/2, 280, 'var(--accent-primary)');

    if (earnedCoins > 0) Object.assign(sessionStats, { coins: sessionStats.coins + earnedCoins });
    setSessionStats(s => {
       const nextCleared = s.tilesCleared + swept.size;
       appState.progressAchievement('m3_clear_20', nextCleared, true);
       return { ...s, xp: s.xp + xpEarned, tilesCleared: nextCleared };
    });

    appState.progressAchievement('m3_score_milestone', pts);
    appState.progressAchievement('m3_first_match', 1);

    if (swept.size >= 10 || comboCount >= 3) {
       spawnFloatingText(`COMBO x${comboCount}!`, window.innerWidth/2, 200, 'var(--accent-danger)');
       appState.progressAchievement('m3_combo_3', 1);
    } else if (comboCount >= 2) {
       spawnFloatingText(`CASCADE!`, window.innerWidth/2, 250, 'var(--accent-warning)');
       appState.progressAchievement('m3_cascade', 1);
    }

    // Nullify
    swept.forEach(s => {
       const [r, c] = s.split(',').map(Number);
       nextGrid[r][c] = null;
    });

    // Spawn new specials
    specialSpawns.forEach(s => {
       nextGrid[s.r][s.c] = { id: generateId(), color: s.color, special: s.type };
    });

    setGrid(nextGrid);
    
    await new Promise(res => setTimeout(res, 400)); // Delay for pop animation

    const { newGrid, hasChanges } = fillBoard(nextGrid);
    setGrid(newGrid);

    await new Promise(res => setTimeout(res, 400)); // Delay for fall animation

    if (hasChanges) {
       processCascades(newGrid, comboCount + 1);
    } else {
       setIsAnimating(false);
    }
  };

  const handleSwap = async (r1: number, c1: number, r2: number, c2: number) => {
    if (isAnimating || isGameOver || moves <= 0) return;
    setIsAnimating(true);
    setMoves(m => m - 1);

    const newGrid = grid.map(row => [...row]);
    const temp = newGrid[r1][c1];
    newGrid[r1][c1] = newGrid[r2][c2];
    newGrid[r2][c2] = temp;
    
    soundEngine.playSwap();
    setGrid(newGrid);

    // Wait for graphical swap
    await new Promise(res => setTimeout(res, 250));

    // Check matches
    const { matches } = findMatches(newGrid, [{r: r1, c: c1}, {r: r2, c: c2}]);
    
    // Is there a bomb swapped with normal tile?
    const t1 = grid[r1][c1];
    const t2 = grid[r2][c2];
    const isBombTrigger = (t1?.special === 'bomb' || t2?.special === 'bomb');

    if (matches.length === 0 && !isBombTrigger) {
      // Invalid swap, revert
      soundEngine.playError();
      spawnFloatingText('INVALID', window.innerWidth/2, window.innerHeight/2, 'var(--text-muted)');
      const revertGrid = newGrid.map(row => [...row]);
      const temp2 = revertGrid[r1][c1];
      revertGrid[r1][c1] = revertGrid[r2][c2];
      revertGrid[r2][c2] = temp2;
      setGrid(revertGrid);
      setTimeout(() => setIsAnimating(false), 250);
      setMoves(m => m + 1); // refund move
    } else {
      // Valid!
      if (isBombTrigger) {
         const targetColor = t1?.special === 'bomb' ? t2?.color : t1?.color;
         // Custom logic to explode all target color immediately
         if (targetColor) {
             soundEngine.playExplosion();
             const swept = new Set<string>();
             destroyTiles(r1, c1, 'bomb', targetColor, newGrid, swept);
            swept.add(`${r1},${c1}`);
            swept.add(`${r2},${c2}`);
            swept.forEach(s => {
               const [r, c] = s.split(',').map(Number);
               newGrid[r][c] = null;
            });
            setGrid([...newGrid]);
            await new Promise(res => setTimeout(res, 300));
            const { newGrid: filled } = fillBoard(newGrid);
            setGrid(filled);
            await new Promise(res => setTimeout(res, 300));
            processCascades(filled, 2);
         }
      } else {
         processCascades(newGrid, 1, [{r: r1, c: c1}, {r: r2, c: c2}]);
      }
    }
  };

  const resetGame = () => {
    initBoard();
  };

  return {
    grid,
    score,
    moves,
    isGameOver,
    isAnimating,
    floatingTexts,
    sessionStats,
    handleSwap,
    resetGame
  };
}
