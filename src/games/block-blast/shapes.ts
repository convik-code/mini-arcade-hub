export type BlockType = 1 | 2 | 3 | 4 | 5;

export interface Shape {
  id: string;
  grid: number[][]; 
  type: BlockType;
}

const generateId = () => Math.random().toString(36).substr(2, 9);

const SHAPE_DEFINITIONS = [
  // 1x1
  { grid: [[1]], type: 1 },
  // 2x2
  { grid: [[1, 1], [1, 1]], type: 2 },
  // 3x3
  { grid: [[1, 1, 1], [1, 1, 1], [1, 1, 1]], type: 3 },
  // Lines
  { grid: [[1, 1]], type: 4 }, 
  { grid: [[1], [1]], type: 4 }, 
  { grid: [[1, 1, 1]], type: 5 }, 
  { grid: [[1], [1], [1]], type: 5 }, 
  { grid: [[1, 1, 1, 1]], type: 1 }, 
  { grid: [[1], [1], [1], [1]], type: 1 }, 
  { grid: [[1, 1, 1, 1, 1]], type: 2 }, 
  { grid: [[1], [1], [1], [1], [1]], type: 2 }, 
  // L-Shapes (small)
  { grid: [[1, 0], [1, 1]], type: 3 }, 
  { grid: [[0, 1], [1, 1]], type: 3 }, 
  { grid: [[1, 1], [1, 0]], type: 3 }, 
  { grid: [[1, 1], [0, 1]], type: 3 }, 
  // L-Shapes (large 3x3)
  { grid: [[1, 0, 0], [1, 0, 0], [1, 1, 1]], type: 4 }, 
  { grid: [[0, 0, 1], [0, 0, 1], [1, 1, 1]], type: 4 }, 
  { grid: [[1, 1, 1], [1, 0, 0], [1, 0, 0]], type: 4 }, 
  { grid: [[1, 1, 1], [0, 0, 1], [0, 0, 1]], type: 4 }, 
  // T-Shapes
  { grid: [[1, 1, 1], [0, 1, 0]], type: 5 }, 
  { grid: [[0, 1, 0], [1, 1, 1]], type: 5 }, 
  { grid: [[1, 0], [1, 1], [1, 0]], type: 5 }, 
  { grid: [[0, 1], [1, 1], [0, 1]], type: 5 }, 
];

const canShapeFit = (shapeGrid: number[][], board: number[][]) => {
  const gSize = board.length;
  for (let r = 0; r <= gSize - shapeGrid.length; r++) {
    for (let c = 0; c <= gSize - shapeGrid[0].length; c++) {
      let fit = true;
      for (let pr = 0; pr < shapeGrid.length; pr++) {
        for (let pc = 0; pc < shapeGrid[pr].length; pc++) {
          if (shapeGrid[pr][pc] > 0 && board[r + pr][c + pc] > 0) {
            fit = false;
            break;
          }
        }
        if (!fit) break;
      }
      if (fit) return true;
    }
  }
  return false;
};

export const getSmartShapes = (count: number, grid?: number[][]): Shape[] => {
  const result: Shape[] = [];
  let guaranteedFit = false;

  for (let i = 0; i < count; i++) {
    let def;
    
    // Try to guarantee at least one piece is playable to avoid unfair sudden deaths
    if (grid && !guaranteedFit) {
      const shuffled = [...SHAPE_DEFINITIONS].sort(() => Math.random() - 0.5);
      for (const d of shuffled) {
        if (canShapeFit(d.grid, grid)) {
          def = d;
          guaranteedFit = true;
          break; // Found a playable shape
        }
      }
    }
    
    // If we already guaranteed a fit or grid is empty/not provided
    if (!def) {
       // We can just grab random, but let's favor smaller pieces generally for casual fun
       // Or just random.
       def = SHAPE_DEFINITIONS[Math.floor(Math.random() * SHAPE_DEFINITIONS.length)];
    }

    result.push({
      id: generateId(),
      grid: def.grid.map(row => row.map(v => v ? def.type : 0)),
      type: def.type as BlockType
    });
  }
  
  // Shuffle the result array so the guaranteed fit piece isn't always first
  return result.sort(() => Math.random() - 0.5);
};
