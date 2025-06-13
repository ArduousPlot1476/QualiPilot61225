import React, { useState, useEffect } from 'react';
import { Search, FileText, ExternalLink, Filter, ChevronRight } from 'lucide-react';
import { useAppStore } from '../../../store/appStore';
import { SourceCardSkeleton } from '../../ui/LoadingStates';
import { EmptyState } from '../../ui/EmptyState';

export const SourcesTab: React.FC = () => {
  const { documents } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [filteredDocuments, setFilteredDocuments] = useState(documents);

  // Simulate loading delay for demonstration
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // Filter documents when search term changes
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredDocuments(documents);
      return;
    }
    
    const filtered = documents.filter(doc => 
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredDocuments(filtered);
  }, [searchTerm, documents]);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'FDA':
        return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800';
      case 'ISO':
        return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800';
      case 'EU-MDR':
        return 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'current':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'outdated':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300';
    }
  };

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Regulatory Sources</h3>
        <button className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors duration-200">
          <Filter className="h-4 w-4 text-slate-600 dark:text-slate-400" />
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search sources..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
        />
      </div>

      {/* Source Cards */}
      <div className="space-y-3">
        {isLoading ? (
          <SourceCardSkeleton />
        ) : filteredDocuments.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No regulatory sources"
            description="Regulatory sources will appear here as you interact with the system"
          />
        ) : (
          filteredDocuments.map((doc) => (
            <div
              key={doc.id}
              className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 hover:bg-slate-100 dark:hover:bg-slate-700 hover:border-teal-300 dark:hover:border-teal-700 border border-transparent transition-all duration-200 cursor-pointer group"
            >
              <div className="flex items-start justify-between mb-3">
                <h4 className="font-medium text-slate-900 dark:text-white text-sm leading-tight group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors duration-200 line-clamp-2">
                  {doc.title}
                </h4>
                <ExternalLink className="h-4 w-4 text-slate-400 dark:text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex-shrink-0 ml-2" />
              </div>
              
              <div className="flex items-center space-x-2 mb-3">
                <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getTypeColor(doc.type)}`}>
                  {doc.type}
                </span>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(doc.status)}`}>
                  {doc.status}
                </span>
              </div>

              {doc.summary && (
                <p className="text-xs text-slate-600 dark:text-slate-400 mb-3 line-clamp-2 leading-relaxed">
                  {doc.summary}
                </p>
              )}
              
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <div>
                  Updated {doc.lastUpdated.toLocaleDateString()}
                </div>
                <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};