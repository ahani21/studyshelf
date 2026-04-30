import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isProtected = createRouteMatcher([
  '/dashboard(.*)',
  '/shelf(.*)',
  '/review(.*)',
  '/collections(.*)',
  '/analytics(.*)',
  '/import(.*)'
]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtected(req)) {
      await auth.protect();
  }
});

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};
