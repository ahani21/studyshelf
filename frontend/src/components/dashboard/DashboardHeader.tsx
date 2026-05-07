'use client'

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Upload, X, FileText, Sparkles, BookOpen, Loader2 } from 'lucide-react';
import { handleSearch } from '@/server/actions/search';

type SearchResult = {
  id: number | string;
  title: string;
  sub: string;
  type: 'resource' | 'flashcard';
};

export default function DashboardHeader({ name }: { name: string }) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Handle Search
  useEffect(() => {
    if (searchQuery.trim().length === 0) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await handleSearch(searchQuery);
        setResults(res as SearchResult[]);
      } catch (e) {
        console.error(e);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Handle Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-[18px] font-medium text-[#1A1A1A]">Good morning, {name}</h1>
          <p className="text-[13px] text-[#666666]">You have 14 cards due today. Let's get through them.</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsSearchOpen(true)}
            className="flex items-center gap-2 px-3 py-2 text-[13px] font-medium text-[#666666] hover:text-[#1A1A1A] transition-colors"
          >
            <Search className="w-4 h-4" />
            Search
            <kbd className="hidden md:inline-flex ml-2 px-1.5 py-0.5 text-[10px] bg-gray-100 border border-gray-200 rounded text-gray-400 font-sans">⌘K</kbd>
          </button>
          <Link 
            href="/ai?mode=pdf"
            className="flex items-center gap-2 px-4 py-2 bg-[#534AB7] text-white rounded-[8px] text-[13px] font-medium hover:bg-[#3C3489] transition-colors"
          >
            <Upload className="w-4 h-4" />
            Upload PDF
          </Link>
        </div>
      </div>

      {/* Search Overlay */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4 bg-black/20 backdrop-blur-[2px]">
          <div className="bg-white w-full max-w-xl rounded-xl shadow-2xl border border-gray-200 overflow-hidden animate-in fade-in zoom-in duration-150">
            <div className="flex items-center px-4 h-14 border-b border-gray-100">
              <Search className="w-5 h-5 text-gray-400 mr-3" />
              <input 
                autoFocus
                placeholder="Search resources, tags, or flashcards..."
                className="flex-1 bg-transparent border-none outline-none text-[15px] text-gray-900 placeholder:text-gray-400"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button 
                onClick={() => setIsSearchOpen(false)}
                className="p-1 hover:bg-gray-100 rounded-md transition-colors"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>
            
            <div className="p-2 max-h-[60vh] overflow-y-auto">
              {isSearching ? (
                <div className="py-12 flex flex-col items-center justify-center gap-3">
                  <Loader2 className="w-6 h-6 text-[#534AB7] animate-spin" />
                  <p className="text-[13px] text-gray-400">Searching your library...</p>
                </div>
              ) : searchQuery.length === 0 ? (
                <div className="py-12 px-4 text-center">
                  <p className="text-[13px] text-gray-400">Search for anything in your StudyShelf library</p>
                </div>
              ) : results.length > 0 ? (
                <div className="space-y-1">
                  <p className="px-3 py-2 text-[11px] font-medium text-gray-400 uppercase tracking-wider">Results</p>
                  {results.map((item) => (
                    <Link 
                      key={`${item.type}-${item.id}`}
                      href={item.type === 'resource' ? `/shelf` : `/review`} 
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                      onClick={() => setIsSearchOpen(false)}
                    >
                      <div className={`w-8 h-8 rounded-md flex items-center justify-center ${item.type === 'resource' ? 'bg-teal-50 text-[#1D9E75]' : 'bg-purple-50 text-[#534AB7]'}`}>
                        {item.type === 'resource' ? <BookOpen className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-medium text-gray-900 group-hover:text-[#534AB7] truncate">{item.title}</p>
                        <p className="text-[11px] text-gray-500">{item.sub}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="py-12 px-4 text-center">
                  <p className="text-[13px] text-gray-400">No results found for "{searchQuery}"</p>
                </div>
              )}
            </div>
            
            <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex items-center gap-4">
              <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
                <kbd className="px-1.5 py-0.5 bg-white border border-gray-200 rounded text-gray-400 shadow-sm font-sans">ESC</kbd>
                to close
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
                <kbd className="px-1.5 py-0.5 bg-white border border-gray-200 rounded text-gray-400 shadow-sm font-sans">ENTER</kbd>
                to select
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
