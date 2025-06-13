import React, { useState, useEffect } from 'react';
import { CheckCircle, Download, Eye, Clock } from 'lucide-react';
import { useAppStore } from '../../../store/appStore';
import { DocumentCardSkeleton } from '../../ui/LoadingStates';

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
        <h3 className="text-lg font-semibold text-slate-900">Generated Documents</h3>
        <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
          {generatedDocuments.length} documents
        </span>
      </div>

      {/* Document Cards */}
      <div className="space-y-3">
        {isLoading ? (
          <DocumentCardSkeleton />
        ) : generatedDocuments.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 text-sm">No generated documents</p>
            <p className="text-xs text-slate-400 mt-1">Documents will appear here after generation</p>
          </div>
        ) : (
          generatedDocuments.map((doc) => (
            <div
              key={doc.id}
              className="bg-slate-50 rounded-lg p-4 hover:bg-slate-100 hover:border-teal-300 border border-transparent transition-all duration-200 cursor-pointer group"
            >
              <div className="flex items-start justify-between mb-3">
                <h4 className="font-medium text-slate-900 text-sm leading-tight group-hover:text-teal-600 transition-colors duration-200">
                  {doc.title}
                </h4>
                <div className="flex items-center space-x-1 ml-2">
                  {doc.status === 'completed' && doc.downloadUrl && (
                    <button className="p-1 rounded hover:bg-slate-200 transition-colors duration-200">
                      <Download className="h-4 w-4 text-slate-600" />
                    </button>
                  )}
                  <button className="p-1 rounded hover:bg-slate-200 transition-colors duration-200">
                    <Eye className="h-4 w-4 text-slate-600" />
                  </button>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 mb-3">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  doc.status === 'completed' 
                    ? 'bg-green-100 text-green-800' 
                    : doc.status === 'in-progress'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {doc.status === 'completed' ? 'Ready' : doc.status === 'in-progress' ? 'Generating...' : 'Failed'}
                </span>
                <span className="text-xs text-slate-600 bg-slate-200 px-2 py-1 rounded-full">
                  {doc.type}
                </span>
              </div>
              
              <div className="flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  Created {formatTimestamp(doc.createdAt)}
                </div>
                {doc.size && (
                  <span className="text-slate-600 font-medium">{doc.size}</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};