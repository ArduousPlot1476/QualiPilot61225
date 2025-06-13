import React, { useState, useEffect } from 'react';
import { CheckCircle, Download, Eye, Clock } from 'lucide-react';
import { useAppStore } from '../../../store/appStore';
import { DocumentCardSkeleton } from '../../ui/LoadingStates';
import { EmptyState } from '../../ui/EmptyState';

export const DocumentsTab: React.FC = () => {
  const { generatedDocuments } = useAppStore();
  const [isLoading, setIsLoading] = useState(true);

  // Simulate loading delay for demonstration
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 700);
    return () => clearTimeout(timer);
  }, []);

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Generated Documents</h3>
        <span className="text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-full">
          {generatedDocuments.length} documents
        </span>
      </div>

      {/* Document Cards */}
      <div className="space-y-3">
        {isLoading ? (
          <DocumentCardSkeleton />
        ) : generatedDocuments.length === 0 ? (
          <EmptyState
            icon={CheckCircle}
            title="No generated documents"
            description="Documents will appear here after generation"
          />
        ) : (
          generatedDocuments.map((doc) => (
            <div
              key={doc.id}
              className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 hover:bg-slate-100 dark:hover:bg-slate-700 hover:border-teal-300 dark:hover:border-teal-700 border border-transparent transition-all duration-200 cursor-pointer group"
            >
              <div className="flex items-start justify-between mb-3">
                <h4 className="font-medium text-slate-900 dark:text-white text-sm leading-tight group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors duration-200">
                  {doc.title}
                </h4>
                <div className="flex items-center space-x-1 ml-2">
                  {doc.status === 'completed' && doc.downloadUrl && (
                    <button className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors duration-200">
                      <Download className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                    </button>
                  )}
                  <button className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors duration-200">
                    <Eye className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                  </button>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 mb-3">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  doc.status === 'completed' 
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' 
                    : doc.status === 'in-progress'
                    ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300'
                    : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                }`}>
                  {doc.status === 'completed' ? 'Ready' : doc.status === 'in-progress' ? 'Generating...' : 'Failed'}
                </span>
                <span className="text-xs text-slate-600 dark:text-slate-400 bg-slate-200 dark:bg-slate-700 px-2 py-1 rounded-full">
                  {doc.type}
                </span>
              </div>
              
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <div className="flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  Created {formatTimestamp(doc.createdAt)}
                </div>
                {doc.size && (
                  <span className="text-slate-600 dark:text-slate-400 font-medium">{doc.size}</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};