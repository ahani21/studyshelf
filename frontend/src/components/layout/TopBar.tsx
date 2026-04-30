import { UserButton } from '@clerk/nextjs';
import SearchBar from './SearchBar';

export default function TopBar() {
  return (
    <header className="h-20 border-b border-border-subtle bg-canvas/80 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-10">
      <div className="flex-1 flex items-center gap-4">
        {/* Placeholder breadcrumb */}
        <span className="text-body-lg text-text-secondary font-medium">Dashboard</span>
      </div>

      <div className="flex-1 max-w-md mx-4">
        <SearchBar />
      </div>


      <div className="flex-1 flex justify-end">
        <UserButton 
          appearance={{
            elements: {
              avatarBox: "w-9 h-9 rounded-full border border-border-subtle"
            }
          }}
        />
      </div>
    </header>
  );
}
