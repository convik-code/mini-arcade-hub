import { useState, useRef } from 'react';
import { motion, useAnimationControls } from 'framer-motion';
import { soundEngine } from '../../core/SoundEngine';
import type { Shape } from './shapes';

interface DraggablePieceProps {
  piece: Shape;
  pieceIndex: number;
  onAttemptPlace: (pieceIndex: number, row: number, col: number, x: number, y: number) => boolean;
}

export function DraggablePiece({ piece, pieceIndex, onAttemptPlace }: DraggablePieceProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [activeCellSize, setActiveCellSize] = useState(40);
  const controls = useAnimationControls();
  const pieceRef = useRef<HTMLDivElement>(null);
  const hoverRef = useRef<HTMLElement[]>([]);

  const blockSize = 24; 
  const rows = piece.grid.length;
  const cols = piece.grid[0].length;

  // Dynamic Scale Calculator ensures giant bounds never overflow the tray slot
  const maxWidth = 80;
  const maxHeight = 80;
  let rackScale = 1;
  const naturalWidth = cols * blockSize;
  const naturalHeight = rows * blockSize;

  if (naturalWidth > maxWidth || naturalHeight > maxHeight) {
      rackScale = Math.min(maxWidth / naturalWidth, maxHeight / naturalHeight);
  }

  const calculatePlacement = () => {
    if (!pieceRef.current) return null;
    const boardEl = document.getElementById('grid-board');
    if (!boardEl) return null;

    // Use absolute coordinates of the first and second cells to derive the true mathematical grid logic
    const cell00 = document.querySelector('#grid-board [data-row="0"][data-col="0"]');
    const cell11 = document.querySelector('#grid-board [data-row="1"][data-col="1"]');
    
    if (!cell00 || !cell11) {
      // Fallback if cells aren't rendered yet
      return null;
    }

    const r00 = cell00.getBoundingClientRect();
    const r11 = cell11.getBoundingClientRect();

    // Mathematically perfect grid stride (width of cell + gap)
    const cellStrideX = r11.left - r00.left;
    const cellStrideY = r11.top - r00.top;

    // Center of the board's 0,0 cell
    const boardOriginX = r00.left + r00.width / 2;
    const boardOriginY = r00.top + r00.height / 2;

    const pieceRect = pieceRef.current.getBoundingClientRect();
    const dragCellWidth = pieceRect.width / cols;
    const dragCellHeight = pieceRect.height / rows;

    // Center of the dragged piece's 0,0 logical block (even if visually empty)
    const pieceOriginX = pieceRect.left + dragCellWidth / 2;
    const pieceOriginY = pieceRect.top + dragCellHeight / 2;

    // Calculate how many strides away the piece's origin is from the board's origin
    const cFloat = (pieceOriginX - boardOriginX) / cellStrideX;
    const rFloat = (pieceOriginY - boardOriginY) / cellStrideY;

    // Rounding matches snapping to the nearest cell center accurately
    const c = Math.round(cFloat);
    const r = Math.round(rFloat);

    return { r, c };
  };

  const clearHover = () => {
    hoverRef.current.forEach(el => {
      el.classList.remove('hover-preview');
    });
    hoverRef.current = [];
  };

  const updateHover = () => {
     clearHover();
     
     const placement = calculatePlacement();
     if (!placement) return null;
     const { r, c } = placement;
     
     let valid = true;
     const targetCells: HTMLElement[] = [];

     for (let pr = 0; pr < piece.grid.length; pr++) {
       for (let pc = 0; pc < piece.grid[pr].length; pc++) {
         if (piece.grid[pr][pc] > 0) {
           const tr = r + pr;
           const tc = c + pc;
           
           if (tr < 0 || tr >= 8 || tc < 0 || tc >= 8) {
             valid = false;
             break;
           }
           const cell = document.querySelector(`[data-row="${tr}"][data-col="${tc}"]`) as HTMLElement;
           if (!cell || cell.getAttribute('data-filled') === 'true') {
             valid = false;
             break;
           }
           targetCells.push(cell);
         }
       }
       if (!valid) break;
     }

     if (valid) {
       targetCells.forEach(cell => {
         cell.style.setProperty('--preview-color', `var(--block-${piece.type})`);
         cell.classList.add('hover-preview');
         hoverRef.current.push(cell);
       });
       return { r, c };
     }
     return null;
  };

  return (
    <div 
      style={{
        position: 'relative',
        width: naturalWidth * rackScale,
        height: naturalHeight * rackScale,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <motion.div
        drag
        dragMomentum={false}
        dragElastic={0}
        animate={controls}
        onDragStart={() => {
          setIsDragging(true);
          soundEngine.playPickUp();
          const boardEl = document.getElementById('grid-board');
          if (boardEl) {
             const pureCellWidth = (boardEl.getBoundingClientRect().width - 14) / 8;
             setActiveCellSize(pureCellWidth);
          }
        }}
        onDrag={() => {
          updateHover();
        }}
        onDragEnd={() => {
          setIsDragging(false);
          const validPlacement = updateHover();
          clearHover();

          let placed = false;
          
          if (validPlacement) {
             const { r, c } = validPlacement;
             
             let anchorX = window.innerWidth / 2;
             let anchorY = window.innerHeight / 2;
             const targetCell = document.querySelector(`#grid-board [data-row="${r}"][data-col="${c}"]`);
             if (targetCell) {
                const rect = targetCell.getBoundingClientRect();
                anchorX = rect.left + rect.width / 2;
                anchorY = rect.top + rect.height / 2;
             }

             placed = onAttemptPlace(pieceIndex, r, c, anchorX, anchorY);
          }

          if (!placed) {
            soundEngine.playError();
            controls.start({ x: 0, y: 0 });
          }
        }}
        style={{
          zIndex: isDragging ? 100 : 1,
          touchAction: 'none',
          userSelect: 'none'
        }}
      >
        <motion.div
          ref={pieceRef}
          animate={{
             scale: isDragging ? activeCellSize / blockSize : rackScale,
             y: isDragging ? -130 : 0
          }}
          transition={{ type: 'spring', stiffness: 600, damping: 35 }}
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${cols}, 1fr)`,
            gridTemplateRows: `repeat(${rows}, 1fr)`,
            gap: '2px',
            cursor: isDragging ? 'grabbing' : 'grab',
          }}
          whileTap={{ cursor: 'grabbing', scale: activeCellSize / blockSize * 0.95 }}
        >
          {piece.grid.map((row, r) => 
            row.map((cellValue, c) => (
              <div
                key={`${r}-${c}`}
                style={{
                  width: blockSize,
                  height: blockSize,
                  background: cellValue > 0 ? `var(--block-${piece.type})` : 'transparent',
                  borderRadius: '4px',
                  boxShadow: cellValue > 0 ? `inset 2px 2px 4px rgba(255,255,255,0.2), inset -2px -2px 4px var(--block-shadow)` : 'none',
                }}
              />
            ))
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}
