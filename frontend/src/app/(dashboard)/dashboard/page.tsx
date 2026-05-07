import { 
  LayoutDashboard, 
  Trophy, 
  Folder, 
  Clock, 
  BarChart3, 
  Target, 
  RefreshCw,
  Clock3,
  FileText,
  Sparkles,
  Library
} from 'lucide-react';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import { auth } from '@clerk/nextjs/server';
import { getDashboardStats, getWeeklyActivity, getUpcomingQueue, getTodaysGoals } from '@/server/queries/analytics';

export default async function DashboardPage() {
  const { sessionClaims } = await auth();
  const name = (sessionClaims?.firstName as string) || 'Ahani';

  let stats, weeklyActivity, queue, todaysGoals;
  try {
    [stats, weeklyActivity, queue, todaysGoals] = await Promise.all([
      getDashboardStats(),
      getWeeklyActivity(),
      getUpcomingQueue(),
      getTodaysGoals()
    ]);
  } catch (e) {
    console.error("Dashboard data fetch error:", e);
    return (
      <div className="p-12 text-center">
        <h1 className="text-xl font-medium text-gray-900 mb-2">Something went wrong</h1>
        <p className="text-gray-500">We couldn't load your dashboard data. Please try refreshing or check your connection.</p>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="p-6 space-y-6">
      <DashboardHeader name={name} />

      {/* SECTION 2 — Stat cards row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Cards due', value: stats.cardsDue.toString(), trend: '↑ 3 from yesterday', icon: <Library className="w-4 h-4" /> },
          { label: 'Mastered', value: stats.masteredCount.toString(), trend: '↑ 12 this week', icon: <Trophy className="w-4 h-4" /> },
          { label: 'Collections', value: stats.collectionsCount.toString(), trend: `${stats.totalResources} resources total`, icon: <Folder className="w-4 h-4" />, muted: true },
          { label: 'Study time', value: `${stats.studyTimeHours}h`, trend: 'this week', icon: <Clock className="w-4 h-4" />, muted: true },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-5 rounded-[12px] border-[0.5px] border-border-default space-y-2 shadow-sm hover:border-[#7F77DD]/50 transition-colors">
            <div className="flex items-center gap-2 text-[11px] text-[#999999] font-medium uppercase tracking-wider">
              {stat.icon}
              {stat.label}
            </div>
            <div className="text-[22px] font-medium text-[#1A1A1A]">{stat.value}</div>
            <div className={`text-[11px] ${stat.muted ? 'text-[#999999]' : 'text-[#1D9E75] font-medium'}`}>
              {stat.trend}
            </div>
          </div>
        ))}
      </div>

      {/* SECTION 3 — Two-column bottom grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT COLUMN */}
        <div className="space-y-6">
          {/* Panel A — Weekly reviews */}
          <div className="bg-white rounded-[12px] border-[0.5px] border-border-default overflow-hidden shadow-sm">
            <div className="px-5 py-4 border-b-[0.5px] border-border-subtle flex items-center justify-between">
              <div className="flex items-center gap-2 text-[13px] font-medium text-[#1A1A1A]">
                <BarChart3 className="w-4 h-4 text-[#534AB7]" />
                Weekly reviews
              </div>
              <button className="text-[11px] text-[#999999] hover:text-[#534AB7] transition-colors">View all</button>
            </div>
            <div className="p-5 space-y-3">
              {weeklyActivity.map((row, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="w-6 text-[11px] text-[#999999]">{row.day}</span>
                  <div className="flex-1 h-[6px] bg-[#F1F3F5] rounded-full overflow-hidden">
                    <div className="h-full bg-[#7F77DD] rounded-full" style={{ width: `${row.val}%` }} />
                  </div>
                  <span className="text-[11px] text-[#666666] w-5 text-right">{row.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Panel B — Today's goals */}
          <div className="bg-white rounded-[12px] border-[0.5px] border-border-default overflow-hidden shadow-sm">
            <div className="px-5 py-4 border-b-[0.5px] border-border-subtle">
              <div className="flex items-center gap-2 text-[13px] font-medium text-[#1A1A1A]">
                <Target className="w-4 h-4 text-[#534AB7]" />
                Today's goals
              </div>
            </div>
            <div className="p-5 space-y-5">
              {todaysGoals.map((goal: any, i: number) => (
                <div key={i} className="flex items-center justify-between gap-4">
                  <span className="flex-1 text-[13px] text-[#666666]">{goal.label}</span>
                  <div className="w-[100px] h-[6px] bg-[#F1F3F5] rounded-full overflow-hidden">
                    <div className={`h-full ${goal.color} rounded-full`} style={{ width: `${goal.val}%` }} />
                  </div>
                  <span className={`text-[13px] w-12 text-right ${goal.success ? 'text-[#1D9E75] font-medium' : 'text-[#666666]'}`}>
                    {goal.text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-6">
          {/* Panel C — Up next in queue */}
          <div className="bg-white rounded-[12px] border-[0.5px] border-border-default overflow-hidden shadow-sm">
            <div className="px-5 py-4 border-b-[0.5px] border-border-subtle flex items-center justify-between">
              <div className="flex items-center gap-2 text-[13px] font-medium text-[#1A1A1A]">
                <RefreshCw className="w-4 h-4 text-[#534AB7]" />
                Up next in queue
              </div>
              <button className="text-[11px] text-[#534AB7] font-medium hover:underline">Start session</button>
            </div>
            <div className="p-2 space-y-1">
              {queue.map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg hover:bg-surface-raised transition-colors">
                  <div className={`w-7 h-7 rounded-[6px] shrink-0 flex items-center justify-center ${item.type === 'Flashcard' ? 'bg-[#EEEDFE]' : 'bg-[#E6F6F2]'}`}>
                    {item.type === 'Flashcard' ? <Sparkles className="w-4 h-4 text-[#534AB7]" /> : <FileText className="w-4 h-4 text-[#1D9E75]" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[12px] font-medium text-[#1A1A1A] truncate">{item.title}</div>
                    <div className="text-[11px] text-[#999999] truncate">{item.type} • {item.sub}</div>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium whitespace-nowrap ${item.isDue ? 'bg-[#FCE8E8] text-[#993C1D]' : 'bg-[#FEF3C7] text-[#BA7517]'}`}>
                    {item.tag}
                  </span>
                </div>
              ))}
              {queue.length === 0 && (
                <div className="p-8 text-center text-[13px] text-gray-400">
                  No items due today. You're all caught up!
                </div>
              )}
            </div>
          </div>

          {/* Panel D — Recently added */}
          <div className="bg-white rounded-[12px] border-[0.5px] border-border-default overflow-hidden shadow-sm">
            <div className="px-5 py-4 border-b-[0.5px] border-border-subtle flex items-center justify-between">
              <div className="flex items-center gap-2 text-[13px] font-medium text-[#1A1A1A]">
                <Clock3 className="w-4 h-4 text-[#534AB7]" />
                Recently added
              </div>
              <button className="text-[11px] text-[#999999] hover:text-[#534AB7] transition-colors">Go to shelf</button>
            </div>
            <div className="p-2 space-y-1">
              {[
                { type: 'PDF', title: 'Neural networks & backpropagation', tags: [{ l: 'AI/ML', c: 'bg-[#E6F6F2] text-[#1D9E75]' }, { l: 'CS', c: 'bg-[#EEEDFE] text-[#534AB7]' }] },
                { type: 'Article', title: 'ER diagrams — complete guide', tags: [{ l: 'DBMS', c: 'bg-[#FEF3C7] text-[#BA7517]' }] },
                { type: 'PDF', title: 'Huffman coding & compression', tags: [{ l: 'CS', c: 'bg-[#EEEDFE] text-[#534AB7]' }] },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg hover:bg-surface-raised transition-colors">
                  <div className="w-8 h-8 rounded-[6px] border-[0.5px] border-border-default bg-[#F8F9FA] flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4 text-[#ADB5BD]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[12px] font-medium text-[#1A1A1A] truncate mb-1">{item.title}</div>
                    <div className="flex gap-1">
                      {item.tags.map((tag, j) => (
                        <span key={j} className={`px-1.5 py-0.5 rounded-[4px] text-[9px] font-medium ${tag.c}`}>
                          {tag.l}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
