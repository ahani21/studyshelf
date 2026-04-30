import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';

export async function getAnalytics() {
  const { userId } = await auth();
  if (!userId) return null;

  const totalResources = await prisma.resource.count({ where: { userId } });
  
  const srsItems = await prisma.sRSData.findMany({
    where: { resource: { userId } },
    select: {
      reviewCount: true,
      easeFactor: true,
      dueDate: true
    }
  });

  const totalReviews = srsItems.reduce((acc, curr) => acc + curr.reviewCount, 0);
  const masteredItems = srsItems.filter(s => s.easeFactor.toNumber() > 2.8).length;
  
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  const overdueItems = srsItems.filter(s => s.dueDate <= today).length;

  return {
    totalResources,
    totalReviews,
    masteredItems,
    overdueItems,
    averageEase: srsItems.length ? srsItems.reduce((acc, c) => acc + c.easeFactor.toNumber(), 0) / srsItems.length : 0
  };
}
