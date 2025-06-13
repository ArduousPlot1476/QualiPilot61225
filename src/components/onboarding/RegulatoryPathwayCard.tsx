import React from 'react';
import { Clock, DollarSign, CheckCircle, AlertTriangle, FileText, ExternalLink } from 'lucide-react';

interface RegulatoryPathwayCardProps {
  pathway: {
    name: string;
    description: string;
    timeline: string;
    cost: string;
    requirements: string[];
    deviceClass: string;
    isRecommended?: boolean;
  };
  onSelect: () => void;
  isSelected: boolean;
}

export const RegulatoryPathwayCard: React.FC<RegulatoryPathwayCardProps> = ({
  pathway,
  onSelect,
  isSelected
}) => {
  const getPathwayColor = (name: string) => {
    switch (name) {
      case 'Exempt':
        return 'bg-green-50 border-green-200';
      case '510(k)':
        return 'bg-blue-50 border-blue-200';
      case 'De Novo':
        return 'bg-purple-50 border-purple-200';
      case 'PMA':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-slate-50 border-slate-200';
    }
  };

  const getPathwayIcon = (name: string) => {
    switch (name) {
      case 'Exempt':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case '510(k)':
        return <FileText className="h-5 w-5 text-blue-500" />;
      case 'De Novo':
        return <FileText className="h-5 w-5 text-purple-500" />;
      case 'PMA':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      default:
        return <FileText className="h-5 w-5 text-slate-500" />;
    }
  };

  return (
    <div 
      className={`rounded-lg p-6 cursor-pointer transition-all duration-200 ${
        isSelected 
          ? `${getPathwayColor(pathway.name)} ring-2 ring-teal-500` 
          : 'bg-white border border-slate-200 hover:border-teal-200 hover:shadow-md'
      }`}
      onClick={onSelect}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          {getPathwayIcon(pathway.name)}
          <h4 className="text-lg font-semibold text-slate-900">{pathway.name}</h4>
        </div>
        
        {pathway.isRecommended && (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-100 text-teal-800">
            Recommended
          </span>
        )}
      </div>
      
      <p className="text-sm text-slate-600 mb-4">{pathway.description}</p>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="flex items-center space-x-2">
          <Clock className="h-4 w-4 text-slate-400" />
          <span className="text-sm text-slate-700">{pathway.timeline}</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <DollarSign className="h-4 w-4 text-slate-400" />
          <span className="text-sm text-slate-700">{pathway.cost}</span>
        </div>
      </div>
      
      <div>
        <h5 className="text-sm font-medium text-slate-700 mb-2">Key Requirements:</h5>
        <ul className="space-y-1">
          {pathway.requirements.map((requirement, index) => (
            <li key={index} className="flex items-start">
              <CheckCircle className="h-3 w-3 text-teal-500 mt-1 mr-2" />
              <span className="text-xs text-slate-600">{requirement}</span>
            </li>
          ))}
        </ul>
      </div>
      
      <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center">
        <span className="text-xs text-slate-500">
          Typical for Class {pathway.deviceClass} devices
        </span>
        
        <a
          href={`https://www.fda.gov/medical-devices/premarket-submissions/${pathway.name.toLowerCase().replace(/\s+/g, '-')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-blue-600 hover:text-blue-700 flex items-center"
          onClick={(e) => e.stopPropagation()}
        >
          <span>FDA Guidance</span>
          <ExternalLink className="h-3 w-3 ml-1" />
        </a>
      </div>
    </div>
  );
};