import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { ReactNode } from 'react';

interface RoleGuardProps {
  children: ReactNode;
  allowedRoles?: ('admin' | 'member' | 'viewer')[];
}

export default async function RoleGuard({ children, allowedRoles }: RoleGuardProps) {
  const { sessionClaims } = await auth();
  
  // Default to member if role is not set in public metadata
  const userRole = (sessionClaims?.role as string) || 'member';

  if (allowedRoles && !allowedRoles.includes(userRole as any)) {
    redirect('/403');
  }

  return <>{children}</>;
}
