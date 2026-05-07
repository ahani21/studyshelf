import { Users2, Sparkles, Shield, Zap } from 'lucide-react';

export default function TeamsPage() {
  return (
    <div className="max-w-4xl mx-auto h-[70vh] flex flex-col items-center justify-center text-center px-4 relative">
      {/* Background glow */}
      <div className="absolute inset-0 bg-accent-glow opacity-[0.03] rounded-[100%] blur-[120px] -z-10" />

      <div className="w-20 h-20 bg-surface-inset border border-border-default rounded-2xl flex items-center justify-center mb-8 shadow-[var(--shadow-raised)] relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-accent-glow/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <Users2 className="w-10 h-10 text-accent-glow relative z-10" />
      </div>

      <h1 className="text-display-lg font-display text-text-primary mb-4">
        StudyShelf <span className="text-accent-glow">Teams</span>
      </h1>
      
      <p className="text-body-lg text-text-secondary max-w-xl mb-12">
        We are building the ultimate collaborative learning experience. Soon, you will be able to create study groups, share flashcard decks, and compete on team leaderboards.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-3xl text-left">
        <div className="card p-6 bg-surface border border-border-default rounded-xl shadow-[var(--shadow-raised)] flex flex-col items-start">
          <div className="p-2 bg-success-bg border border-success-border rounded-lg mb-4 text-success-fg">
            <Sparkles className="w-5 h-5" />
          </div>
          <h3 className="text-h4 font-display text-text-primary mb-2">Shared Knowledge</h3>
          <p className="text-body-sm text-text-secondary">Pool your resources and let the AI generate study materials for your entire class instantly.</p>
        </div>

        <div className="card p-6 bg-surface border border-border-default rounded-xl shadow-[var(--shadow-raised)] flex flex-col items-start">
          <div className="p-2 bg-warning-bg border border-warning-border rounded-lg mb-4 text-warning-fg">
            <Zap className="w-5 h-5" />
          </div>
          <h3 className="text-h4 font-display text-text-primary mb-2">Team Leaderboards</h3>
          <p className="text-body-sm text-text-secondary">Compete with your classmates on review consistency and mastery metrics.</p>
        </div>

        <div className="card p-6 bg-surface border border-border-default rounded-xl shadow-[var(--shadow-raised)] flex flex-col items-start">
          <div className="p-2 bg-danger-bg border border-danger-border rounded-lg mb-4 text-danger-fg">
            <Shield className="w-5 h-5" />
          </div>
          <h3 className="text-h4 font-display text-text-primary mb-2">Access Control</h3>
          <p className="text-body-sm text-text-secondary">Keep your personal shelf private while choosing exactly what to share with your study groups.</p>
        </div>
      </div>

      <div className="mt-12 inline-flex items-center gap-2 px-4 py-2 bg-surface-inset border border-border-default rounded-full text-text-tertiary text-body-sm font-medium uppercase tracking-widest">
        <span className="w-2 h-2 rounded-full bg-accent-glow animate-pulse" />
        In Active Development
      </div>
    </div>
  );
}
