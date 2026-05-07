'use server'

import { searchResources } from '@/server/queries/analytics';

export async function handleSearch(query: string) {
  return await searchResources(query);
}
