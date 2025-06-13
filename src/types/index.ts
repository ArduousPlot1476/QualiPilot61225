export interface ComplianceStatus {
  id: string;
  status: 'compliant' | 'warning' | 'critical' | 'pending';
  message: string;
  timestamp: Date;
}

export interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
  type: 'text' | 'document' | 'regulation';
  citations?: Citation[];
  documentCard?: DocumentCard;
  metadata?: {
    confidence?: string;
    retrievedDocs?: number;
    processingTime?: number;
    searchType?: 'semantic' | 'keyword' | 'hybrid';
  };
}

export interface Citation {
  id: string;
  code: string;
  title: string;
  url: string;
  type: 'regulatory' | 'fda' | 'iso' | 'eu-mdr';
  confidence: number;
}

export interface DocumentCard {
  id: string;
  title: string;
  type: 'generated' | 'template';
  description: string;
  status: 'ready' | 'generating' | 'error';
}

export interface ConversationThread {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: Date;
  unreadCount: number;
  isSelected: boolean;
}

export interface RegulatoryDocument {
  id: string;
  title: string;
  type: 'FDA' | 'ISO' | 'EU-MDR' | 'Other';
  category: string;
  lastUpdated: Date;
  url?: string;
  summary?: string;
  status: 'current' | 'outdated' | 'draft';
}

export interface GeneratedDocument {
  id: string;
  title: string;
  type: string;
  status: 'completed' | 'in-progress' | 'failed';
  createdAt: Date;
  downloadUrl?: string;
  size?: string;
}

export interface Alert {
  id: string;
  type: 'warning' | 'critical' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  severity: 'low' | 'medium' | 'high';
}

// UI Store Types
export interface UIState {
  sidebarCollapsed: boolean;
  contextDrawerOpen: boolean;
  activeTab: 'sources' | 'docs' | 'alerts';
  selectedThread: string;
  toggleSidebar: () => void;
  toggleContextDrawer: () => void;
  setActiveTab: (tab: 'sources' | 'docs' | 'alerts') => void;
  setSelectedThread: (threadId: string) => void;
}

// Thread Store Types
export interface ThreadState {
  threads: ConversationThread[];
  addThread: (thread: Omit<ConversationThread, 'id' | 'timestamp'>) => void;
  updateThread: (id: string, updates: Partial<ConversationThread>) => void;
  deleteThread: (id: string) => void;
  markThreadAsRead: (id: string) => void;
  selectThread: (id: string) => void;
}

// Message Store Types
export interface MessageState {
  messages: ChatMessage[];
  addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  updateMessage: (id: string, updates: Partial<ChatMessage>) => void;
  deleteMessage: (id: string) => void;
  clearMessages: () => void;
  getMessagesByThread: (threadId: string) => ChatMessage[];
}

// Content Store Types
export interface ContentState {
  sources: RegulatoryDocument[];
  generatedDocs: GeneratedDocument[];
  alerts: Alert[];
  addSource: (source: Omit<RegulatoryDocument, 'id'>) => void;
  updateSource: (id: string, updates: Partial<RegulatoryDocument>) => void;
  deleteSource: (id: string) => void;
  addGeneratedDoc: (doc: Omit<GeneratedDocument, 'id' | 'createdAt'>) => void;
  updateGeneratedDoc: (id: string, updates: Partial<GeneratedDocument>) => void;
  deleteGeneratedDoc: (id: string) => void;
  addAlert: (alert: Omit<Alert, 'id' | 'timestamp'>) => void;
  markAlertAsRead: (id: string) => void;
  deleteAlert: (id: string) => void;
}

// Combined App State
export interface AppState extends UIState, ThreadState, MessageState, ContentState {
  // Legacy compatibility
  complianceStatus: ComplianceStatus[];
  chatMessages: ChatMessage[];
  conversationThreads: ConversationThread[];
  documents: RegulatoryDocument[];
  generatedDocuments: GeneratedDocument[];
  currentRoute: string;
  activeContextTab: 'sources' | 'documents' | 'alerts';
  selectedThreadId: string;
  setCurrentRoute: (route: string) => void;
  setActiveContextTab: (tab: 'sources' | 'documents' | 'alerts') => void;
  addChatMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  updateComplianceStatus: (status: ComplianceStatus) => void;
}