import { create } from 'zustand';
import { ThreadState, ConversationThread } from '../types';

export const useThreadStore = create<ThreadState>((set, get) => ({
  threads: [],

  addThread: (thread) =>
    set((state) => ({
      threads: [
        {
          ...thread,
          id: Math.random().toString(36).substr(2, 9),
          timestamp: new Date(),
          isSelected: false
        },
        ...state.threads
      ]
    })),

  updateThread: (id, updates) =>
    set((state) => ({
      threads: state.threads.map(thread =>
        thread.id === id ? { ...thread, ...updates } : thread
      )
    })),

  deleteThread: (id) =>
    set((state) => ({
      threads: state.threads.filter(thread => thread.id !== id)
    })),

  markThreadAsRead: (id) =>
    set((state) => ({
      threads: state.threads.map(thread =>
        thread.id === id ? { ...thread, unreadCount: 0 } : thread
      )
    })),

  selectThread: (id) =>
    set((state) => ({
      threads: state.threads.map(thread => ({
        ...thread,
        isSelected: thread.id === id
      }))
    })),
}));