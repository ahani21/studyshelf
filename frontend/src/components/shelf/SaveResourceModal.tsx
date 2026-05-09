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
        <div className="p-6 border-b border-border-default flex justify-between items-center bg-surface">
          <h2 className="text-display-sm font-display text-text-primary">Save to Shelf</h2>
          <button onClick={() => dialogRef.current?.close()} className="text-text-tertiary hover:text-text-primary transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form action={handleSubmit} className="p-6 space-y-5 bg-surface">
          {error && (
            <div className="p-3 bg-danger-bg border border-danger-border text-danger-fg text-body-sm rounded-md">
              {error}
            </div>
          )}
          
          <div className="space-y-1.5">
            <label htmlFor="url" className="text-label text-text-secondary font-medium">URL *</label>
            <input 
              required
              type="url" 
              name="url" 
              id="url" 
              placeholder="https://..."
              className="w-full h-10 bg-white border border-border-strong rounded-md px-3 text-body text-text-primary placeholder:text-text-muted focus:border-primary-accent focus:ring-2 focus:ring-light-purple-fill outline-none transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="title" className="text-label text-text-secondary font-medium">Custom Title (Optional)</label>
            <input 
              type="text" 
              name="title" 
              id="title" 
              placeholder="Leave blank to auto-fetch..."
              className="w-full h-10 bg-white border border-border-strong rounded-md px-3 text-body text-text-primary placeholder:text-text-muted focus:border-primary-accent focus:ring-2 focus:ring-light-purple-fill outline-none transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="collectionId" className="text-label text-text-secondary font-medium">Collection</label>
              <div className="relative">
                <select 
                  name="collectionId" 
                  id="collectionId"
                  className="w-full h-10 bg-white border border-border-strong rounded-md px-3 text-body text-text-primary focus:border-primary-accent focus:ring-2 focus:ring-light-purple-fill outline-none appearance-none transition-all"
                >
                  <option value="">None</option>
                  {collections.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-text-tertiary">
                  <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="tags" className="text-label text-text-secondary font-medium">Tags (comma separated)</label>
              <input 
                type="text" 
                name="tags" 
                id="tags" 
                placeholder="ai, design, react"
                className="w-full h-10 bg-white border border-border-strong rounded-md px-3 text-body text-text-primary placeholder:text-text-muted focus:border-primary-accent focus:ring-2 focus:ring-light-purple-fill outline-none transition-all"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button 
              type="button" 
              onClick={() => dialogRef.current?.close()}
              className="px-4 py-2 text-body text-text-secondary hover:text-text-primary transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="px-6 py-2 bg-primary-accent text-white rounded-md font-medium hover:bg-primary-accent/90 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save Resource'}
            </button>
          </div>
        </form>
      </dialog>
    </>
  );
}
