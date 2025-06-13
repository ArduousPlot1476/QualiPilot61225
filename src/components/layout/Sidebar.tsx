import React from 'react';
import {
  LayoutDashboard,
  MessageCircle,
  FileText,
  Settings,
  Shield,
  BookOpen,
  BarChart3,
  Users,
  Bell
} from 'lucide-react';
import { useAppStore } from '../../store/appStore';

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  route: string;
  badge?: number;
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, route: '/dashboard' },
  { id: 'chat', label: 'AI Assistant', icon: MessageCircle, route: '/chat', badge: 2 },
  { id: 'documents', label: 'Regulatory Docs', icon: FileText, route: '/documents' },
  { id: 'compliance', label: 'Compliance', icon: Shield, route: '/compliance' },
  { id: 'guidance', label: 'Guidance Library', icon: BookOpen, route: '/guidance' },
  { id: 'analytics', label: 'Analytics', icon: BarChart3, route: '/analytics' },
  { id: 'team', label: 'Team', icon: Users, route: '/team' },
  { id: 'notifications', label: 'Notifications', icon: Bell, route: '/notifications', badge: 5 },
  { id: 'settings', label: 'Settings', icon: Settings, route: '/settings' }
];

export const Sidebar: React.FC = () => {
  const { sidebarCollapsed, currentRoute, setCurrentRoute } = useAppStore();

  return (
    <div className={`
      ${sidebarCollapsed ? 'w-16' : 'w-80'} 
      bg-white border-r border-gray-200 shadow-sm transition-all duration-300 ease-in-out
      flex flex-col
    `}>
      {/* Navigation */}
      <nav className="flex-1 pt-6 pb-4">
        <div className="px-3 space-y-1">
          {navItems.map((item) => {
            const isActive = currentRoute === item.route;
            const Icon = item.icon;
            
            return (
              <button
                key={item.id}
                onClick={() => setCurrentRoute(item.route)}
                className={`
                  group flex items-center w-full px-3 py-2.5 text-sm font-medium rounded-lg
                  transition-all duration-200 ease-in-out
                  ${isActive 
                    ? 'bg-primary text-white shadow-md' 
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }
                `}
              >
                <Icon className={`
                  ${sidebarCollapsed ? 'h-6 w-6' : 'h-5 w-5'} 
                  ${isActive ? 'text-white' : 'text-gray-500 group-hover:text-gray-700'}
                  transition-colors duration-200
                `} />
                
                {!sidebarCollapsed && (
                  <>
                    <span className="ml-3 truncate">{item.label}</span>
                    {item.badge && (
                      <span className={`
                        ml-auto inline-flex items-center justify-center px-2 py-1 text-xs font-bold rounded-full
                        ${isActive ? 'bg-white text-primary' : 'bg-accent text-white'}
                      `}>
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      {!sidebarCollapsed && (
        <div className="p-4 border-t border-gray-200">
          <div className="bg-gradient-to-r from-primary to-teal-700 rounded-lg p-4 text-white">
            <div className="flex items-center space-x-3">
              <div className="bg-white/20 rounded-full p-2">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium">Compliance Score</p>
                <p className="text-lg font-bold">94%</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};