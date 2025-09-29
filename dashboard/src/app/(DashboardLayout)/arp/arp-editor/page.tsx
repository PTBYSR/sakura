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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid,
} from "@mui/material";
import {
  IconPlus,
  IconTrash,
  IconChevronDown,
  IconDeviceFloppy,
  IconEye,
} from "@tabler/icons-react";
import PageContainer from "@/app/(DashboardLayout)/components/container/PageContainer";
import { useARP } from "@/contexts/ARPContext";
import { ARP, ARPTrigger, ARPResponse } from "@/contexts/ARPContext";

const ARPEditorPage = () => {
  const { addARP } = useARP();
  const [arp, setARP] = useState<Partial<ARP>>({
    name: '',
    description: '',
    category: 'general',
    status: 'draft',
    priority: 1,
    triggers: [],
    responses: [],
  });

  const [newTrigger, setNewTrigger] = useState<Partial<ARPTrigger>>({
    type: 'keyword',
    value: '',
    description: '',
  });

  const [newResponse, setNewResponse] = useState<Partial<ARPResponse>>({
    type: 'text',
    content: '',
  });

  const handleSaveARP = () => {
    if (arp.name && arp.description) {
      addARP({
        name: arp.name,
        description: arp.description,
        category: arp.category || 'general',
        status: arp.status || 'draft',
        priority: arp.priority || 1,
        triggers: arp.triggers || [],
        responses: arp.responses || [],
      });
      
      // Reset form
      setARP({
        name: '',
        description: '',
        category: 'general',
        status: 'draft',
        priority: 1,
        triggers: [],
        responses: [],
      });
    }
  };

  const addTrigger = () => {
    if (newTrigger.value && newTrigger.description) {
      const trigger: ARPTrigger = {
        id: `trigger-${Date.now()}`,
        type: newTrigger.type || 'keyword',
        value: newTrigger.value,
        description: newTrigger.description,
      };
      setARP(prev => ({
        ...prev,
        triggers: [...(prev.triggers || []), trigger],
      }));
      setNewTrigger({ type: 'keyword', value: '', description: '' });
    }
  };

  const removeTrigger = (index: number) => {
    setARP(prev => ({
      ...prev,
      triggers: prev.triggers?.filter((_, i) => i !== index) || [],
    }));
  };

  const addResponse = () => {
    if (newResponse.content) {
      const response: ARPResponse = {
        id: `response-${Date.now()}`,
        type: newResponse.type || 'text',
        content: newResponse.content,
      };
      setARP(prev => ({
        ...prev,
        responses: [...(prev.responses || []), response],
      }));
      setNewResponse({ type: 'text', content: '' });
    }
  };

  const removeResponse = (index: number) => {
    setARP(prev => ({
      ...prev,
      responses: prev.responses?.filter((_, i) => i !== index) || [],
    }));
  };

  return (
    <PageContainer title="ARP Editor" description="Create and edit Automated Response Protocols">
      <Container maxWidth="lg">
        <Box sx={{ py: 4 }}>
          <Typography variant="h4" gutterBottom>
            ARP Editor
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Create and configure Automated Response Protocols for your AI agents
          </Typography>

          <Card>
            <CardContent>
              <Grid container spacing={3}>
                {/* Basic Information */}
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Basic Information
                  </Typography>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="ARP Name"
                    value={arp.name}
                    onChange={(e) => setARP(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Refund Processing"
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Category</InputLabel>
                    <Select
                      value={arp.category}
                      label="Category"
                      onChange={(e) => setARP(prev => ({ ...prev, category: e.target.value as any }))}
                    >
                      <MenuItem value="support">Support</MenuItem>
                      <MenuItem value="sales">Sales</MenuItem>
                      <MenuItem value="billing">Billing</MenuItem>
                      <MenuItem value="technical">Technical</MenuItem>
                      <MenuItem value="general">General</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Description"
                    value={arp.description}
                    onChange={(e) => setARP(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe what this ARP handles..."
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={arp.status}
                      label="Status"
                      onChange={(e) => setARP(prev => ({ ...prev, status: e.target.value as any }))}
                    >
                      <MenuItem value="draft">Draft</MenuItem>
                      <MenuItem value="active">Active</MenuItem>
                      <MenuItem value="archived">Archived</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Priority"
                    value={arp.priority}
                    onChange={(e) => setARP(prev => ({ ...prev, priority: parseInt(e.target.value) }))}
                    inputProps={{ min: 1, max: 10 }}
                  />
                </Grid>

                {/* Triggers Section */}
                <Grid item xs={12}>
                  <Accordion>
                    <AccordionSummary expandIcon={<IconChevronDown />}>
                      <Typography variant="h6">
                        Triggers ({arp.triggers?.length || 0})
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Box sx={{ mb: 2 }}>
                        <Grid container spacing={2} alignItems="center">
                          <Grid item xs={12} md={3}>
                            <FormControl fullWidth size="small">
                              <InputLabel>Type</InputLabel>
                              <Select
                                value={newTrigger.type}
                                label="Type"
                                onChange={(e) => setNewTrigger(prev => ({ ...prev, type: e.target.value as any }))}
                              >
                                <MenuItem value="keyword">Keyword</MenuItem>
                                <MenuItem value="intent">Intent</MenuItem>
                                <MenuItem value="pattern">Pattern</MenuItem>
                                <MenuItem value="context">Context</MenuItem>
                              </Select>
                            </FormControl>
                          </Grid>
                          <Grid item xs={12} md={4}>
                            <TextField
                              fullWidth
                              size="small"
                              label="Value"
                              value={newTrigger.value}
                              onChange={(e) => setNewTrigger(prev => ({ ...prev, value: e.target.value }))}
                              placeholder="e.g., refund, money back"
                            />
                          </Grid>
                          <Grid item xs={12} md={4}>
                            <TextField
                              fullWidth
                              size="small"
                              label="Description"
                              value={newTrigger.description}
                              onChange={(e) => setNewTrigger(prev => ({ ...prev, description: e.target.value }))}
                              placeholder="Description of this trigger"
                            />
                          </Grid>
                          <Grid item xs={12} md={1}>
                            <IconButton onClick={addTrigger} color="primary">
                              <IconPlus />
                            </IconButton>
                          </Grid>
                        </Grid>
                      </Box>
                      
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {arp.triggers?.map((trigger, index) => (
                          <Chip
                            key={index}
                            label={`${trigger.type}: ${trigger.value}`}
                            onDelete={() => removeTrigger(index)}
                            color="primary"
                            variant="outlined"
                          />
                        ))}
                      </Box>
                    </AccordionDetails>
                  </Accordion>
                </Grid>

                {/* Responses Section */}
                <Grid item xs={12}>
                  <Accordion>
                    <AccordionSummary expandIcon={<IconChevronDown />}>
                      <Typography variant="h6">
                        Responses ({arp.responses?.length || 0})
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Box sx={{ mb: 2 }}>
                        <Grid container spacing={2} alignItems="center">
                          <Grid item xs={12} md={3}>
                            <FormControl fullWidth size="small">
                              <InputLabel>Type</InputLabel>
                              <Select
                                value={newResponse.type}
                                label="Type"
                                onChange={(e) => setNewResponse(prev => ({ ...prev, type: e.target.value as any }))}
                              >
                                <MenuItem value="text">Text</MenuItem>
                                <MenuItem value="action">Action</MenuItem>
                                <MenuItem value="redirect">Redirect</MenuItem>
                                <MenuItem value="escalate">Escalate</MenuItem>
                              </Select>
                            </FormControl>
                          </Grid>
                          <Grid item xs={12} md={8}>
                            <TextField
                              fullWidth
                              size="small"
                              label="Content"
                              value={newResponse.content}
                              onChange={(e) => setNewResponse(prev => ({ ...prev, content: e.target.value }))}
                              placeholder="Response content or action description"
                            />
                          </Grid>
                          <Grid item xs={12} md={1}>
                            <IconButton onClick={addResponse} color="primary">
                              <IconPlus />
                            </IconButton>
                          </Grid>
                        </Grid>
                      </Box>
                      
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        {arp.responses?.map((response, index) => (
                          <Box
                            key={index}
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              p: 2,
                              border: '1px solid #e0e0e0',
                              borderRadius: 1,
                            }}
                          >
                            <Box>
                              <Typography variant="subtitle2">
                                {response.type.toUpperCase()}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {response.content}
                              </Typography>
                            </Box>
                            <IconButton onClick={() => removeResponse(index)} color="error" size="small">
                              <IconTrash />
                            </IconButton>
                          </Box>
                        ))}
                      </Box>
                    </AccordionDetails>
                  </Accordion>
                </Grid>

                {/* Actions */}
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                    <Button
                      variant="outlined"
                      startIcon={<IconEye />}
                      disabled={!arp.name || !arp.description}
                    >
                      Preview
                    </Button>
                    <Button
                      variant="contained"
                      startIcon={<IconDeviceFloppy />}
                      onClick={handleSaveARP}
                      disabled={!arp.name || !arp.description}
                    >
                      Save ARP
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Box>
      </Container>
    </PageContainer>
  );
};

export default ARPEditorPage;
