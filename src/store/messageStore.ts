import { create } from 'zustand';
import { MessageState, ChatMessage } from '../types';

const mockMessages: ChatMessage[] = [
  {
    id: '1',
    content: 'What are the key requirements for FDA 510(k) submission for a Class II medical device?',
    sender: 'user',
    timestamp: new Date(Date.now() - 1000 * 60 * 10),
    type: 'text'
  },
  {
    id: '2',
    content: 'For FDA 510(k) submission of Class II medical devices, you need to demonstrate substantial equivalence to a predicate device. Key requirements include device description, intended use, substantial equivalence comparison, performance data, and labeling. I\'ve generated a comprehensive checklist for your review.',
    sender: 'assistant',
    timestamp: new Date(Date.now() - 1000 * 60 * 8),
    type: 'text',
    citations: [
      {
        id: '1',
        title: 'FDA 21 CFR Part 807 - Establishment Registration and Device Listing',
        url: 'https://www.fda.gov/medical-devices/how-study-and-market-your-device/premarket-notification-510k',
        source: 'FDA.gov'
      },
      {
        id: '2',
        title: 'FDA Guidance: Format for Traditional and Abbreviated 510(k)s',
        url: 'https://www.fda.gov/regulatory-information/search-fda-guidance-documents/format-traditional-and-abbreviated-510ks',
        source: 'FDA.gov'
      }
    ],
    documentCard: {
      id: '1',
      title: 'FDA 510(k) Submission Checklist',
      type: 'generated',
      description: 'Comprehensive checklist covering all required documentation and submission steps',
      status: 'ready'
    }
  },
  {
    id: '3',
    content: 'How long does the FDA review process typically take?',
    sender: 'user',
    timestamp: new Date(Date.now() - 1000 * 60 * 5),
    type: 'text'
  },
  {
    id: '4',
    content: 'The FDA aims to complete 510(k) reviews within 90 days of receipt, but this can vary based on the complexity of your device and the completeness of your submission. Additional information requests can extend this timeline. The current average review time is approximately 120-150 days.',
    sender: 'assistant',
    timestamp: new Date(Date.now() - 1000 * 60 * 3),
    type: 'text',
    citations: [
      {
        id: '3',
        title: 'FDA Performance Reports - 510(k) Review Times',
        url: 'https://www.fda.gov/about-fda/reports/performance-reports',
        source: 'FDA.gov'
      }
    ]
  }
];

export const useMessageStore = create<MessageState>((set, get) => ({
  messages: mockMessages,

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