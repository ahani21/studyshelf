'use client'

import { useState, useRef } from 'react';
import { saveResourceAction } from '@/server/actions/resource';
import { Plus, X, Loader2 } from 'lucide-react';

export default function SaveResourceModal({ collections }: { collections: any[] }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError('');
    
    try {
      const res = await saveResourceAction(formData);
      if (res.error) {
        setError(res.error);
      } else {
        dialogRef.current?.close();
      }
    } catch (e: any) {
      setError(e.message || "Failed to save resource");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button 
        onClick={() => dialogRef.current?.showModal()}
        className="btn-primary flex items-center gap-2"
      >
        <Plus className="w-5 h-5" />
        Save Resource
      </button>

      <dialog 
        ref={dialogRef}
        className="bg-surface-raised border border-border-subtle rounded-xl shadow-[0_20px_40px_rgba(0,0,0,0.8)] p-0 backdrop:bg-black/70 backdrop:backdrop-blur-md w-full max-w-lg m-auto"
      >
        <div className="p-6 border-b border-border-subtle flex justify-between items-center">
          <h2 className="text-display-sm font-display text-white">Save to Shelf</h2>
          <button onClick={() => dialogRef.current?.close()} className="text-white/50 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form action={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3 bg-danger-bg border border-danger-border text-danger-fg text-body-sm rounded-md">
              {error}
            </div>
          )}
          
          <div className="space-y-1.5">
            <label htmlFor="url" className="text-label text-white font-medium">URL *</label>
            <input 
              required
              type="url" 
              name="url" 
              id="url" 
              placeholder="https://..."
              className="w-full h-10 bg-surface-inset border border-border-default rounded-md px-3 text-body text-white placeholder:text-white/40 focus:border-accent-glow focus:shadow-[var(--shadow-focus)] outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="title" className="text-label text-white font-medium">Custom Title (Optional)</label>
            <input 
              type="text" 
              name="title" 
              id="title" 
              placeholder="Leave blank to auto-fetch..."
              className="w-full h-10 bg-surface-inset border border-border-default rounded-md px-3 text-body text-white placeholder:text-white/40 focus:border-accent-glow focus:shadow-[var(--shadow-focus)] outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="collectionId" className="text-label text-white font-medium">Collection</label>
              <select 
                name="collectionId" 
                id="collectionId"
                className="w-full h-10 bg-surface-inset border border-border-default rounded-md px-3 text-body text-white focus:border-accent-glow focus:shadow-[var(--shadow-focus)] outline-none appearance-none"
              >
                <option value="">None</option>
                {collections.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="tags" className="text-label text-white font-medium">Tags (comma separated)</label>
              <input 
                type="text" 
                name="tags" 
                id="tags" 
                placeholder="ai, design, react"
                className="w-full h-10 bg-surface-inset border border-border-default rounded-md px-3 text-body text-white placeholder:text-white/40 focus:border-accent-glow focus:shadow-[var(--shadow-focus)] outline-none"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button 
              type="button" 
              onClick={() => dialogRef.current?.close()}
              className="px-4 py-2 text-body text-white/70 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save Resource'}
            </button>
          </div>
        </form>
      </dialog>
    </>
  );
}
