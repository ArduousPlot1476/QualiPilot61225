import React, { useState, useEffect } from 'react';
import { FileText, Download, Trash2, Upload, AlertTriangle, Search, Filter } from 'lucide-react';
import { FileUploader } from './FileUploader';
import { useToast } from '../ui/Toast';
import { dbHelpers } from '../../lib/supabase/client';

interface CompanyDocument {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadDate: Date;
  url: string;
}

export const CompanyDocuments: React.FC = () => {
  const [documents, setDocuments] = useState<CompanyDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showUploader, setShowUploader] = useState(false);
  const { showToast } = useToast();

  // Load documents
  useEffect(() => {
    const loadDocuments = async () => {
      try {
        setIsLoading(true);
        // In a real implementation, this would fetch from Supabase
        // For now, we'll use mock data
        const mockDocuments: CompanyDocument[] = [
          {
            id: '1',
            name: 'Quality Manual.pdf',
            type: 'PDF',
            size: '2.4 MB',
            uploadDate: new Date(2024, 5, 10),
            url: '#'
          },
          {
            id: '2',
            name: 'Design Controls SOP.docx',
            type: 'DOCX',
            size: '1.8 MB',
            uploadDate: new Date(2024, 5, 8),
            url: '#'
          },
          {
            id: '3',
            name: 'Risk Management Plan.pdf',
            type: 'PDF',
            size: '3.2 MB',
            uploadDate: new Date(2024, 5, 5),
            url: '#'
          }
        ];
        
        setDocuments(mockDocuments);
      } catch (error) {
        console.error('Error loading documents:', error);
        showToast({
          type: 'error',
          title: 'Loading Failed',
          message: 'Could not load company documents',
          duration: 5000
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadDocuments();
  }, [showToast]);

  const handleFileUpload = (fileUrl: string, fileMetadata: any) => {
    // In a real implementation, this would save to Supabase
    const newDocument: CompanyDocument = {
      id: Math.random().toString(36).substring(2, 9),
      name: fileMetadata.name,
      type: fileMetadata.type.split('/')[1].toUpperCase(),
      size: `${(fileMetadata.size / (1024 * 1024)).toFixed(2)} MB`,
      uploadDate: new Date(),
      url: fileUrl
    };
    
    setDocuments(prev => [newDocument, ...prev]);
    setShowUploader(false);
    
    showToast({
      type: 'success',
      title: 'Document Uploaded',
      message: `${fileMetadata.name} has been uploaded successfully`,
      duration: 3000
    });
  };

  const handleDeleteDocument = (id: string) => {
    // In a real implementation, this would delete from Supabase
    setDocuments(prev => prev.filter(doc => doc.id !== id));
    
    showToast({
      type: 'success',
      title: 'Document Deleted',
      message: 'Document has been deleted successfully',
      duration: 3000
    });
  };

  const filteredDocuments = documents.filter(doc => 
    doc.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="p-6 border-b border-slate-200 flex justify-between items-center">
        <h2 className="text-xl font-semibold text-slate-900">Company Documents</h2>
        <button
          onClick={() => setShowUploader(!showUploader)}
          className="px-3 py-1.5 bg-teal-100 text-teal-700 rounded-lg hover:bg-teal-200 transition-colors flex items-center space-x-1"
        >
          <Upload className="h-4 w-4" />
          <span>Upload Document</span>
        </button>
      </div>
      
      {showUploader && (
        <div className="p-6 border-b border-slate-200 bg-slate-50">
          <h3 className="text-lg font-medium text-slate-900 mb-4">Upload New Document</h3>
          <FileUploader 
            onUploadComplete={handleFileUpload}
            allowedFileTypes={['.pdf', '.docx', '.doc', '.txt', '.xlsx', '.xls']}
            maxSizeMB={20}
            folder="company_documents"
          />
        </div>
      )}
      
      <div className="p-6">
        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 space-y-4 md:space-y-0">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search documents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <button className="px-3 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors flex items-center space-x-1">
              <Filter className="h-4 w-4 text-slate-500" />
              <span className="text-sm text-slate-700">Filter</span>
            </button>
            
            <select className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent">
              <option value="date">Sort by Date</option>
              <option value="name">Sort by Name</option>
              <option value="type">Sort by Type</option>
              <option value="size">Sort by Size</option>
            </select>
          </div>
        </div>
        
        {/* Document List */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse flex items-center p-4 border border-slate-200 rounded-lg">
                <div className="w-10 h-10 bg-slate-200 rounded mr-4"></div>
                <div className="flex-1">
                  <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                </div>
                <div className="w-20 h-8 bg-slate-200 rounded"></div>
              </div>
            ))}
          </div>
        ) : filteredDocuments.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">No documents found</h3>
            <p className="text-slate-500 mb-6">
              {searchTerm ? 'Try a different search term' : 'Upload your first document to get started'}
            </p>
            {!searchTerm && (
              <button
                onClick={() => setShowUploader(true)}
                className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
              >
                Upload Document
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredDocuments.map(doc => (
              <div key={doc.id} className="flex items-center p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                <div className="mr-4">
                  <FileText className="h-10 w-10 text-teal-600" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-slate-900 truncate">{doc.name}</h3>
                  <div className="flex items-center text-sm text-slate-500 mt-1">
                    <span className="bg-slate-100 px-2 py-0.5 rounded text-xs font-medium mr-2">{doc.type}</span>
                    <span>{doc.size}</span>
                    <span className="mx-2">•</span>
                    <span>Uploaded {doc.uploadDate.toLocaleDateString()}</span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => window.open(doc.url, '_blank')}
                    className="p-2 text-slate-600 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                    title="Download document"
                  >
                    <Download className="h-5 w-5" />
                  </button>
                  
                  <button
                    onClick={() => handleDeleteDocument(doc.id)}
                    className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete document"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Document Storage Info */}
        <div className="mt-8 p-4 bg-slate-50 rounded-lg border border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-slate-700">Storage Usage</h3>
            <span className="text-sm text-slate-500">7.4 MB / 1 GB</span>
          </div>
          
          <div className="w-full bg-slate-200 rounded-full h-2.5">
            <div className="bg-teal-600 h-2.5 rounded-full" style={{ width: '0.74%' }}></div>
          </div>
          
          <div className="mt-2 flex items-start space-x-2">
            <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5" />
            <p className="text-xs text-slate-600">
              Free accounts have 1GB of storage. Upgrade to a premium plan for additional storage and features.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};