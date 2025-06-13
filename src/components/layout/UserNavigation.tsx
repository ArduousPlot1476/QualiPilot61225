import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider';
import { User, Building, Settings, LogOut, ChevronDown, Shield, Moon, Sun } from 'lucide-react';
import { TransitionWrapper } from '../ui/TransitionWrapper';
import { FocusableElement } from '../ui/FocusableElement';

export const UserNavigation: React.FC = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user, userProfile, signOut } = useAuth();
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle keyboard navigation
  useEffect(() => {
    if (!isDropdownOpen) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsDropdownOpen(false);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDropdownOpen]);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    // TODO: Implement actual dark mode toggle
  };

  const getInitials = (email: string) => {
    return email.split('@')[0].slice(0, 2).toUpperCase();
  };

  const getCompanyName = () => {
    return userProfile?.company_info?.company_name || 'Your Company';
  };

  const navigateToProfile = () => {
    setIsDropdownOpen(false);
    navigate('/settings');
  };

  if (!user) {
    return null;
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* User Menu Button */}
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex items-center space-x-3 p-2 rounded-lg hover:bg-slate-100 transition-colors duration-200 focus-ring hover-scale"
        aria-expanded={isDropdownOpen}
        aria-haspopup="menu"
      >
        {/* Profile Picture */}
        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
          {getInitials(user.email || '')}
        </div>
        
        {/* User Info */}
        <div className="hidden md:block text-left">
          <p className="text-sm font-medium text-slate-900 truncate max-w-32">
            {user.email?.split('@')[0]}
          </p>
          <p className="text-xs text-slate-500 truncate max-w-32">
            {getCompanyName()}
          </p>
        </div>
        
        {/* Dropdown Arrow */}
        <ChevronDown className={`h-4 w-4 text-slate-500 transition-transform duration-200 ${
          isDropdownOpen ? 'rotate-180' : ''
        }`} />
      </button>

      {/* Dropdown Menu */}
      <TransitionWrapper
        show={isDropdownOpen}
        enter="transition-all duration-200"
        enterFrom="opacity-0 transform scale-95"
        enterTo="opacity-100 transform scale-100"
        leave="transition-all duration-150"
        leaveFrom="opacity-100 transform scale-100"
        leaveTo="opacity-0 transform scale-95"
      >
        <div 
          className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-slate-200 py-2 z-50"
          role="menu"
        >
          {/* User Info Header */}
          <div className="px-4 py-3 border-b border-slate-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium hover-scale transition-transform-150">
                {getInitials(user.email || '')}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate">
                  {user.email}
                </p>
                <p className="text-xs text-slate-500 truncate">
                  {getCompanyName()}
                </p>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            <FocusableElement
              className="w-full flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 transition-colors duration-200"
              onClick={navigateToProfile}
              role="menuitem"
            >
              <User className="h-4 w-4 mr-3 text-slate-500" />
              Profile Settings
            </FocusableElement>
            
            <FocusableElement
              className="w-full flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 transition-colors duration-200"
              onClick={() => {
                setIsDropdownOpen(false);
                navigate('/settings');
              }}
              role="menuitem"
            >
              <Building className="h-4 w-4 mr-3 text-slate-500" />
              Company Settings
            </FocusableElement>
            
            <FocusableElement
              className="w-full flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 transition-colors duration-200"
              onClick={() => {
                setIsDropdownOpen(false);
                navigate('/settings');
              }}
              role="menuitem"
            >
              <Settings className="h-4 w-4 mr-3 text-slate-500" />
              Account Management
            </FocusableElement>
            
            <FocusableElement
              className="w-full flex items-center justify-between px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 transition-colors duration-200"
              onClick={toggleDarkMode}
              role="menuitem"
            >
              <div className="flex items-center">
                {isDarkMode ? (
                  <Sun className="h-4 w-4 mr-3 text-slate-500" />
                ) : (
                  <Moon className="h-4 w-4 mr-3 text-slate-500" />
                )}
                {isDarkMode ? 'Light Mode' : 'Dark Mode'}
              </div>
              <div className={`w-8 h-4 rounded-full transition-colors duration-200 ${
                isDarkMode ? 'bg-teal-600' : 'bg-slate-300'
              } flex items-center ${isDarkMode ? 'justify-end' : 'justify-start'}`}>
                <div className="w-3 h-3 bg-white rounded-full mx-0.5"></div>
              </div>
            </FocusableElement>
          </div>

          {/* Compliance Status */}
          <div className="px-4 py-3 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Shield className="h-4 w-4 text-green-500" />
                <span className="text-xs font-medium text-slate-700">Compliance Status</span>
              </div>
              <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">
                Active
              </span>
            </div>
          </div>

          {/* Sign Out */}
          <div className="border-t border-slate-200 pt-2">
            <FocusableElement
              onClick={handleSignOut}
              className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200"
              role="menuitem"
            >
              <LogOut className="h-4 w-4 mr-3" />
              Sign Out
            </FocusableElement>
          </div>
        </div>
      </TransitionWrapper>
    </div>
  );
};