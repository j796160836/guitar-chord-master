import React from 'react';
import { FretboardPosition } from '../types';

interface ChordDiagramProps {
  positions: FretboardPosition[];
  baseFret?: number;
  name: string;
}

export const ChordDiagram: React.FC<ChordDiagramProps> = ({ positions, baseFret = 1, name }) => {
  const strings = [1, 2, 3, 4, 5, 6];
  const frets = [0, 1, 2, 3, 4]; // Relative frets to display
  
  const width = 120;
  const height = 150;
  const margin = { top: 20, right: 10, bottom: 10, left: 10 };
  
  const stringSpacing = (width - margin.left - margin.right) / 5;
  const fretSpacing = (height - margin.top - margin.bottom) / 4;

  return (
    <div className="flex flex-col items-center p-4 bg-white border border-[#141414] shadow-[4px_4px_0px_0px_rgba(20,20,20,1)]">
      <span className="font-bold text-lg mb-2 font-mono">{name}</span>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        {/* Nut or Base Fret label */}
        {baseFret > 1 ? (
          <text x={0} y={margin.top + 10} fontSize="10" className="font-mono">{baseFret}fr</text>
        ) : (
          <line x1={margin.left} y1={margin.top} x2={width - margin.right} y2={margin.top} stroke="#141414" strokeWidth="4" />
        )}

        {/* Frets */}
        {frets.map(f => (
          <line 
            key={f} 
            x1={margin.left} 
            y1={margin.top + f * fretSpacing} 
            x2={width - margin.right} 
            y2={margin.top + f * fretSpacing} 
            stroke="#141414" 
            strokeWidth="1" 
          />
        ))}

        {/* Strings */}
        {strings.map((s, i) => (
          <line 
            key={s} 
            x1={margin.left + i * stringSpacing} 
            y1={margin.top} 
            x2={margin.left + i * stringSpacing} 
            y2={height - margin.bottom} 
            stroke="#141414" 
            strokeWidth="1" 
          />
        ))}

        {/* Dots */}
        {positions.map((pos, idx) => {
          if (pos.fret === 'x') {
            return (
              <text 
                key={idx} 
                x={margin.left + (6 - pos.string) * stringSpacing - 4} 
                y={margin.top - 5} 
                fontSize="12" 
                className="font-bold"
              >
                ×
              </text>
            );
          }
          if (pos.fret === 0) {
            return (
              <circle 
                key={idx} 
                cx={margin.left + (6 - pos.string) * stringSpacing} 
                cy={margin.top - 8} 
                r="4" 
                fill="none" 
                stroke="#141414" 
                strokeWidth="1" 
              />
            );
          }
          
          // Relative fret position
          const relativeFret = (pos.fret as number) - (baseFret === 1 ? 0 : baseFret - 1);
          if (relativeFret < 1 || relativeFret > 4) return null;

          return (
            <g key={idx}>
              <circle 
                cx={margin.left + (6 - pos.string) * stringSpacing} 
                cy={margin.top + (relativeFret - 0.5) * fretSpacing} 
                r="6" 
                fill="#141414" 
              />
              {pos.finger && (
                <text 
                  x={margin.left + (6 - pos.string) * stringSpacing - 3} 
                  y={margin.top + (relativeFret - 0.5) * fretSpacing + 4} 
                  fontSize="10" 
                  fill="white"
                >
                  {pos.finger}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
};
