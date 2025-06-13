import { create } from 'zustand';
import { UIState } from '../types';

export const useUIStore = create<UIState>((set) => ({
  sidebarCollapsed: false,
  contextDrawerOpen: true,
  activeTab: 'sources',
  selectedThread: '1',

  toggleSidebar: () =>
    set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

  toggleContextDrawer: () =>
    set((state) => ({ contextDrawerOpen: !state.contextDrawerOpen })),

  setActiveTab: (tab) =>
    set({ activeTab: tab }),

  setSelectedThread: (threadId) =>
    set({ selectedThread: threadId }),
}));