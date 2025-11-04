"use client";
import React, { useState, useRef, useEffect } from "react";
import { authClient } from "@/lib/auth-client";
import {
  Box,
  Typography,
  Container,
  Card,
  CardContent,
  Button,
  Grid,
  Chip,
  LinearProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper,
  ListItemIcon,
} from "@mui/material";
import {
  Upload as UploadIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Schedule as ScheduleIcon,
  Description as DescriptionIcon,
  PictureAsPdf as PdfIcon,
  TextSnippet as TextIcon,
  TableChart as SpreadsheetIcon,
  InsertDriveFile as FileIcon,
} from "@mui/icons-material";
import PageContainer from "@/app/(DashboardLayout)/components/container/PageContainer";

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
  // Get logged-in user's ID from session
  const { data: session } = authClient.useSession();
  const userId = session?.user?.id || null;
  const [mounted, setMounted] = useState(false); // For hydration mismatch prevention

  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<FileSource[]>([]);
  const [deleteDialog, setDeleteDialog] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Prevent hydration mismatch by only rendering after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    (process.env.NODE_ENV === "development"
      ? "http://localhost:8000"
      : "https://sakura-backend.onrender.com");

  // Load files on mount and when userId changes
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
        
        // Start polling for any files that are still processing
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

  // Poll file status until it's completed or errored
  const pollFileStatus = (fileId: string) => {
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/knowledge-base/files/${fileId}`);
        if (!response.ok) {
          clearInterval(pollInterval);
          return;
        }
        
        const updatedFile: FileSource = await response.json();
        
        // Update the file in the list
        setFiles(prev => {
          const updated = prev.map(f => f.id === fileId ? updatedFile : f);
          return updated;
        });
        
        // Stop polling if file is completed or errored
        if (updatedFile.status === 'completed' || updatedFile.status === 'error') {
          clearInterval(pollInterval);
        }
      } catch (error) {
        console.error('Error polling file status:', error);
        clearInterval(pollInterval);
      }
    }, 2000); // Poll every 2 seconds
    
    // Store interval reference to clean up on unmount if needed
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

        // Simulate upload progress
        const progressInterval = setInterval(() => {
          setUploadProgress(prev => Math.min(prev + 10, 90));
        }, 200);

        // Add dashboard_user_id to form data if available
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
          // Start polling for status updates if file is still processing
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
        // Remove file from UI immediately
        setFiles(prev => prev.filter(f => f.id !== id));
        console.log(`✅ File ${id} deleted successfully`);
      } else {
        // Try to get error message from response
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
      case 'pdf': return <PdfIcon color="error" />;
      case 'txt': return <TextIcon color="primary" />;
      case 'docx': return <DescriptionIcon color="info" />;
      case 'csv':
      case 'xlsx': return <SpreadsheetIcon color="success" />;
      default: return <FileIcon color="action" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircleIcon color="success" />;
      case 'error': return <ErrorIcon color="error" />;
      case 'processing': return <ScheduleIcon color="primary" />;
      default: return <ScheduleIcon color="action" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'error': return 'error';
      case 'processing': return 'primary';
      default: return 'default';
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
      default: return 'default';
    }
  };

  // Conditional render for hydration
  if (!mounted) {
    return (
      <PageContainer title="Knowledge Base Files" description="Manage file-based knowledge sources">
        <Container maxWidth="lg">
          <Box sx={{ py: 4 }}>
            <Typography variant="h4" gutterBottom>
              Loading...
            </Typography>
          </Box>
        </Container>
      </PageContainer>
    );
  }

  return (
    <PageContainer title="Knowledge Base Files" description="Manage file-based knowledge sources">
      <Container maxWidth="lg">
        <Box sx={{ py: 4 }}>
          <Typography variant="h4" gutterBottom>
            File Knowledge Sources
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Upload documents to automatically extract and index their content into your knowledge base.
          </Typography>

          {/* File Upload Section */}
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Upload Files
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".pdf,.txt,.docx,.csv,.xlsx"
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                />
                <Button
                  variant="contained"
                  startIcon={<UploadIcon />}
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  sx={{ minWidth: 140 }}
                >
                  {isUploading ? 'Uploading...' : 'Choose Files'}
                </Button>
                <Typography variant="body2" color="text.secondary">
                  Supported formats: PDF, TXT, DOCX, CSV, XLSX
                </Typography>
              </Box>
              
              {isUploading && (
                <Box sx={{ mt: 2 }}>
                  <LinearProgress variant="determinate" value={uploadProgress} />
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Uploading and processing files... {uploadProgress}%
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>

          {/* File Sources List */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                File Sources ({files.length})
              </Typography>
              
              {loading ? (
                <Box sx={{ p: 4, textAlign: "center" }}>
                  <Typography variant="body1">Loading files...</Typography>
                </Box>
              ) : files.length === 0 ? (
                <Alert severity="info">
                  No files uploaded yet. Upload your first document above to get started.
                </Alert>
              ) : (
                <List>
                  {files.map((file) => (
                    <ListItem key={file.id} divider>
                      <ListItemIcon>
                        {getFileIcon(file.type)}
                      </ListItemIcon>
                      <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
                        {getStatusIcon(file.status)}
                      </Box>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                            <Typography variant="subtitle1" component="span">
                              {file.originalName}
                            </Typography>
                            <Chip 
                              label={file.type.toUpperCase()} 
                              color={getFileTypeColor(file.type) as any}
                              size="small"
                            />
                            <Chip 
                              label={file.status} 
                              color={getStatusColor(file.status) as any}
                              size="small"
                            />
                          </Box>
                        }
                        secondary={
                          <Box component="div" sx={{ mt: 1 }}>
                            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 1 }}>
                              <Typography variant="caption" component="span">
                                Size: {formatFileSize(file.size)}
                              </Typography>
                              <Typography variant="caption" component="span">
                                Pages: {file.pagesExtracted > 0 ? file.pagesExtracted : '...'}
                              </Typography>
                              <Typography variant="caption" component="span">
                                Chunks: {file.totalChunks > 0 ? file.totalChunks : '...'}
                              </Typography>
                              <Typography variant="caption" component="span">
                                Updated: {new Date(file.lastUpdated).toLocaleString()}
                              </Typography>
                            </Box>
                            
                            {/* Live progress indicators for processing stages */}
                            {file.status === 'processing' && (
                              <Box component="div" sx={{ mt: 1.5, width: '100%' }}>
                                <LinearProgress sx={{ mb: 1 }} />
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                  <Typography variant="caption" color="text.secondary" component="div">
                                    🔄 Processing stages:
                                  </Typography>
                                  <Box sx={{ pl: 2 }}>
                                    <Typography variant="caption" color="text.secondary" component="div" sx={{ display: 'block' }}>
                                      {file.pagesExtracted > 0 ? '✅' : '⏳'} Extracting text from file
                                      {file.pagesExtracted > 0 && ` (${file.pagesExtracted} pages extracted)`}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary" component="div" sx={{ display: 'block' }}>
                                      {file.totalChunks > 0 ? '✅' : '⏳'} Creating chunks
                                      {file.totalChunks > 0 && ` (${file.totalChunks} chunks created)`}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary" component="div" sx={{ display: 'block' }}>
                                      {file.totalChunks > 0 ? '✅' : '⏳'} Storing in database
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary" component="div" sx={{ display: 'block' }}>
                                      {file.totalChunks > 0 ? '⏳' : '⏳'} Indexing into vector store (happens after chunks are created)
                                    </Typography>
                                  </Box>
                                </Box>
                              </Box>
                            )}
                            {file.status === 'pending' && (
                              <Typography variant="caption" color="text.secondary" component="div" sx={{ display: 'block', mt: 1 }}>
                                ⏳ Queued for processing... Waiting to start
                              </Typography>
                            )}
                            {file.status === 'completed' && (
                              <Typography variant="caption" color="success.main" component="div" sx={{ display: 'block', mt: 1, fontWeight: 500 }}>
                                ✅ Ready to use! File has been processed, chunked, and indexed
                              </Typography>
                            )}
                            {file.error && (
                              <Alert severity="error" sx={{ mt: 1 }}>
                                {file.error}
                              </Alert>
                            )}
                          </Box>
                        }
                      />
                      <ListItemSecondaryAction>
                        <IconButton 
                          edge="end" 
                          onClick={() => setDeleteDialog(file.id)}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Box>

        {/* Delete Confirmation Dialog */}
        <Dialog open={!!deleteDialog} onClose={() => setDeleteDialog(null)}>
          <DialogTitle>Delete File Source</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete this file source? This will remove all associated content from your knowledge base.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialog(null)}>Cancel</Button>
            <Button 
              onClick={() => deleteDialog && handleDelete(deleteDialog)} 
              color="error"
              variant="contained"
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </PageContainer>
  );
};

export default KnowledgeBaseFilesPage;
