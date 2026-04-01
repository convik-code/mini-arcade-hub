import { memo } from 'react';
import { GRID_SIZE } from './useBlockBlast';

interface GridBoardProps {
  grid: number[][];
  onCellClick?: (r: number, c: number) => void;
  isTargeting?: boolean;
}

export const GridBoard = memo(function GridBoard({ grid, onCellClick, isTargeting }: GridBoardProps) {
  return (
    <div 
      id="grid-board"
      style={{
        width: '100%',
        aspectRatio: '1 / 1',
        background: 'rgba(0,0,0,0.2)', 
        borderRadius: '12px',
        border: isTargeting ? '4px solid var(--accent-danger)' : '4px solid var(--bg-card)',
        display: 'grid',
        gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
        gridTemplateRows: `repeat(${GRID_SIZE}, 1fr)`,
        gap: '2px', 
        padding: '2px',
        boxShadow: isTargeting ? '0 0 20px rgba(239, 68, 68, 0.4)' : 'inset 0 0 20px rgba(0,0,0,0.5)',
        cursor: isTargeting ? 'crosshair' : 'default',
        transition: 'all 0.3s ease',
        touchAction: 'none' // Prevent scroll while touching board
      }}
    >
      {grid.map((row, r) => 
        row.map((cellValue, c) => (
          <div
            key={`${r}-${c}`}
            className="grid-cell"
            data-row={r}
            data-col={c}
            data-filled={cellValue > 0 ? 'true' : 'false'}
            onClick={() => {
               if (isTargeting && onCellClick) onCellClick(r, c);
            }}
            style={{
              background: cellValue === 0 ? 'rgba(255,255,255,0.05)' : `var(--block-${cellValue})`,
              borderRadius: '5px',
              boxShadow: cellValue > 0 ? `inset 2px 2px 4px rgba(255,255,255,0.2), inset -2px -2px 4px var(--block-shadow)` : 'none',
              transition: 'background-color 0.2s, transform 0.1s, filter 0.1s',
              zIndex: 1
            }}
          />
        ))
      )}
    </div>
  );
});
