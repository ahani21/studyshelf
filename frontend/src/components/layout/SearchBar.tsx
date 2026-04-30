'use client'

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search } from 'lucide-react';

export default function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/shelf?q=${encodeURIComponent(query.trim())}`);
    } else {
      router.push('/shelf');
    }
  };

  return (
    <form onSubmit={handleSearch} className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
      <input 
        type="text" 
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search your shelf..." 
        className="w-full h-11 bg-surface-inset border border-border-default rounded-md pl-10 pr-4 text-body text-text-primary focus:border-accent-glow focus:shadow-[var(--shadow-focus)] outline-none placeholder:text-text-tertiary transition-all"
      />
    </form>
  );
}
