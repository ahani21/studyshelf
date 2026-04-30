'use server'

import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function updateTagColor(tagId: number, color: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  await prisma.tag.update({
    where: { id: tagId },
    data: { color }
  });

  revalidatePath('/tags');
  revalidatePath('/shelf');
  revalidatePath('/review');
  return { success: true };
}

export async function deleteTag(tagId: number) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  await prisma.tag.delete({
    where: { id: tagId }
  });

  revalidatePath('/tags');
  revalidatePath('/shelf');
  revalidatePath('/review');
  return { success: true };
}
