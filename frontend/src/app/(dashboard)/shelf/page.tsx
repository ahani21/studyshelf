import { getUserShelf, getUserCollections } from '@/server/queries/shelf';
import ResourceCard from '@/components/shelf/ResourceCard';
import SaveResourceModal from '@/components/shelf/SaveResourceModal';
import { BookMarked } from 'lucide-react';

export default async function ShelfPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const [resources, collections] = await Promise.all([
    getUserShelf(q),
    getUserCollections()
  ]);


  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-display-lg font-display text-text-primary flex items-center gap-3">
            <BookMarked className="w-8 h-8 text-accent-glow" />
            {q ? `Search: ${q}` : 'My Shelf'}
          </h1>
          <p className="text-body-lg text-text-secondary mt-1">
            {q ? `${resources.length} results found.` : `${resources.length} resources saved.`}
          </p>
        </div>
        
        <SaveResourceModal collections={collections} />
      </header>

      {/* FilterBar Stub */}
      <div className="flex items-center gap-3 p-2 bg-surface-inset border border-border-default rounded-lg">
        <input 
          type="text" 
          placeholder="Filter by title or tag..." 
          className="flex-1 bg-transparent px-3 text-body outline-none placeholder:text-text-tertiary text-text-primary"
        />
        <div className="w-px h-6 bg-border-default" />
        <button className="px-4 py-1.5 text-body-sm text-text-secondary hover:text-text-primary">Status</button>
        <button className="px-4 py-1.5 text-body-sm text-text-secondary hover:text-text-primary">Collection</button>
      </div>

      {resources.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-border-default rounded-2xl bg-surface-inset">
          <BookMarked className="w-12 h-12 text-text-tertiary mb-4" />
          <h3 className="text-h3 font-display text-text-primary mb-2">
            {q ? "No results found" : "Your shelf is empty"}
          </h3>
          <p className="text-body text-text-secondary max-w-md">
            {q ? `No resources match "${q}". Try a different keyword.` : "Click 'Save Resource' above to add your first article, video, or paper to StudyShelf."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {resources.map((res: any) => (
            <ResourceCard key={res.id} resource={res} />
          ))}
        </div>
      )}
    </div>
  );
}
