'use client'

import { useState } from 'react';
import { UserProfile, OrganizationProfile, useOrganization } from '@clerk/nextjs';
import { dark } from '@clerk/themes';
import { User, Users, Plus } from 'lucide-react';

export default function SettingsTabs() {
  const [activeTab, setActiveTab] = useState<'profile' | 'org'>('profile');
  const { organization, isLoaded } = useOrganization();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 p-1 bg-surface-inset border border-border-default rounded-xl w-max">
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-body font-medium transition-all ${
            activeTab === 'profile'
              ? 'bg-surface shadow-[var(--shadow-raised)] text-text-primary border border-border-default'
              : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          <User className="w-4 h-4" />
          Personal Profile
        </button>
        <button
          onClick={() => setActiveTab('org')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-body font-medium transition-all ${
            activeTab === 'org'
              ? 'bg-surface shadow-[var(--shadow-raised)] text-text-primary border border-border-default'
              : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          <Users className="w-4 h-4" />
          Organization
        </button>
      </div>

      <div className="relative min-h-[600px]">
        {activeTab === 'profile' && (
          <div className="animate-fade-in">
            <UserProfile 
              routing="hash"
              appearance={{
                baseTheme: dark,
                elements: {
                  rootBox: "w-full mx-auto",
                  card: "bg-surface border border-border-default shadow-[var(--shadow-raised)] rounded-2xl",
                  navbar: "hidden", // Hide clerk sidebar to use our own tab system
                  pageScrollBox: "p-8",
                }
              }}
            />
          </div>
        )}

        {activeTab === 'org' && (
          <div className="animate-fade-in">
            {isLoaded && !organization ? (
              <div className="bg-surface border border-border-default rounded-2xl p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
                <div className="w-16 h-16 rounded-full bg-surface-raised border border-border-default flex items-center justify-center mb-6">
                  <Users className="w-8 h-8 text-text-tertiary" />
                </div>
                <h3 className="text-h3 font-display text-text-primary mb-2">No Active Organization</h3>
                <p className="text-body text-text-secondary max-w-sm mb-8">
                  You are currently using your personal account. Switch to an organization in the sidebar or create a new one to manage team settings.
                </p>
              </div>
            ) : (
              <OrganizationProfile 
                routing="hash"
                appearance={{
                  baseTheme: dark,
                  elements: {
                    rootBox: "w-full mx-auto",
                    card: "bg-surface border border-border-default shadow-[var(--shadow-raised)] rounded-2xl",
                    navbar: "hidden",
                    pageScrollBox: "p-8",
                  }
                }}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
