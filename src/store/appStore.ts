import { create } from 'zustand';
import { AppState, ChatMessage, ComplianceStatus, RegulatoryDocument, ConversationThread, GeneratedDocument, Alert } from '../types';

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

const mockDocuments: RegulatoryDocument[] = [
  {
    id: '1',
    title: 'FDA 21 CFR Part 820 - Quality System Regulation',
    type: 'FDA',
    category: 'Quality Management',
    lastUpdated: new Date('2024-01-15'),
    status: 'current',
    summary: 'Current Good Manufacturing Practice (cGMP) requirements for medical devices.'
  },
  {
    id: '2',
    title: 'ISO 13485:2016 - Medical devices Quality Management',
    type: 'ISO',
    category: 'Quality Management',
    lastUpdated: new Date('2024-02-01'),
    status: 'current',
    summary: 'International standard for quality management systems in medical device industry.'
  },
  {
    id: '3',
    title: 'EU MDR 2017/745 - Medical Device Regulation',
    type: 'EU-MDR',
    category: 'Market Authorization',
    lastUpdated: new Date('2024-01-28'),
    status: 'current',
    summary: 'European Union regulation for medical devices market access.'
  }
];

const mockGeneratedDocuments: GeneratedDocument[] = [
  {
    id: '1',
    title: 'Risk Management Plan - Device XYZ',
    type: 'Risk Analysis',
    status: 'completed',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
    downloadUrl: '#',
    size: '1.8 MB'
  },
  {
    id: '2',
    title: 'Clinical Evaluation Report Template',
    type: 'Clinical Documentation',
    status: 'in-progress',
    createdAt: new Date(Date.now() - 1000 * 60 * 30),
    size: 'Generating...'
  }
];

const mockAlerts: Alert[] = [
  {
    id: '1',
    type: 'critical',
    title: 'FDA Warning Letter Response Due',
    message: 'Response to FDA warning letter due in 3 days. Ensure all CAPA items are addressed.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60),
    isRead: false,
    severity: 'high'
  },
  {
    id: '2',
    type: 'warning',
    title: 'Design Control Review Overdue',
    message: 'Quarterly design control review is 5 days overdue. Schedule review meeting.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6),
    isRead: false,
    severity: 'medium'
  },
  {
    id: '3',
    type: 'info',
    title: 'New ISO 13485 Guidance Published',
    message: 'ISO has published new guidance on software lifecycle processes.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
    isRead: true,
    severity: 'low'
  }
];

const initialComplianceStatus: ComplianceStatus[] = [
  {
    id: '1',
    status: 'compliant',
    message: 'All quality management systems up to date',
    timestamp: new Date()
  },
  {
    id: '2',
    status: 'warning',
    message: 'Design control documentation review due in 7 days',
    timestamp: new Date()
  }
];

export const useAppStore = create<AppState>((set, get) => ({
  // UI State
  sidebarCollapsed: false,
  contextDrawerOpen: true,
  activeTab: 'sources',
  selectedThread: '1',
  
  // Legacy compatibility
  activeContextTab: 'sources',
  currentRoute: '/dashboard',
  selectedThreadId: '1',
  complianceStatus: initialComplianceStatus,
  chatMessages: [],
  
  // Data
  threads: mockThreads,
  conversationThreads: mockThreads,
  messages: [],
  sources: mockDocuments,
  documents: mockDocuments,
  generatedDocs: mockGeneratedDocuments,
  generatedDocuments: mockGeneratedDocuments,
  alerts: mockAlerts,

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
          timestamp: new Date(),
          isSelected: false
        },
        ...state.threads
      ],
      conversationThreads: [
        {
          ...thread,
          id: Math.random().toString(36).substr(2, 9),
          timestamp: new Date(),
          isSelected: false
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
      threads: state.threads.map(thread => ({
        ...thread,
        isSelected: thread.id === id
      })),
      conversationThreads: state.conversationThreads.map(thread => ({
        ...thread,
        isSelected: thread.id === id
      }))
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