'use client'

import { useRouter, useSearchParams } from 'next/navigation';
import { Search, Filter, Layers } from 'lucide-react';
import { useTransition } from 'react';

export default function FilterBar({ collections }: { collections: any[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  function updateFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== 'all') {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    
    startTransition(() => {
      router.push(`/shelf?${params.toString()}`);
    });
  }

  return (
    <div className={`flex flex-col md:flex-row items-stretch md:items-center gap-4 p-2 bg-surface border border-border-default rounded-xl transition-opacity ${isPending ? 'opacity-60' : 'opacity-100'}`}>
      <div className="flex-1 flex items-center gap-3 px-3 bg-surface-inset rounded-lg border border-border-subtle focus-within:border-accent-glow transition-all">
        <Search className="w-4 h-4 text-text-tertiary" />
        <input 
          type="text" 
          placeholder="Search by title, description or tag..." 
          defaultValue={searchParams.get('q') || ''}
          onChange={(e) => {
            const val = e.target.value;
            const timer = setTimeout(() => updateFilter('q', val), 500);
            return () => clearTimeout(timer);
          }}
          className="flex-1 h-10 bg-transparent text-body outline-none placeholder:text-text-tertiary text-text-primary"
        />
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 bg-surface-inset px-3 h-10 rounded-lg border border-border-subtle">
          <Filter className="w-4 h-4 text-text-tertiary" />
          <select 
            value={searchParams.get('status') || 'all'}
            onChange={(e) => updateFilter('status', e.target.value)}
            className="bg-transparent text-body-sm text-text-primary outline-none pr-2"
          >
            <option value="all">All Status</option>
            <option value="due">Due for Review</option>
            <option value="learning">Learning</option>
            <option value="mastered">Mastered</option>
          </select>
        </div>

        <div className="flex items-center gap-2 bg-surface-inset px-3 h-10 rounded-lg border border-border-subtle">
          <Layers className="w-4 h-4 text-text-tertiary" />
          <select 
            value={searchParams.get('collectionId') || 'all'}
            onChange={(e) => updateFilter('collectionId', e.target.value)}
            className="bg-transparent text-body-sm text-text-primary outline-none pr-2"
          >
            <option value="all">All Collections</option>
            {collections.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
