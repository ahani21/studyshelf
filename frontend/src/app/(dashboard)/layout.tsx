import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-canvas">
      <Sidebar />
      <main className="flex-1 min-h-screen bg-[#F8F9FA] overflow-y-auto overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}
