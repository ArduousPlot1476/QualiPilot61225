import React from 'react';
import { CheckCircle, AlertTriangle, AlertCircle, Info } from 'lucide-react';

interface ConfidenceIndicatorProps {
  level: 'High' | 'Medium' | 'Low';
  score?: number;
  className?: string;
}

export const ConfidenceIndicator: React.FC<ConfidenceIndicatorProps> = ({
  level,
  score,
  className = ''
}) => {
  const getIndicatorConfig = () => {
    switch (level) {
      case 'High':
        return {
          icon: CheckCircle,
          color: 'text-green-600 dark:text-green-500',
          bgColor: 'bg-green-50 dark:bg-green-900/30',
          borderColor: 'border-green-200 dark:border-green-800',
          description: 'High confidence - Based on specific regulatory citations'
        };
      case 'Medium':
        return {
          icon: AlertTriangle,
          color: 'text-yellow-600 dark:text-yellow-500',
          bgColor: 'bg-yellow-50 dark:bg-yellow-900/30',
          borderColor: 'border-yellow-200 dark:border-yellow-800',
          description: 'Medium confidence - General regulatory guidance'
        };
      case 'Low':
        return {
          icon: AlertCircle,
          color: 'text-red-600 dark:text-red-500',
          bgColor: 'bg-red-50 dark:bg-red-900/30',
          borderColor: 'border-red-200 dark:border-red-800',
          description: 'Low confidence - Limited regulatory context available'
        };
      default:
        return {
          icon: Info,
          color: 'text-slate-600 dark:text-slate-400',
          bgColor: 'bg-slate-50 dark:bg-slate-800',
          borderColor: 'border-slate-200 dark:border-slate-700',
          description: 'Confidence level not determined'
        };
    }
  };

  const config = getIndicatorConfig();
  const Icon = config.icon;

  return (
    <div className={`inline-flex items-center space-x-2 px-3 py-2 rounded-lg border ${config.bgColor} ${config.borderColor} ${className}`}>
      <Icon className={`h-4 w-4 ${config.color}`} />
      <div className="flex items-center space-x-2">
        <span className={`text-sm font-medium ${config.color}`}>
          {level} Confidence
        </span>
        {score !== undefined && (
          <span className={`text-xs ${config.color} opacity-75`}>
            ({Math.round(score * 100)}%)
          </span>
        )}
      </div>
      
      {/* Tooltip */}
      <div className="group relative">
        <Info className={`h-3 w-3 ${config.color} opacity-50 cursor-help`} />
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-slate-900 dark:bg-slate-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
          {config.description}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-slate-900 dark:border-t-slate-800"></div>
        </div>
      </div>
    </div>
  );
};

interface ResponseMetadataProps {
  confidence: string;
  retrievedDocs: number;
  processingTime?: number;
  className?: string;
}

export const ResponseMetadata: React.FC<ResponseMetadataProps> = ({
  confidence,
  retrievedDocs,
  processingTime,
  className = ''
}) => {
  return (
    <div className={`flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 ${className}`}>
      <div className="flex items-center space-x-4">
        <ConfidenceIndicator level={confidence as 'High' | 'Medium' | 'Low'} />
        
        <div className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-400">
          <span className="font-medium">{retrievedDocs}</span>
          <span>regulatory documents referenced</span>
        </div>
      </div>

      {processingTime && (
        <div className="text-xs text-slate-500 dark:text-slate-400">
          Response time: {processingTime}ms
        </div>
      )}
    </div>
  );
};