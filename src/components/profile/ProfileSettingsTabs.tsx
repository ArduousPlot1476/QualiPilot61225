import React, { useState } from 'react';
import { User, Shield, Bell, FileText, Lock } from 'lucide-react';
import { ProfileSettings } from './ProfileSettings';
import { SecuritySettings } from './SecuritySettings';
import { NotificationPreferences } from './NotificationPreferences';
import { CompanyDocuments } from './CompanyDocuments';
import { DataPrivacy } from './DataPrivacy';

interface Tab {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const ProfileSettingsTabs: React.FC = () => {
  const [activeTab, setActiveTab] = useState('profile');
  
  const tabs: Tab[] = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'privacy', label: 'Privacy', icon: Lock }
  ];
  
  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return <ProfileSettings />;
      case 'security':
        return <SecuritySettings />;
      case 'notifications':
        return <NotificationPreferences />;
      case 'documents':
        return <CompanyDocuments />;
      case 'privacy':
        return <DataPrivacy />;
      default:
        return <ProfileSettings />;
    }
  };
  
  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Account Settings</h1>
      
      <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
        <div className="border-b border-slate-200">
          <div className="flex overflow-x-auto">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
                    activeTab === tab.id
                      ? 'text-teal-600 border-b-2 border-teal-500'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Icon className={`h-5 w-5 ${activeTab === tab.id ? 'text-teal-600' : 'text-slate-500'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
      
      {renderTabContent()}
    </div>
  );
};