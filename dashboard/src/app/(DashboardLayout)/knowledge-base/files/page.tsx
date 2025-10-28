"use client";
import React, { useState, useRef } from "react";
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
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<FileSource[]>([
    {
      id: "1",
      name: "company-handbook.pdf",
      originalName: "Company Handbook.pdf",
      type: "pdf",
      size: 2048576, // 2MB
      status: "completed",
      pagesExtracted: 25,
      totalChunks: 150,
      createdAt: "2024-01-15",
      lastUpdated: "2024-01-15",
    },
    {
      id: "2",
      name: "product-specs.docx",
      originalName: "Product Specifications.docx",
      type: "docx",
      size: 1024000, // 1MB
      status: "processing",
      pagesExtracted: 8,
      totalChunks: 0,
      createdAt: "2024-01-16",
      lastUpdated: "2024-01-16",
    }
  ]);
  const [deleteDialog, setDeleteDialog] = useState<string | null>(null);

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

        const response = await fetch('/api/knowledge-base/files', {
          method: 'POST',
          body: formData
        });

        clearInterval(progressInterval);
        setUploadProgress(100);

        if (response.ok) {
          const newFile = await response.json();
          setFiles(prev => [newFile, ...prev]);
        } else {
          throw new Error(`Failed to upload ${file.name}`);
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
      await fetch(`/api/knowledge-base/files/${id}`, {
        method: 'DELETE'
      });
      setFiles(prev => prev.filter(f => f.id !== id));
    } catch (error) {
      console.error('Error deleting file:', error);
    }
    setDeleteDialog(null);
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
              
              {files.length === 0 ? (
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
                            <Typography variant="subtitle1">
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
                          <Box>
                            <Box sx={{ display: 'flex', gap: 2, mt: 1, flexWrap: 'wrap' }}>
                              <Typography variant="caption">
                                Size: {formatFileSize(file.size)}
                              </Typography>
                              <Typography variant="caption">
                                Pages: {file.pagesExtracted}
                              </Typography>
                              <Typography variant="caption">
                                Chunks: {file.totalChunks}
                              </Typography>
                              <Typography variant="caption">
                                Updated: {file.lastUpdated}
                              </Typography>
                            </Box>
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
