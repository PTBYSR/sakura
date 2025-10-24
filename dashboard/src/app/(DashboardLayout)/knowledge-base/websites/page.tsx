"use client";
import React, { useState } from "react";
import {
  Box,
  Typography,
  Container,
  Card,
  CardContent,
  TextField,
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
} from "@mui/material";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Schedule as ScheduleIcon,
} from "@mui/icons-material";
import PageContainer from "@/app/(DashboardLayout)/components/container/PageContainer";

interface WebsiteSource {
  id: string;
  url: string;
  title: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  pagesExtracted: number;
  totalChunks: number;
  createdAt: string;
  lastUpdated: string;
  error?: string;
}

const KnowledgeBaseWebsitesPage = () => {
  const [newUrl, setNewUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [websites, setWebsites] = useState<WebsiteSource[]>([
    {
      id: "1",
      url: "https://heirsinsurancegroup.com",
      title: "Heirs Insurance Group",
      status: "completed",
      pagesExtracted: 45,
      totalChunks: 1200,
      createdAt: "2024-01-15",
      lastUpdated: "2024-01-15",
    },
    {
      id: "2", 
      url: "https://example.com",
      title: "Example Website",
      status: "processing",
      pagesExtracted: 12,
      totalChunks: 0,
      createdAt: "2024-01-16",
      lastUpdated: "2024-01-16",
    }
  ]);
  const [deleteDialog, setDeleteDialog] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUrl.trim()) return;

    setIsSubmitting(true);
    
    try {
      // TODO: Call backend API to start website processing
      const response = await fetch('/api/knowledge-base/websites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: newUrl })
      });

      if (response.ok) {
        const newWebsite = await response.json();
        setWebsites(prev => [newWebsite, ...prev]);
        setNewUrl("");
      } else {
        throw new Error('Failed to process website');
      }
    } catch (error) {
      console.error('Error processing website:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/knowledge-base/websites/${id}`, {
        method: 'DELETE'
      });
      setWebsites(prev => prev.filter(w => w.id !== id));
    } catch (error) {
      console.error('Error deleting website:', error);
    }
    setDeleteDialog(null);
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

  return (
    <PageContainer title="Knowledge Base Websites" description="Manage website knowledge sources">
      <Container maxWidth="lg">
        <Box sx={{ py: 4 }}>
          <Typography variant="h4" gutterBottom>
            Website Knowledge Sources
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Add websites to automatically extract and index their content into your knowledge base.
          </Typography>

          {/* Add New Website Form */}
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Add New Website
              </Typography>
              <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                <TextField
                  fullWidth
                  label="Website URL"
                  placeholder="https://example.com"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  disabled={isSubmitting}
                  helperText="Enter the full URL of the website you want to index"
                />
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<AddIcon />}
                  disabled={!newUrl.trim() || isSubmitting}
                  sx={{ minWidth: 140 }}
                >
                  {isSubmitting ? 'Processing...' : 'Add Website'}
                </Button>
              </Box>
              {isSubmitting && (
                <Box sx={{ mt: 2 }}>
                  <LinearProgress />
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Crawling website and extracting content...
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>

          {/* Website Sources List */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Website Sources ({websites.length})
              </Typography>
              
              {websites.length === 0 ? (
                <Alert severity="info">
                  No websites added yet. Add your first website above to get started.
                </Alert>
              ) : (
                <List>
                  {websites.map((website) => (
                    <ListItem key={website.id} divider>
                      <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
                        {getStatusIcon(website.status)}
                      </Box>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="subtitle1">
                              {website.title}
                            </Typography>
                            <Chip 
                              label={website.status} 
                              color={getStatusColor(website.status) as any}
                              size="small"
                            />
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              {website.url}
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                              <Typography variant="caption">
                                Pages: {website.pagesExtracted}
                              </Typography>
                              <Typography variant="caption">
                                Chunks: {website.totalChunks}
                              </Typography>
                              <Typography variant="caption">
                                Updated: {website.lastUpdated}
                              </Typography>
                            </Box>
                            {website.error && (
                              <Alert severity="error" sx={{ mt: 1 }}>
                                {website.error}
                              </Alert>
                            )}
                          </Box>
                        }
                      />
                      <ListItemSecondaryAction>
                        <IconButton 
                          edge="end" 
                          onClick={() => setDeleteDialog(website.id)}
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
          <DialogTitle>Delete Website Source</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete this website source? This will remove all associated content from your knowledge base.
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

export default KnowledgeBaseWebsitesPage;
