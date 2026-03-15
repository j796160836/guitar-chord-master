/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Music, Info, ChevronRight, Check, RotateCcw, HelpCircle, Languages } from 'lucide-react';
import { Note, Difficulty, ChordInfo, Language } from './types';
import { NOTES, COMMON_CHORDS, CHORD_FORMULAS, TRANSLATIONS, CHORD_SHAPES } from './constants';
import { identifyChord, getSuggestedNextChords, getChordNotes } from './chordUtils';
import { ChordDiagram } from './components/ChordDiagram';

export default function App() {
  const [selectedNotes, setSelectedNotes] = useState<Note[]>([]);
  const [bassNote, setBassNote] = useState<Note | null>(null);
  const [activeChord, setActiveChord] = useState<string | null>(null);
  const [lang, setLang] = useState<Language>('zh-TW');

  const t = TRANSLATIONS[lang];

  const toggleNote = (note: Note) => {
    if (selectedNotes.includes(note)) {
      if (bassNote === note) {
        setBassNote(null);
        setSelectedNotes(prev => prev.filter(n => n !== note));
      } else {
        setBassNote(note);
      }
    } else {
      setSelectedNotes(prev => [...prev, note]);
    }
  };

  const identifiedChords = useMemo(() => identifyChord(selectedNotes, bassNote || undefined), [selectedNotes, bassNote]);

  const activeChordInfo = useMemo(() => {
    if (!activeChord) return null;
    return identifiedChords.find(c => c.name === activeChord) || 
           (() => {
             const [basePart, slashPart] = activeChord.split('/');
             const rootMatch = basePart.match(/^[A-G][#b]?/);
             const root = rootMatch ? rootMatch[0] as Note : '' as Note;
             const suffix = basePart.replace(root, '');
             const formula = CHORD_FORMULAS.find(f => f.suffix === suffix);
             const shape = CHORD_SHAPES[activeChord] || CHORD_SHAPES[basePart];
             if (root && (formula || suffix === '')) {
               return {
                 name: activeChord,
                 root,
                 bassNote: slashPart as Note,
                 suffix,
                 notes: formula ? getChordNotes(root, formula) : [root],
                 difficulty: COMMON_CHORDS.find(c => c.name === basePart)?.difficulty || Difficulty.Intermediate,
                 positions: shape?.positions,
                 baseFret: shape?.baseFret
               } as ChordInfo;
             }
             return null;
           })();
  }, [activeChord, identifiedChords]);

  const suggestions = useMemo(() => {
    if (activeChord) return getSuggestedNextChords(activeChord.split('/')[0]);
    if (identifiedChords.length > 0) return getSuggestedNextChords(identifiedChords[0].name.split('/')[0]);
    return [];
  }, [activeChord, identifiedChords]);

  const chordsByDifficulty = useMemo(() => {
    const groups = {
      [Difficulty.Beginner]: COMMON_CHORDS.filter(c => c.difficulty === Difficulty.Beginner),
      [Difficulty.Intermediate]: COMMON_CHORDS.filter(c => c.difficulty === Difficulty.Intermediate),
      [Difficulty.Advanced]: COMMON_CHORDS.filter(c => c.difficulty === Difficulty.Advanced),
      [Difficulty.JazzBlues]: COMMON_CHORDS.filter(c => c.difficulty === Difficulty.JazzBlues),
    };
    return groups;
  }, []);

  const reset = () => {
    setSelectedNotes([]);
    setBassNote(null);
    setActiveChord(null);
  };

  const handleChordSelect = (chordName: string) => {
    setActiveChord(chordName);
    const [basePart, slashPart] = chordName.split('/');
    const rootMatch = basePart.match(/^[A-G][#b]?/);
    const root = rootMatch ? rootMatch[0] as Note : '' as Note;
    const suffix = basePart.replace(root, '');
    const formula = CHORD_FORMULAS.find(f => f.suffix === suffix);
    if (root && (formula || suffix === '')) {
      setSelectedNotes(formula ? getChordNotes(root, formula) : [root]);
      setBassNote(slashPart ? (slashPart as Note) : null);
    }
  };

  return (
    <div className="min-h-screen bg-[#E4E3E0] text-[#141414] font-sans selection:bg-[#141414] selection:text-[#E4E3E0]">
      {/* Header */}
      <header className="border-b border-[#141414] p-6 flex justify-between items-center bg-white/50 backdrop-blur-sm sticky top-0 z-50">
        <div>
          <h1 className="text-3xl md:text-4xl font-serif italic tracking-tight">{t.title}</h1>
          <p className="text-[10px] uppercase tracking-widest opacity-50 mt-1 font-mono">{t.subtitle}</p>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setLang(lang === 'en' ? 'zh-TW' : 'en')}
            className="flex items-center gap-2 px-3 py-1.5 border border-[#141414] hover:bg-[#141414] hover:text-[#E4E3E0] transition-colors rounded-full text-xs font-mono"
          >
            <Languages size={14} />
            {lang === 'en' ? '繁體中文' : 'ENGLISH'}
          </button>
          <button 
            onClick={reset}
            className="flex items-center gap-2 px-4 py-2 border border-[#141414] hover:bg-[#141414] hover:text-[#E4E3E0] transition-colors rounded-full text-sm font-medium"
          >
            <RotateCcw size={16} />
            {t.reset}
          </button>
        </div>
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-12 lg:h-[calc(100vh-100px)] lg:overflow-hidden">
        
        {/* Left Panel: Note Selection */}
        <section className="lg:col-span-4 border-r border-[#141414] p-8 bg-[#DCDAD6] lg:overflow-y-auto custom-scrollbar">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <Music size={20} />
              <h2 className="font-serif italic text-xl">{t.noteComposition}</h2>
            </div>
            <span className="text-[10px] font-mono opacity-40 italic">{t.bassHint}</span>
          </div>
          
          <div className="grid grid-cols-3 gap-3">
            {NOTES.map((note) => (
              <button
                key={note}
                onClick={() => toggleNote(note)}
                className={`
                  h-16 flex flex-col items-center justify-center border border-[#141414] transition-all relative
                  ${selectedNotes.includes(note) 
                    ? (bassNote === note ? 'bg-[#F27D26] text-white' : 'bg-[#141414] text-[#E4E3E0]') 
                    : 'bg-white hover:bg-[#F0EFEA]'}
                  ${selectedNotes.includes(note) ? 'scale-95' : ''}
                `}
              >
                <span className="text-lg font-mono font-bold">{note}</span>
                {selectedNotes.includes(note) && (
                  <div className="flex gap-1 mt-1">
                    {bassNote === note ? (
                      <span className="text-[8px] font-mono uppercase font-bold px-1 bg-white text-[#F27D26] rounded">BASS</span>
                    ) : (
                      <Check size={12} />
                    )}
                  </div>
                )}
              </button>
            ))}
          </div>

          <div className="mt-12 p-6 border border-[#141414] bg-white shadow-[4px_4px_0px_0px_rgba(20,20,20,1)]">
            <h3 className="text-xs uppercase tracking-widest opacity-50 mb-4 font-mono">{t.identifiedChords}</h3>
            <div className="space-y-2">
              {identifiedChords.length > 0 ? (
                identifiedChords.map(chord => (
                  <button
                    key={chord.name}
                    onClick={() => setActiveChord(chord.name)}
                    className={`w-full text-left p-3 border border-[#141414] flex justify-between items-center transition-colors ${activeChord === chord.name ? 'bg-[#141414] text-[#E4E3E0]' : 'hover:bg-[#F0EFEA]'}`}
                  >
                    <span className="font-bold text-xl">{chord.name}</span>
                    <span className="text-[10px] uppercase font-mono opacity-60">{t.difficulty[chord.difficulty]}</span>
                  </button>
                ))
              ) : (
                <div className="py-8 text-center opacity-40 italic font-serif">
                  {t.selectNotes}
                </div>
              )}
            </div>
          </div>

          {/* Chord Diagram for identified or active chord */}
          <AnimatePresence mode="wait">
            {activeChordInfo?.positions && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="mt-8"
              >
                <div className="flex items-center gap-2 mb-4">
                  <Info size={16} />
                  <h3 className="text-xs uppercase tracking-widest opacity-50 font-mono">{t.chordDiagram}</h3>
                </div>
                <ChordDiagram 
                  positions={activeChordInfo.positions} 
                  baseFret={activeChordInfo.baseFret} 
                  name={activeChordInfo.name} 
                />
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* Right Panel: Chord Library & Progressions */}
        <section className="lg:col-span-8 flex flex-col lg:overflow-hidden">
          
          {/* Top Right: Chord Library */}
          <div className="flex-1 p-8 border-b border-[#141414] overflow-y-auto custom-scrollbar">
            <div className="flex items-center gap-2 mb-8">
              <Info size={20} />
              <h2 className="font-serif italic text-xl">{t.chordLibrary}</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
              {(Object.entries(chordsByDifficulty) as [Difficulty, typeof COMMON_CHORDS][]).map(([difficulty, chords]) => (
                <div key={difficulty} className="space-y-4">
                  <h3 className={`text-xs font-mono uppercase tracking-widest pb-2 border-b border-[#141414]/20 ${
                    difficulty === Difficulty.Beginner ? 'text-emerald-700' :
                    difficulty === Difficulty.Intermediate ? 'text-amber-700' : 
                    difficulty === Difficulty.Advanced ? 'text-rose-700' : 'text-indigo-700'
                  }`}>
                    {t.difficulty[difficulty]}
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {chords.map(chord => (
                      <button
                        key={chord.name}
                        onClick={() => handleChordSelect(chord.name)}
                        className={`p-2 text-center border border-[#141414] text-sm font-bold transition-all hover:translate-y-[-2px] hover:shadow-[2px_2px_0px_0px_rgba(20,20,20,1)] ${activeChord === chord.name ? 'bg-[#141414] text-[#E4E3E0]' : 'bg-white'}`}
                      >
                        {chord.name}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Right: Progressions */}
          <div className="p-8 bg-[#EBEAE6]">
            <div className="flex items-center gap-2 mb-6">
              <ChevronRight size={20} />
              <h2 className="font-serif italic text-xl">{t.suggestedProgressions}</h2>
            </div>

            {activeChord ? (
              <div>
                <p className="text-sm mb-4 font-serif italic opacity-70">
                  {t.flowFrom} <span className="font-bold underline">{activeChord}</span>:
                </p>
                <div className="flex flex-wrap gap-4">
                  {suggestions.map(chord => (
                    <motion.button
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      key={chord}
                      onClick={() => handleChordSelect(chord)}
                      className="group relative px-6 py-4 bg-white border border-[#141414] shadow-[4px_4px_0px_0px_rgba(20,20,20,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
                    >
                      <span className="text-2xl font-bold">{chord}</span>
                      <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="bg-[#141414] text-white p-1 rounded-full">
                          <Check size={10} />
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-[#141414]/20 rounded-lg">
                <HelpCircle size={32} className="opacity-20 mb-2" />
                <p className="text-sm font-serif italic opacity-40">{t.selectChordHint}</p>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Footer / Status Bar */}
      <footer className="border-t border-[#141414] p-4 bg-[#141414] text-[#E4E3E0] flex justify-between items-center text-[10px] font-mono tracking-widest uppercase">
        <div>{t.status}: {activeChord ? `${t.analyzing} ${activeChord}` : t.ready}</div>
        <div className="flex gap-4">
          <span>{t.notes}: {selectedNotes.join(', ') || t.none}</span>
          <span className="opacity-50">v1.1.0</span>
        </div>
      </footer>
    </div>
  );
}
