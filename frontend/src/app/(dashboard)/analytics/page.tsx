import { getAnalytics } from '@/server/queries/analytics';
import { BarChart2, BookOpen, Brain, Zap, Target } from 'lucide-react';

export default async function AnalyticsPage() {
  const stats = await getAnalytics();

  if (!stats) return null;

  const masteryPercent = stats.totalResources > 0 
    ? Math.round((stats.masteredItems / stats.totalResources) * 100) 
    : 0;

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-display-lg font-display text-text-primary flex items-center gap-3">
          <BarChart2 className="w-8 h-8 text-accent-glow" />
          Analytics
        </h1>
        <p className="text-body-lg text-text-secondary mt-1">
          Track your learning velocity and shelf health.
        </p>
      </header>

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
    </div>
  );
}
