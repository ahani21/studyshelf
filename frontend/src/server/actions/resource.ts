'use server'

import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';
import { cleanUrl } from '@/lib/url';
import { fetchMetadata } from '@/lib/metadata';
import { revalidatePath } from 'next/cache';

export async function saveResourceAction(formData: FormData) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const rawUrl = formData.get('url') as string;
  if (!rawUrl) throw new Error("URL is required");

  // Lazy-initialize the user in our database if Clerk hasn't synced them yet
  await prisma.user.upsert({
    where: { id: userId },
    update: {},
    create: {
      id: userId,
      email: `${userId}@studyshelf.app`,
      role: 'member'
    }
  });

  const canonicalUrl = cleanUrl(rawUrl);

  // Check for duplicate to strictly enforce spec
  const existing = await prisma.resource.findUnique({
    where: {
      userId_canonicalUrl: {
        userId,
        canonicalUrl
      }
    }
  });

  if (existing) {
    return { error: "This URL is already in your shelf." };
  }

  // Fetch OpenGraph metadata
  const meta = await fetchMetadata(canonicalUrl);
  
  // Use user-provided title or fallback to OG title, or domain as last resort
  const userTitle = formData.get('title') as string;
  let domain = canonicalUrl;
  try {
    domain = new URL(canonicalUrl).hostname;
  } catch (e) {}
  
  const finalTitle = userTitle || meta.title || domain;

  // Insert resource
  const resource = await prisma.resource.create({
    data: {
      url: rawUrl,
      canonicalUrl,
      title: finalTitle.substring(0, 255), // Enforce DB limits
      description: meta.description,
      imageUrl: meta.image,
      userId
    }
  });

  // Automatically initialize Spaced Repetition (SRS) data for this new resource
  // It will immediately be due today.
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const srsData = await prisma.sRSData.create({
    data: {
      resourceId: resource.id,
      interval: 1,
      easeFactor: 2.50,
      dueDate: today,
      reviewCount: 0,
      skipCount: 0
    }
  });

  // Link SRS data to resource
  await prisma.resource.update({
    where: { id: resource.id },
    data: { srsId: srsData.id }
  });

  // Handle Tags if provided (comma separated)
  const tagsStr = formData.get('tags') as string;
  if (tagsStr) {
    const tags = tagsStr.split(',').map(t => t.trim().toLowerCase()).filter(t => t);
    for (const tagName of tags) {
      const tag = await prisma.tag.upsert({
        where: { name: tagName },
        update: {},
        create: { name: tagName, color: 'var(--accent-glow)' } 
      });

      await prisma.resourceTag.create({
        data: {
          resourceId: resource.id,
          tagId: tag.id,
          source: 'manual'
        }
      });
    }
  }

  const collectionIdStr = formData.get('collectionId') as string;
  if (collectionIdStr) {
    const collectionId = parseInt(collectionIdStr, 10);
    await prisma.resourceCollection.create({
      data: {
        resourceId: resource.id,
        collectionId
      }
    });
  }

  // Revalidate frontend caches
  revalidatePath('/shelf');
  revalidatePath('/collections');
  revalidatePath('/dashboard');

  return { success: true, resourceId: resource.id };
}

export async function deleteResourceAction(id: number) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const resource = await prisma.resource.findUnique({ where: { id } });
  if (!resource || resource.userId !== userId) throw new Error("Not found");

  await prisma.resource.delete({ where: { id } });
  
  revalidatePath('/shelf');
  revalidatePath('/dashboard');
  revalidatePath('/review');
}
