import React, { useState } from 'react';
import { Search, FileText, AlertCircle, ExternalLink, Loader2, CheckCircle } from 'lucide-react';
import { RegulatoryAPIService, ComprehensiveSearchResult } from '../../lib/api/regulatoryAPI';
import { useToast } from '../ui/Toast';

export const RegulatorySearch: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [citation, setCitation] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<ComprehensiveSearchResult | null>(null);
  const [activeTab, setActiveTab] = useState<'search' | 'citation'>('search');
  const { showToast } = useToast();

  const handleSearch = async () => {
    if (!searchQuery.trim() && !citation.trim()) {
      showToast({
        type: 'warning',
        title: 'Search Required',
        message: 'Please enter a search term or CFR citation',
        duration: 3000
      });
      return;
    }

    setIsLoading(true);
    try {
      const searchResults = await RegulatoryAPIService.comprehensiveSearch({
        searchTerm: searchQuery.trim() || undefined,
        citation: citation.trim() || undefined,
        limit: 10
      });

      setResults(searchResults);
      
      showToast({
        type: 'success',
        title: 'Search Complete',
        message: `Found ${searchResults.results.length} results from ${searchResults.summary.successful_calls} sources`,
        duration: 3000
      });

    } catch (error) {
      console.error('Search error:', error);
      showToast({
        type: 'error',
        title: 'Search Failed',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        duration: 5000
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCitationValidation = async () => {
    if (!citation.trim()) return;

    try {
      const parsed = await RegulatoryAPIService.parseCitation(citation);
      
      if (parsed.isValid) {
        showToast({
          type: 'success',
          title: 'Valid Citation',
          message: `${parsed.title} CFR ${parsed.part}.${parsed.section}`,
          duration: 3000
        });
      } else {
        showToast({
          type: 'error',
          title: 'Invalid Citation',
          message: parsed.errorMessage || 'Citation format is incorrect',
          duration: 5000
        });
      }
    } catch (error) {
      console.error('Citation validation error:', error);
    }
  };

  const renderResults = () => {
    if (!results) return null;

    return (
      <div className="mt-6 space-y-6">
        {/* Summary */}
        <div className="bg-slate-50 rounded-lg p-4">
          <h3 className="font-semibold text-slate-900 mb-2">Search Summary</h3>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{results.summary.total_apis_called}</div>
              <div className="text-slate-600">APIs Called</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{results.summary.successful_calls}</div>
              <div className="text-slate-600">Successful</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{results.summary.failed_calls}</div>
              <div className="text-slate-600">Failed</div>
            </div>
          </div>
        </div>

        {/* Results by Source */}
        {results.results.map((result, index) => (
          <div key={index} className="bg-white rounded-lg border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-slate-900 capitalize">
                {result.type.replace('_', ' ')} Results
              </h4>
              <span className="text-sm text-slate-500">
                {Array.isArray(result.data.results) ? result.data.results.length : 1} result(s)
              </span>
            </div>

            {result.type === 'ecfr' && (
              <div className="space-y-3">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h5 className="font-medium text-blue-900">{result.data.title}</h5>
                  <p className="text-sm text-blue-700 mt-1">{result.data.identifier}</p>
                  {result.data.text && (
                    <p className="text-sm text-slate-700 mt-2 line-clamp-3">{result.data.text}</p>
                  )}
                  <div className="mt-3 flex items-center space-x-2">
                    <button
                      onClick={() => window.open(
                        RegulatoryAPIService.generateeCFRURL(21, 820, '30'), 
                        '_blank'
                      )}
                      className="text-sm text-blue-600 hover:text-blue-700 flex items-center"
                    >
                      <ExternalLink className="h-3 w-3 mr-1" />
                      View on eCFR
                    </button>
                  </div>
                </div>
              </div>
            )}

            {result.type === 'fda_classification' && (
              <div className="space-y-3">
                {result.data.results.slice(0, 3).map((item: any, idx: number) => (
                  <div key={idx} className="p-4 bg-green-50 rounded-lg">
                    <h5 className="font-medium text-green-900">{item.device_name}</h5>
                    <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                      <div>
                        <span className="text-green-700 font-medium">Class:</span> {item.device_class}
                      </div>
                      <div>
                        <span className="text-green-700 font-medium">Product Code:</span> {item.product_code}
                      </div>
                    </div>
                    <p className="text-sm text-slate-700 mt-2 line-clamp-2">{item.definition}</p>
                  </div>
                ))}
              </div>
            )}

            {result.type === 'fda_510k' && (
              <div className="space-y-3">
                {result.data.results.slice(0, 3).map((item: any, idx: number) => (
                  <div key={idx} className="p-4 bg-purple-50 rounded-lg">
                    <h5 className="font-medium text-purple-900">{item.device_name}</h5>
                    <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                      <div>
                        <span className="text-purple-700 font-medium">K-Number:</span> {item.k_number}
                      </div>
                      <div>
                        <span className="text-purple-700 font-medium">Decision:</span> {item.decision_description}
                      </div>
                    </div>
                    <p className="text-sm text-slate-700 mt-2">
                      <span className="font-medium">Applicant:</span> {item.applicant}
                    </p>
                    <div className="mt-3">
                      <button
                        onClick={() => window.open(
                          RegulatoryAPIService.generateFDA510KURL(item.k_number), 
                          '_blank'
                        )}
                        className="text-sm text-purple-600 hover:text-purple-700 flex items-center"
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        View 510(k) Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {result.type === 'federal_register' && (
              <div className="space-y-3">
                {result.data.results.slice(0, 3).map((item: any, idx: number) => (
                  <div key={idx} className="p-4 bg-yellow-50 rounded-lg">
                    <h5 className="font-medium text-yellow-900">{item.title}</h5>
                    <div className="text-sm text-yellow-700 mt-1">
                      Published: {new Date(item.publication_date).toLocaleDateString()}
                    </div>
                    <p className="text-sm text-slate-700 mt-2 line-clamp-2">{item.abstract}</p>
                    <div className="mt-3 flex items-center space-x-4">
                      <button
                        onClick={() => window.open(item.html_url, '_blank')}
                        className="text-sm text-yellow-600 hover:text-yellow-700 flex items-center"
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        View Document
                      </button>
                      {item.pdf_url && (
                        <button
                          onClick={() => window.open(item.pdf_url, '_blank')}
                          className="text-sm text-yellow-600 hover:text-yellow-700 flex items-center"
                        >
                          <FileText className="h-3 w-3 mr-1" />
                          Download PDF
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        {/* Errors */}
        {results.errors.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h4 className="font-semibold text-red-900 mb-2 flex items-center">
              <AlertCircle className="h-4 w-4 mr-2" />
              API Errors ({results.errors.length})
            </h4>
            <div className="space-y-2">
              {results.errors.map((error, index) => (
                <div key={index} className="text-sm text-red-700">
                  <span className="font-medium">{error.source}:</span> {error.message}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Regulatory Database Search</h2>
          <p className="text-slate-600">
            Search across eCFR, FDA databases, and Federal Register for comprehensive regulatory information
          </p>
        </div>

        <div className="p-6">
          {/* Tab Navigation */}
          <div className="flex space-x-1 mb-6">
            <button
              onClick={() => setActiveTab('search')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'search'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              General Search
            </button>
            <button
              onClick={() => setActiveTab('citation')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'citation'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              CFR Citation Lookup
            </button>
          </div>

          {/* Search Form */}
          <div className="space-y-4">
            {activeTab === 'search' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Search Term
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="e.g., medical device software, 510k requirements, design controls"
                    className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </div>
              </div>
            )}

            {activeTab === 'citation' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  CFR Citation
                </label>
                <div className="relative">
                  <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={citation}
                    onChange={(e) => setCitation(e.target.value)}
                    placeholder="e.g., 21 CFR 820.30"
                    className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    onBlur={handleCitationValidation}
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Format: XX CFR YYY.ZZ (e.g., 21 CFR 820.30 for design controls)
                </p>
              </div>
            )}

            <button
              onClick={handleSearch}
              disabled={isLoading || (!searchQuery.trim() && !citation.trim())}
              className="w-full flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Searching regulatory databases...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Search All Sources
                </>
              )}
            </button>
          </div>

          {/* Results */}
          {renderResults()}
        </div>
      </div>
    </div>
  );
};