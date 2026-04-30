import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';

export async function getReviewQueue() {
  const { userId } = await auth();
  if (!userId) return [];

  const today = new Date();
  today.setHours(23, 59, 59, 999);

  // Fetch resource-based SRS items
  const resourceItems = await prisma.sRSData.findMany({
    where: { resource: { userId }, dueDate: { lte: today } },
    include: { resource: { include: { tags: { include: { tag: true } } } } },
    orderBy: [{ dueDate: 'asc' }, { easeFactor: 'asc' }]
  });

  // Fetch flashcard-based SRS items
  const flashcardItems = await prisma.sRSData.findMany({
    where: { flashcard: { userId }, dueDate: { lte: today } },
    include: { flashcard: true },
    orderBy: [{ dueDate: 'asc' }, { easeFactor: 'asc' }]
  });

  // Normalize into a unified queue format
  const resources = resourceItems
    .filter(item => item.resource)
    .map(item => ({
      type: 'resource' as const,
      srsId: item.id,
      interval: item.interval,
      easeFactor: item.easeFactor.toNumber(),
      skipCount: item.skipCount,
      resource: item.resource!
    }));

  const flashcards = flashcardItems
    .filter(item => item.flashcard)
    .map(item => ({
      type: 'flashcard' as const,
      srsId: item.id,
      interval: item.interval,
      easeFactor: item.easeFactor.toNumber(),
      skipCount: item.skipCount,
      flashcard: item.flashcard!
    }));

  // Resources first, then flashcards
  return [...resources, ...flashcards];
}
