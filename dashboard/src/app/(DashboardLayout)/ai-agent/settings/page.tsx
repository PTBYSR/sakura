"use client";
import React, { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { Avatar } from "@/components/ui/avatar";
import { IconButton } from "@/components/ui/icon-button";
import {
  Save,
  Bot,
  Search,
  BookOpen,
  Globe2,
  HelpCircle,
  FileText,
  X,
  ChevronDown,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import PageContainer from "@/app/(DashboardLayout)/components/container/PageContainer";
import { useAgents } from "@/contexts/AgentsContext";
import { useRouter, usePathname } from "next/navigation";

export const dynamic = 'force-dynamic';

interface KnowledgeBaseItem {
  id: string;
  name: string;
  type: "website" | "faq" | "file";
  url?: string;
  question?: string;
  filename?: string;
  description?: string;
  enabled: boolean;
}

const AIAgentSettingsPage = () => {
  const { agent, updateAgent } = useAgents();
  const { data: session } = authClient.useSession();
  const router = useRouter();
  const pathname = usePathname();
  
  const [agentName, setAgentName] = useState(agent.name || "");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Original values for comparison (to detect changes)
  const [originalAgentName, setOriginalAgentName] = useState(agent.name || "");
  const [originalSystemPrompt, setOriginalSystemPrompt] = useState("");
  const [originalSelectedKbItems, setOriginalSelectedKbItems] = useState<Set<string>>(new Set());
  
  // Change detection state
  const [hasChanges, setHasChanges] = useState(false);
  const [showNavigationDialog, setShowNavigationDialog] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);
  const isNavigatingRef = useRef(false);
  const isInitialLoadRef = useRef(true); // Track if initial load is complete
  
  // Knowledge Base states
  const [kbItems, setKbItems] = useState<KnowledgeBaseItem[]>([]);
  const [kbSearchQuery, setKbSearchQuery] = useState("");
  const [kbFilter, setKbFilter] = useState<"all" | "website" | "faq" | "file">("all");
  const [selectedKbItems, setSelectedKbItems] = useState<Set<string>>(new Set());
  
  // Snackbar states
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: "success" | "error" }>({
    open: false,
    message: "",
    severity: "success",
  });

  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    (process.env.NODE_ENV === "development"
      ? "http://localhost:8000"
      : "https://api.sakurasupport.live");

  // Load system prompt and knowledge base data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const userId = session?.user?.id;
        
        // Load system prompt
        try {
          const promptResponse = await fetch(`${API_BASE_URL}/api/system-prompt`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            mode: "cors",
            credentials: "include",
          });

          if (promptResponse.ok) {
            const promptData = await promptResponse.json();
            // The backend always returns a system_prompt (default if none exists)
            if (promptData.system_prompt !== undefined && promptData.system_prompt !== null) {
              const loadedPrompt = promptData.system_prompt || "";
              setSystemPrompt(loadedPrompt);
              // Store as original for change detection
              setOriginalSystemPrompt(loadedPrompt);
            } else if (promptData.success) {
              // If success is true but no prompt, use empty string
              setSystemPrompt("");
              setOriginalSystemPrompt("");
            }
          } else {
            console.error("Failed to load system prompt:", promptResponse.status, promptResponse.statusText);
            // Set empty prompt if API fails
            setSystemPrompt("");
            setOriginalSystemPrompt("");
          }
        } catch (err) {
          console.error("Error loading system prompt:", err);
          // Set empty prompt on error
          setSystemPrompt("");
          setOriginalSystemPrompt("");
        }
        
        // Store original agent name (use current agent name from context)
        const currentAgentName = agent.name || "";
        setOriginalAgentName(currentAgentName);

        // Load current KB selections FIRST (before loading KB items)
        let enabledKbItemIds = new Set<string>();
        if (userId) {
          try {
            const kbSelectionResponse = await fetch(
              `${API_BASE_URL}/api/ai-agent/kb-selection?dashboard_user_id=${userId}`,
              {
                method: "GET",
                headers: { "Content-Type": "application/json" },
                mode: "cors",
                credentials: "include",
              }
            );
            if (kbSelectionResponse.ok) {
              const kbSelectionData = await kbSelectionResponse.json();
              if (kbSelectionData.success && kbSelectionData.enabled_kb_items) {
                enabledKbItemIds = new Set(
                  kbSelectionData.enabled_kb_items.map((item: any) => item.id)
                );
              }
            }
          } catch (err) {
            console.error("Error loading KB selections:", err);
          }
        }

        // Load knowledge base items
        const kbItemsList: KnowledgeBaseItem[] = [];

        // Load websites
        try {
          const websitesResponse = await fetch(
            `${API_BASE_URL}/api/knowledge-base/websites${userId ? `?dashboard_user_id=${userId}` : ""}`,
            {
              method: "GET",
              headers: { "Content-Type": "application/json" },
              mode: "cors",
              credentials: "include",
            }
          );
          if (websitesResponse.ok) {
            const websites = await websitesResponse.json();
            websites.forEach((website: any) => {
              const websiteId = website.id || website.website_id || `website-${website._id}`;
              kbItemsList.push({
                id: websiteId,
                name: website.title || website.url || "Untitled Website",
                type: "website",
                url: website.url,
                description: `Website: ${website.url}`,
                enabled: enabledKbItemIds.has(websiteId),
              });
            });
          }
        } catch (err) {
          console.error("Error loading websites:", err);
        }

        // Load FAQs
        try {
          const faqsResponse = await fetch(
            `${API_BASE_URL}/api/knowledge-base/faqs${userId ? `?dashboard_user_id=${userId}` : ""}`,
            {
              method: "GET",
              headers: { "Content-Type": "application/json" },
              mode: "cors",
              credentials: "include",
            }
          );
          if (faqsResponse.ok) {
            const faqs = await faqsResponse.json();
            faqs.forEach((faq: any) => {
              const faqId = faq.id || `faq-${faq._id}`;
              kbItemsList.push({
                id: faqId,
                name: faq.question || "Untitled FAQ",
                type: "faq",
                question: faq.question,
                description: faq.answer?.substring(0, 100) || "FAQ",
                enabled: enabledKbItemIds.has(faqId),
              });
            });
          }
        } catch (err) {
          console.error("Error loading FAQs:", err);
        }

        // Load files
        try {
          const filesResponse = await fetch(
            `${API_BASE_URL}/api/knowledge-base/files${userId ? `?dashboard_user_id=${userId}` : ""}`,
            {
              method: "GET",
              headers: { "Content-Type": "application/json" },
              mode: "cors",
              credentials: "include",
            }
          );
          if (filesResponse.ok) {
            const files = await filesResponse.json();
            files.forEach((file: any) => {
              const fileId = file.id || `file-${file._id}`;
              kbItemsList.push({
                id: fileId,
                name: file.filename || file.name || "Untitled File",
                type: "file",
                filename: file.filename || file.name,
                description: `File: ${file.filename || file.name}`,
                enabled: enabledKbItemIds.has(fileId),
              });
            });
          }
        } catch (err) {
          console.error("Error loading files:", err);
        }

        setKbItems(kbItemsList);

        // NOW set the selected KB items and original values after all items are loaded
        setSelectedKbItems(new Set(enabledKbItemIds));
        setOriginalSelectedKbItems(new Set(enabledKbItemIds));

        // Mark initial load as complete and reset change detection
        // Use setTimeout to ensure all state updates are complete before enabling change detection
        setTimeout(() => {
          isInitialLoadRef.current = false;
          setHasChanges(false); // Ensure no changes detected on initial load
        }, 100);

      } catch (error: any) {
        console.error("Error loading data:", error);
        setSnackbar({
          open: true,
          message: "Failed to load some data. Using defaults.",
          severity: "error",
        });
        isInitialLoadRef.current = false;
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [session]);

  // Check for changes whenever relevant state updates (only after initial load)
  useEffect(() => {
    // Don't detect changes during initial load
    if (isInitialLoadRef.current || loading) {
      return;
    }

    const agentNameChanged = agentName !== originalAgentName;
    const systemPromptChanged = systemPrompt !== originalSystemPrompt;
    
    // Compare KB selections properly
    const kbSelectionChanged = 
      selectedKbItems.size !== originalSelectedKbItems.size ||
      Array.from(selectedKbItems).some(id => !originalSelectedKbItems.has(id)) ||
      Array.from(originalSelectedKbItems).some(id => !selectedKbItems.has(id));
    
    const hasAnyChanges = agentNameChanged || systemPromptChanged || kbSelectionChanged;
    setHasChanges(hasAnyChanges);
  }, [agentName, systemPrompt, selectedKbItems, originalAgentName, originalSystemPrompt, originalSelectedKbItems, loading]);

  // Handle browser back/forward navigation
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasChanges && !isNavigatingRef.current) {
        e.preventDefault();
        e.returnValue = "You have unsaved changes. Are you sure you want to leave?";
        return e.returnValue;
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [hasChanges]);

  // Intercept navigation attempts (link clicks, router.push, etc.)
  useEffect(() => {
    if (!hasChanges) return;

    // Intercept all link clicks
    const handleLinkClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a[href]') as HTMLAnchorElement;
      
      if (link && link.href) {
        const url = new URL(link.href);
        const currentUrl = new URL(window.location.href);
        
        // Only intercept if navigating to a different route
        if (url.pathname !== currentUrl.pathname) {
          e.preventDefault();
          e.stopPropagation();
          
          setPendingNavigation(url.pathname + url.search);
          setShowNavigationDialog(true);
        }
      }
    };

    // Intercept router navigation
    const originalPush = router.push.bind(router);
    const originalReplace = router.replace.bind(router);
    const originalBack = router.back.bind(router);
    
    router.push = ((url: any, options?: any) => {
      if (hasChanges && !isNavigatingRef.current) {
        const urlString = typeof url === 'string' ? url : url.pathname || url.href || '';
        if (urlString && urlString !== pathname) {
          setPendingNavigation(urlString);
          setShowNavigationDialog(true);
          return Promise.resolve(false);
        }
      }
      isNavigatingRef.current = true;
      return originalPush(url, options);
    }) as typeof router.push;

    router.replace = ((url: any, options?: any) => {
      if (hasChanges && !isNavigatingRef.current) {
        const urlString = typeof url === 'string' ? url : url.pathname || url.href || '';
        if (urlString && urlString !== pathname) {
          setPendingNavigation(urlString);
          setShowNavigationDialog(true);
          return Promise.resolve(false);
        }
      }
      isNavigatingRef.current = true;
      return originalReplace(url, options);
    }) as typeof router.replace;

    router.back = (() => {
      if (hasChanges && !isNavigatingRef.current) {
        setPendingNavigation("back");
        setShowNavigationDialog(true);
        return;
      }
      isNavigatingRef.current = true;
      originalBack();
    }) as typeof router.back;

    // Listen for link clicks
    document.addEventListener('click', handleLinkClick, true);

    return () => {
      document.removeEventListener('click', handleLinkClick, true);
      router.push = originalPush;
      router.replace = originalReplace;
      router.back = originalBack;
    };
  }, [hasChanges, router, pathname]);

  const handleSave = async () => {
    if (!agentName.trim()) {
      setSnackbar({
        open: true,
        message: "Agent name cannot be empty",
        severity: "error",
      });
      return;
    }

    if (!systemPrompt.trim()) {
      setSnackbar({
        open: true,
        message: "System prompt cannot be empty",
        severity: "error",
      });
      return;
    }

    setSaving(true);
    try {
      const userId = session?.user?.id;
      if (!userId) {
        throw new Error("User not authenticated");
      }

      // Update agent name in context
      updateAgent({
        name: agentName,
      });

      // Update system prompt in backend
      const promptResponse = await fetch(`${API_BASE_URL}/api/system-prompt`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_prompt: systemPrompt,
        }),
        mode: "cors",
        credentials: "include",
      });

      if (!promptResponse.ok) {
        const errorData = await promptResponse.json();
        throw new Error(errorData.detail || "Failed to update system prompt");
      }

      // Save KB selections
      const enabledKbItems = Array.from(selectedKbItems).map((itemId) => {
        const item = kbItems.find((kbItem) => kbItem.id === itemId);
        return {
          id: itemId,
          type: item?.type || "unknown",
        };
      });

      const kbSelectionResponse = await fetch(`${API_BASE_URL}/api/ai-agent/kb-selection`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          enabled_kb_items: enabledKbItems,
          dashboard_user_id: userId,
        }),
        mode: "cors",
        credentials: "include",
      });

      if (!kbSelectionResponse.ok) {
        const errorData = await kbSelectionResponse.json();
        throw new Error(errorData.detail || "Failed to save KB selections");
      }

      // Update original values after successful save
      setOriginalAgentName(agentName);
      setOriginalSystemPrompt(systemPrompt);
      setOriginalSelectedKbItems(new Set(selectedKbItems));
      setHasChanges(false);

      setSnackbar({
        open: true,
        message: "Settings and KB selections saved successfully!",
        severity: "success",
      });
    } catch (error: any) {
      console.error("Error saving settings:", error);
      setSnackbar({
        open: true,
        message: error.message || "Failed to save settings",
        severity: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDiscard = () => {
    // Reset all values to original
    setAgentName(originalAgentName);
    setSystemPrompt(originalSystemPrompt);
    setSelectedKbItems(new Set(originalSelectedKbItems));
    setHasChanges(false);
    
    setSnackbar({
      open: true,
      message: "Changes discarded",
      severity: "success",
    });
  };

  const handleNavigationConfirm = async (save: boolean) => {
    setShowNavigationDialog(false);
    
    if (save) {
      // Save first, then navigate
      try {
        await handleSave();
        // Small delay to ensure state is updated
        await new Promise(resolve => setTimeout(resolve, 100));
        isNavigatingRef.current = true;
        if (pendingNavigation) {
          if (pendingNavigation === "back") {
            router.back();
          } else {
            router.push(pendingNavigation);
          }
          setPendingNavigation(null);
        }
      } catch (error) {
        // If save fails, don't navigate
        console.error("Failed to save, navigation cancelled:", error);
      }
    } else {
      // Discard changes, then navigate
      handleDiscard();
      // Small delay to ensure state is reset
      setTimeout(() => {
        isNavigatingRef.current = true;
        if (pendingNavigation) {
          if (pendingNavigation === "back") {
            router.back();
          } else {
            router.push(pendingNavigation);
          }
          setPendingNavigation(null);
        }
      }, 100);
    }
  };

  const handleNavigationCancel = () => {
    setShowNavigationDialog(false);
    setPendingNavigation(null);
  };

  // Knowledge Base handlers
  const handleKbToggle = (itemId: string) => {
    setSelectedKbItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const handleKbSelectAll = () => {
    const filtered = getFilteredKbItems();
    if (selectedKbItems.size === filtered.length) {
      setSelectedKbItems(new Set());
    } else {
      setSelectedKbItems(new Set(filtered.map((item) => item.id)));
    }
  };

  const handleKbUnselectAll = () => {
    setSelectedKbItems(new Set());
  };

  const getFilteredKbItems = (): KnowledgeBaseItem[] => {
    let filtered = kbItems;

    // Apply filter
    if (kbFilter !== "all") {
      filtered = filtered.filter((item) => item.type === kbFilter);
    }

    // Apply search
    if (kbSearchQuery.trim()) {
      const query = kbSearchQuery.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(query) ||
          item.description?.toLowerCase().includes(query) ||
          item.url?.toLowerCase().includes(query) ||
          item.question?.toLowerCase().includes(query) ||
          item.filename?.toLowerCase().includes(query)
      );
    }

    return filtered;
  };

  if (loading) {
    return (
      <PageContainer title="AI Agent Settings" description="Configure your AI agent">
        <div className="max-w-5xl mx-auto">
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          </div>
        </div>
      </PageContainer>
    );
  }

  const filteredKbItems = getFilteredKbItems();
  return (
    <PageContainer title="AI Agent Settings" description="Configure your AI agent">
      <div className="max-w-5xl mx-auto py-2">
          {/* Changes Banner */}
          {hasChanges && (
            <div className="sticky top-0 z-50 mb-2 p-2 rounded-md bg-yellow-500/25 border border-yellow-400">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium text-yellow-50">You have unsaved changes</div>
                <div className="flex gap-2">
                  <Button variant="outlined" size="small" onClick={handleDiscard} disabled={saving} className="border-yellow-300 text-yellow-100 hover:bg-yellow-500/20 px-3 py-1 text-sm">
                    Discard
                  </Button>
                  <Button size="small" onClick={handleSave} disabled={saving} className="bg-[#3a3a3a] hover:bg-[#4a4a4a] text-white px-3 py-1 text-sm inline-flex items-center gap-2">
                    {saving ? (
                      <>
                        <span className="inline-block w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Header */}
          <div className="flex items-center justify-between mb-2">
            <div>
              <div className="text-white font-semibold text-xl mb-1">AI Agent Settings</div>
              <div className="text-gray-200 text-sm">Configure your AI agent&apos;s name, behavior, and knowledge sources</div>
            </div>
          </div>

          {/* Agent Settings Card */}
          <div className="mb-2 rounded-lg border border-[#333] bg-[#2a2a2a]">
            <div className="flex items-center gap-3 p-3 border-b border-[#333]">
              <Avatar size={32} className="bg-indigo-600 text-white">
                <Bot className="h-4 w-4" />
              </Avatar>
              <div className="text-white font-semibold text-[0.95rem]">Agent Configuration</div>
            </div>
            <div className="p-3 space-y-3">
              <div>
                <label className="block text-sm text-gray-200 mb-1">AI Agent Name</label>
                <Input
                  value={agentName}
                  onChange={(e) => setAgentName(e.target.value)}
                  placeholder="Enter your AI agent name"
                  className="text-sm"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-200 mb-1">System Prompt</label>
                <textarea
                  rows={12}
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  placeholder="Enter the system prompt that defines your AI agent&apos;s behavior and personality..."
                  className="w-full px-4 py-2 rounded-lg bg-[#1e1e1e] border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#EE66AA] focus:border-transparent font-mono text-sm leading-6"
                />
                <div className="text-xs text-gray-400 mt-1">This prompt defines how your AI agent responds to users. Be specific about tone, style, and behavior.</div>
              </div>
              <div className="text-sm text-blue-200 bg-blue-900/30 border border-blue-700 rounded-md p-2">
                The system prompt is used to guide your AI agent&apos;s responses. Changes will take effect immediately after saving.
              </div>
            </div>
          </div>

          {/* Knowledge Base Section */}
          <div className="mb-2 rounded-lg border border-[#333] bg-[#2a2a2a]">
            <div className="flex items-center gap-3 p-3 border-b border-[#333]">
              <Avatar size={32} className="bg-sky-600 text-white">
                <BookOpen className="h-4 w-4" />
              </Avatar>
              <div className="text-white font-semibold text-[0.95rem]">Knowledge Base Sources</div>
            </div>
            <div className="p-3 space-y-2">
              {/* Search and Filters */}
              <div className="flex gap-3 flex-wrap">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300" />
                  <Input
                    placeholder="Search knowledge sources..."
                    value={kbSearchQuery}
                    onChange={(e) => setKbSearchQuery(e.target.value)}
                    className="pl-9 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Filter</label>
                  <select
                    value={kbFilter}
                    onChange={(e) => setKbFilter(e.target.value as any)}
                    className="px-3 py-2 rounded-lg bg-[#1e1e1e] border border-gray-700 text-white text-sm"
                  >
                    <option value="all">All</option>
                    <option value="website">Websites</option>
                    <option value="faq">FAQs</option>
                    <option value="file">Files</option>
                  </select>
                </div>
              </div>

                {/* Bulk Actions */}
              {selectedKbItems.size > 0 && (
                <div className="flex items-center gap-3 p-2 rounded-md bg-white/5">
                  <div className="text-sm">{selectedKbItems.size} selected</div>
                  <Button size="small" onClick={handleKbSelectAll} className="px-2 py-1 text-sm bg-[#3a3a3a] hover:bg-[#4a4a4a]">Select All</Button>
                  <Button size="small" onClick={handleKbUnselectAll} className="px-2 py-1 text-sm bg-[#3a3a3a] hover:bg-[#4a4a4a]">Unselect All</Button>
                </div>
              )}

                {/* Select All Checkbox */}
              {filteredKbItems.length > 0 && (
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="w-4 h-4 accent-[#EE66AA]"
                    checked={filteredKbItems.length > 0 && filteredKbItems.every((item) => selectedKbItems.has(item.id))}
                    ref={el => {
                      if (el) el.indeterminate = selectedKbItems.size > 0 && selectedKbItems.size < filteredKbItems.length;
                    }}
                    onChange={handleKbSelectAll}
                  />
                  <div className="text-sm text-gray-300">Select all ({filteredKbItems.length} items)</div>
                </div>
              )}

              {/* Knowledge Base Items List */}
              <div className="max-h-[400px] overflow-y-auto">
                {filteredKbItems.length === 0 ? (
                  <div className="p-2 text-center text-sm text-gray-300">
                    {kbSearchQuery ? "No knowledge sources match your search." : "No knowledge sources available."}
                  </div>
                ) : (
                  <div className="divide-y divide-[#333]">
                    {filteredKbItems.map((item) => (
                      <div key={item.id} className="flex items-start gap-3 py-2">
                        <div className="min-w-6 mt-0.5">
                          {item.type === 'website' && <Globe2 className="h-4 w-4" />}
                          {item.type === 'faq' && <HelpCircle className="h-4 w-4" />}
                          {item.type === 'file' && <FileText className="h-4 w-4" />}
                          {!['website','faq','file'].includes(item.type) && <BookOpen className="h-4 w-4" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm text-white font-medium">{item.name}</div>
                          <div className="text-xs text-gray-400">
                            {item.type === 'website' && item.url}
                            {item.type === 'faq' && item.question}
                            {item.type === 'file' && item.filename}
                          </div>
                        </div>
                        <Chip size="small" variant="outlined" className="ml-2 text-xs">{item.type}</Chip>
                        <input
                          type="checkbox"
                          className="ml-2 mt-1 w-4 h-4 accent-[#EE66AA]"
                          checked={selectedKbItems.has(item.id)}
                          onChange={() => handleKbToggle(item.id)}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="text-sm text-blue-200 bg-blue-900/30 border border-blue-700 rounded-md p-2">
                Selected knowledge sources will be used by the AI agent to answer questions.
              </div>
            </div>
          </div>

          {/* Snackbar for notifications */}
          {snackbar.open && (
            <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[9999]">
              <div className={`px-4 py-2 rounded-md shadow border ${snackbar.severity === 'success' ? 'bg-green-900/70 border-green-700 text-green-200' : 'bg-red-900/70 border-red-700 text-red-200'}`}>
                <div className="flex items-center gap-2">
                  {snackbar.severity === 'success' ? (
                    <span className="inline-block w-2 h-2 rounded-full bg-green-400" />
                  ) : (
                    <span className="inline-block w-2 h-2 rounded-full bg-red-400" />
                  )}
                  <span className="text-sm">{snackbar.message}</span>
                  <button className="ml-2 text-xs opacity-80 hover:opacity-100" onClick={() => setSnackbar({ ...snackbar, open: false })}>Dismiss</button>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Confirmation Dialog */}
          {showNavigationDialog && (
            <div className="fixed inset-0 z-[10000]">
              <div className="absolute inset-0 bg-black/60" onClick={handleNavigationCancel} />
              <div className="relative max-w-md mx-auto mt-40 rounded-lg border border-[#333] bg-[#2a2a2a] shadow-lg">
                <div className="flex items-center justify-between p-3 border-b border-[#333]">
                  <div className="text-white font-semibold text-base">Unsaved Changes</div>
                  <IconButton onClick={handleNavigationCancel} className="text-gray-300"><X className="h-4 w-4" /></IconButton>
                </div>
                <div className="p-3 text-sm text-gray-200">You have unsaved changes. What would you like to do?</div>
                <div className="p-3 pt-0 flex gap-2 justify-end">
                  <Button onClick={handleNavigationCancel} size="small" className="px-3 py-1 text-sm bg-[#3a3a3a] hover:bg-[#4a4a4a]">Cancel</Button>
                  <Button onClick={() => handleNavigationConfirm(false)} size="small" className="px-3 py-1 text-sm border border-red-600 text-red-400 hover:bg-red-600/10" variant="outlined">Discard Changes</Button>
                  <Button onClick={() => handleNavigationConfirm(true)} size="small" className="px-3 py-1 text-sm inline-flex items-center gap-2 bg-[#3a3a3a] hover:bg-[#4a4a4a] text-white"><Save className="h-4 w-4" /> Save & Continue</Button>
                </div>
              </div>
            </div>
          )}
        </div>
    </PageContainer>
  );
};

export default AIAgentSettingsPage;
