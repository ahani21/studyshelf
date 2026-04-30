export default function DevTokensPage() {
  return (
    <div className="p-8 space-y-12 max-w-4xl mx-auto">
      <header className="mb-8 border-b border-border-default pb-4">
        <h1 className="text-display-sm font-display text-text-primary">Design System Tokens</h1>
        <p className="text-body text-text-secondary">Verify colors, typography, and component shapes.</p>
      </header>

      {/* Typography */}
      <section className="space-y-4">
        <h2 className="text-h2 font-display text-text-primary">Typography</h2>
        <div className="space-y-4 font-display">
          <div className="text-display-hero">Display Hero Lora</div>
          <div className="text-display-lg">Display Lg Lora</div>
          <div className="text-display-md">Display Md Lora</div>
          <div className="text-display-sm">Display Sm Lora</div>
          <div className="text-h1">Heading 1 Lora</div>
          <div className="text-h2">Heading 2 Lora</div>
          <div className="text-h3">Heading 3 Lora (Resource Title)</div>
        </div>
        <div className="space-y-4 font-body">
          <div className="text-body-lg">Body Lg Inter</div>
          <div className="text-body">Body Inter</div>
          <div className="text-body-sm">Body Sm Inter</div>
          <div className="text-caption">Caption Inter</div>
          <div className="text-label tracking-widest uppercase">Label Inter</div>
          <div className="text-micro tracking-widest uppercase">Micro Inter</div>
        </div>
        <div className="space-y-4 font-mono text-text-tertiary">
          <div>Mono JetBrains: https://example.com</div>
        </div>
      </section>

      {/* Surface Colors & Shadows */}
      <section className="space-y-4">
        <h2 className="text-h2 font-display text-text-primary">Surfaces & Glows</h2>
        <div className="flex gap-4">
          <div className="w-32 h-32 bg-void border border-border-subtle flex items-center justify-center p-2 text-center text-caption text-text-secondary rounded-xl">Void Background</div>
          <div className="w-32 h-32 bg-canvas border border-border-subtle flex items-center justify-center p-2 text-center text-caption text-text-secondary rounded-xl">Canvas Background</div>
          <div className="w-32 h-32 bg-surface text-text-primary border border-border-default shadow-[var(--shadow-card)] flex items-center justify-center p-2 text-center text-caption rounded-xl">Surface (Default Card)</div>
          <div className="w-32 h-32 bg-surface-raised border border-border-strong shadow-[var(--shadow-raised)] flex items-center justify-center p-2 text-center text-caption text-text-primary rounded-xl">Surface Raised</div>
          <div className="w-32 h-32 bg-surface-inset border border-border-subtle flex items-center justify-center p-2 text-center text-caption text-text-tertiary rounded-xl">Surface Inset</div>
        </div>
      </section>

      {/* Resource Card */}
      <section className="space-y-4">
        <h2 className="text-h2 font-display text-text-primary">Resource Card</h2>
        <div className="bg-surface bg-[image:var(--card-gradient)] rounded-[var(--radius-xl)] shadow-[var(--shadow-card)] p-8 max-w-sm">
          <div className="w-full h-14 bg-surface-inset rounded-t-[var(--radius-xl)] -mt-8 -mx-8 mb-4 object-cover border-b border-border-subtle" />
          <div className="text-caption font-mono text-text-tertiary mb-1">developer.mozilla.org • Apr 20</div>
          <h3 className="text-h3 font-display text-text-primary mb-2">Introduction to Next.js App Router</h3>
          <p className="text-body-sm text-text-secondary line-clamp-2">Learn how to build faster and more SEO friendly web applications using the new paradigm.</p>
          
          <div className="flex items-center gap-2 mt-4">
            <span className="text-micro rounded-[var(--radius-sm)] bg-surface-raised text-text-secondary border border-border-subtle px-2 py-0.5 border-l-4 border-l-info-DEFAULT">react</span>
            <span className="text-micro rounded-[var(--radius-sm)] bg-surface-raised text-text-secondary border border-border-subtle px-2 py-0.5 border-l-4 border-l-warning-DEFAULT">web-dev</span>
            <div className="ml-auto flex items-center gap-1 inline-flex px-2 py-1 rounded-[var(--radius-full)] bg-warning-bg border border-warning-border text-warning-fg font-body text-[12px] font-semibold">
              Due Today
            </div>
          </div>
        </div>
      </section>

      {/* SRS Rating Buttons */}
      <section className="space-y-4">
        <h2 className="text-h2 font-display text-text-primary">SRS Rating Buttons</h2>
        <div className="flex gap-3">
          <button className="h-12 px-6 rounded-full border text-sm font-medium border-[var(--srs-again)] text-[var(--srs-again)] bg-[var(--danger-bg)] hover:bg-[rgba(251,113,133,0.2)]">Again</button>
          <button className="h-12 px-6 rounded-full border text-sm font-medium border-[var(--srs-hard)] text-[var(--srs-hard)] bg-[var(--warning-bg)] hover:bg-[rgba(251,191,36,0.2)]">Hard</button>
          <button className="h-12 px-6 rounded-full border text-sm font-medium border-[var(--srs-good)] text-[var(--srs-good)] bg-[var(--success-bg)] hover:bg-[rgba(52,211,153,0.2)]">Good</button>
          <button className="h-12 px-6 rounded-full border text-sm font-medium border-[var(--srs-easy)] text-[var(--srs-easy)] bg-[var(--info-bg)] hover:bg-[rgba(96,165,250,0.2)]">Easy</button>
        </div>
      </section>

      {/* Status Pills */}
      <section className="space-y-4">
        <h2 className="text-h2 font-display text-text-primary">Status Pills</h2>
        <div className="flex gap-4">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-semibold text-[12px] font-body bg-success-bg text-success-fg border border-success-border">Success / Mastered</span>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-semibold text-[12px] font-body bg-warning-bg text-warning-fg border border-warning-border">Warning / Due Today</span>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-semibold text-[12px] font-body bg-danger-bg text-danger-fg border border-danger-border">Danger / Overdue</span>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-semibold text-[12px] font-body bg-info-bg text-info-fg border border-info-border">Info / New</span>
        </div>
      </section>

      {/* Input Field */}
      <section className="space-y-4">
        <h2 className="text-h2 font-display text-text-primary">Forms & Inputs</h2>
        <div className="max-w-sm space-y-2">
          <label className="block text-label text-text-secondary">Resource URL</label>
          <input 
            type="text" 
            placeholder="https://example.com"
            className="w-full bg-surface-inset border border-border-default rounded-[var(--radius-md)] px-4 py-3 text-text-primary text-[14px] font-body h-11 focus:border-accent-glow focus:shadow-[var(--shadow-focus)] outline-none placeholder:text-text-tertiary"
          />
          <p className="text-caption text-text-tertiary">Paste a valid URL to save.</p>
        </div>
        <div className="max-w-sm space-y-2 mt-4">
          <button className="w-full h-10 px-5 rounded-[var(--radius-md)] bg-text-primary text-text-inverse font-medium text-[14px] font-body tracking-[-0.005em] hover:bg-[#E8E0D4]">
            Primary Button
          </button>
          <button className="w-full h-10 px-5 rounded-[var(--radius-md)] bg-surface-raised text-text-primary border border-border-default hover:bg-surface">
            Secondary Button
          </button>
        </div>
      </section>
    </div>
  );
}
