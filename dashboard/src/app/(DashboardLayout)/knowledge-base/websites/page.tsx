"use client";
import React, { useState } from "react";
import {
  Plus,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
} from "lucide-react";
import PageContainer from "@/app/(DashboardLayout)/components/container/PageContainer";
import { authClient } from "@/lib/auth-client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Chip } from "@/components/ui/chip";

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
  const { data: session, isPending } = authClient.useSession();
  const userId = session?.user?.id || null;
  const [mounted, setMounted] = useState(false);

  const [newUrl, setNewUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [websites, setWebsites] = useState<WebsiteSource[]>([]);
  const [deleteDialog, setDeleteDialog] = useState<string | null>(null);
  const [deletingWebsiteId, setDeletingWebsiteId] = useState<string | null>(null);

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
  }, [userId]);

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

  if (!mounted) {
    return (
      <PageContainer title="Knowledge Base Websites" description="Manage website knowledge sources">
        <div className="max-w-6xl mx-auto px-4">
          <div className="py-8">
            <p className="text-gray-300">Loading...</p>
          </div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer title="Knowledge Base Websites" description="Manage website knowledge sources">
      <div className="max-w-6xl mx-auto px-4">
        <div className="py-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Website Knowledge Sources
          </h1>
          <p className="text-gray-300 mb-8">
            Add websites to automatically extract and index their content into your knowledge base.
          </p>

          {/* Add New Website Form */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <h6 className="text-lg font-semibold text-white mb-4">
                Add New Website
              </h6>
              <form
                onSubmit={handleSubmit}
                className="flex flex-col sm:flex-row gap-3 items-stretch"
              >
                <div className="sm:flex-1">
                  <Input
                    placeholder="https://example.com"
                    value={newUrl}
                    onChange={(e) => setNewUrl(e.target.value)}
                    disabled={isSubmitting}
                    className="w-full h-11"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Enter the full URL of the website you want to index
                  </p>
                </div>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={!newUrl.trim() || isSubmitting}
                  className="h-11 px-5 shrink-0 sm:min-w-[140px]"
                >
                  <Plus size={16} className="mr-2" />
                  {isSubmitting ? 'Processing...' : 'Add Website'}
                </Button>
              </form>
              {isSubmitting && (
                <div className="mt-4">
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div className="bg-[#EE66AA] h-2 rounded-full animate-pulse" style={{ width: '50%' }} />
                  </div>
                  <p className="text-sm text-gray-300 mt-2">
                    Crawling website and extracting content...
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Website Sources List */}
          <Card>
            <CardContent className="p-6">
              <h6 className="text-lg font-semibold text-white mb-4">
                Website Sources ({websites.length})
              </h6>
              
              {websites.length === 0 ? (
                <div className="p-4 bg-blue-600/20 border border-blue-500 rounded-lg text-blue-400">
                  No websites added yet. Add your first website above to get started.
                </div>
              ) : (
                <div className="space-y-0">
                  {websites.map((website, index) => (
                    <div key={website.id}>
                      <div className="flex items-start gap-4 p-4 hover:bg-gray-800 rounded-lg transition-colors">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          {getStatusIcon(website.status)}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <h6 className="text-base font-semibold text-white">
                                {website.title}
                              </h6>
                              <Chip 
                                color={getStatusColor(website.status)}
                                size="small"
                                className="text-xs"
                              >
                                {website.status}
                              </Chip>
                            </div>
                            <p className="text-sm text-gray-300 mb-2">
                              {website.url}
                            </p>
                            <p className="text-xs text-gray-400">
                              Pages: {website.pagesExtracted} • Chunks: {website.totalChunks} • Updated: {website.lastUpdated}
                            </p>
                            {website.error && (
                              <p className="text-xs text-red-400 mt-2">
                                {website.error}
                              </p>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => setDeleteDialog(website.id)}
                          disabled={deletingWebsiteId === website.id}
                          className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                      {index < websites.length - 1 && (
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
                Delete Website Source
              </h6>
              <p className="text-gray-300 mb-6">
                Are you sure you want to delete this website source? This will remove all associated content from your knowledge base, including all indexed chunks from the vector store.
              </p>
              {deletingWebsiteId && (
                <div className="mb-4">
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div className="bg-[#EE66AA] h-2 rounded-full animate-pulse" style={{ width: '50%' }} />
                  </div>
                  <p className="text-sm text-gray-300 mt-2">
                    Deleting website and removing chunks from index...
                  </p>
                </div>
              )}
              <div className="flex gap-3 justify-end">
                <Button 
                  variant="outlined"
                  color="primary"
                  onClick={() => setDeleteDialog(null)} 
                  disabled={!!deletingWebsiteId}
                >
                  Cancel
                </Button>
                <Button 
                  variant="contained"
                  color="error"
                  onClick={() => deleteDialog && handleDelete(deleteDialog)} 
                  disabled={!!deletingWebsiteId}
                >
                  {deletingWebsiteId ? 'Deleting...' : 'Delete'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageContainer>
  );
};

export default KnowledgeBaseWebsitesPage;
