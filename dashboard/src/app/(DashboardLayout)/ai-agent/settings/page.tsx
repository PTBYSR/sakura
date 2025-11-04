"use client";
import React, { useState } from "react";
import {
  Box,
  Typography,
  Container,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Avatar,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Divider,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  IconButton,
  Paper,
  InputAdornment,
  Slider,
  Alert,
  Badge,
} from "@mui/material";
import {
  Settings as SettingsIcon,
  Save as SaveIcon,
  Edit as EditIcon,
  Person as PersonIcon,
  Message as MessageIcon,
  Psychology as PsychologyIcon,
  Book as BookIcon,
  SmartToy as SmartToyIcon,
  Send as SendIcon,
  AttachFile as AttachFileIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  VolumeUp as VolumeUpIcon,
  Chat as ChatIcon,
  ToggleOn as ToggleOnIcon,
  ToggleOff as ToggleOffIcon,
} from "@mui/icons-material";
import PageContainer from "@/app/(DashboardLayout)/components/container/PageContainer";
import { useAgents } from "@/contexts/AgentsContext";

const AIAgentSettingsPage = () => {
  const { agent, updateAgent } = useAgents();
  
  // Agent Settings State
  const [agentSettings, setAgentSettings] = useState({
    name: agent.name,
    profilePicture: "",
    greetingMessage: "Hello! I'm here to help you with any questions you might have. How can I assist you today?",
    toneOfVoice: "friendly",
    responseLength: "medium",
  });

  // Behavior Controls State
  const [behaviorSettings, setBehaviorSettings] = useState({
    enableSmallTalk: true,
    responseDelay: 1500, // milliseconds
    typingSimulation: true,
  });

  // Knowledge Base State
  const [knowledgeBases, setKnowledgeBases] = useState([
    { id: "kb-1", name: "Company Website", type: "website", url: "https://company.com", active: true },
    { id: "kb-2", name: "Product Manual", type: "file", filename: "manual.pdf", active: true },
    { id: "kb-3", name: "FAQ Database", type: "file", filename: "faq.docx", active: false },
    { id: "kb-4", name: "Support Docs", type: "website", url: "https://support.company.com", active: true },
  ]);

  // Channel Configuration State
  const [channels, setChannels] = useState([
    { id: "whatsapp", name: "WhatsApp", icon: "📱", active: true },
    { id: "instagram", name: "Instagram", icon: "📷", active: false },
    { id: "messenger", name: "Facebook Messenger", icon: "💬", active: true },
    { id: "website", name: "Website Widget", icon: "🌐", active: true },
  ]);

  // Testing Panel State
  const [testMessages, setTestMessages] = useState([
    { id: 1, type: "agent", message: agentSettings.greetingMessage, timestamp: new Date() },
  ]);
  const [newTestMessage, setNewTestMessage] = useState("");

  const handleAgentSettingChange = (field: string, value: any) => {
    setAgentSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleBehaviorSettingChange = (field: string, value: any) => {
    setBehaviorSettings(prev => ({ ...prev, [field]: value }));
  };

  const toggleKnowledgeBase = (kbId: string) => {
    setKnowledgeBases(prev => 
      prev.map(kb => 
        kb.id === kbId ? { ...kb, active: !kb.active } : kb
      )
    );
  };

  const toggleChannel = (channelId: string) => {
    setChannels(prev => 
      prev.map(channel => 
        channel.id === channelId ? { ...channel, active: !channel.active } : channel
      )
    );
  };

  const sendTestMessage = () => {
    if (newTestMessage.trim()) {
      const userMessage = {
        id: Date.now(),
        type: "user",
        message: newTestMessage,
        timestamp: new Date()
      };
      
      setTestMessages(prev => [...prev, userMessage]);
      setNewTestMessage("");
      
      // Simulate AI response after delay
      setTimeout(() => {
        const aiResponse = {
          id: Date.now() + 1,
          type: "agent",
          message: "Thank you for your message! This is a simulated response from the AI agent.",
          timestamp: new Date()
        };
        setTestMessages(prev => [...prev, aiResponse]);
      }, behaviorSettings.responseDelay);
    }
  };

  const handleSaveSettings = () => {
    updateAgent({
      name: agentSettings.name,
      type: agent.type,
      description: agent.description
    });
    console.log("Settings saved:", { agentSettings, behaviorSettings, knowledgeBases, channels });
  };

  const getToneIcon = (tone: string) => {
    switch (tone) {
      case "friendly": return "😊";
      case "formal": return "🎩";
      case "neutral": return "😐";
      default: return "😊";
    }
  };

  const getResponseLengthIcon = (length: string) => {
    switch (length) {
      case "short": return "📝";
      case "medium": return "📄";
      case "long": return "📚";
      default: return "📄";
    }
  };

  return (
    <PageContainer title="AI Agent Customization" description="Customize your AI agent's behavior and settings">
      <Container maxWidth="xl">
        <Box sx={{ py: 4 }}>
          {/* Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            <Box>
              <Typography variant="h4" gutterBottom>
                AI Agent Customization
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Configure your AI agent&apos;s personality, behavior, and capabilities
              </Typography>
            </Box>
            <Button 
              variant="contained" 
              startIcon={<SaveIcon />}
              onClick={handleSaveSettings}
              size="large"
            >
              Save Settings
            </Button>
          </Box>

          <Grid container spacing={3}>
            {/* Left Column - Settings */}
            <Grid item xs={12} lg={8}>
              {/* 1. Agent Settings */}
              <Card sx={{ mb: 3 }}>
                <CardHeader 
                  title="Agent Settings"
                  avatar={<Avatar sx={{ bgcolor: 'primary.main' }}><PersonIcon /></Avatar>}
                />
                <CardContent>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Agent Name"
                        value={agentSettings.name}
                        onChange={(e) => handleAgentSettingChange('name', e.target.value)}
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ width: 60, height: 60, bgcolor: 'primary.main' }}>
                          <PersonIcon />
                        </Avatar>
                        <Box>
                          <Button variant="outlined" size="small" startIcon={<EditIcon />}>
                            Change Avatar
                          </Button>
                          <Typography variant="caption" display="block" color="text.secondary">
                            Upload a profile picture
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Default Greeting Message"
                        value={agentSettings.greetingMessage}
                        onChange={(e) => handleAgentSettingChange('greetingMessage', e.target.value)}
                        multiline
                        rows={3}
                        variant="outlined"
                        helperText="This message will be sent when a new conversation starts"
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth>
                        <InputLabel>Tone of Voice</InputLabel>
                        <Select
                          value={agentSettings.toneOfVoice}
                          label="Tone of Voice"
                          onChange={(e) => handleAgentSettingChange('toneOfVoice', e.target.value)}
                        >
                          <MenuItem value="friendly">
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <span>😊</span> Friendly
                            </Box>
                          </MenuItem>
                          <MenuItem value="formal">
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <span>🎩</span> Formal
                            </Box>
                          </MenuItem>
                          <MenuItem value="neutral">
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <span>😐</span> Neutral
                            </Box>
                          </MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth>
                        <InputLabel>Response Length</InputLabel>
                        <Select
                          value={agentSettings.responseLength}
                          label="Response Length"
                          onChange={(e) => handleAgentSettingChange('responseLength', e.target.value)}
                        >
                          <MenuItem value="short">
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <span>📝</span> Short (1-2 sentences)
                            </Box>
                          </MenuItem>
                          <MenuItem value="medium">
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <span>📄</span> Medium (2-4 sentences)
                            </Box>
                          </MenuItem>
                          <MenuItem value="long">
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <span>📚</span> Long (4+ sentences)
                            </Box>
                          </MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {/* 2. Behavior Controls */}
              <Card sx={{ mb: 3 }}>
                <CardHeader 
                  title="Behavior Controls"
                  avatar={<Avatar sx={{ bgcolor: 'secondary.main' }}><PsychologyIcon /></Avatar>}
                />
                <CardContent>
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={behaviorSettings.enableSmallTalk}
                            onChange={(e) => handleBehaviorSettingChange('enableSmallTalk', e.target.checked)}
                          />
                        }
                        label="Enable Small Talk"
                      />
                      <Typography variant="caption" display="block" color="text.secondary">
                        Allow the agent to engage in casual conversation
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" gutterBottom>
                        Response Delay: {behaviorSettings.responseDelay}ms
                      </Typography>
                      <Slider
                        value={behaviorSettings.responseDelay}
                        onChange={(e, value) => handleBehaviorSettingChange('responseDelay', value)}
                        min={500}
                        max={5000}
                        step={100}
                        marks={[
                          { value: 500, label: 'Fast' },
                          { value: 1500, label: 'Normal' },
                          { value: 3000, label: 'Slow' },
                          { value: 5000, label: 'Very Slow' },
                        ]}
                        valueLabelDisplay="auto"
                      />
                      <Typography variant="caption" display="block" color="text.secondary">
                        Simulate human typing speed for more natural conversations
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {/* 3. Knowledge Base Selection */}
              <Card sx={{ mb: 3 }}>
                <CardHeader 
                  title="Knowledge Base Selection"
                  avatar={<Avatar sx={{ bgcolor: 'info.main' }}><BookIcon /></Avatar>}
                />
                <CardContent>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Select which knowledge bases this agent can access
                  </Typography>
                  <List>
                    {knowledgeBases.map((kb, index) => (
                      <React.Fragment key={kb.id}>
                        <ListItem>
                          <ListItemIcon>
                            {kb.type === 'website' ? <SmartToyIcon /> : <AttachFileIcon />}
                          </ListItemIcon>
                          <ListItemText 
                            primary={kb.name}
                            secondary={kb.type === 'website' ? kb.url : kb.filename}
                          />
                          <ListItemSecondaryAction>
                            <Switch
                              checked={kb.active}
                              onChange={() => toggleKnowledgeBase(kb.id)}
                            />
                          </ListItemSecondaryAction>
                        </ListItem>
                        {index < knowledgeBases.length - 1 && <Divider />}
                      </React.Fragment>
                    ))}
                  </List>
                  <Box sx={{ mt: 2 }}>
                    <Button variant="outlined" startIcon={<AttachFileIcon />}>
                      Add Knowledge Base
                    </Button>
                  </Box>
                </CardContent>
              </Card>

              {/* 4. Channel Configuration */}
              <Card sx={{ mb: 3 }}>
                <CardHeader 
                  title="Channel Configuration"
                  avatar={<Avatar sx={{ bgcolor: 'success.main' }}><MessageIcon /></Avatar>}
                />
                <CardContent>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Select which channels this agent responds on
                  </Typography>
                  <Grid container spacing={2}>
                    {channels.map((channel) => (
                      <Grid item xs={12} sm={6} md={3} key={channel.id}>
                        <Card 
                          variant="outlined" 
                          sx={{ 
                            cursor: 'pointer',
                            borderColor: channel.active ? 'primary.main' : 'grey.300',
                            backgroundColor: channel.active ? 'primary.50' : 'transparent'
                          }}
                          onClick={() => toggleChannel(channel.id)}
                        >
                          <CardContent sx={{ textAlign: 'center', py: 2 }}>
                            <Typography variant="h4" sx={{ mb: 1 }}>
                              {channel.icon}
                            </Typography>
                            <Typography variant="subtitle2">
                              {channel.name}
                            </Typography>
                            <Box sx={{ mt: 1 }}>
                              {channel.active ? (
                                <Chip label="Active" color="primary" size="small" />
                              ) : (
                                <Chip label="Inactive" variant="outlined" size="small" />
                              )}
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Right Column - Testing Panel */}
            <Grid item xs={12} lg={4}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardHeader 
                  title="Testing Panel"
                  avatar={<Avatar sx={{ bgcolor: 'warning.main' }}><ChatIcon /></Avatar>}
                />
                <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                  {/* Chat Messages */}
                  <Paper 
                    variant="outlined" 
                    sx={{ 
                      flexGrow: 1, 
                      p: 2, 
                      mb: 2, 
                      minHeight: 400,
                      maxHeight: 400,
                      overflow: 'auto',
                      backgroundColor: '#f8f9fa'
                    }}
                  >
                    {testMessages.map((msg) => (
                      <Box 
                        key={msg.id} 
                        sx={{ 
                          mb: 2,
                          display: 'flex',
                          justifyContent: msg.type === 'user' ? 'flex-end' : 'flex-start'
                        }}
                      >
                        <Box
                          sx={{
                            maxWidth: '80%',
                            p: 2,
                            borderRadius: 2,
                            backgroundColor: msg.type === 'user' ? 'primary.main' : 'grey.100',
                            color: msg.type === 'user' ? 'white' : 'text.primary'
                          }}
                        >
                          <Typography variant="body2">
                            {msg.message}
                          </Typography>
                          <Typography 
                            variant="caption" 
                            sx={{ 
                              display: 'block', 
                              mt: 1,
                              opacity: 0.7
                            }}
                          >
                            {msg.timestamp.toLocaleTimeString()}
                          </Typography>
                        </Box>
                      </Box>
                    ))}
                  </Paper>

                  {/* Message Input */}
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <TextField
                      fullWidth
                      placeholder="Type a test message..."
                      value={newTestMessage}
                      onChange={(e) => setNewTestMessage(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          sendTestMessage();
                        }
                      }}
                      size="small"
                    />
                    <Button
                      variant="contained"
                      onClick={sendTestMessage}
                      disabled={!newTestMessage.trim()}
                      sx={{ minWidth: 'auto', px: 2 }}
                    >
                      <SendIcon />
                    </Button>
                  </Box>

                  <Box sx={{ mt: 2 }}>
                    <Alert severity="info" sx={{ mb: 2 }}>
                      Test how your agent responds with the current settings
                    </Alert>
                    
                    <Typography variant="subtitle2" gutterBottom>
                      Current Settings Preview:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      <Chip 
                        label={`Tone: ${agentSettings.toneOfVoice}`} 
                        size="small" 
                        icon={<span>{getToneIcon(agentSettings.toneOfVoice)}</span>}
                      />
                      <Chip 
                        label={`Length: ${agentSettings.responseLength}`} 
                        size="small" 
                        icon={<span>{getResponseLengthIcon(agentSettings.responseLength)}</span>}
                      />
                      <Chip 
                        label={`Delay: ${behaviorSettings.responseDelay}ms`} 
                        size="small" 
                      />
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </PageContainer>
  );
};

export default AIAgentSettingsPage;