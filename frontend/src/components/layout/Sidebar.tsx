import Link from 'next/link';
import { BookOpen, LayoutDashboard, Bookmark, Brain, FolderOpen, Tag, BarChart2, Users, Settings, LogOut, Sparkles } from 'lucide-react';
import { OrganizationSwitcher, SignOutButton } from '@clerk/nextjs';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';

export default async function Sidebar() {
  const { userId, sessionClaims } = await auth();
  const role = (sessionClaims?.role as string) || 'member';

  let dueTodayCount = 0;
  if (userId) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    try {
      dueTodayCount = await prisma.sRSData.count({
        where: {
          OR: [
            { resource: { userId } },
            { flashcard: { userId } }
          ],
          dueDate: {
            gte: today,
            lt: tomorrow,
          }
        }
      });
    } catch (e) {
      console.error("Failed to fetch SRS Data for badge", e);
    }
  }

  return (
    <aside className="w-[260px] h-screen border-r border-border-subtle bg-canvas flex-col hidden lg:flex shrink-0">
      <div className="p-6 flex items-center gap-3 border-b border-border-subtle h-20 shrink-0">
        <BookOpen className="w-6 h-6 text-accent-glow" />
        <span className="text-h3 font-display text-text-primary">StudyShelf</span>
      </div>

      <div className="p-4 border-b border-border-subtle shrink-0">
        <OrganizationSwitcher 
          appearance={{
            elements: {
              organizationSwitcherTrigger: "w-full flex items-center justify-between p-2 rounded-md hover:bg-surface-raised text-body text-text-primary font-semibold border border-border-default",
              organizationSwitcherTriggerIcon: "text-text-secondary",
              userPreviewMainIdentifier: "text-text-primary font-semibold",
              userPreviewSecondaryIdentifier: "text-text-tertiary",
              organizationPreviewMainIdentifier: "text-text-primary font-semibold",
              organizationPreviewSecondaryIdentifier: "text-text-tertiary",
            }
          }}
          hidePersonal={false}
        />
      </div>

      <nav className="flex-1 overflow-y-auto p-4 space-y-6">
        <div className="space-y-1">
          <div className="text-label text-text-tertiary mb-2 px-4">STUDY</div>
          <Link href="/dashboard" className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-body text-text-secondary hover:bg-surface hover:text-text-primary transition-colors">
            <LayoutDashboard className="w-5 h-5" />
            Dashboard
          </Link>
          <Link href="/shelf" className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-body text-text-secondary hover:bg-surface hover:text-text-primary transition-colors">
            <Bookmark className="w-5 h-5" />
            My Shelf
          </Link>
          <Link href="/review" className="flex items-center justify-between px-4 py-2.5 rounded-lg text-body text-text-secondary hover:bg-surface hover:text-text-primary transition-colors">
            <div className="flex items-center gap-3">
              <Brain className="w-5 h-5" />
              Review Queue
            </div>
            {dueTodayCount > 0 && (
              <span className="px-2 py-0.5 text-micro rounded-full bg-warning-bg text-warning-fg border border-warning-border">{dueTodayCount}</span>
            )}
          </Link>
          <Link href="/ai" className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-body text-text-secondary hover:bg-surface hover:text-text-primary transition-colors group">
            <Sparkles className="w-5 h-5 text-accent-glow group-hover:animate-pulse" />
            <span>AI Studio</span>
            <span className="ml-auto text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-accent-glow/20 text-accent-glow border border-accent-glow/30">NEW</span>
          </Link>
        </div>

        <div className="space-y-1">
          <div className="text-label text-text-tertiary mb-2 px-4">ORGANIZE</div>
          <Link href="/collections" className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-body text-text-secondary hover:bg-surface hover:text-text-primary transition-colors">
            <FolderOpen className="w-5 h-5" />
            Collections
          </Link>
          <Link href="/tags" className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-body text-text-secondary hover:bg-surface hover:text-text-primary transition-colors">
            <Tag className="w-5 h-5" />
            Tags
          </Link>
        </div>

        <div className="space-y-1">
          <div className="text-label text-text-tertiary mb-2 px-4">INSIGHTS</div>
          <Link href="/analytics" className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-body text-text-secondary hover:bg-surface hover:text-text-primary transition-colors">
            <BarChart2 className="w-5 h-5" />
            Analytics
          </Link>
        </div>

        {role === 'admin' && (
          <div className="space-y-1">
            <div className="text-label text-text-tertiary mb-2 px-4">ORGANIZATION</div>
            <Link href="/admin/analytics" className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-body text-text-secondary hover:bg-surface hover:text-text-primary transition-colors">
              <Users className="w-5 h-5" />
              Org Analytics
            </Link>
          </div>
        )}

      </nav>

      <div className="p-4 border-t border-border-subtle space-y-1 shrink-0">
        <Link href="/settings" className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-body text-text-secondary hover:bg-surface hover:text-text-primary transition-colors">
          <Settings className="w-5 h-5" />
          Settings
        </Link>
        <div className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-body text-text-secondary hover:bg-danger-bg hover:text-danger-fg transition-colors text-left cursor-pointer">
          <LogOut className="w-5 h-5" />
          <SignOutButton />
        </div>
      </div>
    </aside>
  );
}
