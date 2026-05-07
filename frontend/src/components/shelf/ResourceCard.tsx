'use client'

import { useState } from 'react';
import { ExternalLink, Clock, Trash2, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { deleteResourceAction } from '@/server/actions/resource';

export default function ResourceCard({ resource }: { resource: any }) {
  const [isDeleting, setIsDeleting] = useState(false);
  // Use domain as fallback if description isn't available
  let domain = "";
  try {
    domain = new URL(resource.canonicalUrl).hostname;
  } catch(e) {}

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (confirm("Are you sure you want to delete this resource?")) {
      setIsDeleting(true);
      try {
        await deleteResourceAction(resource.id);
      } catch (err) {
        console.error("Failed to delete", err);
        setIsDeleting(false);
      }
    }
  };

  return (
    <div className={`card group relative flex flex-col h-[320px] overflow-hidden hover:-translate-y-1 transition-all duration-300 border border-border-default bg-surface hover:border-border-subtle hover:shadow-[var(--shadow-raised)] rounded-xl ${isDeleting ? 'opacity-50 pointer-events-none' : ''}`}>
      
      {/* Delete Button */}
      <button 
        onClick={handleDelete}
        className="absolute top-3 right-3 z-10 p-2 bg-surface/80 backdrop-blur-sm border border-border-default rounded-full text-text-tertiary opacity-0 group-hover:opacity-100 transition-opacity hover:bg-danger-bg hover:text-danger-fg hover:border-danger-border shadow-sm"
        title="Delete resource"
      >
        {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
      </button>

      {/* Thumbnail */}
      <div className="h-32 w-full bg-surface-inset border-b border-border-default relative shrink-0 overflow-hidden">
        {resource.imageUrl ? (
          <img src={resource.imageUrl} alt="" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-border-default">
            <ExternalLink className="w-8 h-8 opacity-20" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-4 mb-2">
          <h3 className="text-h4 font-display text-text-primary line-clamp-2 leading-tight flex-1">
            {resource.title}
          </h3>
          <a 
            href={resource.canonicalUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-text-tertiary hover:text-accent-glow mt-1"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>

        {/* Tags */}
        {resource.tags && resource.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-2">
            {resource.tags.map((rt: any) => (
              <span 
                key={rt.tag.id} 
                className="px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider rounded text-white border border-black/20 shadow-sm"
                style={{ backgroundColor: rt.tag.color || '#3B82F6' }}
              >
                {rt.tag.name}
              </span>
            ))}
          </div>
        )}
        
        <p className="text-body-sm text-text-secondary line-clamp-2 mb-4 flex-1">
          {resource.description || domain}
        </p>

        {/* Footer */}
        <div className="mt-auto pt-4 border-t border-border-subtle flex items-center justify-between">
          <div className="flex items-center gap-2">
            {resource.srsData ? (
              <span className="px-2 py-0.5 text-micro rounded-full bg-success-bg text-success-fg border border-success-border">
                {resource.srsData.interval}d interval
              </span>
            ) : (
              <span className="px-2 py-0.5 text-micro rounded-full bg-surface-raised text-text-tertiary border border-border-default">
                No SRS
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-1.5 text-text-tertiary">
            <Clock className="w-3.5 h-3.5" />
            <span className="text-micro">{formatDistanceToNow(new Date(resource.createdAt), { addSuffix: true })}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
