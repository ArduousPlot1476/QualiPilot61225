import React, { useState, useRef } from 'react';
import { Upload, File, X, CheckCircle, AlertTriangle } from 'lucide-react';
import { supabase } from '../../lib/supabase/client';
import { useToast } from '../ui/Toast';

interface FileUploaderProps {
  onUploadComplete?: (fileUrl: string, fileMetadata: any) => void;
  allowedFileTypes?: string[];
  maxSizeMB?: number;
  folder?: string;
}

export const FileUploader: React.FC<FileUploaderProps> = ({
  onUploadComplete,
  allowedFileTypes = ['.pdf', '.docx', '.doc', '.txt'],
  maxSizeMB = 10,
  folder = 'documents'
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showToast } = useToast();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const validateFile = (file: File): boolean => {
    // Check file size
    if (file.size > maxSizeMB * 1024 * 1024) {
      setUploadError(`File size exceeds ${maxSizeMB}MB limit`);
      return false;
    }

    // Check file type
    const fileExtension = `.${file.name.split('.').pop()?.toLowerCase()}`;
    if (!allowedFileTypes.includes(fileExtension)) {
      setUploadError(`File type not allowed. Accepted types: ${allowedFileTypes.join(', ')}`);
      return false;
    }

    return true;
  };

  const handleFileUpload = async (file: File) => {
    if (!validateFile(file)) return;

    setIsUploading(true);
    setUploadProgress(0);
    setUploadError(null);
    setUploadedFile(file);

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Create a unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      const filePath = `${folder}/${fileName}`;

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          const newProgress = prev + 10;
          return newProgress >= 90 ? 90 : newProgress;
        });
      }, 300);

      // Upload file to Supabase Storage
      const { data, error } = await supabase.storage
        .from(folder)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      clearInterval(progressInterval);

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(folder)
        .getPublicUrl(fileName);

      setUploadProgress(100);
      
      showToast({
        type: 'success',
        title: 'Upload Complete',
        message: 'File has been uploaded successfully',
        duration: 3000
      });

      // Call callback with file info
      if (onUploadComplete) {
        onUploadComplete(publicUrl, {
          name: file.name,
          size: file.size,
          type: file.type,
          path: filePath
        });
      }
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Upload failed');
      
      showToast({
        type: 'error',
        title: 'Upload Failed',
        message: error instanceof Error ? error.message : 'Failed to upload file',
        duration: 5000
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileUpload(e.target.files[0]);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileInputChange}
        accept={allowedFileTypes.join(',')}
        className="hidden"
      />
      
      {!uploadedFile ? (
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
            isDragging 
              ? 'border-teal-500 bg-teal-50' 
              : 'border-slate-300 hover:border-teal-400 hover:bg-slate-50'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={triggerFileInput}
        >
          <Upload className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-700 font-medium mb-1">
            Drag and drop a file here, or click to browse
          </p>
          <p className="text-slate-500 text-sm">
            Accepted file types: {allowedFileTypes.join(', ')} (Max size: {maxSizeMB}MB)
          </p>
        </div>
      ) : (
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <File className="h-8 w-8 text-teal-600 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-slate-900 font-medium truncate">{uploadedFile.name}</p>
              <p className="text-slate-500 text-sm">
                {(uploadedFile.size / (1024 * 1024)).toFixed(2)} MB
              </p>
              
              {isUploading ? (
                <div className="mt-2">
                  <div className="w-full bg-slate-200 rounded-full h-2 mb-1">
                    <div 
                      className="bg-teal-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p className="text-xs text-slate-500">Uploading: {uploadProgress}%</p>
                </div>
              ) : uploadError ? (
                <div className="mt-2 flex items-center text-red-600 text-sm">
                  <AlertTriangle className="h-4 w-4 mr-1" />
                  {uploadError}
                </div>
              ) : uploadProgress === 100 ? (
                <div className="mt-2 flex items-center text-green-600 text-sm">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Upload complete
                </div>
              ) : null}
            </div>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                setUploadedFile(null);
                setUploadProgress(0);
                setUploadError(null);
              }}
              className="p-1 rounded-full hover:bg-slate-200 transition-colors"
            >
              <X className="h-5 w-5 text-slate-500" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};