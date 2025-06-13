import React from 'react';
import { LazyContextDrawer } from './LazyContextDrawer';
import { TransitionWrapper } from '../ui/TransitionWrapper';
import { useAppStore } from '../../store/appStore';

export const ContextDrawer: React.FC = () => {
  const { contextDrawerOpen } = useAppStore();
  
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