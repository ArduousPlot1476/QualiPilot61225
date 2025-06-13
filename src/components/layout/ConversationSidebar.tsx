import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, Search, MessageCircle, Trash2, Edit2 } from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { TransitionWrapper } from '../ui/TransitionWrapper';
import { EmptyState } from '../ui/EmptyState';
import { FocusableElement } from '../ui/FocusableElement';

export const ConversationSidebar: React.FC = () => {
  const { 
    sidebarCollapsed, 
    toggleSidebar, 
    conversationThreads, 
    selectedThreadId,
    setSelectedThread 
  } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const editInputRef = useRef<HTMLInputElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const filteredThreads = conversationThreads.filter(thread =>
    thread.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    thread.lastMessage.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatTime = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'now';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    return `${days}d`;
  };

  const handleNewThread = () => {
    // TODO: Implement new thread creation
    console.log('Create new thread');
  };

  const handleEditThread = (id: string, title: string) => {
    setIsEditing(id);
    setEditTitle(title);
    
    // Focus the input after rendering
    setTimeout(() => {
      if (editInputRef.current) {
        editInputRef.current.focus();
        editInputRef.current.select();
      }
    }, 50);
  };

  const handleSaveEdit = (id: string) => {
    if (editTitle.trim()) {
      // TODO: Implement thread title update
      console.log('Update thread title:', id, editTitle);
    }
    setIsEditing(null);
  };

  const handleDeleteThread = (id: string) => {
    // TODO: Implement thread deletion with confirmation
    console.log('Delete thread:', id);
  };

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+/ to focus search
      if (e.ctrlKey && e.key === '/') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      
      // Ctrl+N to create new thread
      if (e.ctrlKey && e.key === 'n') {
        e.preventDefault();
        handleNewThread();
      }
      
      // Escape to cancel editing
      if (e.key === 'Escape' && isEditing) {
        setIsEditing(null);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isEditing]);

  return (
    <div className={`
      ${sidebarCollapsed ? 'w-16' : 'w-80'} 
      bg-white border-r border-slate-200 shadow-sm transition-all duration-300 ease-in-out
      flex flex-col h-full
    `}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-200">
        {!sidebarCollapsed && (
          <div className="flex items-center space-x-3">
            <h2 className="text-lg font-semibold text-slate-900">Conversations</h2>
            <button 
              onClick={handleNewThread}
              className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors duration-200 focus-ring hover-scale"
              title="New conversation"
              aria-label="New conversation"
            >
              <Plus className="h-4 w-4 text-slate-600" />
            </button>
          </div>
        )}
        
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg hover:bg-slate-100 transition-colors duration-200 focus-ring hover-scale"
          title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-expanded={!sidebarCollapsed}
        >
          {sidebarCollapsed ? (
            <ChevronRight className="h-5 w-5 text-slate-600" />
          ) : (
            <ChevronLeft className="h-5 w-5 text-slate-600" />
          )}
        </button>
      </div>

      {/* Search Section - Only visible when expanded */}
      <TransitionWrapper
        show={!sidebarCollapsed}
        enter="transition-all duration-300"
        enterFrom="opacity-0 max-h-0"
        enterTo="opacity-100 max-h-20"
        leave="transition-all duration-200"
        leaveFrom="opacity-100 max-h-20"
        leaveTo="opacity-0 max-h-0"
      >
        <div className="p-4 border-b border-slate-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 text-sm"
              aria-label="Search conversations"
            />
          </div>
        </div>
      </TransitionWrapper>

      {/* Thread List */}
      <div className="flex-1 overflow-y-auto">
        {sidebarCollapsed ? (
          // Collapsed view - show only icons
          <div className="p-2 space-y-2">
            {filteredThreads.map((thread) => (
              <FocusableElement
                key={thread.id}
                onClick={() => setSelectedThread(thread.id)}
                className={`
                  w-full p-3 rounded-lg transition-all duration-200 relative group
                  ${thread.id === selectedThreadId
                    ? 'bg-teal-50 border-r-4 border-r-teal-500' 
                    : 'hover:bg-slate-50'
                  }
                `}
                focusClassName="ring-2 ring-teal-500 ring-inset"
              >
                <div className="w-8 h-8 bg-teal-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                  <MessageCircle className="h-4 w-4" />
                </div>
                {thread.unreadCount > 0 && (
                  <div className="absolute -top-1 -right-1 bg-green-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                    {thread.unreadCount > 9 ? '9+' : thread.unreadCount}
                  </div>
                )}
              </FocusableElement>
            ))}
          </div>
        ) : (
          // Expanded view - show full thread details
          <div className="space-y-1 p-2">
            {filteredThreads.length === 0 ? (
              <EmptyState
                icon={MessageCircle}
                title={searchTerm ? 'No conversations found' : 'No conversations yet'}
                description={searchTerm ? 'Try a different search term' : 'Start your first conversation'}
                action={
                  searchTerm 
                    ? { label: 'Clear Search', onClick: () => setSearchTerm('') }
                    : { label: 'New Conversation', onClick: handleNewThread }
                }
              />
            ) : (
              filteredThreads.map((thread) => (
                <div
                  key={thread.id}
                  className={`
                    relative group
                    ${isEditing === thread.id ? 'z-10' : ''}
                  `}
                >
                  {isEditing === thread.id ? (
                    // Edit mode
                    <div className="p-2 bg-white border border-teal-300 rounded-lg shadow-md animate-fade-in">
                      <input
                        ref={editInputRef}
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleSaveEdit(thread.id);
                          }
                        }}
                        className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        placeholder="Conversation title"
                      />
                      <div className="flex justify-end mt-2 space-x-2">
                        <button
                          onClick={() => setIsEditing(null)}
                          className="px-2 py-1 text-xs text-slate-600 hover:bg-slate-100 rounded transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleSaveEdit(thread.id)}
                          className="px-2 py-1 text-xs bg-teal-600 text-white rounded hover:bg-teal-700 transition-colors"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    // Normal view
                    <FocusableElement
                      onClick={() => setSelectedThread(thread.id)}
                      className={`
                        w-full p-4 rounded-lg text-left transition-all duration-200 relative
                        ${thread.id === selectedThreadId
                          ? 'bg-teal-50 border-r-4 border-r-teal-500' 
                          : 'hover:bg-slate-50'
                        }
                      `}
                      focusClassName="ring-2 ring-teal-500 ring-inset"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-medium text-slate-900 text-sm leading-tight line-clamp-2 pr-2">
                          {thread.title}
                        </h3>
                        <div className="flex items-center space-x-2 ml-2 flex-shrink-0">
                          <span className="text-xs text-slate-500 whitespace-nowrap">
                            {formatTime(thread.timestamp)}
                          </span>
                          {thread.unreadCount > 0 && (
                            <span className="bg-green-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                              {thread.unreadCount > 9 ? '9+' : thread.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {thread.lastMessage}
                      </p>
                      
                      {/* Action buttons - only visible on hover/focus */}
                      <div className="absolute right-2 top-2 hidden group-hover:flex group-focus-within:flex space-x-1 bg-white bg-opacity-90 rounded-lg p-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditThread(thread.id, thread.title);
                          }}
                          className="p-1 text-slate-500 hover:text-teal-600 hover:bg-teal-50 rounded transition-colors focus-ring"
                          aria-label="Edit conversation"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteThread(thread.id);
                          }}
                          className="p-1 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors focus-ring"
                          aria-label="Delete conversation"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </FocusableElement>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Footer - Only visible when expanded */}
      <TransitionWrapper
        show={!sidebarCollapsed}
        enter="transition-all duration-300"
        enterFrom="opacity-0 max-h-0"
        enterTo="opacity-100 max-h-24"
        leave="transition-all duration-200"
        leaveFrom="opacity-100 max-h-24"
        leaveTo="opacity-0 max-h-0"
      >
        <div className="p-4 border-t border-slate-200 bg-slate-50">
          <div className="text-center">
            <p className="text-xs text-slate-500 mb-2">
              {filteredThreads.length} conversation{filteredThreads.length !== 1 ? 's' : ''}
            </p>
            <button 
              onClick={handleNewThread}
              className="w-full px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2 focus-ring hover-scale"
            >
              <Plus className="h-4 w-4" />
              <span>New Conversation</span>
            </button>
          </div>
        </div>
      </TransitionWrapper>
    </div>
  );
};