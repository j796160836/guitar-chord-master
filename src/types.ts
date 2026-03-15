
export type Note = 'C' | 'C#' | 'Db' | 'D' | 'D#' | 'Eb' | 'E' | 'F' | 'F#' | 'Gb' | 'G' | 'G#' | 'Ab' | 'A' | 'A#' | 'Bb' | 'B';

export enum Difficulty {
  Beginner = 'Beginner',
  Intermediate = 'Intermediate',
  Advanced = 'Advanced',
  JazzBlues = 'JazzBlues'
}

export interface FretboardPosition {
  string: number; // 1-6 (E high to E low)
  fret: number | 'x'; // 0 for open, 'x' for muted
  finger?: number; // 1-4
}

export interface ChordInfo {
  name: string;
  root: Note;
  bassNote?: Note;
  suffix: string;
  notes: Note[];
  difficulty: Difficulty;
  description?: string;
  positions?: FretboardPosition[];
  baseFret?: number;
}

export interface ChordFormula {
  suffix: string;
  intervals: number[]; // semitones from root
  fullName: string;
}

export type Language = 'en' | 'zh-TW';
