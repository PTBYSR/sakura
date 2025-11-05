"use client";
import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  IconButton,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  InputAdornment,
  ToggleButton,
  ToggleButtonGroup,
  Checkbox,
  Pagination,
  Divider,
  Toolbar,
  CircularProgress,
} from "@mui/material";
import {
  Add,
  Edit,
  Delete,
  Search,
  Clear,
} from "@mui/icons-material";
import PageContainer from "@/app/(DashboardLayout)/components/container/PageContainer";
import DashboardCard from "@/app/(DashboardLayout)/components/shared/DashboardCard";
import ChatbotTester from "./components/ChatbotTester";
import { faqService, FAQ as FAQType } from "./services/faqService";
import { authClient } from "@/lib/auth-client";

// Use FAQ type from service
type FAQ = FAQType;

// Sort filter type
type SortFilter = "recently-added" | "largest" | "a-z";

const ITEMS_PER_PAGE = 10;

export default function FAQsPage() {
  // Get logged-in user's ID from session
  const { data: session } = authClient.useSession();
  const userId = session?.user?.id || null;

  // State management
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortFilter, setSortFilter] = useState<SortFilter>("recently-added");
  const [selectedFaqs, setSelectedFaqs] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const [openAddModal, setOpenAddModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [faqToDelete, setFaqToDelete] = useState<FAQ | null>(null);
  const [editingFaq, setEditingFaq] = useState<FAQ | null>(null);
  const [clearChatKey, setClearChatKey] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [formQuestion, setFormQuestion] = useState("");
  const [formAnswer, setFormAnswer] = useState("");
  const [formTags, setFormTags] = useState("");

  // Load FAQs from API on mount and when userId changes
  useEffect(() => {
    // Load FAQs regardless of userId (can be null/undefined)
    loadFAQs();
  }, [userId]);

  const loadFAQs = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await faqService.getFAQs({ 
        limit: 1000,
        dashboard_user_id: userId || undefined
      });
      setFaqs(data);
    } catch (err: any) {
      console.error("Failed to load FAQs:", err);
      setError(err.message || "Failed to load FAQs");
    } finally {
      setLoading(false);
    }
  };

  // Load search/filter state from URL params
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const search = params.get("search");
      const sort = params.get("sort") as SortFilter;
      const pageNum = params.get("page");
      
      if (search) setSearchQuery(search);
      if (sort && ["recently-added", "largest", "a-z"].includes(sort)) {
        setSortFilter(sort);
      }
      if (pageNum) setPage(parseInt(pageNum, 10));
    }
  }, []);

  // Update URL params when search/filter/page changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams();
      if (searchQuery) params.set("search", searchQuery);
      if (sortFilter !== "recently-added") params.set("sort", sortFilter);
      if (page !== 1) params.set("page", page.toString());
      
      const newUrl = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ""}`;
      window.history.replaceState({}, "", newUrl);
    }
  }, [searchQuery, sortFilter, page]);

  // Filter and sort FAQs (client-side filtering for sorting, search is done server-side)
  const filteredAndSortedFaqs = useMemo(() => {
    let filtered = faqs.filter((faq) =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Apply sorting
    switch (sortFilter) {
      case "recently-added":
        filtered = [...filtered].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
      case "largest":
        filtered = [...filtered].sort((a, b) => b.answer.length - a.answer.length);
        break;
      case "a-z":
        filtered = [...filtered].sort((a, b) =>
          a.question.localeCompare(b.question)
        );
        break;
    }

    return filtered;
  }, [faqs, searchQuery, sortFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedFaqs.length / ITEMS_PER_PAGE);
  const paginatedFaqs = filteredAndSortedFaqs.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [searchQuery, sortFilter]);

  // Handlers
  const handleAddFaq = () => {
    setFormQuestion("");
    setFormAnswer("");
    setFormTags("");
    setOpenAddModal(true);
  };

  const handleEditFaq = (faq: FAQ) => {
    setEditingFaq(faq);
    setFormQuestion(faq.question);
    setFormAnswer(faq.answer);
    setFormTags(faq.tags.join(", "));
    setOpenEditModal(true);
  };

  const handleDeleteClick = (faq: FAQ) => {
    setFaqToDelete(faq);
    setOpenDeleteDialog(true);
  };

  const handleBulkDelete = async () => {
    if (selectedFaqs.size === 0) return;
    try {
      setError(null);
      await faqService.deleteMultipleFAQs(Array.from(selectedFaqs));
      await loadFAQs(); // Reload FAQs from API
      setSelectedFaqs(new Set());
    } catch (err: any) {
      console.error("Failed to delete FAQs:", err);
      setError(err.message || "Failed to delete FAQs");
    }
  };

  const confirmDelete = async () => {
    if (faqToDelete) {
      try {
        setError(null);
        await faqService.deleteFAQ(faqToDelete.id);
        await loadFAQs(); // Reload FAQs from API
        setSelectedFaqs((prev) => {
          const newSet = new Set(prev);
          newSet.delete(faqToDelete.id);
          return newSet;
        });
      } catch (err: any) {
        console.error("Failed to delete FAQ:", err);
        setError(err.message || "Failed to delete FAQ");
      }
    }
    setOpenDeleteDialog(false);
    setFaqToDelete(null);
  };

  const handleSaveAdd = async () => {
    if (!formQuestion.trim() || !formAnswer.trim()) return;

    try {
      setError(null);
      await faqService.createFAQ({
        question: formQuestion.trim(),
        answer: formAnswer.trim(),
        tags: formTags
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag.length > 0),
        dashboard_user_id: userId || undefined,
      });
      await loadFAQs(); // Reload FAQs from API
      setOpenAddModal(false);
      setFormQuestion("");
      setFormAnswer("");
      setFormTags("");
    } catch (err: any) {
      console.error("Failed to create FAQ:", err);
      setError(err.message || "Failed to create FAQ");
    }
  };

  const handleSaveEdit = async () => {
    if (!editingFaq || !formQuestion.trim() || !formAnswer.trim()) return;

    try {
      setError(null);
      await faqService.updateFAQ(editingFaq.id, {
        question: formQuestion.trim(),
        answer: formAnswer.trim(),
        tags: formTags
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag.length > 0),
        dashboard_user_id: userId || undefined,
      });
      await loadFAQs(); // Reload FAQs from API
      setOpenEditModal(false);
      setEditingFaq(null);
    } catch (err: any) {
      console.error("Failed to update FAQ:", err);
      setError(err.message || "Failed to update FAQ");
    }
  };

  const handleSelectFaq = (faqId: string) => {
    setSelectedFaqs((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(faqId)) {
        newSet.delete(faqId);
      } else {
        newSet.add(faqId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedFaqs.size === paginatedFaqs.length) {
      setSelectedFaqs(new Set());
    } else {
      setSelectedFaqs(new Set(paginatedFaqs.map((faq) => faq.id)));
    }
  };

  const clearChat = () => {
    // Force re-render of chatbot component by changing key
    setClearChatKey((prev) => prev + 1);
  };

  // Show error message
  if (error && !loading) {
    // Error will be shown in the UI below
  }

  // Show loading state
  if (loading && faqs.length === 0) {
    return (
      <PageContainer title="FAQs" description="Manage your Frequently Asked Questions">
        <Container maxWidth={false} sx={{ py: 2 }}>
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px" }}>
            <Box sx={{ textAlign: "center" }}>
              <CircularProgress />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2, fontSize: "0.875rem" }}>
                Loading FAQs...
              </Typography>
            </Box>
          </Box>
        </Container>
      </PageContainer>
    );
  }

  return (
    <PageContainer title="FAQs" description="Manage your Frequently Asked Questions">
      <Container maxWidth={false} sx={{ py: 2 }}>
        {/* Error Message */}
        {error && (
          <Box
            sx={{
              mb: 1.5,
              p: 1.5,
              bgcolor: "error.light",
              color: "error.contrastText",
              borderRadius: 1,
            }}
          >
            <Typography variant="body2" sx={{ fontSize: "0.85rem" }}>{error}</Typography>
            <Button
              size="small"
              onClick={() => setError(null)}
              sx={{ mt: 0.75, fontSize: "0.8rem" }}
            >
              Dismiss
            </Button>
          </Box>
        )}

        {/* Top Bar */}
        <Toolbar
          sx={{
            mb: 2,
            px: 0,
            minHeight: "48px !important",
            justifyContent: "space-between",
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: 600, fontSize: "1.25rem" }}>
            FAQs Management
          </Typography>
          <Button
            variant="contained"
            size="small"
            startIcon={<Add sx={{ fontSize: "1rem" }} />}
            onClick={handleAddFaq}
            sx={{ borderRadius: "8px", fontSize: "0.875rem" }}
          >
            Add FAQ
          </Button>
        </Toolbar>

        <Box sx={{ display: "flex", gap: 2, flexDirection: { xs: "column", md: "row" } }}>
          {/* Left Panel - FAQs Editor */}
          <Box sx={{ flex: { xs: 1, md: "0 0 calc(58.333% - 12px)" }, minWidth: 0 }}>
            <DashboardCard>
              <Stack spacing={2}>
                {/* Search Bar */}
                <TextField
                  fullWidth
                  placeholder="Search FAQs by question..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  size="small"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search sx={{ fontSize: "1rem" }} />
                      </InputAdornment>
                    ),
                    endAdornment: searchQuery ? (
                      <InputAdornment position="end">
                        <IconButton
                          size="small"
                          onClick={() => setSearchQuery("")}
                        >
                          <Clear sx={{ fontSize: "1rem" }} />
                        </IconButton>
                      </InputAdornment>
                    ) : null,
                  }}
                  sx={{ 
                    borderRadius: "7px",
                    "& .MuiInputBase-input": { fontSize: "0.875rem" }
                  }}
                />

                {/* Filter Options */}
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" mb={0.75} sx={{ fontSize: "0.875rem" }}>
                    Sort by:
                  </Typography>
                  <ToggleButtonGroup
                    value={sortFilter}
                    exclusive
                    onChange={(_, value) => value && setSortFilter(value)}
                    size="small"
                  >
                    <ToggleButton value="recently-added" sx={{ fontSize: "0.8rem", px: 1.5 }}>
                      Recently Added
                    </ToggleButton>
                    <ToggleButton value="largest" sx={{ fontSize: "0.8rem", px: 1.5 }}>Largest</ToggleButton>
                    <ToggleButton value="a-z" sx={{ fontSize: "0.8rem", px: 1.5 }}>A–Z</ToggleButton>
                  </ToggleButtonGroup>
                </Box>

                {/* Bulk Actions */}
                {selectedFaqs.size > 0 && (
                  <Box
                    sx={{
                      p: 1.5,
                      bgcolor: "action.selected",
                      borderRadius: "7px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Typography variant="body2" sx={{ fontSize: "0.85rem" }}>
                      {selectedFaqs.size} FAQ{selectedFaqs.size > 1 ? "s" : ""}{" "}
                      selected
                    </Typography>
                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<Delete sx={{ fontSize: "1rem" }} />}
                      onClick={handleBulkDelete}
                      size="small"
                      sx={{ fontSize: "0.8rem" }}
                    >
                      Delete Selected
                    </Button>
                  </Box>
                )}

                {/* FAQ Cards */}
                <Stack spacing={1.5}>
                  {loading ? (
                    <Box
                      sx={{
                        p: 3,
                        textAlign: "center",
                        color: "text.secondary",
                      }}
                    >
                      <Typography variant="body2" sx={{ fontSize: "0.85rem" }}>Loading FAQs...</Typography>
                    </Box>
                  ) : paginatedFaqs.length === 0 ? (
                    <Box
                      sx={{
                        p: 3,
                        textAlign: "center",
                        color: "text.secondary",
                      }}
                    >
                      <Typography variant="body2" sx={{ fontSize: "0.85rem" }}>
                        {searchQuery
                          ? "No FAQs match your search."
                          : "No FAQs yet. Click 'Add FAQ' to get started."}
                      </Typography>
                    </Box>
                  ) : (
                    paginatedFaqs.map((faq) => (
                      <Card
                        key={faq.id}
                        variant="outlined"
                        sx={{
                          "&:hover": {
                            boxShadow: 2,
                          },
                          transition: "box-shadow 0.2s",
                        }}
                      >
                        <CardContent sx={{ p: 2 }}>
                          <Stack
                            direction="row"
                            spacing={1.5}
                            alignItems="flex-start"
                          >
                            <Checkbox
                              checked={selectedFaqs.has(faq.id)}
                              onChange={() => handleSelectFaq(faq.id)}
                              size="small"
                            />
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                              <Typography
                                variant="subtitle1"
                                fontWeight={600}
                                gutterBottom
                                sx={{ fontSize: "0.95rem", mb: 0.75 }}
                              >
                                {faq.question}
                              </Typography>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{
                                  display: "-webkit-box",
                                  WebkitLineClamp: 3,
                                  WebkitBoxOrient: "vertical",
                                  overflow: "hidden",
                                  mb: 0.75,
                                  fontSize: "0.85rem",
                                }}
                              >
                                {faq.answer}
                              </Typography>
                              {faq.tags.length > 0 && (
                                <Stack
                                  direction="row"
                                  spacing={0.5}
                                  flexWrap="wrap"
                                  gap={0.5}
                                >
                                  {faq.tags.map((tag, idx) => (
                                    <Chip
                                      key={idx}
                                      label={tag}
                                      size="small"
                                      variant="outlined"
                                      sx={{ fontSize: "0.7rem", height: 22 }}
                                    />
                                  ))}
                                </Stack>
                              )}
                            </Box>
                            <Stack direction="row" spacing={0.5}>
                              <IconButton
                                size="small"
                                onClick={() => handleEditFaq(faq)}
                                color="primary"
                                sx={{ padding: "6px" }}
                              >
                                <Edit sx={{ fontSize: "1rem" }} />
                              </IconButton>
                              <IconButton
                                size="small"
                                onClick={() => handleDeleteClick(faq)}
                                sx={{ padding: "6px" }}
                                color="error"
                              >
                                <Delete sx={{ fontSize: "1rem" }} />
                              </IconButton>
                            </Stack>
                          </Stack>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </Stack>

                {/* Pagination */}
                {totalPages > 1 && (
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      pt: 1.5,
                    }}
                  >
                    <Pagination
                      count={totalPages}
                      page={page}
                      onChange={(_, value) => setPage(value)}
                      color="primary"
                      size="small"
                    />
                  </Box>
                )}

                {/* Select All Checkbox */}
                {paginatedFaqs.length > 0 && (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                    <Checkbox
                      checked={
                        paginatedFaqs.length > 0 &&
                        paginatedFaqs.every((faq) =>
                          selectedFaqs.has(faq.id)
                        )
                      }
                      indeterminate={
                        selectedFaqs.size > 0 &&
                        selectedFaqs.size < paginatedFaqs.length
                      }
                      onChange={handleSelectAll}
                      size="small"
                    />
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.85rem" }}>
                      Select all on this page
                    </Typography>
                  </Box>
                )}
              </Stack>
            </DashboardCard>
          </Box>

          {/* Right Panel - Chatbot Tester */}
          <Box sx={{ flex: { xs: 1, md: "0 0 calc(41.667% - 12px)" }, minWidth: 0 }}>
            <DashboardCard>
              <Stack spacing={1.5}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Typography variant="h6" sx={{ fontWeight: 600, fontSize: "0.95rem" }}>
                    Chatbot Tester
                  </Typography>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={clearChat}
                    startIcon={<Clear sx={{ fontSize: "1rem" }} />}
                    sx={{ fontSize: "0.8rem" }}
                  >
                    Clear Chat
                  </Button>
                </Box>
                <Divider />
                {/* Chatbot Widget Embed */}
                <Box
                  sx={{
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: "7px",
                    overflow: "hidden",
                    bgcolor: "background.default",
                  }}
                  key={clearChatKey}
                >
                  <ChatbotTester faqs={faqs} />
                </Box>
              </Stack>
            </DashboardCard>
          </Box>
        </Box>

        {/* Add FAQ Modal */}
        <Dialog
          open={openAddModal}
          onClose={() => setOpenAddModal(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle sx={{ fontSize: "1.125rem", fontWeight: 600, pb: 1 }}>Add New FAQ</DialogTitle>
          <DialogContent dividers sx={{ pt: 2 }}>
            <Stack spacing={2}>
              <TextField
                fullWidth
                label="Question"
                value={formQuestion}
                onChange={(e) => setFormQuestion(e.target.value)}
                required
                multiline
                rows={2}
                size="small"
                sx={{ "& .MuiInputBase-input": { fontSize: "0.875rem" } }}
              />
              <TextField
                fullWidth
                label="Answer"
                value={formAnswer}
                onChange={(e) => setFormAnswer(e.target.value)}
                required
                multiline
                rows={6}
                size="small"
                sx={{ "& .MuiInputBase-input": { fontSize: "0.875rem" } }}
              />
              <TextField
                fullWidth
                label="Tags (comma-separated)"
                value={formTags}
                onChange={(e) => setFormTags(e.target.value)}
                placeholder="e.g., billing, technical, account"
                helperText="Separate multiple tags with commas"
                size="small"
                sx={{ 
                  "& .MuiInputBase-input": { fontSize: "0.875rem" },
                  "& .MuiFormHelperText-root": { fontSize: "0.75rem" }
                }}
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 2, pt: 1.5 }}>
            <Button onClick={() => setOpenAddModal(false)} size="small" sx={{ fontSize: "0.875rem" }}>Cancel</Button>
            <Button
              variant="contained"
              onClick={handleSaveAdd}
              disabled={!formQuestion.trim() || !formAnswer.trim()}
              size="small"
              sx={{ fontSize: "0.875rem" }}
            >
              Save
            </Button>
          </DialogActions>
        </Dialog>

        {/* Edit FAQ Modal */}
        <Dialog
          open={openEditModal}
          onClose={() => {
            setOpenEditModal(false);
            setEditingFaq(null);
          }}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle sx={{ fontSize: "1.125rem", fontWeight: 600, pb: 1 }}>Edit FAQ</DialogTitle>
          <DialogContent dividers sx={{ pt: 2 }}>
            <Stack spacing={2}>
              <TextField
                fullWidth
                label="Question"
                value={formQuestion}
                onChange={(e) => setFormQuestion(e.target.value)}
                required
                multiline
                rows={2}
                size="small"
                sx={{ "& .MuiInputBase-input": { fontSize: "0.875rem" } }}
              />
              <TextField
                fullWidth
                label="Answer"
                value={formAnswer}
                onChange={(e) => setFormAnswer(e.target.value)}
                required
                multiline
                rows={6}
                size="small"
                sx={{ "& .MuiInputBase-input": { fontSize: "0.875rem" } }}
              />
              <TextField
                fullWidth
                label="Tags (comma-separated)"
                value={formTags}
                onChange={(e) => setFormTags(e.target.value)}
                placeholder="e.g., billing, technical, account"
                helperText="Separate multiple tags with commas"
                size="small"
                sx={{ 
                  "& .MuiInputBase-input": { fontSize: "0.875rem" },
                  "& .MuiFormHelperText-root": { fontSize: "0.75rem" }
                }}
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 2, pt: 1.5 }}>
            <Button
              onClick={() => {
                setOpenEditModal(false);
                setEditingFaq(null);
              }}
              size="small"
              sx={{ fontSize: "0.875rem" }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleSaveEdit}
              disabled={!formQuestion.trim() || !formAnswer.trim()}
              size="small"
              sx={{ fontSize: "0.875rem" }}
            >
              Save Changes
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={openDeleteDialog}
          onClose={() => {
            setOpenDeleteDialog(false);
            setFaqToDelete(null);
          }}
        >
          <DialogTitle sx={{ fontSize: "1.125rem", fontWeight: 600, pb: 1 }}>Delete FAQ</DialogTitle>
          <DialogContent sx={{ pt: 2 }}>
            <Typography sx={{ fontSize: "0.875rem" }}>
              Are you sure you want to delete this FAQ? This action cannot be
              undone.
            </Typography>
            {faqToDelete && (
              <Box sx={{ mt: 1.5, p: 1.5, bgcolor: "action.hover", borderRadius: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: "0.875rem" }}>
                  {faqToDelete.question}
                </Typography>
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 2, pt: 1.5 }}>
            <Button
              onClick={() => {
                setOpenDeleteDialog(false);
                setFaqToDelete(null);
              }}
              size="small"
              sx={{ fontSize: "0.875rem" }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              color="error"
              size="small"
              sx={{ fontSize: "0.875rem" }}
              onClick={confirmDelete}
            >
              Yes, Delete
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </PageContainer>
  );
}

