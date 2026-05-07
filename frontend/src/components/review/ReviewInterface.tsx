'use client'

import { useState, useEffect, useCallback } from 'react';
import { ExternalLink, BrainCircuit, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import { rateItem, skipItem, archiveItem, deleteReviewResource, deleteReviewFlashcard } from '@/server/actions/review';

export default function ReviewInterface({ initialQueue }: { initialQueue: any[] }) {
  const [queue, setQueue] = useState(initialQueue);
  const [loading, setLoading] = useState(false);
  const [showArchivalModal, setShowArchivalModal] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);

  if (queue.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center max-w-md mx-auto">
        <div className="w-16 h-16 rounded-full bg-success-bg flex items-center justify-center mb-6 border border-success-border">
          <BrainCircuit className="w-8 h-8 text-success-fg" />
        </div>
        <h1 className="text-display-sm font-display text-text-primary mb-4">You're all caught up!</h1>
        <p className="text-body-lg text-text-secondary mb-8">
          You have completed all your reviews for today. Great job keeping your shelf healthy.
        </p>
      </div>
    );
  }

  const currentItem = queue[0];
  const isFlashcard = currentItem.type === 'flashcard';

  const handleRate = useCallback(async (rating: 'again' | 'hard' | 'good' | 'easy') => {
    setLoading(true);
    try {
      await rateItem(currentItem.srsId, rating);
      setQueue(q => q.slice(1));
      setIsFlipped(false);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [currentItem]);

  const handleSkip = useCallback(async () => {
    setLoading(true);
    try {
      const { skipCount } = await skipItem(currentItem.srsId);
      if (skipCount >= 3) {
        setShowArchivalModal(true);
      } else {
        setQueue(q => q.slice(1));
        setIsFlipped(false);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [currentItem]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;
      if (queue.length === 0 || showArchivalModal || loading) return;

      switch(e.key) {
        case ' ':
          e.preventDefault();
          if (isFlashcard) setIsFlipped(prev => !prev);
          break;
        case '1':
          if (isFlipped || !isFlashcard) handleRate('again');
          break;
        case '2':
          if (isFlipped || !isFlashcard) handleRate('hard');
          break;
        case '3':
          if (isFlipped || !isFlashcard) handleRate('good');
          break;
        case '4':
          if (isFlipped || !isFlashcard) handleRate('easy');
          break;
        case 's':
          handleSkip();
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [queue.length, showArchivalModal, loading, isFlipped, isFlashcard, handleRate, handleSkip]);


  const handleArchive = async () => {
    setLoading(true);
    try {
      await archiveItem(currentItem.srsId);
      setShowArchivalModal(false);
      setQueue(q => q.slice(1));
      setIsFlipped(false);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      if (isFlashcard) {
        await deleteReviewFlashcard(currentItem.flashcard.id);
      } else {
        await deleteReviewResource(currentItem.resource.id);
      }
      setShowArchivalModal(false);
      setQueue(q => q.slice(1));
      setIsFlipped(false);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleKeep = () => {
    setShowArchivalModal(false);
    setQueue(q => q.slice(1));
    setIsFlipped(false);
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col min-h-[70vh] relative">
      <div className="flex justify-between items-center mb-6">
        <span className="text-label text-text-tertiary flex items-center gap-2">
          {isFlashcard ? <Sparkles className="w-3 h-3 text-accent-glow" /> : <ExternalLink className="w-3 h-3" />}
          {queue.length} REMAINING
        </span>
        <div className="flex gap-6 items-center">
          <button onClick={handleDelete} disabled={loading} className="text-body-sm text-danger-fg hover:text-danger-fg/80 transition-colors disabled:opacity-50">
            {loading ? <Loader2 className="w-4 h-4 animate-spin inline" /> : 'Delete item'}
          </button>
          <button onClick={handleSkip} disabled={loading} className="text-body-sm text-text-secondary hover:text-text-primary transition-colors disabled:opacity-50 flex items-center gap-2">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Skip for now <ArrowRight className="w-4 h-4" /></>}
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col relative z-10">
        {/* Ambient review glow */}
        <div className="absolute inset-0 bg-review-glow opacity-30 rounded-[100%] blur-[120px] -z-10" />
        
        {isFlashcard ? (
          <div 
            className="group perspective-1000 mb-8 cursor-pointer h-[400px] md:h-[450px] w-full relative"
            onClick={() => setIsFlipped(!isFlipped)}
          >
            <div className={`relative w-full h-full transition-all duration-500 preserve-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
              {/* Front */}
              <div className="absolute inset-0 backface-hidden card bg-surface border border-border-default rounded-2xl shadow-[var(--shadow-raised)] p-8 flex flex-col items-center justify-between text-center overflow-hidden">
                <span className="text-micro font-semibold uppercase tracking-widest text-text-tertiary shrink-0">Question</span>
                <div className="flex-1 flex items-center justify-center w-full my-6 overflow-y-auto custom-scrollbar">
                  <h2 className="text-display-sm font-display text-text-primary leading-tight">
                    {currentItem.flashcard.front}
                  </h2>
                </div>
                <p className="text-body-sm text-text-tertiary shrink-0">Click card to reveal answer</p>
              </div>
              
              {/* Back */}
              <div className="absolute inset-0 backface-hidden rotate-y-180 card bg-surface-raised border border-accent-glow/30 rounded-2xl shadow-[var(--shadow-raised)] p-8 flex flex-col items-center justify-between text-center overflow-hidden">
                <span className="text-micro font-semibold uppercase tracking-widest text-accent-glow shrink-0">Answer</span>
                <div className="flex-1 flex flex-col items-center justify-center w-full my-6 overflow-y-auto custom-scrollbar">
                  <h2 className="text-display-sm font-display text-text-primary leading-tight">
                    {currentItem.flashcard.back}
                  </h2>
                  {currentItem.flashcard.explanation && (
                    <div className="mt-6 p-4 bg-surface-inset rounded-xl text-body-sm text-text-secondary border border-border-subtle w-full text-left relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1 h-full bg-accent-glow/50" />
                      <span className="font-semibold text-text-primary mb-1 block uppercase tracking-wider text-[10px]">Explanation</span>
                      {currentItem.flashcard.explanation}
                    </div>
                  )}
                </div>
                <p className="text-body-sm text-text-tertiary shrink-0">Space to flip • 1-4 to rate</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="card bg-surface border border-border-default rounded-2xl shadow-[var(--shadow-raised)] p-8 md:p-12 mb-8 flex-1 flex flex-col">
            {currentItem.resource.imageUrl && (
              <img src={currentItem.resource.imageUrl} alt="" className="w-full h-48 md:h-64 object-cover rounded-xl mb-8 border border-border-subtle" />
            )}
            <h2 className="text-display-md font-display text-text-primary mb-4">{currentItem.resource.title}</h2>
            <p className="text-body-lg text-text-secondary mb-8 flex-1">{currentItem.resource.description}</p>
            
            <a 
              href={currentItem.resource.canonicalUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="btn-primary w-max self-start flex items-center gap-2"
            >
              Read Source Article <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        )}

        {/* Rating Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button onClick={() => handleRate('again')} disabled={loading} className="px-4 py-4 rounded-xl bg-surface-inset border border-border-default text-text-primary hover:border-danger-border hover:bg-danger-bg hover:text-danger-fg transition-all text-body font-medium flex flex-col items-center gap-1 disabled:opacity-50 group">
            <span>Again</span>
            <span className="text-micro text-text-tertiary group-hover:text-danger-fg/70">&lt; 1d</span>
          </button>
          <button onClick={() => handleRate('hard')} disabled={loading} className="px-4 py-4 rounded-xl bg-surface-inset border border-border-default text-text-primary hover:border-warning-border hover:bg-warning-bg hover:text-warning-fg transition-all text-body font-medium flex flex-col items-center gap-1 disabled:opacity-50 group">
            <span>Hard</span>
            <span className="text-micro text-text-tertiary group-hover:text-warning-fg/70">~{Math.min(365, Math.max(1, Math.round(currentItem.interval * 1.2)))}d</span>
          </button>
          <button onClick={() => handleRate('good')} disabled={loading} className="px-4 py-4 rounded-xl bg-surface-inset border border-border-default text-text-primary hover:border-success-border hover:bg-success-bg hover:text-success-fg transition-all text-body font-medium flex flex-col items-center gap-1 disabled:opacity-50 group">
            <span>Good</span>
            <span className="text-micro text-text-tertiary group-hover:text-success-fg/70">~{Math.min(365, Math.max(1, Math.round(currentItem.interval * currentItem.easeFactor)))}d</span>
          </button>
          <button onClick={() => handleRate('easy')} disabled={loading} className="px-4 py-4 rounded-xl bg-surface-inset border border-border-default text-text-primary hover:border-accent-glow hover:text-accent-glow hover:bg-surface-raised transition-all text-body font-medium flex flex-col items-center gap-1 disabled:opacity-50 group">
            <span>Easy</span>
            <span className="text-micro text-text-tertiary group-hover:text-accent-glow/70">~{Math.min(365, Math.max(1, Math.round(currentItem.interval * currentItem.easeFactor * 1.3)))}d</span>
          </button>
        </div>
      </div>

      {/* Archival Modal */}
      {showArchivalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-void/80 backdrop-blur-sm">
          <div className="bg-surface border border-border-default rounded-xl p-6 max-w-md w-full shadow-[var(--shadow-raised)]">
            <div className="w-12 h-12 rounded-full bg-warning-bg border border-warning-border flex items-center justify-center mb-4">
              <span className="text-xl">⚠️</span>
            </div>
            <h3 className="text-h3 font-display text-text-primary mb-2">Read it now, or drop it.</h3>
            <p className="text-body text-text-secondary mb-6">
              You've skipped this {isFlashcard ? 'flashcard' : 'article'} 3 times. Your shelf is for active learning, not hoarding. Either commit to {isFlashcard ? 'learning' : 'reading'} it now, archive it, or delete it forever.
            </p>
            <div className="space-y-3">
              {isFlashcard ? (
                <button onClick={handleKeep} className="w-full btn-primary block text-center">
                  I'll learn it right now
                </button>
              ) : (
                <a href={currentItem.resource.canonicalUrl} target="_blank" onClick={handleKeep} className="w-full btn-primary block text-center">
                  I'll read it right now
                </a>
              )}
              <button onClick={handleArchive} disabled={loading} className="w-full px-4 py-2.5 text-body font-medium bg-surface-inset border border-border-default rounded-md hover:bg-surface-raised text-text-primary transition-colors flex justify-center">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Archive (Remove from Queue)"}
              </button>
              <button onClick={handleDelete} disabled={loading} className="w-full px-4 py-2.5 text-body font-medium border border-danger-border text-danger-fg bg-danger-bg/50 rounded-md hover:bg-danger-bg transition-colors flex justify-center">
                Permanently Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

