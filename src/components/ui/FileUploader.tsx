import React, { useState, useRef, useCallback } from 'react';
import { Upload, File, X, AlertTriangle, CheckCircle, Loader2, Trash, Eye, Download, FileText, Image, Film, Music, Archive, Code, Database } from 'lucide-react';
import { supabase } from '../../lib/supabase/client';
import { useToast } from './Toast';
import { TransitionWrapper } from './TransitionWrapper';
import { ProgressBar } from './LoadingStates';

export interface FileUploaderProps {
  /**
   * Function called when a file is successfully uploaded
   */
  onUploadComplete?: (fileUrl: string, fileMetadata: FileMetadata) => void;
  
  /**
   * Function called when a file is removed
   */
  onFileRemoved?: (fileId: string) => void;
  
  /**
   * Function called when an error occurs
   */
  onError?: (error: Error) => void;
  
  /**
   * Allowed file types (e.g., ['.pdf', '.jpg'])
   */
  allowedFileTypes?: string[];
  
  /**
   * Maximum file size in MB
   */
  maxSizeMB?: number;
  
  /**
   * Storage bucket to upload to
   */
  bucket?: string;
  
  /**
   * Folder path within the bucket
   */
  folder?: string;
  
  /**
   * Allow multiple file uploads
   */
  multiple?: boolean;
  
  /**
   * Custom class name
   */
  className?: string;
  
  /**
   * Initial files to display
   */
  initialFiles?: UploadedFile[];
  
  /**
   * Disable the uploader
   */
  disabled?: boolean;
  
  /**
   * Custom upload button text
   */
  uploadButtonText?: string;
  
  /**
   * Custom drag and drop text
   */
  dragDropText?: string;
}

export interface FileMetadata {
  name: string;
  size: number;
  type: string;
  lastModified: number;
  path?: string;
}

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  thumbnailUrl?: string;
  uploadedAt: Date;
}

interface FileWithPreview extends File {
  id: string;
  preview?: string;
  progress?: number;
  error?: string;
  status: 'idle' | 'uploading' | 'success' | 'error';
}

/**
 * A comprehensive file upload component with drag and drop, preview, progress tracking,
 * and validation features.
 */
export const FileUploader: React.FC<FileUploaderProps> = ({
  onUploadComplete,
  onFileRemoved,
  onError,
  allowedFileTypes = ['.jpg', '.jpeg', '.png', '.pdf', '.doc', '.docx', '.xls', '.xlsx'],
  maxSizeMB = 10,
  bucket = 'uploads',
  folder = 'files',
  multiple = false,
  className = '',
  initialFiles = [],
  disabled = false,
  uploadButtonText = 'Select File',
  dragDropText = 'Drag and drop files here, or click to browse'
}) => {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>(initialFiles);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const { showToast } = useToast();

  // Handle drag events
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;
    setIsDragging(true);
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;
    setIsDragging(true);
  }, [disabled]);

  // Process files when dropped or selected
  const processFiles = useCallback((fileList: FileList | null) => {
    if (!fileList || disabled) return;
    
    const newFiles: FileWithPreview[] = [];
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    const fileExtensionRegex = new RegExp(`(${allowedFileTypes.map(type => type.replace('.', '\\.')).join('|')})$`, 'i');
    
    Array.from(fileList).forEach(file => {
      // Generate a unique ID for the file
      const fileId = `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Validate file size
      if (file.size > maxSizeBytes) {
        showToast({
          type: 'error',
          title: 'File Too Large',
          message: `${file.name} exceeds the maximum size of ${maxSizeMB}MB`,
          duration: 5000
        });
        return;
      }
      
      // Validate file type
      const fileExtension = `.${file.name.split('.').pop()?.toLowerCase()}`;
      if (!allowedFileTypes.includes('*') && !fileExtensionRegex.test(file.name)) {
        showToast({
          type: 'error',
          title: 'Invalid File Type',
          message: `${file.name} is not an allowed file type`,
          duration: 5000
        });
        return;
      }
      
      // Create file preview for images
      let preview = undefined;
      if (file.type.startsWith('image/')) {
        preview = URL.createObjectURL(file);
      }
      
      newFiles.push({
        ...file,
        id: fileId,
        preview,
        progress: 0,
        status: 'idle'
      });
    });
    
    if (!multiple) {
      // Replace existing files if multiple is false
      setFiles(newFiles);
    } else {
      // Add to existing files if multiple is true
      setFiles(prev => [...prev, ...newFiles]);
    }
  }, [allowedFileTypes, disabled, maxSizeMB, multiple, showToast]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (disabled) return;
    
    processFiles(e.dataTransfer.files);
  }, [disabled, processFiles]);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    processFiles(e.target.files);
    // Reset the input value so the same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [processFiles]);

  const openFileDialog = useCallback(() => {
    if (disabled) return;
    fileInputRef.current?.click();
  }, [disabled]);

  // Remove a file from the list
  const removeFile = useCallback((fileId: string) => {
    setFiles(prev => prev.filter(file => file.id !== fileId));
    
    // Revoke object URL to prevent memory leaks
    const fileToRemove = files.find(file => file.id === fileId);
    if (fileToRemove?.preview) {
      URL.revokeObjectURL(fileToRemove.preview);
    }
  }, [files]);

  // Remove an uploaded file
  const removeUploadedFile = useCallback((fileId: string) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
    
    if (onFileRemoved) {
      onFileRemoved(fileId);
    }
  }, [onFileRemoved]);

  // Upload a file to Supabase Storage
  const uploadFile = useCallback(async (file: FileWithPreview) => {
    try {
      // Update file status to uploading
      setFiles(prev => prev.map(f => 
        f.id === file.id ? { ...f, status: 'uploading', progress: 0 } : f
      ));
      
      // Get current user for folder path
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      // Create a unique file path
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
      const filePath = `${folder}/${fileName}`;
      
      // Upload file with progress tracking
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
          onUploadProgress: (progress) => {
            const percent = Math.round((progress.loaded / progress.total) * 100);
            setFiles(prev => prev.map(f => 
              f.id === file.id ? { ...f, progress: percent } : f
            ));
          }
        });
      
      if (error) {
        throw error;
      }
      
      // Get public URL for the file
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);
      
      // Update file status to success
      setFiles(prev => prev.map(f => 
        f.id === file.id ? { ...f, status: 'success', progress: 100 } : f
      ));
      
      // Add to uploaded files
      const uploadedFile: UploadedFile = {
        id: file.id,
        name: file.name,
        size: file.size,
        type: file.type,
        url: publicUrl,
        thumbnailUrl: file.preview,
        uploadedAt: new Date()
      };
      
      setUploadedFiles(prev => [...prev, uploadedFile]);
      
      // Call onUploadComplete callback
      if (onUploadComplete) {
        onUploadComplete(publicUrl, {
          name: file.name,
          size: file.size,
          type: file.type,
          lastModified: file.lastModified,
          path: filePath
        });
      }
      
      showToast({
        type: 'success',
        title: 'Upload Complete',
        message: `${file.name} has been uploaded successfully`,
        duration: 3000
      });
      
      // Remove file from the files list after a delay
      setTimeout(() => {
        removeFile(file.id);
      }, 1000);
      
    } catch (error) {
      console.error('Upload error:', error);
      
      // Update file status to error
      setFiles(prev => prev.map(f => 
        f.id === file.id ? { 
          ...f, 
          status: 'error', 
          error: error instanceof Error ? error.message : 'Upload failed' 
        } : f
      ));
      
      showToast({
        type: 'error',
        title: 'Upload Failed',
        message: error instanceof Error ? error.message : 'Failed to upload file',
        duration: 5000
      });
      
      if (onError) {
        onError(error instanceof Error ? error : new Error('Upload failed'));
      }
    }
  }, [bucket, folder, onError, onUploadComplete, removeFile, showToast]);

  // Upload all files
  const uploadAllFiles = useCallback(() => {
    files.forEach(file => {
      if (file.status === 'idle') {
        uploadFile(file);
      }
    });
  }, [files, uploadFile]);

  // Retry a failed upload
  const retryUpload = useCallback((fileId: string) => {
    const fileToRetry = files.find(file => file.id === fileId);
    if (fileToRetry) {
      uploadFile(fileToRetry);
    }
  }, [files, uploadFile]);

  // Get file icon based on file type
  const getFileIcon = useCallback((fileType: string) => {
    if (fileType.startsWith('image/')) return <Image className="h-8 w-8 text-blue-500" />;
    if (fileType.startsWith('video/')) return <Film className="h-8 w-8 text-purple-500" />;
    if (fileType.startsWith('audio/')) return <Music className="h-8 w-8 text-pink-500" />;
    if (fileType.includes('pdf')) return <FileText className="h-8 w-8 text-red-500" />;
    if (fileType.includes('word') || fileType.includes('document')) return <FileText className="h-8 w-8 text-blue-600" />;
    if (fileType.includes('excel') || fileType.includes('sheet')) return <FileText className="h-8 w-8 text-green-600" />;
    if (fileType.includes('zip') || fileType.includes('compressed')) return <Archive className="h-8 w-8 text-yellow-600" />;
    if (fileType.includes('json') || fileType.includes('javascript') || fileType.includes('html')) return <Code className="h-8 w-8 text-gray-600" />;
    if (fileType.includes('csv') || fileType.includes('database')) return <Database className="h-8 w-8 text-indigo-600" />;
    return <File className="h-8 w-8 text-gray-500" />;
  }, []);

  // Format file size for display
  const formatFileSize = useCallback((bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }, []);

  // Set up keyboard accessibility
  useEffect(() => {
    const dropZone = dropZoneRef.current;
    if (!dropZone) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openFileDialog();
      }
    };

    dropZone.addEventListener('keydown', handleKeyDown);
    return () => {
      dropZone.removeEventListener('keydown', handleKeyDown);
    };
  }, [openFileDialog]);

  // Clean up object URLs when component unmounts
  useEffect(() => {
    return () => {
      files.forEach(file => {
        if (file.preview) {
          URL.revokeObjectURL(file.preview);
        }
      });
    };
  }, [files]);

  return (
    <div className={`w-full ${className}`}>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple={multiple}
        accept={allowedFileTypes.join(',')}
        onChange={handleFileInputChange}
        className="hidden"
        aria-hidden="true"
        disabled={disabled}
      />
      
      {/* Drop zone */}
      <div
        ref={dropZoneRef}
        className={`
          border-2 border-dashed rounded-lg p-6 transition-colors duration-200
          ${disabled ? 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 cursor-not-allowed' : 
            isDragging ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/20' : 
            'border-slate-300 dark:border-slate-700 hover:border-teal-400 dark:hover:border-teal-600 hover:bg-slate-50 dark:hover:bg-slate-800/50'}
          ${files.length > 0 ? 'pb-2' : ''}
        `}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={openFileDialog}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            openFileDialog();
          }
        }}
        tabIndex={disabled ? -1 : 0}
        role="button"
        aria-label={disabled ? "File upload disabled" : "Click or drag and drop to upload files"}
        aria-disabled={disabled}
      >
        {files.length === 0 ? (
          <div className="text-center">
            <Upload className={`h-12 w-12 mx-auto mb-4 ${disabled ? 'text-slate-400 dark:text-slate-600' : 'text-slate-400 dark:text-slate-500'}`} />
            <p className={`font-medium mb-1 ${disabled ? 'text-slate-500 dark:text-slate-400' : 'text-slate-700 dark:text-slate-300'}`}>
              {dragDropText}
            </p>
            <p className={`text-sm ${disabled ? 'text-slate-400 dark:text-slate-500' : 'text-slate-500 dark:text-slate-400'}`}>
              {allowedFileTypes.includes('*') 
                ? `Maximum file size: ${maxSizeMB}MB` 
                : `Accepted file types: ${allowedFileTypes.join(', ')} (Max size: ${maxSizeMB}MB)`}
            </p>
            {disabled && (
              <p className="text-sm text-amber-600 dark:text-amber-400 mt-2">
                File upload is currently disabled
              </p>
            )}
          </div>
        ) : (
          <div className="text-center mb-4">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Drop more files to add, or click to browse
            </p>
          </div>
        )}
      </div>
      
      {/* File list */}
      {files.length > 0 && (
        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Files to Upload ({files.length})
            </h3>
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={uploadAllFiles}
                disabled={files.every(f => f.status !== 'idle') || disabled}
                className="px-3 py-1 text-xs bg-teal-600 text-white rounded hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus-ring"
                aria-label="Upload all files"
              >
                Upload All
              </button>
              <button
                type="button"
                onClick={() => setFiles([])}
                disabled={disabled}
                className="px-3 py-1 text-xs bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus-ring"
                aria-label="Clear all files"
              >
                Clear All
              </button>
            </div>
          </div>
          
          {files.map(file => (
            <div 
              key={file.id} 
              className={`
                p-4 rounded-lg border transition-all duration-200
                ${file.status === 'error' ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' : 
                  file.status === 'success' ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' : 
                  'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'}
              `}
            >
              <div className="flex items-start">
                <div className="mr-3 flex-shrink-0">
                  {file.preview ? (
                    <div className="w-12 h-12 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
                      <img 
                        src={file.preview} 
                        alt={file.name} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    getFileIcon(file.type)
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-slate-900 dark:text-white truncate" title={file.name}>
                        {file.name}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                    
                    <div className="flex items-center ml-4">
                      {file.status === 'idle' && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            uploadFile(file);
                          }}
                          className="p-1 text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 hover:bg-teal-50 dark:hover:bg-teal-900/20 rounded transition-colors focus-ring"
                          aria-label={`Upload ${file.name}`}
                        >
                          <Upload className="h-4 w-4" />
                        </button>
                      )}
                      
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFile(file.id);
                        }}
                        className="p-1 text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors focus-ring ml-1"
                        aria-label={`Remove ${file.name}`}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  
                  {file.status === 'uploading' && (
                    <div className="mt-2">
                      <ProgressBar progress={file.progress || 0} />
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Uploading: {file.progress}%
                      </p>
                    </div>
                  )}
                  
                  {file.status === 'error' && (
                    <div className="mt-2 flex items-center text-red-600 dark:text-red-400 text-xs">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      <span>{file.error || 'Upload failed'}</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          retryUpload(file.id);
                        }}
                        className="ml-2 px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded text-xs hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors focus-ring"
                      >
                        Retry
                      </button>
                    </div>
                  )}
                  
                  {file.status === 'success' && (
                    <div className="mt-2 flex items-center text-green-600 dark:text-green-400 text-xs">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      <span>Upload complete</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Uploaded files */}
      {uploadedFiles.length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
            Uploaded Files ({uploadedFiles.length})
          </h3>
          
          <div className="space-y-3">
            {uploadedFiles.map(file => (
              <div 
                key={file.id}
                className="p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start">
                  <div className="mr-3 flex-shrink-0">
                    {file.thumbnailUrl ? (
                      <div className="w-12 h-12 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
                        <img 
                          src={file.thumbnailUrl} 
                          alt={file.name} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      getFileIcon(file.type)
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-slate-900 dark:text-white truncate" title={file.name}>
                          {file.name}
                        </h4>
                        <div className="flex items-center text-xs text-slate-500 dark:text-slate-400 mt-1">
                          <span className="mr-2">{formatFileSize(file.size)}</span>
                          <span>•</span>
                          <span className="ml-2">{new Date(file.uploadedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center ml-4">
                        <a
                          href={file.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors focus-ring"
                          aria-label={`View ${file.name}`}
                        >
                          <Eye className="h-4 w-4" />
                        </a>
                        
                        <a
                          href={file.url}
                          download={file.name}
                          className="p-1 text-slate-600 dark:text-slate-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded transition-colors focus-ring ml-1"
                          aria-label={`Download ${file.name}`}
                        >
                          <Download className="h-4 w-4" />
                        </a>
                        
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeUploadedFile(file.id);
                          }}
                          className="p-1 text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors focus-ring ml-1"
                          aria-label={`Delete ${file.name}`}
                        >
                          <Trash className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Accessibility description */}
      <div className="sr-only" aria-live="polite" role="status">
        {files.length > 0 ? `${files.length} files selected for upload` : 'No files selected'}
        {uploadedFiles.length > 0 ? `, ${uploadedFiles.length} files already uploaded` : ''}
      </div>
    </div>
  );
};

/**
 * A simplified version of the FileUploader component with a button-centric interface
 */
export const SimpleFileUploader: React.FC<Omit<FileUploaderProps, 'dragDropText'> & { buttonText?: string }> = ({
  buttonText = 'Upload File',
  ...props
}) => {
  return (
    <div className={`w-full ${props.className}`}>
      <FileUploader
        {...props}
        dragDropText=""
        uploadButtonText={buttonText}
        className="hidden"
      />
      
      <button
        type="button"
        onClick={() => document.getElementById('file-input')?.click()}
        disabled={props.disabled}
        className="px-4 py-2 bg-teal-600 dark:bg-teal-700 text-white rounded-lg hover:bg-teal-700 dark:hover:bg-teal-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 focus-ring"
      >
        <Upload className="h-4 w-4" />
        <span>{buttonText}</span>
      </button>
    </div>
  );
};