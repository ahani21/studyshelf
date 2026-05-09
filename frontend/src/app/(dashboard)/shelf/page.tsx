import { getUserShelf, getUserCollections } from '@/server/queries/shelf';
import ResourceCard from '@/components/shelf/ResourceCard';
import SaveResourceModal from '@/components/shelf/SaveResourceModal';
import FilterBar from '@/components/shelf/FilterBar';
import { BookMarked } from 'lucide-react';

export default async function ShelfPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; collectionId?: string }>;
}) {
  const { q, status, collectionId } = await searchParams;
  const [resources, collections] = await Promise.all([
    getUserShelf(q, status, collectionId),
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
            {q || status || collectionId ? `${resources.length} results found.` : `${resources.length} resources saved.`}
          </p>
        </div>
        
        <SaveResourceModal collections={collections} />
      </header>

      <FilterBar collections={collections} />

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
