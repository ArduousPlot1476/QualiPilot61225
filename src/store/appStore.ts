import { create } from 'zustand';
import { AppState, ChatMessage, ComplianceStatus, RegulatoryDocument, ConversationThread, GeneratedDocument, Alert } from '../types';

// Initial empty state for compliance status
const initialComplianceStatus: ComplianceStatus[] = [];

export const useAppStore = create<AppState>((set, get) => ({
  // UI State
  sidebarCollapsed: false,
  contextDrawerOpen: true,
  activeTab: 'sources',
  selectedThread: '',
  
  // Legacy compatibility
  activeContextTab: 'sources',
  currentRoute: '/dashboard',
  selectedThreadId: '',
  complianceStatus: initialComplianceStatus,
  chatMessages: [],
  
  // Data
  threads: [],
  conversationThreads: [],
  messages: [],
  sources: [],
  documents: [],
  generatedDocs: [],
  generatedDocuments: [],
  alerts: [],

  // UI Actions
  toggleSidebar: () => 
    set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

  toggleContextDrawer: () => 
    set((state) => ({ contextDrawerOpen: !state.contextDrawerOpen })),

  setActiveTab: (tab) =>
    set({ activeTab: tab, activeContextTab: tab === 'sources' ? 'sources' : tab === 'docs' ? 'documents' : 'alerts' }),

  setSelectedThread: (threadId) =>
    set({ selectedThread: threadId, selectedThreadId: threadId }),

  // Legacy compatibility
  setActiveContextTab: (tab) =>
    set({ activeContextTab: tab, activeTab: tab === 'sources' ? 'sources' : tab === 'documents' ? 'docs' : 'alerts' }),

  setCurrentRoute: (route: string) => 
    set({ currentRoute: route }),

  // Thread Actions
  addThread: (thread) =>
    set((state) => ({
      threads: [
        {
          ...thread,
          id: Math.random().toString(36).substr(2, 9),
          timestamp: new Date()
        },
        ...state.threads
      ],
      conversationThreads: [
        {
          ...thread,
          id: Math.random().toString(36).substr(2, 9),
          timestamp: new Date()
        },
        ...state.conversationThreads
      ]
    })),

  updateThread: (id, updates) =>
    set((state) => ({
      threads: state.threads.map(thread =>
        thread.id === id ? { ...thread, ...updates } : thread
      ),
      conversationThreads: state.conversationThreads.map(thread =>
        thread.id === id ? { ...thread, ...updates } : thread
      )
    })),

  deleteThread: (id) =>
    set((state) => ({
      threads: state.threads.filter(thread => thread.id !== id),
      conversationThreads: state.conversationThreads.filter(thread => thread.id !== id)
    })),

  markThreadAsRead: (id) =>
    set((state) => ({
      threads: state.threads.map(thread =>
        thread.id === id ? { ...thread, unreadCount: 0 } : thread
      ),
      conversationThreads: state.conversationThreads.map(thread =>
        thread.id === id ? { ...thread, unreadCount: 0 } : thread
      )
    })),

  selectThread: (id) =>
    set((state) => ({
      selectedThread: id,
      selectedThreadId: id
    })),

  // Message Actions
  addMessage: (message) =>
    set((state) => ({
      messages: [
        ...state.messages,
        {
          ...message,
          id: Math.random().toString(36).substr(2, 9),
          timestamp: new Date()
        }
      ],
      chatMessages: [
        ...state.chatMessages,
        {
          ...message,
          id: Math.random().toString(36).substr(2, 9),
          timestamp: new Date()
        }
      ]
    })),

  addChatMessage: (message) => 
    set((state) => ({
      chatMessages: [
        ...state.chatMessages,
        {
          ...message,
          id: Math.random().toString(36).substr(2, 9),
          timestamp: new Date()
        }
      ],
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
      ),
      chatMessages: state.chatMessages.map(message =>
        message.id === id ? { ...message, ...updates } : message
      )
    })),

  deleteMessage: (id) =>
    set((state) => ({
      messages: state.messages.filter(message => message.id !== id),
      chatMessages: state.chatMessages.filter(message => message.id !== id)
    })),

  clearMessages: () =>
    set({ messages: [], chatMessages: [] }),

  getMessagesByThread: (threadId) => {
    return get().messages;
  },

  // Content Actions
  addSource: (source) =>
    set((state) => ({
      sources: [
        {
          ...source,
          id: Math.random().toString(36).substr(2, 9)
        },
        ...state.sources
      ],
      documents: [
        {
          ...source,
          id: Math.random().toString(36).substr(2, 9)
        },
        ...state.documents
      ]
    })),

  updateSource: (id, updates) =>
    set((state) => ({
      sources: state.sources.map(source =>
        source.id === id ? { ...source, ...updates } : source
      ),
      documents: state.documents.map(source =>
        source.id === id ? { ...source, ...updates } : source
      )
    })),

  deleteSource: (id) =>
    set((state) => ({
      sources: state.sources.filter(source => source.id !== id),
      documents: state.documents.filter(source => source.id !== id)
    })),

  addGeneratedDoc: (doc) =>
    set((state) => ({
      generatedDocs: [
        {
          ...doc,
          id: Math.random().toString(36).substr(2, 9),
          createdAt: new Date()
        },
        ...state.generatedDocs
      ],
      generatedDocuments: [
        {
          ...doc,
          id: Math.random().toString(36).substr(2, 9),
          createdAt: new Date()
        },
        ...state.generatedDocuments
      ]
    })),

  updateGeneratedDoc: (id, updates) =>
    set((state) => ({
      generatedDocs: state.generatedDocs.map(doc =>
        doc.id === id ? { ...doc, ...updates } : doc
      ),
      generatedDocuments: state.generatedDocuments.map(doc =>
        doc.id === id ? { ...doc, ...updates } : doc
      )
    })),

  deleteGeneratedDoc: (id) =>
    set((state) => ({
      generatedDocs: state.generatedDocs.filter(doc => doc.id !== id),
      generatedDocuments: state.generatedDocuments.filter(doc => doc.id !== id)
    })),

  addAlert: (alert) =>
    set((state) => ({
      alerts: [
        {
          ...alert,
          id: Math.random().toString(36).substr(2, 9),
          timestamp: new Date()
        },
        ...state.alerts
      ]
    })),

  markAlertAsRead: (id) =>
    set((state) => ({
      alerts: state.alerts.map(alert =>
        alert.id === id ? { ...alert, isRead: true } : alert
      )
    })),

  deleteAlert: (id) =>
    set((state) => ({
      alerts: state.alerts.filter(alert => alert.id !== id)
    })),

  updateComplianceStatus: (status: ComplianceStatus) =>
    set((state) => ({
      complianceStatus: [
        ...state.complianceStatus.filter(s => s.id !== status.id),
        status
      ]
    }))
}));