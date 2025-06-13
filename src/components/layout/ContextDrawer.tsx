import React, { useEffect } from 'react';
import { LazyContextDrawer } from './LazyContextDrawer';
import { TransitionWrapper } from '../ui/TransitionWrapper';
import { useAppStore } from '../../store/appStore';
import { useAuth } from '../auth/AuthProvider';
import { subscribeToAlerts } from '../../lib/realtime/alertSubscription';

export const ContextDrawer: React.FC = () => {
  const { contextDrawerOpen } = useAppStore();
  const { user } = useAuth();
  
  // Subscribe to real-time alerts when the drawer is mounted
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    
    if (user) {
      unsubscribe = subscribeToAlerts(user.id);
    }
    
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [user]);
  
  return (
    <TransitionWrapper
      show={contextDrawerOpen}
      enter="transition-all duration-300"
      enterFrom="opacity-0 transform translate-x-full"
      enterTo="opacity-100 transform translate-x-0"
      leave="transition-all duration-200"
      leaveFrom="opacity-100 transform translate-x-0"
      leaveTo="opacity-0 transform translate-x-full"
    >
      <LazyContextDrawer />
    </TransitionWrapper>
  );
};