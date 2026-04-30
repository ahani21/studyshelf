import RoleGuard from '@/components/auth/RoleGuard';

export default function ForbiddenPage() {
  return (
    <RoleGuard allowedRoles={['admin', 'member', 'viewer']}>
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center max-w-md mx-auto">
        <div className="w-16 h-16 rounded-full bg-danger-bg flex items-center justify-center mb-6">
          <svg className="w-8 h-8 text-danger-fg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h1 className="text-display-sm font-display text-text-primary mb-4">Access Denied</h1>
        <p className="text-body-lg text-text-secondary mb-8">
          You don't have permission to view this page. This area is restricted to Organization Administrators.
        </p>
        <a href="/dashboard" className="btn-primary">
          Return to Dashboard
        </a>
      </div>
    </RoleGuard>
  );
}
