"use client";
import React, { useState, useEffect, useMemo } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Search,
  X,
  Loader2,
} from "lucide-react";
import PageContainer from "@/app/(DashboardLayout)/components/container/PageContainer";
import DashboardCard from "@/app/(DashboardLayout)/components/shared/DashboardCard";
import { faqService, FAQ as FAQType } from "./services/faqService";
import { authClient } from "@/lib/auth-client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Chip } from "@/components/ui/chip";
import { Modal } from "@/components/ui/modal";
import { Pagination } from "@/components/ui/pagination";

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [formQuestion, setFormQuestion] = useState("");
  const [formAnswer, setFormAnswer] = useState("");
  const [formTags, setFormTags] = useState("");

  // Load FAQs from API on mount and when userId changes
  useEffect(() => {
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

  // Filter and sort FAQs
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
      await loadFAQs();
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
        await loadFAQs();
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
      await loadFAQs();
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
      await loadFAQs();
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

  // Show loading state
  if (loading && faqs.length === 0) {
    return (
      <PageContainer title="FAQs" description="Manage your Frequently Asked Questions">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-[#EE66AA] mx-auto mb-4" />
            <p className="text-sm text-gray-300">Loading FAQs...</p>
          </div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer title="FAQs" description="Manage your Frequently Asked Questions">
      <div className="py-4">
        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-600/20 border border-red-500 rounded-lg text-red-400">
            <div className="flex items-center justify-between">
              <p className="text-sm">{error}</p>
              <button
                onClick={() => setError(null)}
                className="ml-4 text-red-400 hover:text-red-300"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Top Bar */}
        <div className="flex justify-between items-center mb-6">
          <h5 className="text-xl font-semibold text-slate-900">
            FAQs Management
          </h5>
          <Button
            variant="contained"
            color="primary"
            size="small"
            onClick={handleAddFaq}
            className="text-sm"
          >
            <Plus size={16} className="mr-2" />
            Add FAQ
          </Button>
        </div>

        <div className="space-y-4">
          {/* FAQs Editor */}
          <div className="w-full">
            <DashboardCard>
              <div className="space-y-4">
                {/* Search Bar */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    placeholder="Search FAQs by question..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-10"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-white"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>

                {/* Filter Options */}
                <div>
                  <p className="text-sm text-gray-300 mb-2">Sort by:</p>
                  <div className="flex gap-2">
                    {[
                      { value: "recently-added", label: "Recently Added" },
                      { value: "largest", label: "Largest" },
                      { value: "a-z", label: "A–Z" },
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setSortFilter(option.value as SortFilter)}
                        className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
                          sortFilter === option.value
                            ? "bg-[#EE66AA] border-[#EE66AA] text-white"
                            : "border-gray-700 text-gray-300 hover:bg-gray-700"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Bulk Actions */}
                {selectedFaqs.size > 0 && (
                  <div className="p-3 bg-gray-800 rounded-lg flex items-center justify-between">
                    <p className="text-sm text-white">
                      {selectedFaqs.size} FAQ{selectedFaqs.size > 1 ? "s" : ""} selected
                    </p>
                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      onClick={handleBulkDelete}
                      className="text-xs"
                    >
                      <Trash2 size={14} className="mr-2" />
                      Delete Selected
                    </Button>
                  </div>
                )}

                {/* FAQ Cards */}
                <div className="space-y-3">
                  {loading ? (
                    <div className="p-6 text-center text-gray-400">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                      <p className="text-sm">Loading FAQs...</p>
                    </div>
                  ) : paginatedFaqs.length === 0 ? (
                    <div className="p-6 text-center text-gray-400">
                      <p className="text-sm">
                        {searchQuery
                          ? "No FAQs match your search."
                          : "No FAQs yet. Click 'Add FAQ' to get started."}
                      </p>
                    </div>
                  ) : (
                    paginatedFaqs.map((faq) => (
                      <Card
                        key={faq.id}
                        className="border border-gray-700 hover:shadow-lg transition-shadow"
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <input
                              type="checkbox"
                              checked={selectedFaqs.has(faq.id)}
                              onChange={() => handleSelectFaq(faq.id)}
                              className="mt-1 w-4 h-4 rounded border-gray-600 bg-[#1e1e1e] text-[#EE66AA] focus:ring-[#EE66AA]"
                            />
                            <div className="flex-1 min-w-0">
                              <h6 className="text-base font-semibold text-white mb-2">
                                {faq.question}
                              </h6>
                              <p className="text-sm text-gray-300 mb-2 line-clamp-3">
                                {faq.answer}
                              </p>
                              {faq.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                  {faq.tags.map((tag, idx) => (
                                    <Chip
                                      key={idx}
                                      size="small"
                                      variant="outlined"
                                      className="text-xs"
                                    >
                                      {tag}
                                    </Chip>
                                  ))}
                                </div>
                              )}
                            </div>
                            <div className="flex gap-1">
                              <button
                                onClick={() => handleEditFaq(faq)}
                                className="p-2 text-[#EE66AA] hover:bg-[#EE66AA]/10 rounded-lg transition-colors"
                                title="Edit"
                              >
                                <Edit size={16} />
                              </button>
                              <button
                                onClick={() => handleDeleteClick(faq)}
                                className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                title="Delete"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center pt-4">
                    <Pagination
                      count={totalPages}
                      page={page}
                      onChange={setPage}
                      color="primary"
                      size="small"
                    />
                  </div>
                )}

                {/* Select All Checkbox */}
                {paginatedFaqs.length > 0 && (
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={
                        paginatedFaqs.length > 0 &&
                        paginatedFaqs.every((faq) => selectedFaqs.has(faq.id))
                      }
                      onChange={handleSelectAll}
                      className="w-4 h-4 rounded border-gray-600 bg-[#1e1e1e] text-[#EE66AA] focus:ring-[#EE66AA]"
                    />
                    <p className="text-sm text-gray-300">
                      Select all on this page
                    </p>
                  </div>
                )}
              </div>
            </DashboardCard>
          </div>
        </div>

        {/* Add FAQ Modal */}
        <Modal
          open={openAddModal}
          onClose={() => setOpenAddModal(false)}
          title="Add New FAQ"
          maxWidth="md"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Question *
              </label>
              <textarea
                value={formQuestion}
                onChange={(e) => setFormQuestion(e.target.value)}
                required
                rows={2}
                className="w-full px-4 py-2 rounded-lg bg-[#1e1e1e] border border-gray-700 text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#EE66AA] focus:border-transparent resize-none"
                placeholder="Enter the question"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Answer *
              </label>
              <textarea
                value={formAnswer}
                onChange={(e) => setFormAnswer(e.target.value)}
                required
                rows={6}
                className="w-full px-4 py-2 rounded-lg bg-[#1e1e1e] border border-gray-700 text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#EE66AA] focus:border-transparent resize-none"
                placeholder="Enter the answer"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Tags (comma-separated)
              </label>
              <Input
                value={formTags}
                onChange={(e) => setFormTags(e.target.value)}
                placeholder="e.g., billing, technical, account"
                helperText="Separate multiple tags with commas"
                className="text-sm"
              />
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-700">
              <Button
                variant="outlined"
                color="primary"
                size="small"
                onClick={() => setOpenAddModal(false)}
                className="text-sm"
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                color="primary"
                size="small"
                onClick={handleSaveAdd}
                disabled={!formQuestion.trim() || !formAnswer.trim()}
                className="text-sm"
              >
                Save
              </Button>
            </div>
          </div>
        </Modal>

        {/* Edit FAQ Modal */}
        <Modal
          open={openEditModal}
          onClose={() => {
            setOpenEditModal(false);
            setEditingFaq(null);
          }}
          title="Edit FAQ"
          maxWidth="md"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Question *
              </label>
              <textarea
                value={formQuestion}
                onChange={(e) => setFormQuestion(e.target.value)}
                required
                rows={2}
                className="w-full px-4 py-2 rounded-lg bg-[#1e1e1e] border border-gray-700 text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#EE66AA] focus:border-transparent resize-none"
                placeholder="Enter the question"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Answer *
              </label>
              <textarea
                value={formAnswer}
                onChange={(e) => setFormAnswer(e.target.value)}
                required
                rows={6}
                className="w-full px-4 py-2 rounded-lg bg-[#1e1e1e] border border-gray-700 text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#EE66AA] focus:border-transparent resize-none"
                placeholder="Enter the answer"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Tags (comma-separated)
              </label>
              <Input
                value={formTags}
                onChange={(e) => setFormTags(e.target.value)}
                placeholder="e.g., billing, technical, account"
                helperText="Separate multiple tags with commas"
                className="text-sm"
              />
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-700">
              <Button
                variant="outlined"
                color="primary"
                size="small"
                onClick={() => {
                  setOpenEditModal(false);
                  setEditingFaq(null);
                }}
                className="text-sm"
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                color="primary"
                size="small"
                onClick={handleSaveEdit}
                disabled={!formQuestion.trim() || !formAnswer.trim()}
                className="text-sm"
              >
                Save Changes
              </Button>
            </div>
          </div>
        </Modal>

        {/* Delete Confirmation Dialog */}
        <Modal
          open={openDeleteDialog}
          onClose={() => {
            setOpenDeleteDialog(false);
            setFaqToDelete(null);
          }}
          title="Delete FAQ"
          maxWidth="sm"
        >
          <div className="space-y-4">
            <p className="text-sm text-gray-300">
              Are you sure you want to delete this FAQ? This action cannot be undone.
            </p>
            {faqToDelete && (
              <div className="p-3 bg-gray-800 rounded-lg">
                <p className="text-sm font-semibold text-white">
                  {faqToDelete.question}
                </p>
              </div>
            )}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-700">
              <Button
                variant="outlined"
                color="primary"
                size="small"
                onClick={() => {
                  setOpenDeleteDialog(false);
                  setFaqToDelete(null);
                }}
                className="text-sm"
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                color="error"
                size="small"
                onClick={confirmDelete}
                className="text-sm"
              >
                Yes, Delete
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </PageContainer>
  );
}
