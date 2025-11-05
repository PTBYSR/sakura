"use client";
import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Typography,
  Container,
  Card,
  CardContent,
  CardHeader,
  Avatar,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Snackbar,
  InputAdornment,
  Checkbox,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemButton,
  IconButton,
  Divider,
  ToggleButton,
  ToggleButtonGroup,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Paper,
} from "@mui/material";
import {
  Save as SaveIcon,
  SmartToy as SmartToyIcon,
  Search as SearchIcon,
  Book as BookIcon,
  Language as WebsiteIcon,
  QuestionAnswer as FAQIcon,
  Description as FileIcon,
  Code as SOPIcon,
  CheckBox as CheckBoxIcon,
  CheckBoxOutlineBlank as CheckBoxOutlineBlankIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import { authClient } from "@/lib/auth-client";
import PageContainer from "@/app/(DashboardLayout)/components/container/PageContainer";
import { useAgents } from "@/contexts/AgentsContext";
import { useSOPs } from "@/contexts/SOPsContext";
import { useRouter, usePathname } from "next/navigation";

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

interface SOPItem {
  id: string;
  name: string;
  description: string;
  category: string;
  status: string;
  enabled: boolean;
}

const AIAgentSettingsPage = () => {
  const { agent, updateAgent } = useAgents();
  const { sops } = useSOPs();
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
  const [originalSelectedSopItems, setOriginalSelectedSopItems] = useState<Set<string>>(new Set());
  
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
  
  // SOPs states
  const [sopItems, setSopItems] = useState<SOPItem[]>([]);
  const [sopSearchQuery, setSopSearchQuery] = useState("");
  const [selectedSopItems, setSelectedSopItems] = useState<Set<string>>(new Set());
  
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
      : "https://sakura-backend.onrender.com");

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

        // Load SOPs from context
        const sopItemsList: SOPItem[] = sops.map((sop) => ({
          id: sop.id,
          name: sop.name,
          description: sop.description,
          category: sop.category,
          status: sop.status,
          enabled: true,
        }));
        setSopItems(sopItemsList);
        // Initialize SOP selections (all enabled by default for now)
        const sopIds = new Set(sopItemsList.map(sop => sop.id));
        setSelectedSopItems(sopIds);
        setOriginalSelectedSopItems(new Set(sopIds));

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
  }, [session, sops]);

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
    
    // Compare SOP selections properly
    const sopSelectionChanged =
      selectedSopItems.size !== originalSelectedSopItems.size ||
      Array.from(selectedSopItems).some(id => !originalSelectedSopItems.has(id)) ||
      Array.from(originalSelectedSopItems).some(id => !selectedSopItems.has(id));

    const hasAnyChanges = agentNameChanged || systemPromptChanged || kbSelectionChanged || sopSelectionChanged;
    setHasChanges(hasAnyChanges);
  }, [agentName, systemPrompt, selectedKbItems, selectedSopItems, originalAgentName, originalSystemPrompt, originalSelectedKbItems, originalSelectedSopItems, loading]);

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
      setOriginalSelectedSopItems(new Set(selectedSopItems));
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
    setSelectedSopItems(new Set(originalSelectedSopItems));
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

  // SOPs handlers
  const handleSopToggle = (itemId: string) => {
    setSelectedSopItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const handleSopSelectAll = () => {
    const filtered = getFilteredSopItems();
    if (selectedSopItems.size === filtered.length) {
      setSelectedSopItems(new Set());
    } else {
      setSelectedSopItems(new Set(filtered.map((item) => item.id)));
    }
  };

  const handleSopUnselectAll = () => {
    setSelectedSopItems(new Set());
  };

  const getFilteredSopItems = (): SOPItem[] => {
    let filtered = sopItems;

    // Apply search
    if (sopSearchQuery.trim()) {
      const query = sopSearchQuery.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(query) ||
          item.description.toLowerCase().includes(query) ||
          item.category.toLowerCase().includes(query)
      );
    }

    return filtered;
  };

  const getKbIcon = (type: string) => {
    switch (type) {
      case "website":
        return <WebsiteIcon sx={{ fontSize: "1rem" }} />;
      case "faq":
        return <FAQIcon sx={{ fontSize: "1rem" }} />;
      case "file":
        return <FileIcon sx={{ fontSize: "1rem" }} />;
      default:
        return <BookIcon sx={{ fontSize: "1rem" }} />;
    }
  };

  if (loading) {
    return (
      <PageContainer title="AI Agent Settings" description="Configure your AI agent">
        <Container maxWidth="lg">
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px" }}>
            <CircularProgress />
          </Box>
        </Container>
      </PageContainer>
    );
  }

  const filteredKbItems = getFilteredKbItems();
  const filteredSopItems = getFilteredSopItems();

  return (
    <PageContainer title="AI Agent Settings" description="Configure your AI agent">
      <Container maxWidth="lg">
        <Box sx={{ py: 2 }}>
          {/* Changes Banner */}
          {hasChanges && (
            <Paper
              elevation={3}
              sx={{
                position: "sticky",
                top: 0,
                zIndex: 1000,
                mb: 2,
                p: 2,
                bgcolor: "warning.light",
                borderRadius: 1,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <Alert severity="warning" sx={{ flex: 1, py: 0 }}>
                    <Typography variant="body2" sx={{ fontSize: "0.875rem", fontWeight: 500 }}>
                      You have unsaved changes
                    </Typography>
                  </Alert>
                </Box>
                <Box sx={{ display: "flex", gap: 1 }}>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={handleDiscard}
                    disabled={saving}
                    sx={{ fontSize: "0.875rem" }}
                  >
                    Discard
                  </Button>
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={saving ? <CircularProgress size={16} /> : <SaveIcon sx={{ fontSize: "1rem" }} />}
                    onClick={handleSave}
                    disabled={saving}
                    sx={{ fontSize: "0.875rem" }}
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </Button>
                </Box>
              </Box>
            </Paper>
          )}

          {/* Header */}
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 600, fontSize: "1.25rem", mb: 0.5 }}>
                AI Agent Settings
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.875rem" }}>
                Configure your AI agent&apos;s name, behavior, knowledge sources, and SOPs
              </Typography>
            </Box>
          </Box>

          {/* Agent Settings Card */}
          <Card sx={{ mb: 2 }}>
                <CardHeader 
              avatar={
                <Avatar sx={{ bgcolor: "primary.main", width: 32, height: 32 }}>
                  <SmartToyIcon sx={{ fontSize: "1rem" }} />
                </Avatar>
              }
              title="Agent Configuration"
              titleTypographyProps={{ variant: "h6", sx: { fontSize: "0.95rem", fontWeight: 600 } }}
              sx={{ pb: 1, pt: 2 }}
            />
            <CardContent sx={{ pt: 1 }}>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
                <TextField
                  label="AI Agent Name"
                  fullWidth
                  size="small"
                  value={agentName}
                  onChange={(e) => setAgentName(e.target.value)}
                  placeholder="Enter your AI agent name"
                  sx={{ "& .MuiInputBase-input": { fontSize: "0.875rem" } }}
                />

                      <TextField
                  label="System Prompt"
                        fullWidth
                        multiline
                  rows={12}
                  size="small"
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  placeholder="Enter the system prompt that defines your AI agent's behavior and personality..."
                  helperText="This prompt defines how your AI agent responds to users. Be specific about tone, style, and behavior."
                  sx={{
                    "& .MuiInputBase-input": {
                      fontSize: "0.875rem",
                      fontFamily: "monospace",
                      lineHeight: 1.5,
                    },
                    "& .MuiFormHelperText-root": { fontSize: "0.75rem" },
                  }}
                />

                <Alert severity="info" sx={{ fontSize: "0.875rem" }}>
                  The system prompt is used to guide your AI agent&apos;s responses. Changes will take effect immediately after saving.
                </Alert>
                            </Box>
                </CardContent>
              </Card>

          {/* Knowledge Base Section */}
          <Card sx={{ mb: 2 }}>
                <CardHeader 
              avatar={
                <Avatar sx={{ bgcolor: "info.main", width: 32, height: 32 }}>
                  <BookIcon sx={{ fontSize: "1rem" }} />
                </Avatar>
              }
              title="Knowledge Base Sources"
              titleTypographyProps={{ variant: "h6", sx: { fontSize: "0.95rem", fontWeight: 600 } }}
              sx={{ pb: 1, pt: 2 }}
            />
            <CardContent sx={{ pt: 1 }}>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {/* Search and Filters */}
                <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
                  <TextField
                    placeholder="Search knowledge sources..."
                    size="small"
                    value={kbSearchQuery}
                    onChange={(e) => setKbSearchQuery(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon sx={{ fontSize: "1rem" }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{ flex: 1, minWidth: 200, "& .MuiInputBase-input": { fontSize: "0.875rem" } }}
                  />
                  <FormControl size="small" sx={{ minWidth: 120 }}>
                    <InputLabel sx={{ fontSize: "0.875rem" }}>Filter</InputLabel>
                    <Select
                      value={kbFilter}
                      label="Filter"
                      onChange={(e) => setKbFilter(e.target.value as any)}
                      sx={{ fontSize: "0.875rem" }}
                    >
                      <MenuItem value="all" sx={{ fontSize: "0.875rem" }}>All</MenuItem>
                      <MenuItem value="website" sx={{ fontSize: "0.875rem" }}>Websites</MenuItem>
                      <MenuItem value="faq" sx={{ fontSize: "0.875rem" }}>FAQs</MenuItem>
                      <MenuItem value="file" sx={{ fontSize: "0.875rem" }}>Files</MenuItem>
                    </Select>
                  </FormControl>
                </Box>

                {/* Bulk Actions */}
                {selectedKbItems.size > 0 && (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, p: 1.5, bgcolor: "action.selected", borderRadius: 1 }}>
                    <Typography variant="body2" sx={{ fontSize: "0.875rem" }}>
                      {selectedKbItems.size} selected
                    </Typography>
                    <Button size="small" onClick={handleKbSelectAll} sx={{ fontSize: "0.8rem" }}>
                      Select All
                    </Button>
                    <Button size="small" onClick={handleKbUnselectAll} sx={{ fontSize: "0.8rem" }}>
                      Unselect All
                    </Button>
                  </Box>
                )}

                {/* Select All Checkbox */}
                {filteredKbItems.length > 0 && (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                    <Checkbox
                      checked={filteredKbItems.length > 0 && filteredKbItems.every((item) => selectedKbItems.has(item.id))}
                      indeterminate={selectedKbItems.size > 0 && selectedKbItems.size < filteredKbItems.length}
                      onChange={handleKbSelectAll}
                      size="small"
                    />
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.875rem" }}>
                      Select all ({filteredKbItems.length} items)
                      </Typography>
                  </Box>
                )}

                {/* Knowledge Base Items List */}
                <Box sx={{ maxHeight: 400, overflowY: "auto" }}>
                  {filteredKbItems.length === 0 ? (
                    <Box sx={{ p: 2, textAlign: "center" }}>
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.875rem" }}>
                        {kbSearchQuery ? "No knowledge sources match your search." : "No knowledge sources available."}
                      </Typography>
                    </Box>
                  ) : (
                    <List dense sx={{ py: 0 }}>
                      {filteredKbItems.map((item, index) => (
                        <React.Fragment key={item.id}>
                          <ListItem
                            secondaryAction={
                              <Checkbox
                                checked={selectedKbItems.has(item.id)}
                                onChange={() => handleKbToggle(item.id)}
                                size="small"
                              />
                            }
                            sx={{ py: 0.75 }}
                          >
                            <ListItemIcon sx={{ minWidth: 32 }}>
                              {getKbIcon(item.type)}
                          </ListItemIcon>
                          <ListItemText 
                              primary={
                                <Typography variant="body2" sx={{ fontSize: "0.875rem", fontWeight: 500 }}>
                                  {item.name}
                                </Typography>
                              }
                              secondary={
                                <Typography variant="caption" sx={{ fontSize: "0.75rem" }}>
                                  {item.type === "website" && item.url}
                                  {item.type === "faq" && item.question}
                                  {item.type === "file" && item.filename}
                                </Typography>
                              }
                            />
                            <Chip
                              label={item.type}
                              size="small"
                              variant="outlined"
                              sx={{ fontSize: "0.7rem", height: 20, ml: 1 }}
                            />
                        </ListItem>
                          {index < filteredKbItems.length - 1 && <Divider />}
                      </React.Fragment>
                    ))}
                  </List>
                  )}
                </Box>

                <Alert severity="info" sx={{ fontSize: "0.875rem" }}>
                  Selected knowledge sources will be used by the AI agent to answer questions.
                </Alert>
                  </Box>
                </CardContent>
              </Card>

          {/* SOPs Section */}
          <Card sx={{ mb: 2 }}>
                <CardHeader 
              avatar={
                <Avatar sx={{ bgcolor: "secondary.main", width: 32, height: 32 }}>
                  <SOPIcon sx={{ fontSize: "1rem" }} />
                </Avatar>
              }
              title="Standard Operating Procedures (SOPs)"
              titleTypographyProps={{ variant: "h6", sx: { fontSize: "0.95rem", fontWeight: 600 } }}
              sx={{ pb: 1, pt: 2 }}
            />
            <CardContent sx={{ pt: 1 }}>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {/* Search */}
                <TextField
                  placeholder="Search SOPs..."
                  size="small"
                  value={sopSearchQuery}
                  onChange={(e) => setSopSearchQuery(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ fontSize: "1rem" }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ "& .MuiInputBase-input": { fontSize: "0.875rem" } }}
                />

                {/* Bulk Actions */}
                {selectedSopItems.size > 0 && (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, p: 1.5, bgcolor: "action.selected", borderRadius: 1 }}>
                    <Typography variant="body2" sx={{ fontSize: "0.875rem" }}>
                      {selectedSopItems.size} selected
                          </Typography>
                    <Button size="small" onClick={handleSopSelectAll} sx={{ fontSize: "0.8rem" }}>
                      Select All
                    </Button>
                    <Button size="small" onClick={handleSopUnselectAll} sx={{ fontSize: "0.8rem" }}>
                      Unselect All
                    </Button>
                        </Box>
                )}

                {/* Select All Checkbox */}
                {filteredSopItems.length > 0 && (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                    <Checkbox
                      checked={filteredSopItems.length > 0 && filteredSopItems.every((item) => selectedSopItems.has(item.id))}
                      indeterminate={selectedSopItems.size > 0 && selectedSopItems.size < filteredSopItems.length}
                      onChange={handleSopSelectAll}
                      size="small"
                    />
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.875rem" }}>
                      Select all ({filteredSopItems.length} items)
                    </Typography>
                  </Box>
                )}

                {/* SOPs List */}
                <Box sx={{ maxHeight: 400, overflowY: "auto" }}>
                  {filteredSopItems.length === 0 ? (
                    <Box sx={{ p: 2, textAlign: "center" }}>
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.875rem" }}>
                        {sopSearchQuery ? "No SOPs match your search." : "No SOPs available."}
                    </Typography>
                    </Box>
                  ) : (
                    <List dense sx={{ py: 0 }}>
                      {filteredSopItems.map((item, index) => (
                        <React.Fragment key={item.id}>
                          <ListItem
                            secondaryAction={
                              <Checkbox
                                checked={selectedSopItems.has(item.id)}
                                onChange={() => handleSopToggle(item.id)}
                        size="small" 
                              />
                            }
                            sx={{ py: 0.75 }}
                          >
                            <ListItemIcon sx={{ minWidth: 32 }}>
                              <SOPIcon sx={{ fontSize: "1rem" }} />
                            </ListItemIcon>
                            <ListItemText
                              primary={
                                <Typography variant="body2" sx={{ fontSize: "0.875rem", fontWeight: 500 }}>
                                  {item.name}
                                </Typography>
                              }
                              secondary={
                                <Typography variant="caption" sx={{ fontSize: "0.75rem" }}>
                                  {item.description}
                                </Typography>
                              }
                            />
                            <Box sx={{ display: "flex", gap: 0.5, ml: 1 }}>
                      <Chip 
                                label={item.category}
                        size="small" 
                                variant="outlined"
                                sx={{ fontSize: "0.7rem", height: 20 }}
                      />
                      <Chip 
                                label={item.status}
                        size="small" 
                                color={item.status === "active" ? "success" : "default"}
                                sx={{ fontSize: "0.7rem", height: 20 }}
                      />
                    </Box>
                          </ListItem>
                          {index < filteredSopItems.length - 1 && <Divider />}
                        </React.Fragment>
                      ))}
                    </List>
                  )}
                </Box>

                <Alert severity="info" sx={{ fontSize: "0.875rem" }}>
                  Selected SOPs will be used by the AI agent to follow standard procedures.
                </Alert>
                  </Box>
                </CardContent>
              </Card>

          {/* Snackbar for notifications */}
          <Snackbar
            open={snackbar.open}
            autoHideDuration={6000}
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
          >
            <Alert
              onClose={() => setSnackbar({ ...snackbar, open: false })}
              severity={snackbar.severity}
              sx={{ width: "100%" }}
            >
              {snackbar.message}
            </Alert>
          </Snackbar>

          {/* Navigation Confirmation Dialog */}
          <Dialog
            open={showNavigationDialog}
            onClose={handleNavigationCancel}
            aria-labelledby="navigation-dialog-title"
            aria-describedby="navigation-dialog-description"
          >
            <DialogTitle id="navigation-dialog-title" sx={{ fontSize: "1.125rem", fontWeight: 600 }}>
              Unsaved Changes
            </DialogTitle>
            <DialogContent>
              <DialogContentText id="navigation-dialog-description" sx={{ fontSize: "0.875rem" }}>
                You have unsaved changes. What would you like to do?
              </DialogContentText>
            </DialogContent>
            <DialogActions sx={{ p: 2, pt: 1.5 }}>
              <Button
                onClick={handleNavigationCancel}
                size="small"
                sx={{ fontSize: "0.875rem" }}
              >
                Cancel
              </Button>
              <Button
                onClick={() => handleNavigationConfirm(false)}
                variant="outlined"
                color="error"
                size="small"
                sx={{ fontSize: "0.875rem" }}
              >
                Discard Changes
              </Button>
              <Button
                onClick={() => handleNavigationConfirm(true)}
                variant="contained"
                size="small"
                startIcon={<SaveIcon sx={{ fontSize: "1rem" }} />}
                sx={{ fontSize: "0.875rem" }}
              >
                Save & Continue
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      </Container>
    </PageContainer>
  );
};

export default AIAgentSettingsPage;
