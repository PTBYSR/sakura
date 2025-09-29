"use client";
import React, { useState } from "react";
import {
  Box,
  Typography,
  Container,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  IconSearch,
  IconEdit,
  IconTrash,
  IconEye,
  IconPlus,
  IconFilter,
} from "@tabler/icons-react";
import PageContainer from "@/app/(DashboardLayout)/components/container/PageContainer";
import { useARP } from "@/contexts/ARPContext";
import { ARP } from "@/contexts/ARPContext";

const AllARPsPage = () => {
  const { arps, deleteARP } = useARP();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedARP, setSelectedARP] = useState<ARP | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);

  const filteredARPs = arps.filter(arp => {
    const matchesSearch = arp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         arp.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || arp.category === categoryFilter;
    const matchesStatus = statusFilter === "all" || arp.status === statusFilter;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'draft': return 'warning';
      case 'archived': return 'default';
      default: return 'default';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'support': return 'primary';
      case 'sales': return 'secondary';
      case 'billing': return 'error';
      case 'technical': return 'info';
      case 'general': return 'default';
      default: return 'default';
    }
  };

  const handleViewARP = (arp: ARP) => {
    setSelectedARP(arp);
    setViewDialogOpen(true);
  };

  const handleDeleteARP = (arpId: string) => {
    if (window.confirm('Are you sure you want to delete this ARP?')) {
      deleteARP(arpId);
    }
  };

  return (
    <PageContainer title="All ARPs" description="View and manage all Automated Response Protocols">
      <Container maxWidth="lg">
        <Box sx={{ py: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            <Typography variant="h4" gutterBottom>
              All ARPs
            </Typography>
            <Button
              variant="contained"
              startIcon={<IconPlus />}
              href="/arp/arp-editor"
            >
              Create New ARP
            </Button>
          </Box>

          {/* Filters */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    placeholder="Search ARPs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <IconSearch />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <FormControl fullWidth>
                    <InputLabel>Category</InputLabel>
                    <Select
                      value={categoryFilter}
                      label="Category"
                      onChange={(e) => setCategoryFilter(e.target.value)}
                    >
                      <MenuItem value="all">All Categories</MenuItem>
                      <MenuItem value="support">Support</MenuItem>
                      <MenuItem value="sales">Sales</MenuItem>
                      <MenuItem value="billing">Billing</MenuItem>
                      <MenuItem value="technical">Technical</MenuItem>
                      <MenuItem value="general">General</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={3}>
                  <FormControl fullWidth>
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={statusFilter}
                      label="Status"
                      onChange={(e) => setStatusFilter(e.target.value)}
                    >
                      <MenuItem value="all">All Status</MenuItem>
                      <MenuItem value="active">Active</MenuItem>
                      <MenuItem value="draft">Draft</MenuItem>
                      <MenuItem value="archived">Archived</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={2}>
                  <Typography variant="body2" color="text.secondary" align="center">
                    {filteredARPs.length} ARPs
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* ARP Cards */}
          <Grid container spacing={3}>
            {filteredARPs.map((arp) => (
              <Grid item xs={12} md={6} lg={4} key={arp.id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Typography variant="h6" component="h2" sx={{ fontWeight: 600 }}>
                        {arp.name}
                      </Typography>
                      <Chip
                        label={arp.status}
                        color={getStatusColor(arp.status) as any}
                        size="small"
                      />
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {arp.description}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                      <Chip
                        label={arp.category}
                        color={getCategoryColor(arp.category) as any}
                        size="small"
                        variant="outlined"
                      />
                      <Chip
                        label={`Priority: ${arp.priority}`}
                        size="small"
                        variant="outlined"
                      />
                    </Box>
                    
                    <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                      <Typography variant="caption" color="text.secondary">
                        {arp.triggers.length} triggers
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        •
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {arp.responses.length} responses
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        •
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {arp.assignedAgents.length} agents
                      </Typography>
                    </Box>
                    
                    <Typography variant="caption" color="text.secondary">
                      Updated: {arp.updatedAt.toLocaleDateString()}
                    </Typography>
                  </CardContent>
                  
                  <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                    <Box>
                      <IconButton
                        size="small"
                        onClick={() => handleViewARP(arp)}
                        color="primary"
                      >
                        <IconEye />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="primary"
                        href={`/arp/arp-editor?id=${arp.id}`}
                      >
                        <IconEdit />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeleteARP(arp.id)}
                      >
                        <IconTrash />
                      </IconButton>
                    </Box>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>

          {filteredARPs.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No ARPs found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Try adjusting your search criteria or create a new ARP
              </Typography>
            </Box>
          )}
        </Box>

        {/* View ARP Dialog */}
        <Dialog
          open={viewDialogOpen}
          onClose={() => setViewDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            {selectedARP?.name}
            <Chip
              label={selectedARP?.status}
              color={getStatusColor(selectedARP?.status || '') as any}
              size="small"
              sx={{ ml: 2 }}
            />
          </DialogTitle>
          <DialogContent>
            {selectedARP && (
              <Box>
                <Typography variant="body1" sx={{ mb: 3 }}>
                  {selectedARP.description}
                </Typography>
                
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Triggers ({selectedARP.triggers.length})
                  </Typography>
                  {selectedARP.triggers.map((trigger, index) => (
                    <Box key={index} sx={{ mb: 1, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
                      <Typography variant="subtitle2">
                        {trigger.type.toUpperCase()}: {trigger.value}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {trigger.description}
                      </Typography>
                    </Box>
                  ))}
                </Box>
                
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Responses ({selectedARP.responses.length})
                  </Typography>
                  {selectedARP.responses.map((response, index) => (
                    <Box key={index} sx={{ mb: 1, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
                      <Typography variant="subtitle2">
                        {response.type.toUpperCase()}
                      </Typography>
                      <Typography variant="body2">
                        {response.content}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
            <Button
              variant="contained"
              href={`/arp/arp-editor?id=${selectedARP?.id}`}
            >
              Edit ARP
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </PageContainer>
  );
};

export default AllARPsPage;
