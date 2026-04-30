import { getReviewQueue } from '@/server/queries/review';
import ReviewInterface from '@/components/review/ReviewInterface';
import { Brain } from 'lucide-react';

export default async function ReviewPage() {
  const queue = await getReviewQueue();

  return (
    <div className="space-y-8">
      <header className="mb-4">
        <h1 className="text-display-lg font-display text-text-primary flex items-center gap-3">
          <Brain className="w-8 h-8 text-accent-glow" />
          Review Queue
        </h1>
      </header>

      <ReviewInterface initialQueue={queue} />
    </div>
  );
}
