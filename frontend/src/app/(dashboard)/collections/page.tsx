import { getUserCollections } from '@/server/queries/shelf';
import { FolderOpen } from 'lucide-react';

export default async function CollectionsPage() {
  const collections = await getUserCollections();

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-display-lg font-display text-text-primary flex items-center gap-3">
          <FolderOpen className="w-8 h-8 text-accent-glow" />
          Collections
        </h1>
        <p className="text-body-lg text-text-secondary mt-1">
          Organize your knowledge base.
        </p>
      </header>

      <div className="flex flex-col md:flex-row gap-6 min-h-[60vh]">
        {/* Left Tree Pane */}
        <div className="w-full md:w-[300px] border border-border-default bg-surface rounded-xl p-4 shrink-0">
          <h3 className="text-label text-text-tertiary mb-4">HIERARCHY</h3>
          <div className="space-y-1">
            {collections.map(c => (
              <button key={c.id} className="w-full text-left px-3 py-2 rounded-md text-body hover:bg-surface-inset text-text-secondary hover:text-text-primary flex items-center gap-2">
                <FolderOpen className="w-4 h-4" />
                {c.name}
              </button>
            ))}
            {collections.length === 0 && (
              <p className="text-body-sm text-text-tertiary">No collections yet.</p>
            )}
          </div>
        </div>

        {/* Right Resource Pane */}
        <div className="flex-1 border border-border-default bg-surface-inset rounded-xl flex items-center justify-center p-8">
          <div className="text-center">
            <FolderOpen className="w-12 h-12 text-border-default mx-auto mb-4" />
            <h3 className="text-h4 font-display text-text-primary mb-2">Select a collection</h3>
            <p className="text-body text-text-secondary">Choose a collection from the sidebar to view its resources.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
