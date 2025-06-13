import React, { useState, useEffect } from 'react';
import { HelpCircle, X, Search, Book, Keyboard, MessageSquare, ExternalLink, ChevronRight, ArrowLeft } from 'lucide-react';
import { KeyboardShortcutsModal } from './KeyboardShortcuts';
import { TransitionWrapper } from './TransitionWrapper';

interface HelpCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

interface HelpArticle {
  id: string;
  title: string;
  category: string;
  content: React.ReactNode;
}

const HELP_ARTICLES: HelpArticle[] = [
  {
    id: 'getting-started',
    title: 'Getting Started with QualiPilot',
    category: 'Basics',
    content: (
      <div className="space-y-4">
        <p>
          Welcome to QualiPilot, your comprehensive medical device regulatory compliance platform. 
          This guide will help you get started with the key features.
        </p>
        
        <h4 className="text-lg font-medium text-slate-900">Key Features</h4>
        <ul className="list-disc list-inside space-y-2 text-slate-700">
          <li>
            <strong>AI-Powered FDA Assistant</strong> - Get instant answers to regulatory questions with citations
          </li>
          <li>
            <strong>Document Generator</strong> - Create FDA-compliant regulatory documents
          </li>
          <li>
            <strong>Regulatory Intelligence</strong> - Stay updated with the latest FDA regulations
          </li>
          <li>
            <strong>Compliance Tracking</strong> - Monitor your regulatory compliance status
          </li>
        </ul>
        
        <h4 className="text-lg font-medium text-slate-900">First Steps</h4>
        <ol className="list-decimal list-inside space-y-2 text-slate-700">
          <li>Complete your company profile in Settings</li>
          <li>Use the Regulatory Wizard to classify your device</li>
          <li>Generate your first compliance document</li>
          <li>Set up regulatory alerts for your device type</li>
        </ol>
      </div>
    )
  },
  {
    id: 'ai-assistant',
    title: 'Using the AI Regulatory Assistant',
    category: 'Features',
    content: (
      <div className="space-y-4">
        <p>
          The AI Regulatory Assistant helps you navigate complex FDA regulations by providing
          instant, accurate answers with proper citations to regulatory sources.
        </p>
        
        <h4 className="text-lg font-medium text-slate-900">How to Use</h4>
        <ol className="list-decimal list-inside space-y-2 text-slate-700">
          <li>Type your regulatory question in the chat input</li>
          <li>Review the AI response with regulatory citations</li>
          <li>Click on citations to view the original source</li>
          <li>Save important conversations for future reference</li>
        </ol>
        
        <h4 className="text-lg font-medium text-slate-900">Example Questions</h4>
        <ul className="list-disc list-inside space-y-2 text-slate-700">
          <li>"What are the key requirements for FDA 510(k) submission?"</li>
          <li>"Explain design controls for medical devices"</li>
          <li>"What documentation is needed for a Class II device?"</li>
          <li>"How do I implement risk management per ISO 14971?"</li>
        </ul>
        
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-800">
            <strong>Pro Tip:</strong> Be specific in your questions to get the most accurate responses.
            Include your device type and classification when relevant.
          </p>
        </div>
      </div>
    )
  },
  {
    id: 'document-generator',
    title: 'Creating Regulatory Documents',
    category: 'Features',
    content: (
      <div className="space-y-4">
        <p>
          The Document Generator creates FDA-compliant regulatory documents tailored to your
          specific device and regulatory pathway.
        </p>
        
        <h4 className="text-lg font-medium text-slate-900">Available Document Types</h4>
        <ul className="list-disc list-inside space-y-2 text-slate-700">
          <li>Quality Management System (QMS) Manual</li>
          <li>510(k) Premarket Notification</li>
          <li>Risk Management File</li>
          <li>Design Controls Documentation</li>
          <li>Software Validation Plan</li>
        </ul>
        
        <h4 className="text-lg font-medium text-slate-900">Generation Process</h4>
        <ol className="list-decimal list-inside space-y-2 text-slate-700">
          <li>Select your device classification and regulatory pathway</li>
          <li>Enter device and company information</li>
          <li>Choose the document template</li>
          <li>Validate requirements</li>
          <li>Generate and download your document</li>
        </ol>
        
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <p className="text-sm text-yellow-800">
            <strong>Important:</strong> Always review generated documents with a regulatory
            expert before submission to the FDA.
          </p>
        </div>
      </div>
    )
  },
  {
    id: 'regulatory-intelligence',
    title: 'Using Regulatory Intelligence',
    category: 'Features',
    content: (
      <div className="space-y-4">
        <p>
          The Regulatory Intelligence system provides real-time access to FDA regulations,
          monitors regulatory changes, and helps you stay compliant.
        </p>
        
        <h4 className="text-lg font-medium text-slate-900">Key Features</h4>
        <ul className="list-disc list-inside space-y-2 text-slate-700">
          <li>
            <strong>Advanced Search</strong> - Search across FDA regulations, guidance documents, and Federal Register
          </li>
          <li>
            <strong>Change Monitoring</strong> - Get alerts when regulations affecting your device change
          </li>
          <li>
            <strong>Device Classification</strong> - Determine the correct classification for your device
          </li>
          <li>
            <strong>Compliance Audit Trail</strong> - Track all regulatory queries and responses
          </li>
        </ul>
        
        <h4 className="text-lg font-medium text-slate-900">Search Tips</h4>
        <ul className="list-disc list-inside space-y-2 text-slate-700">
          <li>Use specific terms related to your device or requirement</li>
          <li>Filter by CFR title and part for more targeted results</li>
          <li>Try both keyword and semantic search options</li>
          <li>Save important searches for future reference</li>
        </ul>
      </div>
    )
  },
  {
    id: 'keyboard-shortcuts',
    title: 'Keyboard Shortcuts',
    category: 'Accessibility',
    content: (
      <div className="space-y-4">
        <p>
          QualiPilot supports keyboard shortcuts for faster navigation and improved accessibility.
          Press <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-300 rounded text-xs font-semibold text-slate-800">?</kbd> anywhere in the application to view all shortcuts.
        </p>
        
        <button
          className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors focus-ring"
          onClick={() => {
            // Open the keyboard shortcuts modal
            const event = new CustomEvent('openHelpCenter');
            document.dispatchEvent(event);
          }}
        >
          View All Shortcuts
        </button>
      </div>
    )
  },
  {
    id: 'accessibility',
    title: 'Accessibility Features',
    category: 'Accessibility',
    content: (
      <div className="space-y-4">
        <p>
          QualiPilot is designed to be accessible to all users, including those with disabilities.
          We follow WCAG 2.1 AA standards and provide the following accessibility features:
        </p>
        
        <h4 className="text-lg font-medium text-slate-900">Features</h4>
        <ul className="list-disc list-inside space-y-2 text-slate-700">
          <li>Full keyboard navigation</li>
          <li>Screen reader compatibility with ARIA labels</li>
          <li>High contrast mode</li>
          <li>Resizable text</li>
          <li>Reduced motion option</li>
        </ul>
        
        <h4 className="text-lg font-medium text-slate-900">Keyboard Navigation</h4>
        <p className="text-slate-700">
          Use <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-300 rounded text-xs font-semibold text-slate-800">Tab</kbd> to navigate between elements and <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-300 rounded text-xs font-semibold text-slate-800">Enter</kbd> or <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-300 rounded text-xs font-semibold text-slate-800">Space</kbd> to activate buttons and controls.
        </p>
      </div>
    )
  },
  {
    id: 'contact-support',
    title: 'Contact Support',
    category: 'Help',
    content: (
      <div className="space-y-4">
        <p>
          Need help with QualiPilot? Our support team is available to assist you.
        </p>
        
        <h4 className="text-lg font-medium text-slate-900">Contact Options</h4>
        <ul className="list-disc list-inside space-y-2 text-slate-700">
          <li>Email: support@qualipilot.com</li>
          <li>Phone: (800) 555-1234</li>
          <li>Live Chat: Available Monday-Friday, 9am-5pm ET</li>
        </ul>
        
        <h4 className="text-lg font-medium text-slate-900">Before Contacting Support</h4>
        <p className="text-slate-700">
          Please have the following information ready:
        </p>
        <ul className="list-disc list-inside space-y-2 text-slate-700">
          <li>Your account email</li>
          <li>Device type and classification</li>
          <li>Description of the issue</li>
          <li>Screenshots (if applicable)</li>
        </ul>
        
        <button
          className="mt-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors focus-ring flex items-center space-x-2"
          onClick={() => window.open('mailto:support@qualipilot.com')}
        >
          <MessageSquare className="h-4 w-4" />
          <span>Contact Support</span>
        </button>
      </div>
    )
  }
];

export const HelpCenterButton: React.FC<{ className?: string }> = ({ className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  // Listen for global event to open help center
  useEffect(() => {
    const handleOpenHelp = () => setIsOpen(true);
    document.addEventListener('openHelpCenter', handleOpenHelp);
    return () => document.removeEventListener('openHelpCenter', handleOpenHelp);
  }, []);
  
  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`p-2 rounded-lg hover:bg-slate-100 transition-colors focus-ring ${className}`}
        aria-label="Help center"
      >
        <HelpCircle className="h-5 w-5 text-slate-600" />
      </button>
      
      <TransitionWrapper
        show={isOpen}
        enter="transition-all duration-300"
        enterFrom="opacity-0 scale-95"
        enterTo="opacity-100 scale-100"
        leave="transition-all duration-200"
        leaveFrom="opacity-100 scale-100"
        leaveTo="opacity-0 scale-95"
      >
        <HelpCenter isOpen={isOpen} onClose={() => setIsOpen(false)} />
      </TransitionWrapper>
    </>
  );
};

export const HelpCenter: React.FC<HelpCenterProps> = ({ isOpen, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArticle, setSelectedArticle] = useState<HelpArticle | null>(null);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
  
  // Filter articles based on search query
  const filteredArticles = searchQuery
    ? HELP_ARTICLES.filter(article => 
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : HELP_ARTICLES;
  
  // Group articles by category
  const articlesByCategory = filteredArticles.reduce((acc, article) => {
    if (!acc[article.category]) {
      acc[article.category] = [];
    }
    acc[article.category].push(article);
    return acc;
  }, {} as Record<string, HelpArticle[]>);

  // Close on escape key
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (selectedArticle) {
          setSelectedArticle(null);
        } else {
          onClose();
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, selectedArticle]);

  // Prevent scrolling of background
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (showKeyboardShortcuts) {
    return <KeyboardShortcutsModal onClose={() => setShowKeyboardShortcuts(false)} />;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div 
        className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden animate-slide-in-up"
        role="dialog"
        aria-modal="true"
        aria-labelledby="help-center-title"
      >
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div className="flex items-center space-x-3">
            <div className="bg-teal-100 p-2 rounded-full">
              <HelpCircle className="h-5 w-5 text-teal-600" />
            </div>
            <h2 id="help-center-title" className="text-xl font-semibold text-slate-900">
              {selectedArticle ? 'Help Article' : 'Help Center'}
            </h2>
          </div>
          
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-100 transition-colors focus-ring"
            aria-label="Close help center"
          >
            <X className="h-5 w-5 text-slate-600" />
          </button>
        </div>
        
        {selectedArticle ? (
          <div className="flex flex-col h-[calc(90vh-80px)]">
            <div className="p-4 border-b border-slate-200 bg-slate-50">
              <button
                onClick={() => setSelectedArticle(null)}
                className="flex items-center text-teal-600 hover:text-teal-700 transition-colors focus-ring rounded-lg px-2 py-1"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                <span>Back to Help Center</span>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              <h3 className="text-2xl font-semibold text-slate-900 mb-2">{selectedArticle.title}</h3>
              <div className="text-sm text-slate-500 mb-6">Category: {selectedArticle.category}</div>
              
              <div className="prose max-w-none">
                {selectedArticle.content}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col h-[calc(90vh-80px)]">
            <div className="p-4 border-b border-slate-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search help articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="overflow-y-auto flex-1 p-6">
              {Object.keys(articlesByCategory).length === 0 ? (
                <div className="text-center py-12">
                  <Search className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-900 mb-2">No results found</h3>
                  <p className="text-slate-600">
                    Try searching with different keywords or browse all articles
                  </p>
                  <button
                    onClick={() => setSearchQuery('')}
                    className="mt-4 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
                  >
                    Clear Search
                  </button>
                </div>
              ) : (
                <div className="space-y-8">
                  {Object.entries(articlesByCategory).map(([category, articles]) => (
                    <div key={category}>
                      <h3 className="text-lg font-medium text-slate-900 mb-4">{category}</h3>
                      <div className="space-y-3">
                        {articles.map((article) => (
                          <button
                            key={article.id}
                            onClick={() => setSelectedArticle(article)}
                            className="w-full text-left p-4 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors focus-ring"
                          >
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium text-slate-900">{article.title}</h4>
                              <ChevronRight className="h-4 w-4 text-slate-400" />
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                  
                  {/* Special buttons */}
                  <div>
                    <h3 className="text-lg font-medium text-slate-900 mb-4">Quick Access</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <button
                        onClick={() => setShowKeyboardShortcuts(true)}
                        className="flex items-center justify-between p-4 bg-teal-50 hover:bg-teal-100 rounded-lg transition-colors focus-ring"
                      >
                        <div className="flex items-center">
                          <Keyboard className="h-5 w-5 text-teal-600 mr-3" />
                          <span className="font-medium text-teal-900">Keyboard Shortcuts</span>
                        </div>
                        <ChevronRight className="h-4 w-4 text-teal-500" />
                      </button>
                      
                      <button
                        onClick={() => window.open('https://docs.qualipilot.com', '_blank')}
                        className="flex items-center justify-between p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors focus-ring"
                      >
                        <div className="flex items-center">
                          <Book className="h-5 w-5 text-blue-600 mr-3" />
                          <span className="font-medium text-blue-900">Documentation</span>
                        </div>
                        <ExternalLink className="h-4 w-4 text-blue-500" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-between items-center">
          <div className="text-sm text-slate-500">
            QualiPilot v1.2.0
          </div>
          
          <button
            onClick={onClose}
            className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors focus-ring"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};