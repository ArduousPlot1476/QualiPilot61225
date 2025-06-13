import React, { useState, useEffect } from 'react';
import { Search, AlertTriangle, CheckCircle, Clock, ExternalLink, Filter, Download, Bell, Shield, TrendingUp, FileText, Database } from 'lucide-react';
import { RegulatoryIntelligenceService, RegulatorySearchRequest, RegulatoryUpdate, DeviceClassification } from '../../lib/ai/regulatoryIntelligence';
import { useToast } from '../ui/Toast';

export const RegulatoryIntelligence: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'search' | 'monitor' | 'classify' | 'audit'>('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [regulatoryUpdates, setRegulatoryUpdates] = useState<RegulatoryUpdate[]>([]);
  const [deviceClassification, setDeviceClassification] = useState<DeviceClassification | null>(null);
  const [auditTrail, setAuditTrail] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [filters, setFilters] = useState({
    cfr_title: '',
    cfr_part: '',
    device_class: '',
    search_type: 'hybrid' as 'hybrid' | 'semantic' | 'keyword'
  });
  const { showToast } = useToast();

  useEffect(() => {
    loadRegulatoryAlerts();
    loadAuditTrail();
  }, []);

  const loadRegulatoryAlerts = async () => {
    try {
      const alertsData = await RegulatoryIntelligenceService.getRegulatoryAlerts();
      setAlerts(alertsData);
    } catch (error) {
      console.error('Failed to load alerts:', error);
    }
  };

  const loadAuditTrail = async () => {
    try {
      const auditData = await RegulatoryIntelligenceService.getAuditTrail();
      setAuditTrail(auditData);
    } catch (error) {
      console.error('Failed to load audit trail:', error);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      showToast({
        type: 'warning',
        title: 'Search Required',
        message: 'Please enter a search query',
        duration: 3000
      });
      return;
    }

    setIsSearching(true);
    try {
      const searchRequest: RegulatorySearchRequest = {
        query: searchQuery,
        search_type: filters.search_type,
        limit: 20,
        filters: {
          ...(filters.cfr_title && { cfr_title: parseInt(filters.cfr_title) }),
          ...(filters.cfr_part && { cfr_part: parseInt(filters.cfr_part) }),
          ...(filters.device_class && { device_class: filters.device_class })
        }
      };

      const results = await RegulatoryIntelligenceService.searchRegulations(searchRequest);
      setSearchResults(results.results || []);

      showToast({
        type: 'success',
        title: 'Search Complete',
        message: `Found ${results.results?.length || 0} results`,
        duration: 3000
      });
    } catch (error) {
      console.error('Search error:', error);
      showToast({
        type: 'error',
        title: 'Search Failed',
        message: error instanceof Error ? error.message : 'Unknown error',
        duration: 5000
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleDeviceClassification = async (deviceName: string) => {
    try {
      const classification = await RegulatoryIntelligenceService.getDeviceClassification(deviceName);
      setDeviceClassification(classification);

      showToast({
        type: 'success',
        title: 'Classification Found',
        message: `Device classified as Class ${classification.device_class}`,
        duration: 3000
      });
    } catch (error) {
      console.error('Classification error:', error);
      showToast({
        type: 'error',
        title: 'Classification Failed',
        message: error instanceof Error ? error.message : 'Unknown error',
        duration: 5000
      });
    }
  };

  const handleMonitorChanges = async () => {
    try {
      const cfrParts = [800, 801, 807, 814, 820]; // Common medical device CFR parts
      const updates = await RegulatoryIntelligenceService.monitorRegulatoryChanges(cfrParts);
      setRegulatoryUpdates(updates);

      showToast({
        type: 'success',
        title: 'Updates Retrieved',
        message: `Found ${updates.length} recent regulatory updates`,
        duration: 3000
      });
    } catch (error) {
      console.error('Monitoring error:', error);
      showToast({
        type: 'error',
        title: 'Monitoring Failed',
        message: error instanceof Error ? error.message : 'Unknown error',
        duration: 5000
      });
    }
  };

  const getImpactColor = (level: string) => {
    switch (level) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const getImpactIcon = (level: string) => {
    switch (level) {
      case 'critical':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'high':
        return <TrendingUp className="h-4 w-4 text-orange-500" />;
      case 'medium':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'low':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <FileText className="h-4 w-4 text-slate-500" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg">
        {/* Header */}
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Regulatory Intelligence System</h2>
              <p className="text-slate-600">
                Real-time eCFR integration, change monitoring, and compliance intelligence
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              {alerts.length > 0 && (
                <div className="flex items-center space-x-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg">
                  <Bell className="h-4 w-4 text-red-500" />
                  <span className="text-sm font-medium text-red-700">{alerts.length} alerts</span>
                </div>
              )}
              
              <div className="flex items-center space-x-2">
                <Shield className="h-6 w-6 text-teal-600" />
                <span className="text-sm font-medium text-slate-700">99.9% Uptime</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-slate-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'search', label: 'Advanced Search', icon: Search },
              { id: 'monitor', label: 'Change Monitoring', icon: TrendingUp },
              { id: 'classify', label: 'Device Classification', icon: Database },
              { id: 'audit', label: 'Audit Trail', icon: FileText }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'border-teal-500 text-teal-600'
                      : 'border-transparent text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'search' && (
            <div className="space-y-6">
              {/* Search Interface */}
              <div className="bg-slate-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Hybrid Regulatory Search</h3>
                
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-4">
                  <div className="lg:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Search Query
                    </label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="e.g., design controls, 510k requirements, medical device software"
                        className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      CFR Title
                    </label>
                    <select
                      value={filters.cfr_title}
                      onChange={(e) => setFilters(prev => ({ ...prev, cfr_title: e.target.value }))}
                      className="w-full px-3 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    >
                      <option value="">All Titles</option>
                      <option value="21">Title 21 (FDA)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Search Type
                    </label>
                    <select
                      value={filters.search_type}
                      onChange={(e) => setFilters(prev => ({ ...prev, search_type: e.target.value as any }))}
                      className="w-full px-3 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    >
                      <option value="hybrid">Hybrid (60% Semantic + 40% Keyword)</option>
                      <option value="semantic">Semantic Only</option>
                      <option value="keyword">Keyword Only</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      CFR Part
                    </label>
                    <input
                      type="number"
                      value={filters.cfr_part}
                      onChange={(e) => setFilters(prev => ({ ...prev, cfr_part: e.target.value }))}
                      placeholder="e.g., 820"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Device Class
                    </label>
                    <select
                      value={filters.device_class}
                      onChange={(e) => setFilters(prev => ({ ...prev, device_class: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    >
                      <option value="">All Classes</option>
                      <option value="I">Class I</option>
                      <option value="II">Class II</option>
                      <option value="III">Class III</option>
                    </select>
                  </div>

                  <div className="flex items-end">
                    <button
                      onClick={handleSearch}
                      disabled={isSearching}
                      className="w-full px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                    >
                      {isSearching ? (
                        <>
                          <Search className="h-4 w-4 animate-spin mr-2" />
                          Searching...
                        </>
                      ) : (
                        <>
                          <Search className="h-4 w-4 mr-2" />
                          Search
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Search Results */}
              {searchResults.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">
                    Search Results ({searchResults.length})
                  </h3>
                  
                  <div className="space-y-4">
                    {searchResults.map((result, index) => (
                      <div key={index} className="bg-white border border-slate-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-3">
                          <h4 className="font-semibold text-slate-900 text-lg">{result.title}</h4>
                          <div className="flex items-center space-x-2">
                            {result.similarity && (
                              <span className="text-xs bg-teal-100 text-teal-800 px-2 py-1 rounded-full">
                                {Math.round(result.similarity * 100)}% match
                              </span>
                            )}
                            <button
                              onClick={() => window.open(result.source_url, '_blank')}
                              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-4 mb-3">
                          <span className="text-sm font-medium text-slate-600">
                            {result.cfr_title} CFR {result.cfr_part}.{result.cfr_section}
                          </span>
                        </div>
                        
                        <p className="text-slate-700 mb-4 line-clamp-3">
                          {result.content?.substring(0, 300)}...
                        </p>
                        
                        {result.related_sections && result.related_sections.length > 0 && (
                          <div className="mb-3">
                            <span className="text-sm font-medium text-slate-600">Related Sections: </span>
                            {result.related_sections.map((section: any, idx: number) => (
                              <span key={idx} className="text-sm text-teal-600 mr-2">
                                {section.cfr_section}
                              </span>
                            ))}
                          </div>
                        )}
                        
                        {result.guidance_documents && result.guidance_documents.length > 0 && (
                          <div>
                            <span className="text-sm font-medium text-slate-600">Guidance: </span>
                            {result.guidance_documents.map((guidance: any, idx: number) => (
                              <a
                                key={idx}
                                href={guidance.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-blue-600 hover:text-blue-700 mr-2"
                              >
                                {guidance.title}
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'monitor' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900">Regulatory Change Monitoring</h3>
                <button
                  onClick={handleMonitorChanges}
                  className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
                >
                  Check for Updates
                </button>
              </div>

              {regulatoryUpdates.length > 0 ? (
                <div className="space-y-4">
                  {regulatoryUpdates.map((update) => (
                    <div key={update.id} className="bg-white border border-slate-200 rounded-lg p-6">
                      <div className="flex items-start justify-between mb-3">
                        <h4 className="font-semibold text-slate-900">{update.title}</h4>
                        <div className="flex items-center space-x-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getImpactColor(update.impact_level)}`}>
                            {getImpactIcon(update.impact_level)}
                            <span className="ml-1 capitalize">{update.impact_level} Impact</span>
                          </span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                        <div>
                          <span className="font-medium text-slate-600">Type:</span>
                          <span className="ml-1 capitalize">{update.type.replace('_', ' ')}</span>
                        </div>
                        <div>
                          <span className="font-medium text-slate-600">Agency:</span>
                          <span className="ml-1">{update.agency}</span>
                        </div>
                        <div>
                          <span className="font-medium text-slate-600">Published:</span>
                          <span className="ml-1">{new Date(update.publication_date).toLocaleDateString()}</span>
                        </div>
                        {update.effective_date && (
                          <div>
                            <span className="font-medium text-slate-600">Effective:</span>
                            <span className="ml-1">{new Date(update.effective_date).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                      
                      <p className="text-slate-700 mb-4">{update.summary}</p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div>
                            <span className="text-sm font-medium text-slate-600">CFR References: </span>
                            {update.cfr_references.map((ref, idx) => (
                              <span key={idx} className="text-sm text-teal-600 mr-2">{ref}</span>
                            ))}
                          </div>
                          {update.affected_devices.length > 0 && (
                            <div>
                              <span className="text-sm font-medium text-slate-600">Devices: </span>
                              {update.affected_devices.slice(0, 3).map((device, idx) => (
                                <span key={idx} className="text-sm text-slate-700 mr-2">{device}</span>
                              ))}
                            </div>
                          )}
                        </div>
                        
                        <button
                          onClick={() => window.open(update.document_url, '_blank')}
                          className="flex items-center space-x-2 px-3 py-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <ExternalLink className="h-4 w-4" />
                          <span>View Document</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <TrendingUp className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500">No recent regulatory updates found</p>
                  <p className="text-sm text-slate-400 mt-1">Click "Check for Updates" to monitor changes</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'classify' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Device Classification System</h3>
                
                <div className="bg-slate-50 rounded-lg p-6">
                  <div className="flex space-x-4">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Device Name
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., Blood Glucose Meter, Cardiac Pacemaker"
                        className="w-full px-3 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleDeviceClassification((e.target as HTMLInputElement).value);
                          }
                        }}
                      />
                    </div>
                    <div className="flex items-end">
                      <button
                        onClick={() => {
                          const input = document.querySelector('input[placeholder*="Blood Glucose"]') as HTMLInputElement;
                          if (input?.value) {
                            handleDeviceClassification(input.value);
                          }
                        }}
                        className="px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
                      >
                        Classify Device
                      </button>
                    </div>
                  </div>
                </div>

                {deviceClassification && (
                  <div className="bg-white border border-slate-200 rounded-lg p-6">
                    <h4 className="font-semibold text-slate-900 mb-4">{deviceClassification.device_name}</h4>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <span className="text-sm font-medium text-slate-600">Device Class:</span>
                        <div className={`mt-1 px-3 py-1 rounded-full text-sm font-medium inline-block ${
                          deviceClassification.device_class === 'I' ? 'bg-green-100 text-green-800' :
                          deviceClassification.device_class === 'II' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          Class {deviceClassification.device_class}
                        </div>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-slate-600">Product Code:</span>
                        <div className="mt-1 text-sm text-slate-900">{deviceClassification.product_code}</div>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-slate-600">Regulation:</span>
                        <div className="mt-1 text-sm text-slate-900">{deviceClassification.regulation_number}</div>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-slate-600">Submission Type:</span>
                        <div className="mt-1 text-sm text-slate-900">{deviceClassification.submission_type}</div>
                      </div>
                    </div>
                    
                    <p className="text-slate-700 mb-4">{deviceClassification.definition}</p>
                    
                    {deviceClassification.guidance_documents.length > 0 && (
                      <div className="mb-4">
                        <span className="text-sm font-medium text-slate-600">Related Guidance:</span>
                        <ul className="mt-2 space-y-1">
                          {deviceClassification.guidance_documents.map((guidance, idx) => (
                            <li key={idx} className="text-sm text-blue-600">{guidance}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {deviceClassification.predicate_devices && deviceClassification.predicate_devices.length > 0 && (
                      <div>
                        <span className="text-sm font-medium text-slate-600">Predicate Devices:</span>
                        <ul className="mt-2 space-y-1">
                          {deviceClassification.predicate_devices.map((device, idx) => (
                            <li key={idx} className="text-sm text-slate-700">{device}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'audit' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-slate-900">Compliance Audit Trail</h3>
              
              {auditTrail.length > 0 ? (
                <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                            Timestamp
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                            Action
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                            Query
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                            Results
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                            Processing Time
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-slate-200">
                        {auditTrail.map((entry) => (
                          <tr key={entry.id} className="hover:bg-slate-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                              {new Date(entry.timestamp).toLocaleString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                              {entry.action}
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-900 max-w-xs truncate">
                              {entry.query}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                              {entry.results_count}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                              {entry.processing_time}ms
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500">No audit trail entries found</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};