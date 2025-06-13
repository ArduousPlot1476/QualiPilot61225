import React, { useState } from 'react';
import { FileUploader, UploadedFile } from './FileUploader';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './Tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './Card';
import { Button } from './Button';
import { Trash, Download, Upload, Settings } from 'lucide-react';

export const FileUploadDemo: React.FC = () => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [activeTab, setActiveTab] = useState('basic');
  
  const handleUploadComplete = (fileUrl: string, fileMetadata: any) => {
    const newFile: UploadedFile = {
      id: `file_${Date.now()}`,
      name: fileMetadata.name,
      size: fileMetadata.size,
      type: fileMetadata.type,
      url: fileUrl,
      uploadedAt: new Date()
    };
    
    setUploadedFiles(prev => [...prev, newFile]);
  };
  
  const handleFileRemoved = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
  };
  
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">File Upload Component</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="basic">Basic Uploader</TabsTrigger>
          <TabsTrigger value="advanced">Advanced Options</TabsTrigger>
          <TabsTrigger value="gallery">File Gallery</TabsTrigger>
        </TabsList>
        
        <TabsContent value="basic">
          <Card>
            <CardHeader>
              <CardTitle>Basic File Upload</CardTitle>
              <CardDescription>
                Upload files with drag and drop or file browser
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FileUploader
                onUploadComplete={handleUploadComplete}
                onFileRemoved={handleFileRemoved}
                allowedFileTypes={['.jpg', '.jpeg', '.png', '.pdf', '.doc', '.docx']}
                maxSizeMB={5}
                bucket="uploads"
                folder="demo"
                initialFiles={uploadedFiles}
              />
            </CardContent>
            <CardFooter className="flex justify-between">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Supports images, PDFs, and Office documents up to 5MB
              </p>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="advanced">
          <Card>
            <CardHeader>
              <CardTitle>Advanced Upload Options</CardTitle>
              <CardDescription>
                Multiple file uploads with custom validation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FileUploader
                onUploadComplete={handleUploadComplete}
                onFileRemoved={handleFileRemoved}
                allowedFileTypes={['.jpg', '.jpeg', '.png', '.pdf', '.zip', '.mp4']}
                maxSizeMB={20}
                bucket="uploads"
                folder="advanced"
                multiple={true}
                initialFiles={uploadedFiles}
                dragDropText="Drop files here or click to browse (multiple files allowed)"
              />
            </CardContent>
            <CardFooter className="flex justify-between">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Supports images, PDFs, ZIP archives, and videos up to 20MB
              </p>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Configure
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="gallery">
          <Card>
            <CardHeader>
              <CardTitle>Uploaded Files Gallery</CardTitle>
              <CardDescription>
                View and manage your uploaded files
              </CardDescription>
            </CardHeader>
            <CardContent>
              {uploadedFiles.length === 0 ? (
                <div className="text-center py-12">
                  <Upload className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">No files uploaded</h3>
                  <p className="text-slate-500 dark:text-slate-400 mb-4">
                    Upload files using the Basic or Advanced uploader tabs
                  </p>
                  <Button onClick={() => setActiveTab('basic')}>
                    Upload Files
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {uploadedFiles.map(file => (
                    <div key={file.id} className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden bg-white dark:bg-slate-800 shadow-sm hover:shadow-md transition-shadow">
                      <div className="aspect-square bg-slate-100 dark:bg-slate-900 flex items-center justify-center">
                        {file.thumbnailUrl ? (
                          <img 
                            src={file.thumbnailUrl} 
                            alt={file.name} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="text-slate-400 dark:text-slate-600">
                            {file.type.startsWith('image/') ? (
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            ) : (
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="p-3">
                        <h4 className="font-medium text-slate-900 dark:text-white text-sm truncate" title={file.name}>
                          {file.name}
                        </h4>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            {new Date(file.uploadedAt).toLocaleDateString()}
                          </span>
                          <div className="flex space-x-1">
                            <Button size="icon" variant="ghost" asChild>
                              <a href={file.url} download={file.name} aria-label="Download file">
                                <Download className="h-4 w-4" />
                              </a>
                            </Button>
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              onClick={() => handleFileRemoved(file.id)}
                              aria-label="Delete file"
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};