import SettingsTabs from '@/components/settings/SettingsTabs';
import { Settings as SettingsIcon } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12">
      <header>
        <h1 className="text-display-lg font-display text-text-primary flex items-center gap-3">
          <SettingsIcon className="w-8 h-8 text-accent-glow" />
          Settings
        </h1>
        <p className="text-body-lg text-text-secondary mt-1">
          Manage your personal profile and organization settings.
        </p>
      </header>

      <SettingsTabs />
    </div>
  );
}
