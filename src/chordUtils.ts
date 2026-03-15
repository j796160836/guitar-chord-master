
import { Note, ChordFormula, ChordInfo, Difficulty } from './types';
import { NOTES, CHORD_FORMULAS, COMMON_CHORDS, CHORD_SHAPES } from './constants';

const NOTE_TO_INDEX: Record<string, number> = {
  'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3, 'E': 4, 'F': 5, 'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8, 'Ab': 8, 'A': 9, 'A#': 10, 'Bb': 10, 'B': 11
};

export function getNoteIndex(note: Note): number {
  return NOTE_TO_INDEX[note];
}

export function getNoteFromIndex(index: number): Note {
  return NOTES[(index % 12 + 12) % 12];
}

export function getChordNotes(root: Note, formula: ChordFormula): Note[] {
  const rootIdx = getNoteIndex(root);
  return formula.intervals.map(interval => getNoteFromIndex(rootIdx + interval));
}

export function identifyChord(selectedNotes: Note[], bassNote?: Note): ChordInfo[] {
  if (selectedNotes.length === 0) return [];

  const results: ChordInfo[] = [];
  const sortedSelected = [...new Set(selectedNotes)].sort();

  for (const root of NOTES) {
    for (const formula of CHORD_FORMULAS) {
      const chordNotes = getChordNotes(root, formula);
      const sortedChord = [...new Set(chordNotes)].sort();

      // Check if all selected notes are in the chord and vice versa
      if (sortedSelected.length === sortedChord.length && 
          sortedSelected.every((n, i) => n === sortedChord[i])) {
        
        let chordName = root + formula.suffix;
        let finalBass = bassNote;

        // If a bass note is specified and it's in the chord but not the root
        if (finalBass && finalBass !== root && sortedChord.includes(finalBass)) {
          chordName += '/' + finalBass;
        } else {
          finalBass = undefined;
        }

        // Find difficulty from COMMON_CHORDS or default to Intermediate
        const baseChordName = root + formula.suffix;
        const common = COMMON_CHORDS.find(c => c.name === baseChordName);
        const shape = CHORD_SHAPES[chordName] || CHORD_SHAPES[baseChordName];
        
        results.push({
          name: chordName,
          root,
          bassNote: finalBass,
          suffix: formula.suffix,
          notes: chordNotes,
          difficulty: common ? common.difficulty : Difficulty.Intermediate,
          positions: shape?.positions,
          baseFret: shape?.baseFret
        });
      }
    }
  }

  return results;
}

export function getSuggestedNextChords(currentChordName: string): string[] {
  // Simple circle of fifths and common progression logic
  // This is a simplified heuristic
  const progressions: Record<string, string[]> = {
    'C': ['G', 'F', 'Am', 'Dm', 'Em', 'G7'],
    'G': ['D', 'C', 'Em', 'Am', 'Bm', 'D7'],
    'D': ['A', 'G', 'Bm', 'Em', 'F#m', 'A7'],
    'A': ['E', 'D', 'F#m', 'Bm', 'C#m', 'E7'],
    'E': ['B', 'A', 'C#m', 'F#m', 'G#m', 'B7'],
    'F': ['C', 'Bb', 'Dm', 'Gm', 'Am', 'C7'],
    'Am': ['Dm', 'Em', 'F', 'G', 'C', 'E7'],
    'Em': ['Am', 'Bm', 'C', 'D', 'G', 'B7'],
    'Dm': ['Gm', 'Am', 'Bb', 'C', 'F', 'A7'],
  };

  // If exact match not found, try to find by root major/minor
  if (progressions[currentChordName]) return progressions[currentChordName];
  
  // Fallback: suggest chords in the same "key" if we can guess it
  // For now, return a generic set or empty
  return ['G', 'C', 'D', 'Am', 'Em', 'F']; 
}
