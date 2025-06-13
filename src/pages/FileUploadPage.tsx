import React from 'react';
import { FileUploader } from '../components/ui/FileUploader';
import { FileUploadDemo } from '../components/ui/FileUploadDemo';

export const FileUploadPage: React.FC = () => {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">File Upload Component</h1>
      
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4 text-slate-900 dark:text-white">Basic Implementation</h2>
        <p className="text-slate-600 dark:text-slate-300 mb-6">
          A fully-featured file upload component with drag-and-drop support, file previews, progress tracking, and validation.
        </p>
        
        <FileUploader 
          onUploadComplete={(fileUrl, metadata) => {
            console.log('File uploaded:', fileUrl, metadata);
          }}
          onFileRemoved={(fileId) => {
            console.log('File removed:', fileId);
          }}
          onError={(error) => {
            console.error('Upload error:', error);
          }}
          allowedFileTypes={['.jpg', '.jpeg', '.png', '.pdf', '.doc', '.docx']}
          maxSizeMB={5}
          bucket="uploads"
          folder="demo"
        />
      </div>
      
      <FileUploadDemo />
    </div>
  );
};