import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertTriangle, AlertCircle, FileText, ExternalLink, Clock, Shield } from 'lucide-react';
import { DocumentGeneratorService } from '../../lib/ai/documentGenerator';

interface ValidationResultProps {
  documentId: string;
}

interface ComplianceCheck {
  id: string;
  section: string;
  requirement: string;
  status: 'passed' | 'failed' | 'warning';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  cfrReference?: string;
  recommendation?: string;
}

export const DocumentValidation: React.FC<ValidationResultProps> = ({ documentId }) => {
  const [validationResults, setValidationResults] = useState<ComplianceCheck[]>([]);
  const [loading, setLoading] = useState(true);
  const [overallScore, setOverallScore] = useState(0);

  useEffect(() => {
    loadValidationResults();
  }, [documentId]);

  const loadValidationResults = async () => {
    try {
      setLoading(true);
      const results = await DocumentGeneratorService.getValidationResults(documentId);
      
      // Transform results into compliance checks
      const checks: ComplianceCheck[] = results.map((result: any) => ({
        id: result.id,
        section: result.details?.section || 'General',
        requirement: result.message,
        status: result.status,
        severity: result.severity,
        message: result.message,
        cfrReference: result.cfr_reference,
        recommendation: result.details?.recommendation
      }));

      setValidationResults(checks);
      
      // Calculate overall compliance score
      const totalChecks = checks.length;
      const passedChecks = checks.filter(c => c.status === 'passed').length;
      const score = totalChecks > 0 ? Math.round((passedChecks / totalChecks) * 100) : 0;
      setOverallScore(score);

    } catch (error) {
      console.error('Failed to load validation results:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'failed':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      default:
        return <Clock className="h-5 w-5 text-slate-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passed':
        return 'bg-green-50 border-green-200';
      case 'failed':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      default:
        return 'bg-slate-50 border-slate-200';
    }
  };

  const getSeverityBadge = (severity: string) => {
    const colors = {
      low: 'bg-blue-100 text-blue-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      critical: 'bg-red-100 text-red-800'
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[severity as keyof typeof colors]}`}>
        {severity.toUpperCase()}
      </span>
    );
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const groupedResults = validationResults.reduce((acc, check) => {
    if (!acc[check.section]) {
      acc[check.section] = [];
    }
    acc[check.section].push(check);
    return acc;
  }, {} as Record<string, ComplianceCheck[]>);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-slate-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-4 bg-slate-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="p-6 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Shield className="h-6 w-6 text-teal-600" />
            <h2 className="text-xl font-semibold text-slate-900">Compliance Validation</h2>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-sm text-slate-600">Overall Score</div>
              <div className={`text-2xl font-bold ${getScoreColor(overallScore)}`}>
                {overallScore}%
              </div>
            </div>
            
            <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
              overallScore >= 90 ? 'bg-green-100' :
              overallScore >= 70 ? 'bg-yellow-100' : 'bg-red-100'
            }`}>
              <span className={`text-xl font-bold ${getScoreColor(overallScore)}`}>
                {overallScore}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="p-6 border-b border-slate-200">
        <div className="grid grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {validationResults.filter(r => r.status === 'passed').length}
            </div>
            <div className="text-sm text-slate-600">Passed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {validationResults.filter(r => r.status === 'warning').length}
            </div>
            <div className="text-sm text-slate-600">Warnings</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {validationResults.filter(r => r.status === 'failed').length}
            </div>
            <div className="text-sm text-slate-600">Failed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-slate-600">
              {validationResults.length}
            </div>
            <div className="text-sm text-slate-600">Total Checks</div>
          </div>
        </div>
      </div>

      {/* Validation Results by Section */}
      <div className="p-6">
        {Object.keys(groupedResults).length === 0 ? (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">No validation results available</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedResults).map(([section, checks]) => (
              <div key={section}>
                <h3 className="text-lg font-semibold text-slate-900 mb-4">{section}</h3>
                
                <div className="space-y-3">
                  {checks.map((check) => (
                    <div
                      key={check.id}
                      className={`p-4 rounded-lg border ${getStatusColor(check.status)}`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 mt-0.5">
                          {getStatusIcon(check.status)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-2">
                            <h4 className="font-medium text-slate-900">{check.requirement}</h4>
                            {getSeverityBadge(check.severity)}
                          </div>
                          
                          <p className="text-sm text-slate-600 mb-2">{check.message}</p>
                          
                          {check.cfrReference && (
                            <div className="flex items-center space-x-2 mb-2">
                              <span className="text-xs font-medium text-slate-500">CFR Reference:</span>
                              <button className="text-xs text-blue-600 hover:text-blue-700 flex items-center space-x-1">
                                <span>{check.cfrReference}</span>
                                <ExternalLink className="h-3 w-3" />
                              </button>
                            </div>
                          )}
                          
                          {check.recommendation && (
                            <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                              <div className="text-xs font-medium text-blue-800 mb-1">Recommendation:</div>
                              <div className="text-xs text-blue-700">{check.recommendation}</div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Action Items */}
      {validationResults.filter(r => r.status === 'failed').length > 0 && (
        <div className="p-6 border-t border-slate-200 bg-red-50">
          <h3 className="text-lg font-semibold text-red-900 mb-3">Action Required</h3>
          <div className="text-sm text-red-700">
            <p className="mb-2">
              {validationResults.filter(r => r.status === 'failed').length} critical issue(s) must be resolved before document approval.
            </p>
            <ul className="list-disc list-inside space-y-1">
              {validationResults
                .filter(r => r.status === 'failed' && r.severity === 'critical')
                .slice(0, 3)
                .map((check, index) => (
                  <li key={index}>{check.requirement}</li>
                ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};