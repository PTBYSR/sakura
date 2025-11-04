"use client";

import React, { createContext, useContext, useEffect, useRef, useState, useCallback, ReactNode } from 'react';

// Dynamically switch between local and production backend URLs
// Convert HTTP URL to WebSocket URL (ws:// or wss://)
const getWebSocketUrl = () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 
    (process.env.NODE_ENV === "development"
      ? "http://localhost:8000"
      : "https://sakura-backend.onrender.com");
  
  // Convert http:// to ws:// and https:// to wss://
  return apiUrl.replace(/^http:/, 'ws:').replace(/^https:/, 'wss:');
};

const WS_BASE_URL = getWebSocketUrl();

export type SubscriptionType = 'chat_updates' | 'unread_counts' | 'website_status';

interface WebSocketMessage {
  type: string;
  data?: any;
  connection_id?: string;
  subscription_type?: string;
  timestamp?: string;
  message?: string;
}

interface WebSocketContextType {
  isConnected: boolean;
  subscribe: (type: SubscriptionType, callback: (data: any) => void) => () => void;
  unsubscribe: (type: SubscriptionType) => void;
  send: (action: string, data?: any) => void;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export const useWebSocket = (): WebSocketContextType => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};

interface WebSocketProviderProps {
  children: ReactNode;
}

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const subscribersRef = useRef<Map<SubscriptionType, Set<(data: any) => void>>>(new Map());
  const shouldReconnectRef = useRef(true);

  const MAX_RECONNECT_ATTEMPTS = 5;
  const RECONNECT_DELAY = 1000; // Start with 1 second

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return; // Already connected
    }

    try {
      const wsUrl = `${WS_BASE_URL}/ws/dashboard`;
      console.log(`🔌 Attempting to connect to WebSocket: ${wsUrl}`);
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('✅ WebSocket connected');
        setIsConnected(true);
        reconnectAttempts.current = 0;

        // Resubscribe to all previous subscriptions
        subscribersRef.current.forEach((callbacks, subscriptionType) => {
          if (callbacks.size > 0) {
            ws.send(JSON.stringify({
              action: 'subscribe',
              subscription_type: subscriptionType
            }));
          }
        });
      };

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);

          if (message.type === 'connected') {
            console.log('WebSocket connection confirmed:', message.connection_id);
          } else if (message.type === 'subscribed') {
            console.log('Subscribed to:', message.subscription_type);
          } else if (message.type === 'chat_updates' || message.type === 'unread_counts' || message.type === 'website_status') {
            // Broadcast to all subscribers of this type
            const callbacks = subscribersRef.current.get(message.type as SubscriptionType);
            if (callbacks) {
              callbacks.forEach(callback => {
                try {
                  callback(message.data);
                } catch (error) {
                  console.warn('Error in subscription callback:', error);
                }
              });
            }
          } else if (message.type === 'pong') {
            // Keepalive response
          } else {
            console.log('Received WebSocket message:', message);
          }
        } catch (error) {
          console.warn('Error parsing WebSocket message:', error);
        }
      };

      ws.onerror = (error) => {
        // WebSocket error events don't always have detailed error info
        // Log connection details for debugging
        console.warn('WebSocket connection error:', {
          url: `${WS_BASE_URL}/ws/dashboard`,
          readyState: ws.readyState,
          error: error
        });
        // Don't use console.error here to avoid triggering Next.js error handler
        setIsConnected(false);
      };

      ws.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason);
        setIsConnected(false);
        wsRef.current = null;

        // Attempt to reconnect if we should
        if (shouldReconnectRef.current && reconnectAttempts.current < MAX_RECONNECT_ATTEMPTS) {
          const delay = RECONNECT_DELAY * Math.pow(2, reconnectAttempts.current); // Exponential backoff
          reconnectAttempts.current++;
          console.log(`Attempting to reconnect in ${delay}ms (attempt ${reconnectAttempts.current}/${MAX_RECONNECT_ATTEMPTS})...`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, delay);
        } else if (reconnectAttempts.current >= MAX_RECONNECT_ATTEMPTS) {
          console.warn('Max reconnection attempts reached. Please refresh the page or check if the backend WebSocket server is running.');
        }
      };
    } catch (error: any) {
      // Log error details but don't use console.error to avoid Next.js error handler
      console.warn('Error creating WebSocket connection:', {
        error: error?.message || error,
        url: `${WS_BASE_URL}/ws/dashboard`,
        details: 'This might be expected if the backend is not running or WebSocket is not available'
      });
      setIsConnected(false);
    }
  }, []);

  const subscribe = useCallback((type: SubscriptionType, callback: (data: any) => void): (() => void) => {
    // Add callback to subscribers
    if (!subscribersRef.current.has(type)) {
      subscribersRef.current.set(type, new Set());
    }
    subscribersRef.current.get(type)!.add(callback);

    // Send subscribe message if connected
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        action: 'subscribe',
        subscription_type: type
      }));
    } else {
      // If not connected, connect first
      connect();
    }

    // Return unsubscribe function
    return () => {
      const callbacks = subscribersRef.current.get(type);
      if (callbacks) {
        callbacks.delete(callback);
        // If no more subscribers, unsubscribe from server
        if (callbacks.size === 0 && wsRef.current?.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({
            action: 'unsubscribe',
            subscription_type: type
          }));
        }
      }
    };
  }, [connect]);

  const unsubscribe = useCallback((type: SubscriptionType) => {
    subscribersRef.current.delete(type);
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        action: 'unsubscribe',
        subscription_type: type
      }));
    }
  }, []);

  const send = useCallback((action: string, data?: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        action,
        ...data
      }));
    } else {
      console.warn('WebSocket not connected. Cannot send message.');
    }
  }, []);

  // Connect on mount
  useEffect(() => {
    // Check if WebSocket is supported
    if (typeof WebSocket === 'undefined') {
      console.warn('WebSocket is not supported in this environment. Real-time updates will not be available.');
      return;
    }

    connect();

    // Cleanup on unmount
    return () => {
      shouldReconnectRef.current = false;
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        try {
          wsRef.current.close();
        } catch (e) {
          // Ignore errors during cleanup
        }
      }
    };
  }, [connect]);

  // Send ping every 30 seconds to keep connection alive
  useEffect(() => {
    if (!isConnected) return;

    const pingInterval = setInterval(() => {
      send('ping');
    }, 30000);

    return () => clearInterval(pingInterval);
  }, [isConnected, send]);

  const value: WebSocketContextType = {
    isConnected,
    subscribe,
    unsubscribe,
    send,
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};

