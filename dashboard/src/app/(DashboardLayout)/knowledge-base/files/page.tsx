"use client";
import React, { useState, useRef, useEffect } from "react";
import { authClient } from "@/lib/auth-client";
import {
  Upload,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
  FileText,
  File,
  FileSpreadsheet,
  Loader2,
} from "lucide-react";
import PageContainer from "@/app/(DashboardLayout)/components/container/PageContainer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";

interface FileSource {
  id: string;
  name: string;
  originalName: string;
  type: 'pdf' | 'txt' | 'docx' | 'csv' | 'xlsx' | 'other';
  size: number;
  status: 'pending' | 'processing' | 'completed' | 'error';
  pagesExtracted: number;
  totalChunks: number;
  createdAt: string;
  lastUpdated: string;
  error?: string;
}

const KnowledgeBaseFilesPage = () => {
  const { data: session } = authClient.useSession();
  const userId = session?.user?.id || null;
  const [mounted, setMounted] = useState(false);

  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<FileSource[]>([]);
  const [deleteDialog, setDeleteDialog] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    (process.env.NODE_ENV === "development"
      ? "http://localhost:8000"
      : "https://api.sakurasupport.live");

  useEffect(() => {
    if (userId) {
      loadFiles();
    }
  }, [userId]);

  const loadFiles = async () => {
    try {
      setLoading(true);
      const url = userId 
        ? `${API_BASE_URL}/api/knowledge-base/files?dashboard_user_id=${userId}`
        : `${API_BASE_URL}/api/knowledge-base/files`;
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setFiles(data);
        
        data.forEach((file: FileSource) => {
          if (file.status === 'pending' || file.status === 'processing') {
            pollFileStatus(file.id);
          }
        });
      }
    } catch (error) {
      console.error('Error loading files:', error);
    } finally {
      setLoading(false);
    }
  };

  const pollFileStatus = (fileId: string) => {
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/knowledge-base/files/${fileId}`);
        if (!response.ok) {
          clearInterval(pollInterval);
          return;
        }
        
        const updatedFile: FileSource = await response.json();
        
        setFiles(prev => {
          const updated = prev.map(f => f.id === fileId ? updatedFile : f);
          return updated;
        });
        
        if (updatedFile.status === 'completed' || updatedFile.status === 'error') {
          clearInterval(pollInterval);
        }
      } catch (error) {
        console.error('Error polling file status:', error);
        clearInterval(pollInterval);
      }
    }, 2000);
    
    return pollInterval;
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        const formData = new FormData();
        formData.append('file', file);

        const progressInterval = setInterval(() => {
          setUploadProgress(prev => Math.min(prev + 10, 90));
        }, 200);

        if (userId) {
          formData.append('dashboard_user_id', userId);
        }

        const response = await fetch(`${API_BASE_URL}/api/knowledge-base/files`, {
          method: 'POST',
          body: formData
        });

        clearInterval(progressInterval);
        setUploadProgress(100);

        if (response.ok) {
          const newFile = await response.json();
          setFiles(prev => [newFile, ...prev]);
          if (newFile.status === 'pending' || newFile.status === 'processing') {
            pollFileStatus(newFile.id);
          }
        } else {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.detail || `Failed to upload ${file.name}`);
        }
      }
    } catch (error) {
      console.error('Error uploading files:', error);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/knowledge-base/files/${id}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        setFiles(prev => prev.filter(f => f.id !== id));
        console.log(`✅ File ${id} deleted successfully`);
      } else {
        let errorMessage = 'Failed to delete file';
        try {
          const errorData = await response.json();
          errorMessage = errorData.detail || errorMessage;
        } catch {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }
    } catch (error: any) {
      console.error('Error deleting file:', error);
      alert(error.message || 'Failed to delete file. Please try again.');
    } finally {
      setDeleteDialog(null);
    }
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf': return <FileText className="text-red-500 w-5 h-5" />;
      case 'txt': return <FileText className="text-[#EE66AA] w-5 h-5" />;
      case 'docx': return <FileText className="text-blue-500 w-5 h-5" />;
      case 'csv':
      case 'xlsx': return <FileSpreadsheet className="text-green-500 w-5 h-5" />;
      default: return <File className="text-gray-500 w-5 h-5" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="text-green-500 w-5 h-5" />;
      case 'error': return <XCircle className="text-red-500 w-5 h-5" />;
      case 'processing': return <Clock className="text-blue-500 w-5 h-5" />;
      default: return <Clock className="text-gray-500 w-5 h-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'error': return 'error';
      case 'processing': return 'primary';
      default: return 'secondary';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileTypeColor = (type: string) => {
    switch (type) {
      case 'pdf': return 'error';
      case 'txt': return 'primary';
      case 'docx': return 'info';
      case 'csv':
      case 'xlsx': return 'success';
      default: return 'secondary';
    }
  };

  if (!mounted) {
    return (
      <PageContainer title="Knowledge Base Files" description="Manage file-based knowledge sources">
        <div className="max-w-6xl mx-auto px-4">
          <div className="py-8">
            <p className="text-gray-300">Loading...</p>
          </div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer title="Knowledge Base Files" description="Manage file-based knowledge sources">
      <div className="max-w-6xl mx-auto px-4">
        <div className="py-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            File Knowledge Sources
          </h1>
          <p className="text-gray-300 mb-8">
            Upload documents to automatically extract and index their content into your knowledge base.
          </p>

          {/* File Upload Section */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <h6 className="text-lg font-semibold text-white mb-4">
                Upload Files
              </h6>
              <div className="flex gap-4 items-center mb-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".pdf,.txt,.docx,.csv,.xlsx"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="min-w-[140px]"
                >
                  <Upload size={16} className="mr-2" />
                  {isUploading ? 'Uploading...' : 'Choose Files'}
                </Button>
                <p className="text-sm text-gray-300">
                  Supported formats: PDF, TXT, DOCX, CSV, XLSX
                </p>
              </div>
              
              {isUploading && (
                <div className="mt-4">
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-[#EE66AA] h-2 rounded-full transition-all"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p className="text-sm text-gray-300 mt-2">
                    Uploading and processing files... {uploadProgress}%
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* File Sources List */}
          <Card>
            <CardContent className="p-6">
              <h6 className="text-lg font-semibold text-white mb-4">
                File Sources ({files.length})
              </h6>
              
              {loading ? (
                <div className="p-8 text-center">
                  <Loader2 className="w-8 h-8 animate-spin text-[#EE66AA] mx-auto mb-4" />
                  <p className="text-gray-300">Loading files...</p>
                </div>
              ) : files.length === 0 ? (
                <div className="p-4 bg-blue-600/20 border border-blue-500 rounded-lg text-blue-400">
                  No files uploaded yet. Upload your first document above to get started.
                </div>
              ) : (
                <div className="space-y-0">
                  {files.map((file, index) => (
                    <div key={file.id}>
                      <div className="flex items-start gap-4 p-4 hover:bg-gray-800 rounded-lg transition-colors">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          {getFileIcon(file.type)}
                          {getStatusIcon(file.status)}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <h6 className="text-base font-semibold text-white truncate">
                                {file.originalName}
                              </h6>
                              <Chip 
                                color={getFileTypeColor(file.type)}
                                size="small"
                                className="text-xs"
                              >
                                {file.type.toUpperCase()}
                              </Chip>
                              <Chip 
                                color={getStatusColor(file.status)}
                                size="small"
                                className="text-xs"
                              >
                                {file.status}
                              </Chip>
                            </div>
                            <div className="flex gap-4 flex-wrap text-xs text-gray-400 mb-2">
                              <span>Size: {formatFileSize(file.size)}</span>
                              <span>Pages: {file.pagesExtracted > 0 ? file.pagesExtracted : '...'}</span>
                              <span>Chunks: {file.totalChunks > 0 ? file.totalChunks : '...'}</span>
                              <span>Updated: {new Date(file.lastUpdated).toLocaleString()}</span>
                            </div>
                            
                            {/* Live progress indicators */}
                            {file.status === 'processing' && (
                              <div className="mt-3 w-full">
                                <div className="w-full bg-gray-700 rounded-full h-1 mb-2">
                                  <div className="bg-blue-500 h-1 rounded-full animate-pulse" style={{ width: '50%' }} />
                                </div>
                                <div className="space-y-1 text-xs text-gray-400 pl-2">
                                  <p>🔄 Processing stages:</p>
                                  <div className="pl-4 space-y-1">
                                    <p>
                                      {file.pagesExtracted > 0 ? '✅' : '⏳'} Extracting text from file
                                      {file.pagesExtracted > 0 && ` (${file.pagesExtracted} pages extracted)`}
                                    </p>
                                    <p>
                                      {file.totalChunks > 0 ? '✅' : '⏳'} Creating chunks
                                      {file.totalChunks > 0 && ` (${file.totalChunks} chunks created)`}
                                    </p>
                                    <p>
                                      {file.totalChunks > 0 ? '✅' : '⏳'} Storing in database
                                    </p>
                                    <p>
                                      {file.totalChunks > 0 ? '⏳' : '⏳'} Indexing into vector store (happens after chunks are created)
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}
                            {file.status === 'pending' && (
                              <p className="text-xs text-gray-400 mt-2">
                                ⏳ Queued for processing... Waiting to start
                              </p>
                            )}
                            {file.status === 'completed' && (
                              <p className="text-xs text-green-400 mt-2 font-medium">
                                ✅ Ready to use! File has been processed, chunked, and indexed
                              </p>
                            )}
                            {file.error && (
                              <div className="mt-2 p-3 bg-red-600/20 border border-red-500 rounded-lg text-red-400 text-sm">
                                {file.error}
                              </div>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => setDeleteDialog(file.id)}
                          className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                      {index < files.length - 1 && (
                        <div className="border-t border-gray-700 my-2" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Delete Confirmation Dialog */}
        {deleteDialog && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-[#1e1e1e] border border-gray-700 rounded-lg p-6 max-w-md w-full mx-4">
              <h6 className="text-lg font-semibold text-white mb-4">
                Delete File Source
              </h6>
              <p className="text-gray-300 mb-6">
                Are you sure you want to delete this file source? This will remove all associated content from your knowledge base.
              </p>
              <div className="flex gap-3 justify-end">
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() => setDeleteDialog(null)}
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  color="error"
                  onClick={() => deleteDialog && handleDelete(deleteDialog)}
                >
                  Delete
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageContainer>
  );
};

export default KnowledgeBaseFilesPage;
