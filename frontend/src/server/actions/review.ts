'use server' // Cache buster: 1

import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';
import { addDays } from 'date-fns';
import { revalidatePath } from 'next/cache';

export async function rateItem(srsId: number, rating: 'again' | 'hard' | 'good' | 'easy') {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  
  const srs = await prisma.sRSData.findUnique({ 
    where: { id: srsId },
    include: { resource: true, flashcard: true }
  });
  
  if (!srs) throw new Error("SRS data not found");
  
  // Verify ownership
  if (srs.resource && srs.resource.userId !== userId) throw new Error("Forbidden");
  if (srs.flashcard && srs.flashcard.userId !== userId) throw new Error("Forbidden");

  let { interval, easeFactor, lapses, repetitions } = srs;
  const oldEase = easeFactor.toNumber();
  let newEase = oldEase;

  switch (rating) {
    case 'again':
      interval = 1;
      newEase = Math.max(1.30, oldEase - 0.20);
      lapses += 1;
      repetitions = 0;
      break;
    case 'hard':
      interval = Math.round(interval * 1.2);
      newEase = Math.max(1.30, oldEase - 0.15);
      repetitions += 1;
      break;
    case 'good':
      interval = Math.round(interval * oldEase);
      repetitions += 1;
      break;
    case 'easy':
      interval = Math.round(interval * oldEase * 1.3);
      newEase = Math.min(4.0, oldEase + 0.15);
      repetitions += 1;
      break;
  }

  // Cap interval between 1 and 365 days
  interval = Math.min(365, Math.max(1, interval));
  const dueDate = addDays(new Date(), interval);
  
  const masteryLevel = Math.min(1.0, (repetitions * 0.1) + ((newEase - 1.3) * 0.1));
  const retentionScore = 1.0 - (lapses / Math.max(1, lapses + repetitions));
  
  await prisma.sRSData.update({
    where: { id: srsId },
    data: {
      interval,
      easeFactor: newEase,
      dueDate,
      lastReviewed: new Date(),
      skipCount: 0,
      reviewCount: { increment: 1 },
      lapses,
      repetitions,
      masteryLevel,
      retentionScore,
      lastRating: rating.toUpperCase()
    }
  });

  revalidatePath('/review');
  revalidatePath('/shelf');
  revalidatePath('/dashboard');
  
  return { success: true, newInterval: interval };
}

export async function skipItem(srsId: number) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  
  const srs = await prisma.sRSData.findUnique({ 
    where: { id: srsId },
    include: { resource: true, flashcard: true }
  });
  
  if (!srs) throw new Error("SRS data not found");
  if (srs.resource && srs.resource.userId !== userId) throw new Error("Forbidden");
  if (srs.flashcard && srs.flashcard.userId !== userId) throw new Error("Forbidden");

  const newSkipCount = srs.skipCount + 1;

  await prisma.sRSData.update({
    where: { id: srsId },
    data: { skipCount: newSkipCount }
  });

  revalidatePath('/review');
  return { skipCount: newSkipCount };
}

export async function archiveItem(srsId: number) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  
  // We just delete the SRS record to stop tracking it
  await prisma.sRSData.delete({
    where: { id: srsId }
  });

  revalidatePath('/review');
  revalidatePath('/shelf');
  return { success: true };
}

export async function deleteReviewResource(resourceId: number) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  
  await prisma.resource.delete({
    where: { id: resourceId, userId }
  });

  revalidatePath('/review');
  revalidatePath('/shelf');
  return { success: true };
}

export async function deleteReviewFlashcard(flashcardId: number) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  
  await prisma.flashcard.delete({
    where: { id: flashcardId, userId }
  });

  revalidatePath('/review');
  return { success: true };
}

