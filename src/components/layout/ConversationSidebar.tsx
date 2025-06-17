import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, Search, MessageCircle, Trash2, Edit2, AlertTriangle, Bookmark, BookmarkCheck } from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { TransitionWrapper } from '../ui/TransitionWrapper';
import { EmptyState } from '../ui/EmptyState';
import { FocusableElement } from '../ui/FocusableElement';
import { ChatService } from '../../lib/ai/chatService';
import { useOptimisticUpdates } from '../../hooks/useOptimisticUpdates';
import { useToast } from '../ui/Toast';
import { ConversationThread } from '../../types';
import { ThreadListSkeleton } from '../ui/LoadingStates';

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
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'saved'>('all');
  const editInputRef = useRef<HTMLInputElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { showToast } = useToast();

  // Use optimistic updates for thread operations
  const { 
    data: optimisticThreads, 
    createItem: createThread,
    updateItem: updateThread,
    deleteItem: deleteThread,
    isOptimistic,
    isPending
  } = useOptimisticUpdates<ConversationThread>(conversationThreads, 'threads');

  // Load threads on component mount
  useEffect(() => {
    const loadThreads = async () => {
      try {
        setIsLoading(true);
        // In a real implementation, this would fetch threads from Supabase
        // For now, we'll just simulate a loading delay
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error('Error loading threads:', error);
        showToast({
          type: 'error',
          title: 'Loading Failed',
          message: 'Could not load conversation threads',
          duration: 5000
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadThreads();
  }, [showToast]);

  const filteredThreads = optimisticThreads
    .filter(thread => {
      // Apply saved filter if needed
      if (filter === 'saved' && !thread.isSaved) {
        return false;
      }
      
      // Apply search filter
      return thread.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (thread.lastMessage && thread.lastMessage.toLowerCase().includes(searchTerm.toLowerCase()));
    });

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

  const handleNewThread = async () => {
    try {
      // Create a new thread with a default title
      const title = "New Conversation";
      
      // Optimistically add the thread to the UI
      await createThread({
        title,
        lastMessage: "Start a new conversation",
        timestamp: new Date(),
        unreadCount: 0,
        isSaved: false
      });
      
      // The actual API call is queued by useOptimisticUpdates
      // and will be executed in the background
      const newThread = await ChatService.createThread(title);
      
      // Select the new thread
      setSelectedThread(newThread.id);
      
      showToast({
        type: 'success',
        title: 'Thread Created',
        message: 'New conversation thread created',
        duration: 2000
      });
    } catch (error) {
      console.error('Failed to create thread:', error);
      showToast({
        type: 'error',
        title: 'Thread Creation Failed',
        message: error instanceof Error ? error.message : 'Could not create new conversation',
        duration: 5000
      });
    }
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

  const handleSaveEdit = async (id: string) => {
    if (!editTitle.trim()) {
      setIsEditing(null);
      return;
    }
    
    try {
      // Optimistically update the thread title in the UI
      await updateThread(id, { title: editTitle });
      
      // The actual API call is queued by useOptimisticUpdates
      await ChatService.updateThreadTitle(id, editTitle);
      
      showToast({
        type: 'success',
        title: 'Thread Updated',
        message: 'Conversation title updated',
        duration: 2000
      });
    } catch (error) {
      console.error('Failed to update thread:', error);
      showToast({
        type: 'error',
        title: 'Update Failed',
        message: error instanceof Error ? error.message : 'Could not update conversation title',
        duration: 5000
      });
    } finally {
      setIsEditing(null);
    }
  };

  const handleDeleteThread = async (id: string) => {
    setIsDeleting(id);
  };

  const confirmDeleteThread = async (id: string) => {
    try {
      // Optimistically remove the thread from the UI
      await deleteThread(id);
      
      // The actual API call is queued by useOptimisticUpdates
      await ChatService.deleteThread(id);
      
      // If the deleted thread was selected, select another thread
      if (id === selectedThreadId) {
        const nextThread = optimisticThreads.find(t => t.id !== id);
        if (nextThread) {
          setSelectedThread(nextThread.id);
        }
      }
      
      showToast({
        type: 'success',
        title: 'Thread Deleted',
        message: 'Conversation deleted successfully',
        duration: 2000
      });
    } catch (error) {
      console.error('Failed to delete thread:', error);
      showToast({
        type: 'error',
        title: 'Deletion Failed',
        message: error instanceof Error ? error.message : 'Could not delete conversation',
        duration: 5000
      });
    } finally {
      setIsDeleting(null);
    }
  };

  const cancelDeleteThread = () => {
    setIsDeleting(null);
  };

  const handleToggleSave = async (id: string, isSaved: boolean) => {
    try {
      // Optimistically update the saved status in the UI
      await updateThread(id, { isSaved: !isSaved });
      
      // The actual API call is queued by useOptimisticUpdates
      await ChatService.updateThreadSaved(id, !isSaved);
      
      showToast({
        type: 'success',
        title: isSaved ? 'Conversation Unsaved' : 'Conversation Saved',
        message: isSaved ? 'Removed from saved conversations' : 'Added to saved conversations',
        duration: 2000
      });
    } catch (error) {
      console.error('Failed to update saved status:', error);
      showToast({
        type: 'error',
        title: 'Update Failed',
        message: error instanceof Error ? error.message : 'Could not update saved status',
        duration: 5000
      });
    }
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
      
      // Escape to cancel deletion
      if (e.key === 'Escape' && isDeleting) {
        setIsDeleting(null);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isEditing, isDeleting]);

  return (
    <div className={`
      ${sidebarCollapsed ? 'w-16' : 'w-80'} 
      bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 shadow-sm transition-all duration-300 ease-in-out
      flex flex-col h-full
    `}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
        {!sidebarCollapsed && (
          <div className="flex items-center space-x-3">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Conversations</h2>
            <button 
              onClick={handleNewThread}
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors duration-200 focus-ring hover-scale"
              title="New conversation"
              aria-label="New conversation"
            >
              <Plus className="h-4 w-4 text-slate-600 dark:text-slate-400" />
            </button>
          </div>
        )}
        
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors duration-200 focus-ring hover-scale"
          title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-expanded={!sidebarCollapsed}
        >
          {sidebarCollapsed ? (
            <ChevronRight className="h-5 w-5 text-slate-600 dark:text-slate-400" />
          ) : (
            <ChevronLeft className="h-5 w-5 text-slate-600 dark:text-slate-400" />
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
        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              aria-label="Search conversations"
            />
          </div>
          
          {/* Filter tabs */}
          <div className="flex mt-3 border-b border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setFilter('all')}
              className={`flex-1 py-2 text-sm font-medium border-b-2 transition-colors ${
                filter === 'all' 
                  ? 'border-teal-500 text-teal-600 dark:text-teal-400' 
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('saved')}
              className={`flex-1 py-2 text-sm font-medium border-b-2 transition-colors ${
                filter === 'saved' 
                  ? 'border-teal-500 text-teal-600 dark:text-teal-400' 
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              Saved
            </button>
          </div>
        </div>
      </TransitionWrapper>

      {/* Thread List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <ThreadListSkeleton />
        ) : sidebarCollapsed ? (
          // Collapsed view - show only icons
          <div className="p-2 space-y-2">
            {filteredThreads.length === 0 ? (
              <div className="flex justify-center py-4">
                <button
                  onClick={handleNewThread}
                  className="p-3 bg-teal-50 dark:bg-teal-900/30 rounded-lg hover:bg-teal-100 dark:hover:bg-teal-800/30 transition-colors"
                  title="New conversation"
                >
                  <Plus className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                </button>
              </div>
            ) : (
              filteredThreads.map((thread) => (
                <FocusableElement
                  key={thread.id}
                  onClick={() => setSelectedThread(thread.id)}
                  className={`
                    w-full p-3 rounded-lg transition-all duration-200 relative group
                    ${thread.id === selectedThreadId
                      ? 'bg-teal-50 dark:bg-teal-900/30 border-r-4 border-r-teal-500 dark:border-r-teal-400' 
                      : 'hover:bg-slate-50 dark:hover:bg-slate-700'
                    }
                    ${isOptimistic(thread.id) ? 'opacity-70' : ''}
                    ${isPending(thread.id) ? 'opacity-85' : ''}
                  `}
                  focusClassName="ring-2 ring-teal-500 dark:ring-teal-400 ring-inset"
                >
                  <div className="w-8 h-8 bg-teal-600 dark:bg-teal-700 rounded-full flex items-center justify-center text-white text-sm font-medium">
                    <MessageCircle className="h-4 w-4" />
                  </div>
                  {thread.unreadCount > 0 && (
                    <div className="absolute -top-1 -right-1 bg-green-500 dark:bg-green-400 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                      {thread.unreadCount > 9 ? '9+' : thread.unreadCount}
                    </div>
                  )}
                  {thread.isSaved && (
                    <div className="absolute bottom-0 right-0 bg-teal-500 dark:bg-teal-400 text-white rounded-full p-1">
                      <BookmarkCheck className="h-3 w-3" />
                    </div>
                  )}
                </FocusableElement>
              ))
            )}
          </div>
        ) : (
          // Expanded view - show full thread details
          <div className="space-y-1 p-2">
            {filteredThreads.length === 0 ? (
              <EmptyState
                icon={MessageCircle}
                title={searchTerm ? 'No conversations found' : 'No conversations yet'}
                description={searchTerm ? 'Try a different search term' : 'Start your first conversation'}
                action={{
                  label: searchTerm ? 'Clear Search' : 'New Conversation',
                  onClick: searchTerm ? () => setSearchTerm('') : handleNewThread
                }}
              />
            ) : (
              filteredThreads.map((thread) => (
                <div
                  key={thread.id}
                  className={`
                    relative group
                    ${isEditing === thread.id || isDeleting === thread.id ? 'z-10' : ''}
                    ${isOptimistic(thread.id) ? 'opacity-70' : ''}
                    ${isPending(thread.id) ? 'opacity-85' : ''}
                  `}
                >
                  {isEditing === thread.id ? (
                    // Edit mode
                    <div className="p-2 bg-white dark:bg-slate-800 border border-teal-300 dark:border-teal-700 rounded-lg shadow-md animate-fade-in">
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
                        className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                        placeholder="Conversation title"
                      />
                      <div className="flex justify-end mt-2 space-x-2">
                        <button
                          onClick={() => setIsEditing(null)}
                          className="px-2 py-1 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors focus-ring"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleSaveEdit(thread.id)}
                          className="px-2 py-1 text-xs bg-teal-600 dark:bg-teal-700 text-white rounded hover:bg-teal-700 dark:hover:bg-teal-600 transition-colors focus-ring"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  ) : isDeleting === thread.id ? (
                    // Delete confirmation
                    <div className="p-3 bg-white dark:bg-slate-800 border border-red-300 dark:border-red-700 rounded-lg shadow-md animate-fade-in">
                      <div className="flex items-start space-x-2 mb-3">
                        <AlertTriangle className="h-5 w-5 text-red-500 dark:text-red-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-slate-900 dark:text-white text-sm">Delete conversation?</h4>
                          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                            This will permanently delete this conversation and all its messages.
                          </p>
                        </div>
                      </div>
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={cancelDeleteThread}
                          className="px-2 py-1 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors focus-ring"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => confirmDeleteThread(thread.id)}
                          className="px-2 py-1 text-xs bg-red-600 dark:bg-red-700 text-white rounded hover:bg-red-700 dark:hover:bg-red-600 transition-colors focus-ring"
                        >
                          Delete
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
                          ? 'bg-teal-50 dark:bg-teal-900/30 border-r-4 border-r-teal-500 dark:border-r-teal-400' 
                          : 'hover:bg-slate-50 dark:hover:bg-slate-700'
                        }
                      `}
                      focusClassName="ring-2 ring-teal-500 dark:ring-teal-400 ring-inset"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-medium text-slate-900 dark:text-white text-sm leading-tight line-clamp-2 pr-2">
                          {thread.title}
                        </h3>
                        <div className="flex items-center space-x-2 ml-2 flex-shrink-0">
                          <span className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                            {formatTime(thread.timestamp)}
                          </span>
                          {thread.unreadCount > 0 && (
                            <span className="bg-green-500 dark:bg-green-400 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                              {thread.unreadCount > 9 ? '9+' : thread.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                        {thread.lastMessage}
                      </p>
                      
                      {/* Action buttons - only visible on hover/focus */}
                      <div className="absolute right-2 top-2 hidden group-hover:flex group-focus-within:flex space-x-1 bg-white dark:bg-slate-800 bg-opacity-90 dark:bg-opacity-90 rounded-lg p-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleSave(thread.id, thread.isSaved || false);
                          }}
                          className={`p-1 rounded transition-colors focus-ring ${
                            thread.isSaved
                              ? 'text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900/20'
                              : 'text-slate-500 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900/20'
                          }`}
                          aria-label={thread.isSaved ? "Unsave conversation" : "Save conversation"}
                          title={thread.isSaved ? "Unsave conversation" : "Save conversation"}
                        >
                          {thread.isSaved ? (
                            <BookmarkCheck className="h-3.5 w-3.5" />
                          ) : (
                            <Bookmark className="h-3.5 w-3.5" />
                          )}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditThread(thread.id, thread.title);
                          }}
                          className="p-1 text-slate-500 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900/20 rounded transition-colors focus-ring"
                          aria-label="Edit conversation"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteThread(thread.id);
                          }}
                          className="p-1 text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors focus-ring"
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
        <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
          <div className="text-center">
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
              {filteredThreads.length} conversation{filteredThreads.length !== 1 ? 's' : ''}
              {filter === 'saved' ? ' saved' : ''}
            </p>
            <button 
              onClick={handleNewThread}
              className="w-full px-4 py-2 bg-teal-600 dark:bg-teal-700 hover:bg-teal-700 dark:hover:bg-teal-600 text-white text-sm font-medium rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2 focus-ring hover-scale"
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