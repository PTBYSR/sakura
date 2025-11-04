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
import { authClient } from "@/lib/auth-client";

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

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
  // Get logged-in user's ID from session
  const { data: session, isPending } = authClient.useSession();
  const userId = session?.user?.id || null;
  const [mounted, setMounted] = useState(false);

  const [newUrl, setNewUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [websites, setWebsites] = useState<WebsiteSource[]>([]);
  const [deleteDialog, setDeleteDialog] = useState<string | null>(null);
  const [deletingWebsiteId, setDeletingWebsiteId] = useState<string | null>(null);

  // Prevent hydration mismatch by only rendering after mount
  React.useEffect(() => {
    setMounted(true);
  }, []);

  const refreshList = async () => {
    try {
      const url = userId 
        ? `${API_BASE}/api/knowledge-base/websites?dashboard_user_id=${userId}`
        : `${API_BASE}/api/knowledge-base/websites`;
      const resp = await fetch(url);
      if (resp.ok) {
        const list = await resp.json();
        setWebsites(list);
      }
    } catch {}
  };

  React.useEffect(() => {
    if (userId) {
      refreshList();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  // Note: Website status updates via WebSocket can be added later
  // For now, we'll keep a simplified polling only for specific website status checks
  // This can be enhanced to use WebSocket when backend supports website_status subscription
  const pollWebsite = (id: string) => {
    const iv = setInterval(async () => {
      try {
        const resp = await fetch(`${API_BASE}/api/knowledge-base/websites/${id}`);
        if (!resp.ok) return;
        const item: WebsiteSource = await resp.json();
        setWebsites(prev => {
          const others = prev.filter(w => w.id !== id);
          return [item, ...others];
        });
        if (item.status === 'completed' || item.status === 'error') {
          clearInterval(iv);
        }
      } catch {}
    }, 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUrl.trim()) return;

    setIsSubmitting(true);
    
    try {
      const response = await fetch(`${API_BASE}/api/knowledge-base/websites`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          url: newUrl,
          dashboard_user_id: userId || undefined
        })
      });

      if (response.ok) {
        const newWebsite = await response.json();
        setWebsites(prev => [newWebsite, ...prev]);
        setNewUrl("");
        pollWebsite(newWebsite.id);
      } else {
        let detail = '';
        try { const data = await response.json(); detail = data?.detail || ''; } catch {}
        throw new Error(`Failed to process website${detail ? `: ${detail}` : ''}`);
      }
    } catch (error) {
      console.error('Error processing website:', error);
      alert((error as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingWebsiteId(id);
    try {
      const resp = await fetch(`${API_BASE}/api/knowledge-base/websites/${id}`, {
        method: 'DELETE'
      });
      if (!resp.ok) {
        let detail = '';
        try { const data = await resp.json(); detail = data?.detail || ''; } catch {}
        throw new Error(`Failed to delete website${detail ? `: ${detail}` : ''}`);
      }
      setWebsites(prev => prev.filter(w => w.id !== id));
      refreshList();
    } catch (error) {
      console.error('Error deleting website:', error);
      alert((error as Error).message);
    } finally {
      setDeletingWebsiteId(null);
      setDeleteDialog(null);
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

  // Prevent hydration mismatch - don't render content until mounted
  if (!mounted) {
    return (
      <PageContainer title="Knowledge Base Websites" description="Manage website knowledge sources">
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
                          <>
                            <Typography variant="body2" color="text.secondary" component="span" display="block">
                              {website.url}
                            </Typography>
                            <Typography variant="caption" component="span" sx={{ display: 'block', mt: 1 }}>
                              Pages: {website.pagesExtracted} • Chunks: {website.totalChunks} • Updated: {website.lastUpdated}
                            </Typography>
                            {website.error && (
                              <Typography variant="caption" component="span" color="error" sx={{ display: 'block', mt: 1 }}>
                                {website.error}
                              </Typography>
                            )}
                          </>
                        }
                      />
                      <ListItemSecondaryAction>
                        <IconButton 
                          edge="end" 
                          onClick={() => setDeleteDialog(website.id)}
                          color="error"
                          disabled={deletingWebsiteId === website.id}
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
        <Dialog open={!!deleteDialog} onClose={() => !deletingWebsiteId && setDeleteDialog(null)}>
          <DialogTitle>Delete Website Source</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete this website source? This will remove all associated content from your knowledge base, including all indexed chunks from the vector store.
            </Typography>
            {deletingWebsiteId && (
              <Box sx={{ mt: 2 }}>
                <LinearProgress />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Deleting website and removing chunks from index...
                </Typography>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={() => setDeleteDialog(null)} 
              disabled={!!deletingWebsiteId}
            >
              Cancel
            </Button>
            <Button 
              onClick={() => deleteDialog && handleDelete(deleteDialog)} 
              color="error"
              variant="contained"
              disabled={!!deletingWebsiteId}
            >
              {deletingWebsiteId ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </PageContainer>
  );
};

export default KnowledgeBaseWebsitesPage;
