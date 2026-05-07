import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';
import { startOfDay, endOfDay, subDays, format } from 'date-fns';

export async function getDashboardStats() {
  const { userId } = await auth();
  if (!userId) return null;

  const today = new Date();
  today.setHours(23, 59, 59, 999);

  // 1. Cards Due
  const cardsDue = await prisma.sRSData.count({
    where: {
      OR: [
        { resource: { userId } },
        { flashcard: { userId } }
      ],
      dueDate: { lte: today }
    }
  });

  // 2. Mastered (SRS items with easeFactor > 2.8 or reviewCount > 5)
  const masteredCount = await prisma.sRSData.count({
    where: {
      OR: [
        { resource: { userId } },
        { flashcard: { userId } }
      ],
      reviewCount: { gt: 5 }
    }
  });

  // 3. Collections Count
  const collectionsCount = await prisma.collection.count({
    where: { userId }
  });

  const totalResources = await prisma.resource.count({
    where: { userId }
  });

  // 4. Study Time (last 7 days)
  const lastWeek = subDays(new Date(), 7);
  const sessions = await prisma.studySession.findMany({
    where: { userId, startTime: { gte: lastWeek } }
  });
  const totalSeconds = sessions.reduce((acc, s) => acc + (s.duration || 0), 0);
  const studyTimeHours = (totalSeconds / 3600).toFixed(1);

  // 5. Review Streak
  const logs = await prisma.activityLog.findMany({
    where: { userId, type: 'REVIEW' },
    orderBy: { createdAt: 'desc' },
    select: { createdAt: true }
  });
  let reviewStreak = 0;
  if (logs.length > 0) {
    const uniqueDates = Array.from(new Set(logs.map(l => format(l.createdAt, 'yyyy-MM-dd'))));
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const yesterdayStr = format(subDays(new Date(), 1), 'yyyy-MM-dd');
    if (uniqueDates.includes(todayStr) || uniqueDates.includes(yesterdayStr)) {
      let currentDate = uniqueDates.includes(todayStr) ? new Date() : subDays(new Date(), 1);
      for (let i = 0; i < uniqueDates.length; i++) {
        const expectedDateStr = format(subDays(currentDate, i), 'yyyy-MM-dd');
        if (uniqueDates.includes(expectedDateStr)) {
          reviewStreak++;
        } else {
          break;
        }
      }
    }
  }

  return {
    cardsDue,
    masteredCount,
    collectionsCount,
    totalResources,
    studyTimeHours,
    reviewStreak
  };
}

export async function getWeeklyActivity() {
  const { userId } = await auth();
  if (!userId) return [];

  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = subDays(new Date(), i);
    const start = startOfDay(d);
    const end = endOfDay(d);

    const count = await prisma.activityLog.count({
      where: {
        userId,
        type: 'REVIEW',
        createdAt: { gte: start, lte: end }
      }
    });

    days.push({
      day: format(d, 'eee')[0], // M, T, W...
      count,
      val: Math.min(100, (count / 20) * 100) // Scale to 20 reviews for 100%
    });
  }

  return days;
}

export async function getUpcomingQueue() {
  const { userId } = await auth();
  if (!userId) return [];

  const items = await prisma.sRSData.findMany({
    where: {
      OR: [{ resource: { userId } }, { flashcard: { userId } }]
    },
    include: {
      resource: true,
      flashcard: true
    },
    orderBy: { dueDate: 'asc' },
    take: 4
  });

  return items.map(item => {
    const isFlashcard = !!item.flashcard;
    const title = isFlashcard ? item.flashcard?.front : item.resource?.title;
    const sub = isFlashcard ? 'Flashcard' : 'Article';
    const tag = item.dueDate <= new Date() ? 'Due now' : `In ${Math.ceil((item.dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days`;

    return {
      type: isFlashcard ? 'Flashcard' : 'Article',
      title: title || 'Untitled',
      sub: sub,
      tag: tag,
      isDue: item.dueDate <= new Date()
    };
  });
}

export async function getAnalytics() {
  const { userId } = await auth();
  if (!userId) return null;

  const stats = await getDashboardStats();
  if (!stats) return null;

  const totalReviews = await prisma.activityLog.count({
    where: { userId, type: 'REVIEW' }
  });

  return {
    totalResources: stats.totalResources,
    overdueItems: stats.cardsDue,
    masteredItems: stats.masteredCount,
    totalReviews: totalReviews,
    averageEase: 2.5 // Mock for compatibility
  };
}

export async function searchResources(query: string) {
  const { userId } = await auth();
  if (!userId || !query) return [];

  const [resources, flashcards] = await Promise.all([
    prisma.resource.findMany({
      where: { userId, title: { contains: query, mode: 'insensitive' } },
      take: 3
    }),
    prisma.flashcard.findMany({
      where: { userId, front: { contains: query, mode: 'insensitive' } },
      take: 3
    })
  ]);

  return [
    ...resources.map(r => ({ id: r.id, title: r.title, sub: 'Article', type: 'resource' })),
    ...flashcards.map(f => ({ id: f.id, title: f.front, sub: 'Flashcard', type: 'flashcard' }))
  ];
}

export async function getTodaysGoals() {
  const { userId } = await auth();
  if (!userId) return [];

  const today = new Date();
  const start = startOfDay(today);
  const end = endOfDay(today);

  const reviewsToday = await prisma.activityLog.count({
    where: { userId, type: 'REVIEW', createdAt: { gte: start, lte: end } }
  });
  
  const itemsDue = await prisma.sRSData.count({
    where: {
      OR: [{ resource: { userId } }, { flashcard: { userId } }],
      dueDate: { lte: end }
    }
  });

  const totalToReview = reviewsToday + itemsDue;
  const reviewProgress = totalToReview > 0 ? Math.round((reviewsToday / totalToReview) * 100) : 100;
  
  const uploadsToday = await prisma.resource.count({
    where: { userId, createdAt: { gte: start, lte: end } }
  });
  const uploaded = uploadsToday > 0;

  return [
    { 
      label: 'Review items', 
      val: totalToReview === 0 ? 100 : reviewProgress, 
      text: totalToReview === 0 ? 'Done' : `${reviewsToday} / ${totalToReview}`, 
      color: totalToReview > 0 && reviewsToday >= totalToReview ? 'bg-[#1D9E75]' : 'bg-[#7F77DD]',
      success: totalToReview === 0 || reviewsToday >= totalToReview
    },
    { 
      label: 'Upload a resource', 
      val: uploaded ? 100 : 0, 
      text: uploaded ? 'Done' : '0 / 1', 
      color: uploaded ? 'bg-[#1D9E75]' : 'bg-[#7F77DD]',
      success: uploaded
    }
  ];
}

