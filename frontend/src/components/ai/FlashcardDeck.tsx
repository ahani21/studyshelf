'use client'

import { useState } from 'react';
import { ChevronLeft, ChevronRight, RotateCcw, Eye } from 'lucide-react';

interface Flashcard {
  front: string;
  back: string;
}

export default function FlashcardDeck({ flashcards }: { flashcards: Flashcard[] }) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  if (!flashcards.length) return null;

  const card = flashcards[index];

  const next = () => { setIndex((i) => (i + 1) % flashcards.length); setFlipped(false); };
  const prev = () => { setIndex((i) => (i - 1 + flashcards.length) % flashcards.length); setFlipped(false); };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-label text-text-tertiary">FLASHCARDS ({flashcards.length})</h3>
        <span className="text-micro text-text-tertiary">{index + 1} / {flashcards.length}</span>
      </div>

      {/* Card */}
      <div
        onClick={() => setFlipped(!flipped)}
        className="relative cursor-pointer h-52 rounded-xl border border-border-default bg-surface-inset flex items-center justify-center p-8 text-center transition-all duration-300 hover:border-accent-glow/50 hover:shadow-[0_0_20px_rgba(99,102,241,0.1)] select-none group"
        style={{ perspective: '1000px' }}
      >
        <div className={`transition-all duration-300 ${flipped ? 'opacity-0 scale-95' : 'opacity-100 scale-100'} absolute inset-0 flex items-center justify-center p-8`}>
          <div>
            <p className="text-micro text-text-tertiary mb-2 uppercase tracking-wider">Question</p>
            <p className="text-body-lg text-text-primary font-medium">{card.front}</p>
          </div>
        </div>
        <div className={`transition-all duration-300 ${flipped ? 'opacity-100 scale-100' : 'opacity-0 scale-95'} absolute inset-0 flex items-center justify-center p-8 bg-accent-glow/5 rounded-xl`}>
          <div>
            <p className="text-micro text-success-fg mb-2 uppercase tracking-wider">Answer</p>
            <p className="text-body-lg text-text-primary">{card.back}</p>
          </div>
        </div>

        {/* Flip hint */}
        {!flipped && (
          <div className="absolute bottom-3 right-3 flex items-center gap-1 text-text-tertiary opacity-0 group-hover:opacity-100 transition-opacity">
            <Eye className="w-3 h-3" />
            <span className="text-micro">Click to reveal</span>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <button onClick={prev} className="flex items-center gap-1.5 px-3 py-2 rounded-md text-text-secondary hover:text-text-primary hover:bg-surface-raised transition-colors text-body-sm">
          <ChevronLeft className="w-4 h-4" /> Prev
        </button>
        <button onClick={() => setFlipped(false)} className="flex items-center gap-1 text-text-tertiary hover:text-text-primary transition-colors">
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="text-micro">Reset</span>
        </button>
        <button onClick={next} className="flex items-center gap-1.5 px-3 py-2 rounded-md text-text-secondary hover:text-text-primary hover:bg-surface-raised transition-colors text-body-sm">
          Next <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
