'use client'

import { useState } from 'react';
import { updateTagColor, deleteTag } from '@/server/actions/tags';
import { Palette, Trash2, Loader2 } from 'lucide-react';

const COLORS = [
  '#3B82F6', // Blue
  '#10B981', // Green
  '#F59E0B', // Orange
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#64748B', // Slate
];

export default function TagManager({ initialTags }: { initialTags: any[] }) {
  const [tags, setTags] = useState(initialTags);
  const [loadingId, setLoadingId] = useState<number | null>(null);

  const handleColorChange = async (tagId: number, color: string) => {
    setLoadingId(tagId);
    try {
      await updateTagColor(tagId, color);
      setTags(tags.map(t => t.id === tagId ? { ...t, color } : t));
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingId(null);
    }
  };

  const handleDelete = async (tagId: number) => {
    if (!confirm('Are you sure you want to delete this tag from all resources?')) return;
    
    setLoadingId(tagId);
    try {
      await deleteTag(tagId);
      setTags(tags.filter(t => t.id !== tagId));
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingId(null);
    }
  };

  if (tags.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-body text-text-tertiary">No tags found. Save some resources and add tags to them first!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {tags.map((tag) => (
        <div key={tag.id} className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 border border-border-subtle rounded-lg bg-surface-inset">
          <div className="flex items-center gap-4">
            <div 
              className="w-4 h-4 rounded-full shrink-0 border border-black/20 shadow-sm" 
              style={{ backgroundColor: tag.color || COLORS[0] }} 
            />
            <div>
              <h3 className="text-body font-medium text-text-primary">{tag.name}</h3>
              <p className="text-micro text-text-tertiary">{tag._count.resources} resources</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 p-1.5 bg-surface rounded-md border border-border-default">
              <Palette className="w-4 h-4 text-text-tertiary mx-1" />
              {COLORS.map(c => (
                <button
                  key={c}
                  onClick={() => handleColorChange(tag.id, c)}
                  disabled={loadingId === tag.id}
                  className="w-6 h-6 rounded border border-black/20 hover:scale-110 transition-transform disabled:opacity-50"
                  style={{ backgroundColor: c }}
                  title="Change color"
                />
              ))}
            </div>

            <button 
              onClick={() => handleDelete(tag.id)}
              disabled={loadingId === tag.id}
              className="p-2 text-text-tertiary hover:text-danger-fg hover:bg-danger-bg rounded-md transition-colors disabled:opacity-50"
              title="Delete Tag"
            >
              {loadingId === tag.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
