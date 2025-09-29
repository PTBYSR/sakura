"use client";
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Chip,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
  Grid,
} from '@mui/material';
import {
  IconSearch,
  IconChevronDown,
  IconCode,
  IconCheck,
} from '@tabler/icons-react';
import { useARP } from '@/contexts/ARPContext';
import { useAgents } from '@/contexts/AgentsContext';
import { ARP } from '@/contexts/ARPContext';

interface ARPCustomizationProps {
  agentId: string;
}

const ARPCustomization: React.FC<ARPCustomizationProps> = ({ agentId }) => {
  const { arps, assignARPToAgent, unassignARPFromAgent } = useARP();
  const { agents } = useAgents();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [assignedARPs, setAssignedARPs] = useState<string[]>([]);

  const agent = agents.find(a => a.id === agentId);

  useEffect(() => {
    if (agent) {
      // Get ARPs assigned to this agent
      const agentARPs = arps.filter(arp => arp.assignedAgents.includes(agentId));
      setAssignedARPs(agentARPs.map(arp => arp.id));
    }
  }, [agent, arps, agentId]);

  const filteredARPs = arps.filter(arp => {
    const matchesSearch = arp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         arp.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || arp.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  const handleARPAssignment = (arpId: string, checked: boolean) => {
    if (checked) {
      assignARPToAgent(arpId, agentId);
      setAssignedARPs(prev => [...prev, arpId]);
    } else {
      unassignARPFromAgent(arpId, agentId);
      setAssignedARPs(prev => prev.filter(id => id !== arpId));
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'draft': return 'warning';
      case 'archived': return 'default';
      default: return 'default';
    }
  };

  const groupedARPs = filteredARPs.reduce((acc, arp) => {
    if (!acc[arp.category]) {
      acc[arp.category] = [];
    }
    acc[arp.category].push(arp);
    return acc;
  }, {} as Record<string, ARP[]>);

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
          <IconCode size={24} color="#1976d2" />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            ARP Customization
          </Typography>
        </Box>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Select which Automated Response Protocols (ARPs) this agent should use. 
          The agent will only respond to scenarios covered by its assigned ARPs.
        </Typography>

        {/* Summary */}
        <Box sx={{ mb: 3, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
          <Typography variant="subtitle2" gutterBottom>
            Current Assignment Summary
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {assignedARPs.length > 0 ? (
              assignedARPs.map(arpId => {
                const arp = arps.find(a => a.id === arpId);
                return arp ? (
                  <Chip
                    key={arpId}
                    label={arp.name}
                    size="small"
                    color={getCategoryColor(arp.category) as any}
                    variant="outlined"
                  />
                ) : null;
              })
            ) : (
              <Typography variant="body2" color="text.secondary">
                No ARPs assigned yet
              </Typography>
            )}
          </Box>
        </Box>

        {/* Filters */}
        <Box sx={{ mb: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search ARPs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <IconSearch size={20} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth size="small">
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
          </Grid>
        </Box>

        {/* ARP Categories */}
        <Box>
          {Object.entries(groupedARPs).map(([category, categoryARPs]) => (
            <Accordion key={category} defaultExpanded>
              <AccordionSummary expandIcon={<IconChevronDown />}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, textTransform: 'capitalize' }}>
                    {category} ARPs
                  </Typography>
                  <Chip
                    label={categoryARPs.length}
                    size="small"
                    color={getCategoryColor(category) as any}
                    variant="outlined"
                  />
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <FormGroup>
                  {categoryARPs.map((arp) => (
                    <Box key={arp.id} sx={{ mb: 2 }}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={assignedARPs.includes(arp.id)}
                            onChange={(e) => handleARPAssignment(arp.id, e.target.checked)}
                            color="primary"
                          />
                        }
                        label={
                          <Box sx={{ ml: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                {arp.name}
                              </Typography>
                              <Chip
                                label={arp.status}
                                size="small"
                                color={getStatusColor(arp.status) as any}
                              />
                              <Chip
                                label={`Priority: ${arp.priority}`}
                                size="small"
                                variant="outlined"
                              />
                            </Box>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                              {arp.description}
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                              <Typography variant="caption" color="text.secondary">
                                {arp.triggers.length} triggers
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                •
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {arp.responses.length} responses
                              </Typography>
                              {arp.assignedAgents.length > 0 && (
                                <>
                                  <Typography variant="caption" color="text.secondary">
                                    •
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    Used by {arp.assignedAgents.length} agent{arp.assignedAgents.length > 1 ? 's' : ''}
                                  </Typography>
                                </>
                              )}
                            </Box>
                          </Box>
                        }
                      />
                    </Box>
                  ))}
                </FormGroup>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>

        {filteredARPs.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body2" color="text.secondary">
              No ARPs found matching your criteria
            </Typography>
          </Box>
        )}

        {/* Benefits Section */}
        <Divider sx={{ my: 3 }} />
        <Box>
          <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
            Benefits of ARP Assignment:
          </Typography>
          <Box component="ul" sx={{ pl: 2, m: 0 }}>
            <Typography component="li" variant="body2" color="text.secondary">
              <strong>Reusability:</strong> Create an ARP once, use it across multiple agents
            </Typography>
            <Typography component="li" variant="body2" color="text.secondary">
              <strong>Consistency:</strong> Same ARP works identically across different agents
            </Typography>
            <Typography component="li" variant="body2" color="text.secondary">
              <strong>Management:</strong> Centralized updates affect all agents using the ARP
            </Typography>
            <Typography component="li" variant="body2" color="text.secondary">
              <strong>Flexibility:</strong> Different agents can have different ARP combinations
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ARPCustomization;
