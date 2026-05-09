import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';

export async function getUserShelf(query?: string, status?: string, collectionId?: string) {
  const { userId } = await auth();
  if (!userId) return [];

  const where: any = { userId };

  if (query) {
    where.OR = [
      { title: { contains: query, mode: 'insensitive' } },
      { description: { contains: query, mode: 'insensitive' } },
      { tags: { some: { tag: { name: { contains: query, mode: 'insensitive' } } } } }
    ];
  }

  if (collectionId && collectionId !== 'all') {
    where.collections = { some: { collectionId: parseInt(collectionId) } };
  }

  if (status && status !== 'all') {
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    if (status === 'due') {
      where.srsData = { is: { dueDate: { lte: today } } };
    } else if (status === 'mastered') {
      where.srsData = { is: { masteryLevel: { gte: 0.8 } } };
    } else if (status === 'learning') {
      where.srsData = { is: { masteryLevel: { lt: 0.8 }, reviewCount: { gt: 0 } } };
    }
  }

  const resources = await prisma.resource.findMany({
    where,
    include: {
      srsData: true,
      tags: {
        include: {
          tag: true
        }
      },
      collections: {
        include: {
          collection: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  return resources;
}

export async function getUserCollections() {
  const { userId, orgId } = await auth();
  if (!userId) return [];

  const collections = await prisma.collection.findMany({
    where: {
      userId
    },
    orderBy: {
      name: 'asc'
    }
  });

  return collections;
}
