import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';
import { Tag as TagIcon } from 'lucide-react';
import TagManager from '@/components/tags/TagManager';

export default async function TagsPage() {
  const { userId } = await auth();
  if (!userId) return null;

  // Since Tag doesn't have a userId, we fetch tags that are attached to this user's resources
  const userTags = await prisma.tag.findMany({
    where: {
      resources: {
        some: {
          resource: {
            userId
          }
        }
      }
    },
    include: {
      _count: {
        select: { resources: true }
      }
    },
    orderBy: {
      name: 'asc'
    }
  });

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      <header>
        <h1 className="text-display-lg font-display text-text-primary flex items-center gap-3">
          <TagIcon className="w-8 h-8 text-accent-glow" />
          Tags
        </h1>
        <p className="text-body-lg text-text-secondary mt-1">
          Manage and organize your knowledge graph.
        </p>
      </header>

      <div className="card bg-surface border border-border-default rounded-xl shadow-[var(--shadow-raised)] p-6">
        <TagManager initialTags={userTags} />
      </div>
    </div>
  );
}
