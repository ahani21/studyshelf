import RoleGuard from '@/components/auth/RoleGuard';
import { auth } from '@clerk/nextjs/server';
import { getAnalytics } from '@/server/queries/analytics';
import Link from 'next/link';

export default async function DashboardPage() {
  const { sessionClaims } = await auth();
  const name = (sessionClaims?.firstName as string) || 'Scholar';
  
  const stats = await getAnalytics();
  const totalResources = stats?.totalResources || 0;
  const overdueItems = stats?.overdueItems || 0;
  const masteredItems = stats?.masteredItems || 0;
  const avgRecall = stats?.averageEase 
    ? Math.min(100, Math.round((stats.averageEase / 2.5) * 100)) 
    : 0;

  return (
    <RoleGuard allowedRoles={['admin', 'member', 'viewer']}>
      <div className="space-y-12">
        <header className="space-y-2">
          <h1 className="text-display-hero font-display text-text-primary">
            Good evening, {name}
          </h1>
          <p className="text-body-lg text-text-secondary">
            You have {overdueItems} {overdueItems === 1 ? 'item' : 'items'} due for review today.
          </p>
        </header>

        {/* Stat strip placeholder */}
        <div className="flex items-center gap-6 overflow-x-auto pb-4">
          <div className="flex items-center gap-3 shrink-0">
            <span className="text-label text-text-tertiary">RESOURCES</span>
            <span className="text-body-lg font-semibold tabular-nums text-text-primary">{totalResources}</span>
          </div>
          <div className="w-px h-6 bg-border-subtle shrink-0" />
          <div className="flex items-center gap-3 shrink-0">
            <span className="text-label text-text-tertiary">DUE TODAY</span>
            <span className="text-body-lg font-semibold tabular-nums text-text-primary">{overdueItems}</span>
          </div>
          <div className="w-px h-6 bg-border-subtle shrink-0" />
          <div className="flex items-center gap-3 shrink-0">
            <span className="text-label text-text-tertiary">AVG RECALL</span>
            <span className="text-body-lg font-semibold tabular-nums text-text-primary">{avgRecall}%</span>
          </div>
          <div className="w-px h-6 bg-border-subtle shrink-0" />
          <div className="flex items-center gap-3 shrink-0">
            <span className="text-label text-text-tertiary">MASTERED</span>
            <span className="text-body-lg font-semibold tabular-nums text-text-primary">{masteredItems}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card !rounded-2xl !p-10 border border-border-subtle relative overflow-hidden group">
            <div className="absolute inset-0 bg-review-glow opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <div className="relative z-10 flex flex-col items-start h-full">
              <span className="text-label text-text-tertiary mb-2">REVIEW QUEUE</span>
              <h2 className="text-display-lg font-display text-text-primary tabular-nums mb-1">{overdueItems}</h2>
              <p className="text-body text-text-secondary mb-8">resources due today. Est {Math.ceil(overdueItems * 1.5)} min.</p>
              
              <div className="mt-auto">
                <Link href="/review" className="bg-accent-glow hover:bg-accent-highlight text-white rounded-md px-5 py-3 font-medium text-body transition-colors inline-block">
                  Start Review
                </Link>
              </div>
            </div>
          </div>

          <div className="card !rounded-2xl !p-10 border border-border-subtle relative">
            <span className="text-label text-text-tertiary mb-2 block">SHELF HEALTH</span>
            <h2 className="text-display-md font-display text-text-primary mb-6">Strong</h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-body-sm text-text-secondary">Average Ease Factor</span>
                  <span className="text-body-sm text-text-primary font-mono">2.45</span>
                </div>
                <div className="h-1.5 w-full bg-surface-inset rounded-full overflow-hidden">
                  <div className="h-full bg-success-fg rounded-full w-[80%]" />
                </div>
              </div>
              <p className="text-body-sm text-warning-fg">3 resources at risk of forgetting</p>
            </div>
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}
