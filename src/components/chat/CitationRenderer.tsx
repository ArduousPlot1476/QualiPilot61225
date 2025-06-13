import React from 'react';
import { ExternalLink, FileText, Scale, Globe, Award } from 'lucide-react';

interface Citation {
  id: string;
  code: string;
  title: string;
  url: string;
  type: 'regulatory' | 'fda' | 'iso' | 'eu-mdr';
  confidence: number;
}

interface CitationRendererProps {
  citations: Citation[];
  className?: string;
}

export const CitationRenderer: React.FC<CitationRendererProps> = ({ 
  citations, 
  className = '' 
}) => {
  if (!citations || citations.length === 0) {
    return null;
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'fda':
      case 'regulatory':
        return <Scale className="h-3 w-3" />;
      case 'iso':
        return <Award className="h-3 w-3" />;
      case 'eu-mdr':
        return <Globe className="h-3 w-3" />;
      default:
        return <FileText className="h-3 w-3" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'fda':
      case 'regulatory':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800 hover:bg-blue-200 dark:hover:bg-blue-800/50';
      case 'iso':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-200 dark:border-green-800 hover:bg-green-200 dark:hover:bg-green-800/50';
      case 'eu-mdr':
        return 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-800 hover:bg-purple-200 dark:hover:bg-purple-800/50';
      default:
        return 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700';
    }
  };

  const getConfidenceIndicator = (confidence: number) => {
    if (confidence >= 0.8) {
      return <div className="w-2 h-2 bg-green-500 dark:bg-green-400 rounded-full" title="High confidence" />;
    } else if (confidence >= 0.6) {
      return <div className="w-2 h-2 bg-yellow-500 dark:bg-yellow-400 rounded-full" title="Medium confidence" />;
    } else {
      return <div className="w-2 h-2 bg-red-500 dark:bg-red-400 rounded-full" title="Low confidence" />;
    }
  };

  return (
    <div className={`mt-4 ${className}`}>
      <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3 flex items-center">
        <FileText className="h-4 w-4 mr-2" />
        Regulatory Citations ({citations.length})
      </h4>
      
      <div className="space-y-2">
        {citations.map((citation) => (
          <div
            key={citation.id}
            className={`
              flex items-center justify-between p-3 rounded-lg border transition-all duration-200
              ${getTypeColor(citation.type)}
            `}
          >
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <div className="flex-shrink-0">
                {getIcon(citation.type)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-sm truncate">
                    {citation.code}
                  </span>
                  {getConfidenceIndicator(citation.confidence)}
                </div>
                <p className="text-xs opacity-75 truncate" title={citation.title}>
                  {citation.title}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2 flex-shrink-0">
              <span className="text-xs font-medium opacity-60">
                {Math.round(citation.confidence * 100)}%
              </span>
              
              <button
                onClick={() => window.open(citation.url, '_blank', 'noopener,noreferrer')}
                className="p-1.5 rounded-md hover:bg-white hover:bg-opacity-50 dark:hover:bg-slate-900 dark:hover:bg-opacity-50 transition-colors duration-200"
                title="Open regulation"
                aria-label={`Open ${citation.code} in new tab`}
              >
                <ExternalLink className="h-3 w-3" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Citation Legend */}
      <div className="mt-3 p-2 bg-slate-50 dark:bg-slate-800 rounded-lg">
        <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 dark:bg-green-400 rounded-full"></div>
              <span>High confidence</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-yellow-500 dark:bg-yellow-400 rounded-full"></div>
              <span>Medium</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-red-500 dark:bg-red-400 rounded-full"></div>
              <span>Low</span>
            </div>
          </div>
          <span className="text-slate-500 dark:text-slate-400">Click to view regulation</span>
        </div>
      </div>
    </div>
  );
};