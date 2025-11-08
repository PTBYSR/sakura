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
  Search,
  ChevronDown,
  User,
  MessageSquare,
  MessageCircle,
  Clock,
  MapPin,
  Monitor,
  Brain,
  Tag,
  CheckCircle2,
  Bot,
  UserCircle,
  Database,
  Users,
  MessageSquareMore,
  UserCircle2,
  Link2,
  BarChart3,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Chip } from "@/components/ui/chip";

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

  // Fetch data when authenticated
  useEffect(() => {
    if (!isAuthenticated) return;
    
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
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#1a1a1a] p-6">
        <Card className="max-w-md w-full bg-[#2a2a2a] border border-gray-700 p-8">
          <div className="flex flex-col items-center mb-6">
            <Database className="text-[#ff6b35] w-16 h-16 mb-4" />
            <h4 className="text-2xl font-bold text-white mb-2">
              Database Inspector
            </h4>
            <p className="text-sm text-gray-300 text-center">
              This page is password protected. Please enter the passcode to continue.
            </p>
          </div>

          <form onSubmit={handlePasscodeSubmit}>
            <Input
              type="password"
              label="Passcode"
              value={passcode}
              onChange={(e) => {
                setPasscode(e.target.value);
                setPasscodeError("");
              }}
              error={passcodeError}
              helperText={passcodeError}
              autoFocus
              className="mb-6"
            />

              <Button
                type="submit"
                variant="contained"
              color="primary"
              className="w-full"
              style={{ backgroundColor: "#ff6b35" }}
              >
                Access Database
              </Button>
          </form>
        </Card>
      </div>
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
      case 'closed': return 'secondary';
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
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <Loader2 className="w-16 h-16 animate-spin text-[#ff6b35]" />
        <h6 className="text-lg text-gray-300">Loading database overview...</h6>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="p-4 bg-red-600/20 border border-red-500 rounded-lg text-red-400">
          Failed to load data: {error}
        </div>
      </div>
    );
  }

  if (!overview) {
    return (
      <div className="p-6">
        <div className="p-4 bg-blue-600/20 border border-blue-500 rounded-lg text-blue-400">
          No data available
        </div>
      </div>
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
    <div className="p-6 bg-[#1a1a1a] min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Database className="text-[#ff6b35] w-10 h-10" />
          <div>
            <h3 className="text-3xl font-bold text-white">
              Database Inspector
            </h3>
            <p className="text-base text-gray-300">
              Comprehensive MongoDB Data Viewer - Database: {overview.database_name}
            </p>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-[#2a2a2a] border border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <Users className="text-green-500 w-10 h-10" />
                <div>
                  <h4 className="text-2xl font-semibold text-white">
                      {stats.total_widget_customers}
                  </h4>
                  <p className="text-sm text-gray-300">
                      Widget Customers
                  </p>
                </div>
              </div>
              </CardContent>
            </Card>

          <Card className="bg-[#2a2a2a] border border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <MessageSquareMore className="text-blue-500 w-10 h-10" />
                <div>
                  <h4 className="text-2xl font-semibold text-white">
                      {stats.total_customer_chats}
                  </h4>
                  <p className="text-sm text-gray-300">
                      Customer Chats
                  </p>
                </div>
              </div>
              </CardContent>
            </Card>

          <Card className="bg-[#2a2a2a] border border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <MessageCircle className="text-[#ff6b35] w-10 h-10" />
                <div>
                  <h4 className="text-2xl font-semibold text-white">
                      {stats.total_messages}
                  </h4>
                  <p className="text-sm text-gray-300">
                      Total Messages
                  </p>
                </div>
              </div>
              </CardContent>
            </Card>

          <Card className="bg-[#2a2a2a] border border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <UserCircle2 className="text-purple-500 w-10 h-10" />
                <div>
                  <h4 className="text-2xl font-semibold text-white">
                      {stats.total_dashboard_users}
                  </h4>
                  <p className="text-sm text-gray-300">
                      Dashboard Users
                  </p>
                </div>
              </div>
              </CardContent>
            </Card>
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <Card className="bg-[#2a2a2a] border border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <Link2 className="text-green-500 w-8 h-8" />
                <div>
                  <h5 className="text-xl font-semibold text-white">
                      {stats.customers_linked_to_dashboard}
                  </h5>
                  <p className="text-sm text-gray-300">
                      Customers Linked
                  </p>
                </div>
              </div>
              </CardContent>
            </Card>

          <Card className="bg-[#2a2a2a] border border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <Link2 className="text-red-500 w-8 h-8" />
                <div>
                  <h5 className="text-xl font-semibold text-white">
                      {stats.customers_not_linked}
                  </h5>
                  <p className="text-sm text-gray-300">
                      Customers Not Linked
                  </p>
                </div>
              </div>
              </CardContent>
            </Card>

          <Card className="bg-[#2a2a2a] border border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <MessageSquare className="text-orange-500 w-8 h-8" />
                <div>
                  <h5 className="text-xl font-semibold text-white">
                      {stats.customers_with_chats}
                  </h5>
                  <p className="text-sm text-gray-300">
                      Customers w/ Chats
                  </p>
                </div>
              </div>
              </CardContent>
            </Card>
        </div>

        {/* Search */}
        <div className="max-w-2xl mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
          placeholder="Search across all collections..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-[#2a2a2a] border border-gray-700 rounded-lg mb-6">
        <div className="flex border-b border-gray-700">
          {[
            { icon: Users, label: `Widget Customers (${filteredCustomers.length})` },
            { icon: MessageSquareMore, label: `Customer Chats (${filteredChats.length})` },
            { icon: UserCircle2, label: `Dashboard Users (${filteredDashboardUsers.length})` },
            { icon: BarChart3, label: "Relationships" },
          ].map((tab, index) => {
            const Icon = tab.icon;
            return (
              <button
                key={index}
                onClick={() => setActiveTab(index)}
                className={`px-6 py-3 text-sm font-medium transition-colors flex items-center gap-2 ${
                  activeTab === index
                    ? "text-[#ff6b35] border-b-2 border-[#ff6b35]"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <Icon size={18} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div>
        {/* Tab 0: Widget Customers */}
        {activeTab === 0 && (
          <div className="flex flex-col gap-4">
            {filteredCustomers.length === 0 ? (
              <div className="p-4 bg-blue-600/20 border border-blue-500 rounded-lg text-blue-400">
                No widget customers found
              </div>
            ) : (
              filteredCustomers.map((customer) => (
                <Card key={customer._id} className="bg-[#2a2a2a] border border-gray-700">
                  <CardHeader className="bg-[#333] p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-[#ff6b35] flex items-center justify-center text-white font-semibold">
                          {customer.name?.charAt(0) || "?"}
                        </div>
                        <div>
                          <h6 className="text-base font-semibold text-white">
                            {customer.name || "Unknown User"}
                          </h6>
                          <p className="text-sm text-gray-300">
                            {customer.email}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {customer.dashboard_user_id && (
                  <Chip
                            label="Linked"
                            color="success"
                    size="small"
                            className="text-xs"
                  />
                        )}
                        {customer.category && (
                  <Chip
                            label={customer.category}
                    size="small"
                            className="text-xs"
                            style={{ backgroundColor: getCategoryColor(customer.category), color: "white" }}
                          />
                        )}
                        {customer.status && (
                    <Chip
                            label={customer.status}
                      size="small"
                            color={getStatusColor(customer.status)}
                            className="text-xs"
                          />
                        )}
                        <button
                          onClick={() => handleToggle(`customer-${customer._id}`)}
                          className="p-2 text-white hover:bg-gray-700 rounded-lg transition-colors"
                        >
                          <ChevronDown
                            className={`w-5 h-5 transition-transform ${
                              expandedItems[`customer-${customer._id}`] ? "rotate-180" : ""
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  </CardHeader>
                  {expandedItems[`customer-${customer._id}`] && (
                    <CardContent className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-[#ff6b35] mb-1 font-semibold">Customer ID</p>
                          <p className="text-sm text-gray-300 mb-4 font-mono">
                            {customer._id}
                          </p>
                        </div>
                        {customer.dashboard_user_id && (
                          <div>
                            <p className="text-xs text-green-500 mb-1 font-semibold">
                              Linked to Dashboard User
                            </p>
                            <p className="text-sm text-gray-300 mb-4 font-mono">
                              {customer.dashboard_user_id}
                            </p>
                          </div>
                        )}
                        <div>
                          <p className="text-xs text-[#ff6b35] mb-1 font-semibold">Location</p>
                          <p className="text-sm text-gray-300">
                            {customer.location?.city || "?"}, {customer.location?.country || "?"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-[#ff6b35] mb-1 font-semibold">Device</p>
                          <p className="text-sm text-gray-300">
                            {customer.device?.platform || "Unknown"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-[#ff6b35] mb-1 font-semibold">IP Address</p>
                          <p className="text-sm text-gray-300">
                            {customer.ip || "N/A"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-[#ff6b35] mb-1 font-semibold">Vibe</p>
                          <p className="text-sm text-gray-300">
                            {customer.vibe || "neutral"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-[#ff6b35] mb-1 font-semibold">Created</p>
                          <p className="text-sm text-gray-300">
                            {customer.created_at ? new Date(customer.created_at).toLocaleString() : "N/A"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-[#ff6b35] mb-1 font-semibold">Last Seen</p>
                          <p className="text-sm text-gray-300">
                            {customer.last_seen ? new Date(customer.last_seen).toLocaleString() : "N/A"}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  )}
                </Card>
              ))
            )}
          </div>
                  )}

        {/* Tab 1: Customer Chats */}
        {activeTab === 1 && (
          <div className="flex flex-col gap-4">
            {filteredChats.length === 0 ? (
              <div className="p-4 bg-blue-600/20 border border-blue-500 rounded-lg text-blue-400">
                No customer chats found
              </div>
            ) : (
              filteredChats.map((chat) => (
                <Card key={chat._id} className="bg-[#2a2a2a] border border-gray-700">
                  <CardHeader className="bg-[#333] p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <MessageSquare className="text-[#ff6b35] w-5 h-5" />
                        <h6 className="text-base font-semibold text-white">
                          Chat: {chat.chat_id}
                        </h6>
                              <Chip
                          label={chat.status || "active"}
                                size="small"
                                color={getStatusColor(chat.status)}
                          className="text-xs"
                        />
                        <Chip
                          label={`${chat.messages_count || 0} messages`}
                          size="small"
                          className="text-xs"
                          style={{ backgroundColor: "#ff6b35", color: "white" }}
                        />
                      </div>
                      <button
                        onClick={() => handleToggle(`chat-${chat._id}`)}
                        className="p-2 text-white hover:bg-gray-700 rounded-lg transition-colors"
                      >
                        <ChevronDown
                          className={`w-5 h-5 transition-transform ${
                            expandedItems[`chat-${chat._id}`] ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                    </div>
                  </CardHeader>
                  {expandedItems[`chat-${chat._id}`] && (
                    <CardContent className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-[#ff6b35] mb-1 font-semibold">Chat ID</p>
                          <p className="text-sm text-gray-300 mb-4 font-mono">
                            {chat.chat_id}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-[#ff6b35] mb-1 font-semibold">Document ID</p>
                          <p className="text-sm text-gray-300 mb-4 font-mono">
                            {chat._id}
                          </p>
                        </div>
                        {chat.user_id && (
                          <div>
                            <p className="text-xs text-green-500 mb-1 font-semibold">
                              Linked to Customer
                            </p>
                            <p className="text-sm text-gray-300 mb-4 font-mono">
                              {chat.user_id}
                            </p>
                          </div>
                        )}
                        <div>
                          <p className="text-xs text-[#ff6b35] mb-1 font-semibold">Created</p>
                          <p className="text-sm text-gray-300">
                            {chat.created_at ? new Date(chat.created_at).toLocaleString() : "N/A"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-[#ff6b35] mb-1 font-semibold">Last Activity</p>
                          <p className="text-sm text-gray-300">
                            {chat.last_activity ? new Date(chat.last_activity).toLocaleString() : "N/A"}
                          </p>
                        </div>
                        {chat.first_message && (
                          <div className="md:col-span-2">
                            <p className="text-xs text-[#ff6b35] mb-1 font-semibold">First Message</p>
                            <div className="p-3 bg-[#333] text-gray-300 rounded-lg">
                              {chat.first_message}
                            </div>
                          </div>
                        )}
                        {chat.last_message && (
                          <div className="md:col-span-2">
                            <p className="text-xs text-[#ff6b35] mb-1 font-semibold">Last Message</p>
                            <div className="p-3 bg-[#333] text-gray-300 rounded-lg">
                              {chat.last_message}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  )}
                </Card>
              ))
            )}
          </div>
        )}

        {/* Tab 2: Dashboard Users */}
        {activeTab === 2 && (
          <div className="flex flex-col gap-4">
            {filteredDashboardUsers.length === 0 ? (
              <div className="p-4 bg-blue-600/20 border border-blue-500 rounded-lg text-blue-400">
                No dashboard users found
              </div>
            ) : (
              filteredDashboardUsers.map((user) => (
                <Card key={user._id} className="bg-[#2a2a2a] border border-gray-700">
                  <CardHeader className="bg-[#333] p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-white font-semibold">
                          {user.name?.charAt(0) || user.email?.charAt(0) || "?"}
                        </div>
                        <div>
                          <h6 className="text-base font-semibold text-white">
                            {user.name || "Unknown User"}
                          </h6>
                          <p className="text-sm text-gray-300">
                            {user.email}
                          </p>
                        </div>
                        {user.emailVerified && (
                          <Chip
                            label="Verified"
                            color="success"
                            size="small"
                            className="text-xs"
                          />
                        )}
                      </div>
                      <button
                        onClick={() => handleToggle(`dashuser-${user._id}`)}
                        className="p-2 text-white hover:bg-gray-700 rounded-lg transition-colors"
                      >
                        <ChevronDown
                          className={`w-5 h-5 transition-transform ${
                            expandedItems[`dashuser-${user._id}`] ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                    </div>
                  </CardHeader>
                  {expandedItems[`dashuser-${user._id}`] && (
                    <CardContent className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-purple-500 mb-1 font-semibold">User ID</p>
                          <p className="text-sm text-gray-300 mb-4 font-mono">
                            {user._id}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-purple-500 mb-1 font-semibold">Email Verified</p>
                          <p className="text-sm text-gray-300 mb-4">
                            {user.emailVerified ? "Yes" : "No"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-purple-500 mb-1 font-semibold">Created</p>
                          <p className="text-sm text-gray-300">
                            {user.createdAt ? new Date(user.createdAt).toLocaleString() : "N/A"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-purple-500 mb-1 font-semibold">Updated</p>
                          <p className="text-sm text-gray-300">
                            {user.updatedAt ? new Date(user.updatedAt).toLocaleString() : "N/A"}
                          </p>
                        </div>
                        <div className="md:col-span-2">
                          <p className="text-xs text-purple-500 mb-1 font-semibold">Widget Link</p>
                          <p className="text-sm text-green-500 font-mono">
                            {typeof window !== "undefined" && `/widget/${user._id}`}
                          </p>
                        </div>
                      </div>
                          </CardContent>
                  )}
                      </Card>
              ))
            )}
          </div>
        )}

        {/* Tab 3: Relationships */}
        {activeTab === 3 && (
          <div>
            <h5 className="text-xl font-semibold text-white mb-6">
              Dashboard User → Widget Customer Relationships
            </h5>
            
            {dashboardUsers.length === 0 ? (
              <div className="p-4 bg-blue-600/20 border border-blue-500 rounded-lg text-blue-400">
                No dashboard users found. Create relationships by using widget links.
              </div>
            ) : (
              <div className="flex flex-col gap-6">
                {dashboardUsers.map((dashUser) => {
                  const linkedCustomers = customers.filter(c => c.dashboard_user_id === dashUser._id);
                  
                  return (
                    <Card key={dashUser._id} className="bg-[#2a2a2a] border border-gray-700">
                      <CardHeader className="bg-[#333] p-4">
                        <div className="flex items-center gap-4">
                          <UserCircle2 className="text-purple-500 w-5 h-5" />
                          <div>
                            <h6 className="text-base font-semibold text-white">
                                {dashUser.name || dashUser.email}
                            </h6>
                            <p className="text-sm text-gray-300 font-mono">
                                ID: {dashUser._id}
                            </p>
                          </div>
                            <Chip
                              label={`${linkedCustomers.length} widget customers`}
                              size="small"
                            className="text-xs"
                            style={{ backgroundColor: linkedCustomers.length > 0 ? "#4caf50" : "#666", color: "white" }}
                          />
                        </div>
                      </CardHeader>
                      <CardContent className="p-4">
                        {linkedCustomers.length === 0 ? (
                          <div className="p-4 bg-yellow-600/20 border border-yellow-500 rounded-lg text-yellow-400">
                            No widget customers linked to this dashboard user.
                            Widget link: <code className="ml-1">/widget/{dashUser._id}</code>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-2">
                            {linkedCustomers.map((customer) => (
                              <div key={customer._id} className="p-4 bg-[#333] rounded-lg flex items-center gap-4">
                                <Link2 className="text-green-500 w-5 h-5" />
                                <div className="flex-1">
                                  <p className="text-sm font-semibold text-white">
                                    {customer.name}
                                  </p>
                                  <p className="text-xs text-gray-400">
                                    {customer.email}
                                  </p>
                                </div>
                                <Chip size="small" className="text-xs">
                                  {customer.category || "agent-inbox"}
                                </Chip>
                                <Chip
                                  size="small"
                                  color={getStatusColor(customer.status)}
                                  className="text-xs"
                                >
                                  {customer.status || "active"}
                                </Chip>
                              </div>
                            ))}
                          </div>
                )}
              </CardContent>
          </Card>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
