'use client'

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserButton } from '@clerk/nextjs';
import {
  LayoutDashboard,
  Sparkles,
  Bookmark,
  BrainCircuit,
  BarChart3,
  Users2,
  Settings2,
  Flame,
  Library
} from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();

  const getLinkClass = (path: string) => {
    const isActive = pathname === path;
    return `flex items-center gap-3 px-3 py-2 rounded-md text-[13px] transition-colors ${isActive
        ? "bg-[#EEEDFE] text-[#3C3489] font-medium"
        : "text-[#666666] hover:bg-surface-raised hover:text-[#1A1A1A]"
      }`;
  };

  return (
    <aside className="w-[200px] h-screen border-r border-border-subtle bg-white flex flex-col hidden lg:flex shrink-0 z-20">
      {/* Logo Lockup */}
      <div className="p-5 flex items-center gap-2 mb-2">
        <div className="w-7 h-7 rounded-[6px] bg-[#EEEDFE] flex items-center justify-center">
          <Library className="w-4 h-4 text-[#534AB7]" />
        </div>
        <span className="text-[14px] font-medium text-[#1A1A1A]">StudyShelf</span>
      </div>

      <nav className="flex-1 px-3 space-y-6">
        {/* MAIN Section */}
        <div>
          <div className="px-3 text-[11px] font-medium text-text-muted uppercase tracking-wider mb-2">MAIN</div>
          <div className="space-y-0.5">
            <Link href="/dashboard" className={getLinkClass('/dashboard')}>
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </Link>
            <Link href="/ai" className={getLinkClass('/ai')}>
              <Sparkles className="w-4 h-4" />
              AI Studio
            </Link>
            <Link href="/shelf" className={getLinkClass('/shelf')}>
              <Bookmark className="w-4 h-4" />
              My Shelf
            </Link>
            <Link href="/review" className={getLinkClass('/review')}>
              <BrainCircuit className="w-4 h-4" />
              Review Queue
            </Link>
          </div>
        </div>

        {/* INSIGHTS Section */}
        <div>
          <div className="px-3 text-[11px] font-medium text-text-muted uppercase tracking-wider mb-2">INSIGHTS</div>
          <div className="space-y-0.5">
            <Link href="/analytics" className={getLinkClass('/analytics')}>
              <BarChart3 className="w-4 h-4" />
              Analytics
            </Link>
            <Link href="/teams" className={getLinkClass('/teams')}>
              <Users2 className="w-4 h-4" />
              Teams
            </Link>
            <Link href="/settings" className={getLinkClass('/settings')}>
              <Settings2 className="w-4 h-4" />
              Settings
            </Link>
          </div>
        </div>
      </nav>

      {/* Streak Pill Card & User Account */}
      <div className="p-4 mt-auto space-y-4">
        <div className="bg-[#EEEDFE] p-4 rounded-xl flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
            <Flame className="w-4 h-4 text-[#D97706]" />
          </div>
          <div>
            <div className="text-[13px] font-medium text-[#3C3489]">12-day streak</div>
            <div className="text-[11px] text-[#666666]">Keep it up!</div>
          </div>
        </div>

        <div className="pt-4 border-t border-border-subtle flex items-center justify-between px-1">
          <span className="text-[13px] font-medium text-[#666666]">Account</span>
          <UserButton />
        </div>
      </div>
    </aside>
  );
}
