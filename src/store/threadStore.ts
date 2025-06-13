import { create } from 'zustand';
import { ThreadState, ConversationThread } from '../types';

const mockThreads: ConversationThread[] = [
  {
    id: '1',
    title: 'FDA 510(k) Submission Requirements',
    lastMessage: 'What are the key documentation requirements for a Class II medical device?',
    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    unreadCount: 2,
    isSelected: true
  },
  {
    id: '2',
    title: 'ISO 13485 QMS Implementation',
    lastMessage: 'How do I establish design controls for software as a medical device?',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    unreadCount: 0,
    isSelected: false
  },
  {
    id: '3',
    title: 'Quality Manual Draft Review',
    lastMessage: 'Please review the updated quality manual sections for compliance.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    unreadCount: 1,
    isSelected: false
  }
];

export const useThreadStore = create<ThreadState>((set, get) => ({
  threads: mockThreads,

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