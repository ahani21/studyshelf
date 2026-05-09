import { getAnalytics, getFlashcardCategories } from '@/server/queries/analytics';
import { BarChart2, BookOpen, Brain, Zap, Target, BookMarked, History } from 'lucide-react';

export default async function AnalyticsPage() {
  const [stats, categories] = await Promise.all([
    getAnalytics(),
    getFlashcardCategories()
  ]);

  if (!stats || !categories) return null;

  const masteryPercent = stats.totalResources > 0 
    ? Math.round((stats.masteredItems / stats.totalResources) * 100) 
    : 0;

  const categoryEntries = [
    { label: 'Again', key: 'AGAIN', color: 'text-danger-fg', bg: 'bg-danger-bg/20' },
    { label: 'Hard', key: 'HARD', color: 'text-warning-fg', bg: 'bg-warning-bg/20' },
    { label: 'Good', key: 'GOOD', color: 'text-success-fg', bg: 'bg-success-bg/20' },
    { label: 'Easy', key: 'EASY', color: 'text-accent-glow', bg: 'bg-accent-glow/10' },
    { label: 'New', key: 'NEW', color: 'text-text-secondary', bg: 'bg-surface-inset' },
  ];

  return (
    <div className="space-y-8 pb-12">
      <header>
        <h1 className="text-display-lg font-display text-text-primary flex items-center gap-3">
          <BarChart2 className="w-8 h-8 text-accent-glow" />
          Analytics
        </h1>
        <p className="text-body-lg text-text-secondary mt-1">
          Track your learning velocity and shelf health.
        </p>
      </header>

      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card p-6 bg-surface border border-border-default rounded-xl shadow-[var(--shadow-raised)]">
          <div className="flex items-center gap-3 mb-2 text-text-secondary">
            <BookOpen className="w-5 h-5 text-accent-glow" />
            <h3 className="text-label">TOTAL SAVED</h3>
          </div>
          <div className="text-display-xl font-display text-text-primary">{stats.totalResources}</div>
        </div>

        <div className="card p-6 bg-surface border border-border-default rounded-xl shadow-[var(--shadow-raised)]">
          <div className="flex items-center gap-3 mb-2 text-text-secondary">
            <Zap className="w-5 h-5 text-warning-fg" />
            <h3 className="text-label">TOTAL REVIEWS</h3>
          </div>
          <div className="text-display-xl font-display text-text-primary">{stats.totalReviews}</div>
        </div>

        <div className="card p-6 bg-surface border border-border-default rounded-xl shadow-[var(--shadow-raised)]">
          <div className="flex items-center gap-3 mb-2 text-text-secondary">
            <Brain className="w-5 h-5 text-danger-fg" />
            <h3 className="text-label">DUE TODAY</h3>
          </div>
          <div className="text-display-xl font-display text-text-primary">{stats.overdueItems}</div>
        </div>

        <div className="card p-6 bg-surface border border-border-default rounded-xl shadow-[var(--shadow-raised)]">
          <div className="flex items-center gap-3 mb-2 text-text-secondary">
            <Target className="w-5 h-5 text-success-fg" />
            <h3 className="text-label">MASTERY</h3>
          </div>
          <div className="text-display-xl font-display text-text-primary">{masteryPercent}%</div>
          <div className="text-micro text-text-tertiary mt-1">Items with &gt; 2.8 Ease Factor</div>
        </div>
      </div>

      {/* Knowledge Categorization Section */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <History className="w-6 h-6 text-accent-glow" />
          <h2 className="text-h2 font-display text-text-primary">Memory Distribution</h2>
        </div>

        <div className="grid grid-cols-1 gap-8">
          {categoryEntries.map(({ label, key, color, bg }) => {
            const cards = (categories as any)[key] || [];
            if (cards.length === 0) return null;

            return (
              <div key={key} className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className={`px-3 py-1 rounded-full ${bg} ${color} text-label font-bold tracking-widest uppercase`}>
                    {label} ({cards.length})
                  </div>
                  <div className="flex-1 h-px bg-border-subtle" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {cards.map((card: any) => (
                    <div 
                      key={card.id} 
                      className="group p-5 bg-surface border border-border-subtle rounded-xl hover:border-accent-glow/50 hover:shadow-[var(--shadow-raised)] transition-all cursor-default"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <span className="text-micro font-semibold text-text-tertiary uppercase tracking-tighter">Flashcard</span>
                        <div className="flex gap-1">
                          {[...Array(5)].map((_, i) => (
                            <div 
                              key={i} 
                              className={`w-1 h-1 rounded-full ${i < card.difficulty ? 'bg-accent-glow' : 'bg-border-default'}`} 
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-body font-medium text-text-primary line-clamp-2 mb-2">{card.front}</p>
                      <div className="h-px bg-border-subtle my-3 opacity-50" />
                      <p className="text-body-sm text-text-secondary italic line-clamp-2">
                        {card.back}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {Object.values(categories).every(arr => arr.length === 0) && (
            <div className="p-12 text-center border border-dashed border-border-default rounded-2xl bg-surface-inset">
              <BookMarked className="w-12 h-12 text-text-tertiary mx-auto mb-4" />
              <p className="text-body text-text-secondary">No flashcards reviewed yet. Complete a review session to see your memory distribution.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

