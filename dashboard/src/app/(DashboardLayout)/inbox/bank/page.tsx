"use client";

/**
 * Database Inspector - Comprehensive MongoDB Data Viewer
 * 
 * Shows all data from MongoDB collections:
 * - Widget Customers (customers collection)
 * - Customer Chats (customer-chats collection)
 * - Dashboard Users (user collection from Better Auth)
 * - Statistics and relationships
 * 
 * Protected with passcode authentication.
 */

import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Avatar,
  CircularProgress,
  Alert,
  Paper,
  Divider,
  InputAdornment,
  IconButton,
  Collapse,
  Tabs,
  Tab,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
} from "@mui/material";
import {
  Search as SearchIcon,
  ExpandMore as ExpandMoreIcon,
  Person as PersonIcon,
  Chat as ChatIcon,
  Message as MessageIcon,
  AccessTime as TimeIcon,
  LocationOn as LocationIcon,
  Computer as ComputerIcon,
  Psychology as PsychologyIcon,
  Category as CategoryIcon,
  CheckCircle as CheckCircleIcon,
  SmartToy as AgentIcon,
  PersonPin as HumanIcon,
  Storage as DatabaseIcon,
  People as PeopleIcon,
  Forum as ForumIcon,
  AccountCircle as AccountIcon,
  Link as LinkIcon,
  Analytics as AnalyticsIcon,
} from "@mui/icons-material";

interface DashboardUser {
  _id: string;
  email: string;
  name?: string;
  emailVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface WidgetCustomer {
  _id: string;
  name: string;
  email: string;
  category?: string;
  status?: string;
  dashboard_user_id?: string;
  ip?: string;
  location?: { city?: string; region?: string; country?: string };
  device?: { userAgent?: string; platform?: string };
  created_at?: string;
  last_seen?: string;
  vibe?: string;
}

interface CustomerChat {
  _id: string;
  chat_id: string;
  user_id?: string;
  status?: string;
  created_at?: string;
  last_activity?: string;
  total_messages?: number;
  messages_count?: number;
  first_message?: string;
  last_message?: string;
}

interface DatabaseOverview {
  database_name: string;
  collections: {
    customers?: { count: number; data: WidgetCustomer[] };
    "customer-chats"?: { count: number; data: CustomerChat[] };
    dashboard_users?: { count: number; data: DashboardUser[] };
  };
  statistics: {
    total_widget_customers: number;
    total_customer_chats: number;
    total_messages: number;
    total_dashboard_users: number;
    customers_with_chats: number;
    customers_linked_to_dashboard: number;
    customers_not_linked: number;
  };
  timestamp: string;
}

const PASSCODE = "Godisgood12344";
const STORAGE_KEY = "db_inspector_authenticated";

export default function DatabaseInspectorPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcode, setPasscode] = useState("");
  const [passcodeError, setPasscodeError] = useState("");
  const [overview, setOverview] = useState<DatabaseOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState(0);
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    (process.env.NODE_ENV === "development"
      ? "http://localhost:8000"
      : "https://sakura-backend.onrender.com");

  // Check authentication on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const authStatus = sessionStorage.getItem(STORAGE_KEY);
      if (authStatus === "true") {
        setIsAuthenticated(true);
      }
    }
  }, []);

  // Fetch data when authenticated - must be declared before conditional return
  useEffect(() => {
    if (!isAuthenticated) return; // Early return inside useEffect, not conditional hook declaration
    
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log("🔄 Fetching comprehensive database overview...");
        
        const res = await fetch(`${API_BASE_URL}/api/debug/database-overview`);
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }
        
        const data = await res.json();
        console.log("📊 Database overview received:", data);
        
        setOverview(data);
        
      } catch (err: any) {
        console.error("❌ Failed to fetch database overview:", err);
        setError(`Failed to load data: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [API_BASE_URL, isAuthenticated]);

  const handlePasscodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPasscodeError("");
    
    if (passcode === PASSCODE) {
      setIsAuthenticated(true);
      if (typeof window !== "undefined") {
        sessionStorage.setItem(STORAGE_KEY, "true");
      }
      setPasscode("");
    } else {
      setPasscodeError("Incorrect passcode. Please try again.");
      setPasscode("");
    }
  };

  // Show login screen if not authenticated
  if (!isAuthenticated) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          backgroundColor: "#1a1a1a",
          p: 3,
        }}
      >
        <Card
          sx={{
            maxWidth: 450,
            width: "100%",
            backgroundColor: "#2a2a2a",
            border: "1px solid #333",
            p: 4,
          }}
        >
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mb: 3 }}>
            <DatabaseIcon sx={{ fontSize: 60, color: "#ff6b35", mb: 2 }} />
            <Typography variant="h4" sx={{ color: "white", fontWeight: "bold", mb: 1 }}>
              Database Inspector
            </Typography>
            <Typography variant="body2" sx={{ color: "#ccc", textAlign: "center" }}>
              This page is password protected. Please enter the passcode to continue.
            </Typography>
          </Box>

          <form onSubmit={handlePasscodeSubmit}>
            <TextField
              fullWidth
              type="password"
              label="Passcode"
              value={passcode}
              onChange={(e) => {
                setPasscode(e.target.value);
                setPasscodeError("");
              }}
              error={!!passcodeError}
              helperText={passcodeError}
              autoFocus
              sx={{
                mb: 3,
                "& .MuiOutlinedInput-root": {
                  backgroundColor: "#333",
                  "& fieldset": { borderColor: "#444" },
                  "&:hover fieldset": { borderColor: "#666" },
                  "&.Mui-focused fieldset": { borderColor: "#ff6b35" },
                },
                "& .MuiInputBase-input": { color: "white" },
                "& .MuiInputLabel-root": { color: "#ccc" },
                "& .MuiFormHelperText-root": { color: "#f44336" },
              }}
            />

            <Box sx={{ display: "flex", gap: 2 }}>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{
                  backgroundColor: "#ff6b35",
                  color: "white",
                  "&:hover": {
                    backgroundColor: "#d1488a",
                  },
                }}
              >
                Access Database
              </Button>
            </Box>
          </form>
        </Card>
      </Box>
    );
  }

  const handleToggle = (id: string) => {
    setExpandedItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const getStatusColor = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'success';
      case 'closed': return 'default';
      default: return 'warning';
    }
  };

  const getCategoryColor = (category?: string) => {
    switch (category?.toLowerCase()) {
      case 'agent-inbox': return '#4caf50';
      case 'human-chats': return '#2196f3';
      case 'escalated': return '#f44336';
      case 'resolved': return '#9c27b0';
      default: return '#666';
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100vh", gap: 2 }}>
        <CircularProgress size={60} />
        <Typography variant="h6" color="text.secondary">Loading database overview...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">Failed to load data: {error}</Alert>
      </Box>
    );
  }

  if (!overview) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="info">No data available</Alert>
      </Box>
    );
  }

  const stats = overview.statistics;
  const customers = overview.collections.customers?.data || [];
  const chats = overview.collections["customer-chats"]?.data || [];
  const dashboardUsers = overview.collections.dashboard_users?.data || [];

  // Filter data based on search
  const filteredCustomers = customers.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase()) ||
    c._id?.toLowerCase().includes(search.toLowerCase())
  );

  const filteredChats = chats.filter(c =>
    c.chat_id?.toLowerCase().includes(search.toLowerCase()) ||
    c.user_id?.toLowerCase().includes(search.toLowerCase()) ||
    c._id?.toLowerCase().includes(search.toLowerCase())
  );

  const filteredDashboardUsers = dashboardUsers.filter(u =>
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u._id?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Box sx={{ p: 3, backgroundColor: "#1a1a1a", minHeight: "100vh" }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
          <DatabaseIcon sx={{ fontSize: 40, color: "#ff6b35" }} />
          <Box>
            <Typography variant="h3" sx={{ color: "white", fontWeight: "bold" }}>
              Database Inspector
            </Typography>
            <Typography variant="subtitle1" sx={{ color: "#ccc" }}>
              Comprehensive MongoDB Data Viewer - Database: {overview.database_name}
            </Typography>
          </Box>
        </Box>

        {/* Statistics Cards */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid sx={{ xs: 12, sm: 6, md: 3 }}>
            <Card sx={{ backgroundColor: "#2a2a2a", border: "1px solid #333" }}>
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <PeopleIcon sx={{ fontSize: 40, color: "#4caf50" }} />
                  <Box>
                    <Typography variant="h4" sx={{ color: "white" }}>
                      {stats.total_widget_customers}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#ccc" }}>
                      Widget Customers
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid sx={{ xs: 12, sm: 6, md: 3 }}>
            <Card sx={{ backgroundColor: "#2a2a2a", border: "1px solid #333" }}>
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <ForumIcon sx={{ fontSize: 40, color: "#2196f3" }} />
                  <Box>
                    <Typography variant="h4" sx={{ color: "white" }}>
                      {stats.total_customer_chats}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#ccc" }}>
                      Customer Chats
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid sx={{ xs: 12, sm: 6, md: 3 }}>
            <Card sx={{ backgroundColor: "#2a2a2a", border: "1px solid #333" }}>
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <MessageIcon sx={{ fontSize: 40, color: "#ff6b35" }} />
                  <Box>
                    <Typography variant="h4" sx={{ color: "white" }}>
                      {stats.total_messages}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#ccc" }}>
                      Total Messages
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid sx={{ xs: 12, sm: 6, md: 3 }}>
            <Card sx={{ backgroundColor: "#2a2a2a", border: "1px solid #333" }}>
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <AccountIcon sx={{ fontSize: 40, color: "#9c27b0" }} />
                  <Box>
                    <Typography variant="h4" sx={{ color: "white" }}>
                      {stats.total_dashboard_users}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#ccc" }}>
                      Dashboard Users
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Additional Stats */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid sx={{ xs: 12, sm: 4 }}>
            <Card sx={{ backgroundColor: "#2a2a2a", border: "1px solid #333" }}>
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <LinkIcon sx={{ fontSize: 30, color: "#4caf50" }} />
                  <Box>
                    <Typography variant="h5" sx={{ color: "white" }}>
                      {stats.customers_linked_to_dashboard}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#ccc" }}>
                      Customers Linked
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid sx={{ xs: 12, sm: 4 }}>
            <Card sx={{ backgroundColor: "#2a2a2a", border: "1px solid #333" }}>
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <LinkIcon sx={{ fontSize: 30, color: "#f44336" }} />
                  <Box>
                    <Typography variant="h5" sx={{ color: "white" }}>
                      {stats.customers_not_linked}
        </Typography>
                    <Typography variant="body2" sx={{ color: "#ccc" }}>
                      Customers Not Linked
        </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid sx={{ xs: 12, sm: 4 }}>
            <Card sx={{ backgroundColor: "#2a2a2a", border: "1px solid #333" }}>
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <ChatIcon sx={{ fontSize: 30, color: "#ff9800" }} />
                  <Box>
                    <Typography variant="h5" sx={{ color: "white" }}>
                      {stats.customers_with_chats}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#ccc" }}>
                      Customers w/ Chats
          </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Search */}
        <TextField
          fullWidth
          placeholder="Search across all collections..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: "#666" }} />
              </InputAdornment>
            ),
          }}
          sx={{
            maxWidth: 600,
            mb: 3,
            "& .MuiOutlinedInput-root": {
              backgroundColor: "#2a2a2a",
              "& fieldset": { borderColor: "#444" },
              "&:hover fieldset": { borderColor: "#666" },
              "&.Mui-focused fieldset": { borderColor: "#ff6b35" },
            },
            "& .MuiInputBase-input": { color: "white" },
          }}
        />
      </Box>

      {/* Tabs */}
      <Paper sx={{ backgroundColor: "#2a2a2a", mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
            sx={{
            "& .MuiTab-root": { color: "#ccc" },
            "& .Mui-selected": { color: "#ff6b35" },
            "& .MuiTabs-indicator": { backgroundColor: "#ff6b35" },
          }}
        >
          <Tab icon={<PeopleIcon />} label={`Widget Customers (${filteredCustomers.length})`} />
          <Tab icon={<ForumIcon />} label={`Customer Chats (${filteredChats.length})`} />
          <Tab icon={<AccountIcon />} label={`Dashboard Users (${filteredDashboardUsers.length})`} />
          <Tab icon={<AnalyticsIcon />} label="Relationships" />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      <Box>
        {/* Tab 0: Widget Customers */}
        {activeTab === 0 && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {filteredCustomers.length === 0 ? (
              <Alert severity="info">No widget customers found</Alert>
            ) : (
              filteredCustomers.map((customer) => (
                <Card key={customer._id} sx={{ backgroundColor: "#2a2a2a", border: "1px solid #333" }}>
            <CardHeader
                    sx={{ backgroundColor: "#333" }}
              title={
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                        <Avatar sx={{ bgcolor: "#ff6b35" }}>{customer.name?.charAt(0) || "?"}</Avatar>
                  <Box>
                    <Typography variant="h6" sx={{ color: "white" }}>
                            {customer.name || "Unknown User"}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#ccc" }}>
                            {customer.email}
                    </Typography>
                  </Box>
                </Box>
              }
              action={
                      <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                        {customer.dashboard_user_id && (
                  <Chip
                            icon={<LinkIcon />}
                            label="Linked"
                    size="small"
                            sx={{ bgcolor: "#4caf50", color: "white" }}
                  />
                        )}
                        {customer.category && (
                  <Chip
                            label={customer.category}
                    size="small"
                            sx={{ bgcolor: getCategoryColor(customer.category), color: "white" }}
                          />
                        )}
                        {customer.status && (
                    <Chip
                            label={customer.status}
                      size="small"
                            color={getStatusColor(customer.status)}
                          />
                        )}
                        <IconButton onClick={() => handleToggle(`customer-${customer._id}`)} sx={{ color: "white" }}>
                    <ExpandMoreIcon
                      sx={{
                              transform: expandedItems[`customer-${customer._id}`] ? "rotate(180deg)" : "rotate(0deg)",
                        transition: "transform 0.3s",
                      }}
                    />
                  </IconButton>
                </Box>
              }
            />
                  <Collapse in={expandedItems[`customer-${customer._id}`]}>
              <CardContent>
                      <Grid container spacing={2}>
                        <Grid sx={{ xs: 12, md: 6 }}>
                          <Typography variant="subtitle2" sx={{ color: "#ff6b35", mb: 1 }}>Customer ID</Typography>
                          <Typography variant="body2" sx={{ color: "#ccc", mb: 2, fontFamily: "monospace" }}>
                            {customer._id}
                          </Typography>
                        </Grid>
                        {customer.dashboard_user_id && (
                          <Grid sx={{ xs: 12, md: 6 }}>
                            <Typography variant="subtitle2" sx={{ color: "#4caf50", mb: 1 }}>
                              Linked to Dashboard User
                            </Typography>
                            <Typography variant="body2" sx={{ color: "#ccc", mb: 2, fontFamily: "monospace" }}>
                              {customer.dashboard_user_id}
                            </Typography>
                          </Grid>
                        )}
                        <Grid sx={{ xs: 12, md: 6 }}>
                          <Typography variant="subtitle2" sx={{ color: "#ff6b35", mb: 1 }}>Location</Typography>
                          <Typography variant="body2" sx={{ color: "#ccc" }}>
                            {customer.location?.city || "?"}, {customer.location?.country || "?"}
                          </Typography>
                        </Grid>
                        <Grid sx={{ xs: 12, md: 6 }}>
                          <Typography variant="subtitle2" sx={{ color: "#ff6b35", mb: 1 }}>Device</Typography>
                          <Typography variant="body2" sx={{ color: "#ccc" }}>
                            {customer.device?.platform || "Unknown"}
                          </Typography>
                        </Grid>
                        <Grid sx={{ xs: 12, md: 6 }}>
                          <Typography variant="subtitle2" sx={{ color: "#ff6b35", mb: 1 }}>IP Address</Typography>
                    <Typography variant="body2" sx={{ color: "#ccc" }}>
                            {customer.ip || "N/A"}
                    </Typography>
                        </Grid>
                        <Grid sx={{ xs: 12, md: 6 }}>
                          <Typography variant="subtitle2" sx={{ color: "#ff6b35", mb: 1 }}>Vibe</Typography>
                    <Typography variant="body2" sx={{ color: "#ccc" }}>
                            {customer.vibe || "neutral"}
                    </Typography>
                        </Grid>
                        <Grid sx={{ xs: 12, md: 6 }}>
                          <Typography variant="subtitle2" sx={{ color: "#ff6b35", mb: 1 }}>Created</Typography>
                    <Typography variant="body2" sx={{ color: "#ccc" }}>
                            {customer.created_at ? new Date(customer.created_at).toLocaleString() : "N/A"}
                    </Typography>
                        </Grid>
                        <Grid sx={{ xs: 12, md: 6 }}>
                          <Typography variant="subtitle2" sx={{ color: "#ff6b35", mb: 1 }}>Last Seen</Typography>
                          <Typography variant="body2" sx={{ color: "#ccc" }}>
                            {customer.last_seen ? new Date(customer.last_seen).toLocaleString() : "N/A"}
                      </Typography>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Collapse>
                </Card>
              ))
            )}
                    </Box>
                  )}

        {/* Tab 1: Customer Chats */}
        {activeTab === 1 && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {filteredChats.length === 0 ? (
              <Alert severity="info">No customer chats found</Alert>
            ) : (
              filteredChats.map((chat) => (
                <Card key={chat._id} sx={{ backgroundColor: "#2a2a2a", border: "1px solid #333" }}>
                        <CardHeader
                    sx={{ backgroundColor: "#333" }}
                          title={
                            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                              <ChatIcon sx={{ color: "#ff6b35" }} />
                        <Typography variant="h6" sx={{ color: "white" }}>
                          Chat: {chat.chat_id}
                              </Typography>
                              <Chip
                          label={chat.status || "active"}
                                size="small"
                                color={getStatusColor(chat.status)}
                        />
                        <Chip
                          label={`${chat.messages_count || 0} messages`}
                          size="small"
                          sx={{ bgcolor: "#ff6b35", color: "white" }}
                        />
                            </Box>
                          }
                          action={
                      <IconButton onClick={() => handleToggle(`chat-${chat._id}`)} sx={{ color: "white" }}>
                              <ExpandMoreIcon
                                sx={{
                            transform: expandedItems[`chat-${chat._id}`] ? "rotate(180deg)" : "rotate(0deg)",
                                  transition: "transform 0.3s",
                                }}
                              />
                            </IconButton>
                          }
                        />
                  <Collapse in={expandedItems[`chat-${chat._id}`]}>
                          <CardContent>
                      <Grid container spacing={2}>
                        <Grid sx={{ xs: 12, md: 6 }}>
                          <Typography variant="subtitle2" sx={{ color: "#ff6b35", mb: 1 }}>Chat ID</Typography>
                          <Typography variant="body2" sx={{ color: "#ccc", mb: 2, fontFamily: "monospace" }}>
                            {chat.chat_id}
                          </Typography>
                        </Grid>
                        <Grid sx={{ xs: 12, md: 6 }}>
                          <Typography variant="subtitle2" sx={{ color: "#ff6b35", mb: 1 }}>Document ID</Typography>
                          <Typography variant="body2" sx={{ color: "#ccc", mb: 2, fontFamily: "monospace" }}>
                            {chat._id}
                          </Typography>
                        </Grid>
                        {chat.user_id && (
                          <Grid sx={{ xs: 12, md: 6 }}>
                            <Typography variant="subtitle2" sx={{ color: "#4caf50", mb: 1 }}>
                              Linked to Customer
                            </Typography>
                            <Typography variant="body2" sx={{ color: "#ccc", mb: 2, fontFamily: "monospace" }}>
                              {chat.user_id}
                            </Typography>
                          </Grid>
                        )}
                        <Grid sx={{ xs: 12, md: 6 }}>
                          <Typography variant="subtitle2" sx={{ color: "#ff6b35", mb: 1 }}>Created</Typography>
                          <Typography variant="body2" sx={{ color: "#ccc" }}>
                            {chat.created_at ? new Date(chat.created_at).toLocaleString() : "N/A"}
                                        </Typography>
                        </Grid>
                        <Grid sx={{ xs: 12, md: 6 }}>
                          <Typography variant="subtitle2" sx={{ color: "#ff6b35", mb: 1 }}>Last Activity</Typography>
                          <Typography variant="body2" sx={{ color: "#ccc" }}>
                            {chat.last_activity ? new Date(chat.last_activity).toLocaleString() : "N/A"}
                                        </Typography>
                        </Grid>
                        {chat.first_message && (
                          <Grid sx={{ xs: 12 }}>
                            <Typography variant="subtitle2" sx={{ color: "#ff6b35", mb: 1 }}>First Message</Typography>
                            <Paper sx={{ p: 2, backgroundColor: "#333", color: "#ccc" }}>
                              {chat.first_message}
                            </Paper>
                          </Grid>
                        )}
                        {chat.last_message && (
                          <Grid sx={{ xs: 12 }}>
                            <Typography variant="subtitle2" sx={{ color: "#ff6b35", mb: 1 }}>Last Message</Typography>
                            <Paper sx={{ p: 2, backgroundColor: "#333", color: "#ccc" }}>
                              {chat.last_message}
                            </Paper>
                          </Grid>
                        )}
                      </Grid>
                    </CardContent>
                  </Collapse>
                </Card>
              ))
            )}
                                      </Box>
        )}

        {/* Tab 2: Dashboard Users */}
        {activeTab === 2 && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {filteredDashboardUsers.length === 0 ? (
              <Alert severity="info">No dashboard users found</Alert>
            ) : (
              filteredDashboardUsers.map((user) => (
                <Card key={user._id} sx={{ backgroundColor: "#2a2a2a", border: "1px solid #333" }}>
                  <CardHeader
                    sx={{ backgroundColor: "#333" }}
                    title={
                      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                        <Avatar sx={{ bgcolor: "#9c27b0" }}>{user.name?.charAt(0) || user.email?.charAt(0) || "?"}</Avatar>
                        <Box>
                          <Typography variant="h6" sx={{ color: "white" }}>
                            {user.name || "Unknown User"}
                          </Typography>
                          <Typography variant="body2" sx={{ color: "#ccc" }}>
                            {user.email}
                                      </Typography>
                                  </Box>
                        {user.emailVerified && (
                          <Chip
                            icon={<CheckCircleIcon />}
                            label="Verified"
                            size="small"
                            sx={{ bgcolor: "#4caf50", color: "white" }}
                          />
                        )}
                            </Box>
                    }
                    action={
                      <IconButton onClick={() => handleToggle(`dashuser-${user._id}`)} sx={{ color: "white" }}>
                        <ExpandMoreIcon
                          sx={{
                            transform: expandedItems[`dashuser-${user._id}`] ? "rotate(180deg)" : "rotate(0deg)",
                            transition: "transform 0.3s",
                          }}
                        />
                      </IconButton>
                    }
                  />
                  <Collapse in={expandedItems[`dashuser-${user._id}`]}>
                    <CardContent>
                      <Grid container spacing={2}>
                        <Grid sx={{ xs: 12, md: 6 }}>
                          <Typography variant="subtitle2" sx={{ color: "#9c27b0", mb: 1 }}>User ID</Typography>
                          <Typography variant="body2" sx={{ color: "#ccc", mb: 2, fontFamily: "monospace" }}>
                            {user._id}
                          </Typography>
                        </Grid>
                        <Grid sx={{ xs: 12, md: 6 }}>
                          <Typography variant="subtitle2" sx={{ color: "#9c27b0", mb: 1 }}>Email Verified</Typography>
                          <Typography variant="body2" sx={{ color: "#ccc", mb: 2 }}>
                            {user.emailVerified ? "Yes" : "No"}
                          </Typography>
                        </Grid>
                        <Grid sx={{ xs: 12, md: 6 }}>
                          <Typography variant="subtitle2" sx={{ color: "#9c27b0", mb: 1 }}>Created</Typography>
                          <Typography variant="body2" sx={{ color: "#ccc" }}>
                            {user.createdAt ? new Date(user.createdAt).toLocaleString() : "N/A"}
                          </Typography>
                        </Grid>
                        <Grid sx={{ xs: 12, md: 6 }}>
                          <Typography variant="subtitle2" sx={{ color: "#9c27b0", mb: 1 }}>Updated</Typography>
                          <Typography variant="body2" sx={{ color: "#ccc" }}>
                            {user.updatedAt ? new Date(user.updatedAt).toLocaleString() : "N/A"}
                          </Typography>
                        </Grid>
                        <Grid sx={{ xs: 12 }}>
                          <Typography variant="subtitle2" sx={{ color: "#9c27b0", mb: 1 }}>Widget Link</Typography>
                          <Typography variant="body2" sx={{ color: "#4caf50", fontFamily: "monospace" }}>
                            {typeof window !== "undefined" && `/widget/${user._id}`}
                          </Typography>
                        </Grid>
                      </Grid>
                          </CardContent>
                        </Collapse>
                      </Card>
              ))
            )}
          </Box>
        )}

        {/* Tab 3: Relationships */}
        {activeTab === 3 && (
          <Box>
            <Typography variant="h5" sx={{ color: "white", mb: 3 }}>
              Dashboard User → Widget Customer Relationships
            </Typography>
            
            {dashboardUsers.length === 0 ? (
              <Alert severity="info">No dashboard users found. Create relationships by using widget links.</Alert>
            ) : (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                {dashboardUsers.map((dashUser) => {
                  const linkedCustomers = customers.filter(c => c.dashboard_user_id === dashUser._id);
                  
                  return (
                    <Card key={dashUser._id} sx={{ backgroundColor: "#2a2a2a", border: "1px solid #333" }}>
                      <CardHeader
                        sx={{ backgroundColor: "#333" }}
                        title={
                          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                            <AccountIcon sx={{ color: "#9c27b0" }} />
                            <Box>
                              <Typography variant="h6" sx={{ color: "white" }}>
                                {dashUser.name || dashUser.email}
                              </Typography>
                              <Typography variant="body2" sx={{ color: "#ccc", fontFamily: "monospace" }}>
                                ID: {dashUser._id}
                              </Typography>
                            </Box>
                            <Chip
                              label={`${linkedCustomers.length} widget customers`}
                              size="small"
                              sx={{ bgcolor: linkedCustomers.length > 0 ? "#4caf50" : "#666", color: "white" }}
                            />
                          </Box>
                        }
                      />
                      <CardContent>
                        {linkedCustomers.length === 0 ? (
                          <Alert severity="warning">
                            No widget customers linked to this dashboard user.
                            Widget link: <code>/widget/{dashUser._id}</code>
                          </Alert>
                        ) : (
                          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                            {linkedCustomers.map((customer) => (
                              <Paper key={customer._id} sx={{ p: 2, backgroundColor: "#333", display: "flex", alignItems: "center", gap: 2 }}>
                                <LinkIcon sx={{ color: "#4caf50" }} />
                                <Box sx={{ flex: 1 }}>
                                  <Typography variant="body1" sx={{ color: "white" }}>
                                    {customer.name}
                                  </Typography>
                                  <Typography variant="caption" sx={{ color: "#ccc" }}>
                                    {customer.email}
                                  </Typography>
                                </Box>
                                <Chip label={customer.category || "agent-inbox"} size="small" />
                                <Chip label={customer.status || "active"} size="small" color={getStatusColor(customer.status)} />
                              </Paper>
                    ))}
                  </Box>
                )}
              </CardContent>
          </Card>
                  );
                })}
              </Box>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
}
