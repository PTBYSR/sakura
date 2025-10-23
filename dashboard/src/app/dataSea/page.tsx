"use client"

// components/UserDashboard.tsx
import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Grid2 as Grid,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  Divider,
  Chip
} from '@mui/material';
import {
  Person as PersonIcon,
  Chat as ChatIcon,
  Message as MessageIcon,
  CheckCircle as CheckCircleIcon,
  PendingActions as PendingActionsIcon
} from '@mui/icons-material';

// Type definitions
interface User {
  _id: string;
  name: string;
  email: string;
  created_at: string;
  last_seen: string;
}

interface UserStats {
  email: string;
  name: string;
  total_chats: number;
  open_chats: number;
  closed_chats: number;
  total_messages: number;
  created_at: string;
  last_seen: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const UserDashboard: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all users
  const fetchUsers = async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      console.log('Fetching from:', `${API_BASE_URL}/users`);
      const response = await fetch(`${API_BASE_URL}/users?skip=0&limit=100`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        // Add these for CORS
        mode: 'cors',
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log('Users fetched:', data);
      setUsers(data.users);
    } catch (err) {
      let errorMessage = 'Failed to fetch users';
      if (err instanceof Error) {
        errorMessage = err.message;
        if (err.message === 'Failed to fetch') {
          errorMessage = 'Cannot connect to backend server. Make sure FastAPI is running on http://localhost:8000';
        }
      }
      setError(errorMessage);
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch user stats
  const fetchUserStats = async (email: string): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      console.log('Fetching stats for:', email);
      const response = await fetch(`${API_BASE_URL}/users/${encodeURIComponent(email)}/stats`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'cors',
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: UserStats = await response.json();
      console.log('Stats fetched:', data);
      setUserStats(data);
    } catch (err) {
      let errorMessage = 'Failed to fetch user stats';
      if (err instanceof Error) {
        errorMessage = err.message;
        if (err.message === 'Failed to fetch') {
          errorMessage = 'Cannot connect to backend server';
        }
      }
      setError(errorMessage);
      console.error('Stats fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleUserClick = (user: User): void => {
    setSelectedUser(user);
    fetchUserStats(user.email);
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: 4 }}>
      <Container maxWidth="xl">
        <Typography variant="h3" component="h1" fontWeight="bold" gutterBottom>
          User Dashboard
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* Users List */}
          <Grid size={12} lg={4}>
            <Paper elevation={2} sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PersonIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6" component="h2">
                  Users ({users.length})
                </Typography>
              </Box>
              
              {loading && users.length === 0 ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <List sx={{ maxHeight: 500, overflow: 'auto' }}>
                  {users.map((user) => (
                    <ListItem key={user._id} disablePadding>
                      <ListItemButton
                        selected={selectedUser?._id === user._id}
                        onClick={() => handleUserClick(user)}
                        sx={{
                          borderRadius: 1,
                          mb: 1,
                          '&.Mui-selected': {
                            bgcolor: 'primary.light',
                            '&:hover': {
                              bgcolor: 'primary.light',
                            },
                          },
                        }}
                      >
                        <ListItemText
                          primary={user.name}
                          secondary={user.email}
                          primaryTypographyProps={{ fontWeight: 'medium' }}
                        />
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
              )}
            </Paper>
          </Grid>

          {/* User Details */}
          <Grid size={12} lg={8}>
            <Paper elevation={2} sx={{ p: 3 }}>
              {!selectedUser ? (
                <Box sx={{ textAlign: 'center', py: 12, color: 'text.secondary' }}>
                  <PersonIcon sx={{ fontSize: 60, mb: 2, opacity: 0.3 }} />
                  <Typography variant="h6">
                    Select a user to view details
                  </Typography>
                </Box>
              ) : (
                <>
                  <Typography variant="h5" component="h2" gutterBottom>
                    User Details
                  </Typography>
                  <Divider sx={{ mb: 3 }} />
                  
                  <Grid container spacing={3} sx={{ mb: 4 }}>
                    {/* Display all user data dynamically */}
                    {Object.entries(selectedUser).map(([key, value]) => {
                      // Skip the _id field or format it specially
                      if (key === '_id') return null;
                      
                      // Format the key for display
                      const displayKey = key
                        .split('_')
                        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                        .join(' ');
                      
                      // Format the value based on type
                      let displayValue: string;
                      
                      if (value === null || value === undefined) {
                        displayValue = 'N/A';
                      } else if (typeof value === 'object' && !Array.isArray(value)) {
                        // Handle nested objects (like location, device)
                        displayValue = JSON.stringify(value, null, 2);
                      } else if (Array.isArray(value)) {
                        displayValue = value.join(', ');
                      } else if (key.includes('date') || key.includes('at') || key.includes('seen')) {
                        // Format date fields
                        try {
                          displayValue = new Date(value as string).toLocaleString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          });
                        } catch {
                          displayValue = String(value);
                        }
                      } else {
                        displayValue = String(value);
                      }
                      
                      return (
                        <Grid size={12} md={6} key={key}>
                          <Typography variant="overline" color="text.secondary">
                            {displayKey}
                          </Typography>
                          {typeof value === 'object' && value !== null && !Array.isArray(value) ? (
                            <Box
                              component="pre"
                              sx={{
                                bgcolor: 'grey.100',
                                p: 1,
                                borderRadius: 1,
                                fontSize: '0.875rem',
                                overflow: 'auto',
                                maxHeight: '150px'
                              }}
                            >
                              {displayValue}
                            </Box>
                          ) : (
                            <Typography variant="body1" sx={{ wordBreak: 'break-word' }}>
                              {displayValue}
                            </Typography>
                          )}
                        </Grid>
                      );
                    })}
                  </Grid>

                  {loading && !userStats ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                      <CircularProgress />
                    </Box>
                  ) : userStats ? (
                    <>
                      <Typography variant="h6" component="h3" gutterBottom sx={{ mt: 2 }}>
                        Statistics
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid size={12} sm={6} md={3}>
                          <Card sx={{ bgcolor: 'primary.light', height: '100%' }}>
                            <CardContent>
                              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <ChatIcon sx={{ mr: 1, color: 'primary.main' }} />
                                <Typography variant="overline" color="text.secondary">
                                  Total Chats
                                </Typography>
                              </Box>
                              <Typography variant="h4" fontWeight="bold" color="primary.dark">
                                {userStats.total_chats}
                              </Typography>
                            </CardContent>
                          </Card>
                        </Grid>
                        <Grid size={12} sm={6} md={3}>
                          <Card sx={{ bgcolor: 'success.light', height: '100%' }}>
                            <CardContent>
                              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <PendingActionsIcon sx={{ mr: 1, color: 'success.main' }} />
                                <Typography variant="overline" color="text.secondary">
                                  Open Chats
                                </Typography>
                              </Box>
                              <Typography variant="h4" fontWeight="bold" color="success.dark">
                                {userStats.open_chats}
                              </Typography>
                            </CardContent>
                          </Card>
                        </Grid>
                        <Grid size={12} sm={6} md={3}>
                          <Card sx={{ bgcolor: 'warning.light', height: '100%' }}>
                            <CardContent>
                              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <CheckCircleIcon sx={{ mr: 1, color: 'warning.main' }} />
                                <Typography variant="overline" color="text.secondary">
                                  Closed Chats
                                </Typography>
                              </Box>
                              <Typography variant="h4" fontWeight="bold" color="warning.dark">
                                {userStats.closed_chats}
                              </Typography>
                            </CardContent>
                          </Card>
                        </Grid>
                        <Grid size={12} sm={6} md={3}>
                          <Card sx={{ bgcolor: 'secondary.light', height: '100%' }}>
                            <CardContent>
                              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <MessageIcon sx={{ mr: 1, color: 'secondary.main' }} />
                                <Typography variant="overline" color="text.secondary">
                                  Total Messages
                                </Typography>
                              </Box>
                              <Typography variant="h4" fontWeight="bold" color="secondary.dark">
                                {userStats.total_messages}
                              </Typography>
                            </CardContent>
                          </Card>
                        </Grid>
                      </Grid>
                    </>
                  ) : null}
                </>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default UserDashboard;