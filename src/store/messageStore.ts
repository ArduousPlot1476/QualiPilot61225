import { create } from 'zustand';
import { MessageState, ChatMessage } from '../types';

export const useMessageStore = create<MessageState>((set, get) => ({
  messages: [],

  addMessage: (message) =>
    set((state) => ({
      messages: [
        ...state.messages,
        {
          ...message,
          id: Math.random().toString(36).substr(2, 9),
          timestamp: new Date()
        }
      ]
    })),

  updateMessage: (id, updates) =>
    set((state) => ({
      messages: state.messages.map(message =>
        message.id === id ? { ...message, ...updates } : message
      )
    })),

  deleteMessage: (id) =>
    set((state) => ({
      messages: state.messages.filter(message => message.id !== id)
    })),

  clearMessages: () =>
    set({ messages: [] }),

  getMessagesByThread: (threadId) => {
    // In a real implementation, messages would be associated with threads
    // For now, return all messages as they're part of the selected thread
    return get().messages;
  },
}));