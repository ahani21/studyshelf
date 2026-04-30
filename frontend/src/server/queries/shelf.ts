import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';

export async function getUserShelf(query?: string) {
  const { userId } = await auth();
  if (!userId) return [];

  const resources = await prisma.resource.findMany({
    where: {
      userId,
      OR: query ? [
        { title: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
        { tags: { some: { tag: { name: { contains: query, mode: 'insensitive' } } } } }
      ] : undefined
    },
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
