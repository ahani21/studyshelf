'use client'

import { useState } from 'react';
import { CheckCircle2, XCircle, ChevronRight } from 'lucide-react';

interface MCQ {
  question: string;
  options: string[];
  answer: string;
}

export default function MCQQuiz({ mcqs }: { mcqs: MCQ[] }) {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  if (!mcqs.length) return null;

  const mcq = mcqs[index];
  const isCorrect = selected === mcq.answer;

  const handleNext = () => {
    if (index + 1 >= mcqs.length) {
      setDone(true);
    } else {
      setIndex(i => i + 1);
      setSelected(null);
    }
  };

  const handleSelect = (opt: string) => {
    if (selected) return;
    setSelected(opt);
    if (opt === mcq.answer) setScore(s => s + 1);
  };

  if (done) {
    const pct = Math.round((score / mcqs.length) * 100);
    return (
      <div className="text-center py-8 space-y-4">
        <div className={`text-display-xl font-display ${pct >= 80 ? 'text-success-fg' : pct >= 50 ? 'text-warning-fg' : 'text-danger-fg'}`}>
          {pct}%
        </div>
        <p className="text-body text-text-secondary">You got {score} out of {mcqs.length} correct</p>
        <button
          onClick={() => { setIndex(0); setSelected(null); setScore(0); setDone(false); }}
          className="px-4 py-2 bg-accent-glow text-white rounded-md text-body-sm hover:bg-accent-highlight transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="text-label text-text-tertiary">QUIZ ({mcqs.length} QUESTIONS)</h3>
        <span className="text-micro text-text-tertiary">{index + 1} / {mcqs.length}</span>
      </div>

      <p className="text-body-lg text-text-primary font-medium leading-relaxed">{mcq.question}</p>

      <div className="space-y-2.5">
        {mcq.options.map((opt) => {
          let style = 'border-border-default text-text-secondary hover:border-accent-glow/50 hover:text-text-primary';
          if (selected) {
            if (opt === mcq.answer) style = 'border-success-border bg-success-bg text-success-fg';
            else if (opt === selected) style = 'border-danger-border bg-danger-bg text-danger-fg';
            else style = 'border-border-subtle text-text-tertiary opacity-60';
          }
          return (
            <button
              key={opt}
              onClick={() => handleSelect(opt)}
              disabled={!!selected}
              className={`w-full text-left px-4 py-3 rounded-lg border transition-all duration-150 text-body-sm ${style} disabled:cursor-default`}
            >
              <span className="flex items-center justify-between gap-2">
                {opt}
                {selected && opt === mcq.answer && <CheckCircle2 className="w-4 h-4 shrink-0" />}
                {selected && opt === selected && opt !== mcq.answer && <XCircle className="w-4 h-4 shrink-0" />}
              </span>
            </button>
          );
        })}
      </div>

      {selected && (
        <button
          onClick={handleNext}
          className="flex items-center gap-1.5 ml-auto px-4 py-2 bg-accent-glow text-white rounded-md text-body-sm hover:bg-accent-highlight transition-colors"
        >
          {index + 1 >= mcqs.length ? 'See Results' : 'Next Question'}
          <ChevronRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
