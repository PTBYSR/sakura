"use client";
import React, { useState, useEffect } from "react";
import {
  Code,
  Copy,
  CheckCircle2,
  MessageCircle,
  Instagram,
  Settings,
  Loader2,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import PageContainer from "@/app/(DashboardLayout)/components/container/PageContainer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Chip } from "@/components/ui/chip";

interface ContactChannel {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  status: 'connected' | 'disconnected';
  color: string;
}

const ContactChannelsPage = () => {
  const { data: session } = authClient.useSession();
  const [widgetCode, setWidgetCode] = useState("");
  const [widgetUrl, setWidgetUrl] = useState("");
  const [widgetLink, setWidgetLink] = useState("");
  const [loading, setLoading] = useState(true);
  const [copySuccess, setCopySuccess] = useState(false);
  
  const [channels] = useState<ContactChannel[]>([
    {
      id: "whatsapp",
      name: "WhatsApp",
      description: "Connect WhatsApp Business API for customer support",
      icon: <MessageCircle size={20} />,
      status: "disconnected",
      color: "#25D366",
    },
    {
      id: "instagram",
      name: "Instagram",
      description: "Connect Instagram Direct Messages for customer engagement",
      icon: <Instagram size={20} />,
      status: "disconnected",
      color: "#E4405F",
    },
  ]);

  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    (process.env.NODE_ENV === "development"
      ? "http://localhost:8000"
      : "https://sakura-backend.onrender.com");

  useEffect(() => {
    const FRONTEND_URL =
      process.env.NEXT_PUBLIC_FRONTEND_URL ||
      (typeof window !== "undefined"
        ? window.location.origin
        : "http://localhost:3000");

    if (session?.user) {
      const userId = session.user.id;
      const userEmail = session.user.email;
      
      const script = `<script>
  (function() {
    var script = document.createElement('script');
    script.src = '${FRONTEND_URL}/widget.js';
    script.setAttribute('data-user-id', '${userId}');
    script.setAttribute('data-email', '${userEmail}');
    script.setAttribute('data-theme', 'light');
    script.setAttribute('data-api-url', '${API_BASE_URL}');
    script.async = true;
    document.head.appendChild(script);
  })();
</script>`;

      setWidgetCode(script);
      setWidgetUrl(`${FRONTEND_URL}/widget.js`);
      setWidgetLink(`${FRONTEND_URL}/widget/${userId}`);
    } else {
      const defaultScript = `<script>
  (function() {
    var script = document.createElement('script');
    script.src = '${FRONTEND_URL}/widget.js';
    script.setAttribute('data-theme', 'light');
    script.setAttribute('data-api-url', '${API_BASE_URL}');
    script.async = true;
    document.head.appendChild(script);
  })();
</script>`;
      setWidgetCode(defaultScript);
      setWidgetUrl(`${FRONTEND_URL}/widget.js`);
      setWidgetLink(`${FRONTEND_URL}/widget`);
    }
    setLoading(false);
  }, [session]);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(widgetCode);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 3000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(widgetUrl);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 3000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleCopyWidgetLink = async () => {
    try {
      await navigator.clipboard.writeText(widgetLink);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 3000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleConnectChannel = (channelId: string) => {
    console.log(`Connect ${channelId}`);
  };

  if (loading) {
    return (
      <PageContainer title="Contact Channels" description="Get your widget link">
        <div className="max-w-3xl mx-auto px-4">
          <div className="flex justify-center items-center min-h-[400px]">
            <Loader2 className="w-8 h-8 animate-spin text-[#EE66AA]" />
          </div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer title="Contact Channels" description="Get your widget link">
      <div className="max-w-3xl mx-auto px-4">
        <div className="py-4">
          {/* Header */}
          <div className="mb-6">
            <h5 className="text-xl font-semibold text-white mb-1">
              Contact Channels
            </h5>
            <p className="text-sm text-gray-300">
              Connect with messaging platforms and embed the chat widget on your website
            </p>
          </div>

          {/* Contact Channel Integrations */}
          <div className="mb-6">
            <h6 className="text-lg font-semibold text-white mb-4">
              Messaging Platforms
            </h6>
            <div className="flex flex-col gap-3">
              {channels.map((channel) => (
                <Card key={channel.id}>
                  <CardContent className="p-5">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-start sm:items-center gap-4 min-w-0">
                        <div className="w-12 h-12 rounded-full flex items-center justify-center text-white" style={{ backgroundColor: channel.color }}>
                          {channel.icon}
                        </div>
                        <div className="min-w-0">
                          <h6 className="text-base font-semibold text-white truncate">
                            {channel.name}
                          </h6>
                          <p className="text-sm text-gray-300 break-words">
                            {channel.description}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
                        {channel.status === 'connected' ? (
                          <CheckCircle2 className="text-green-500 w-4 h-4" />
                        ) : (
                          <CheckCircle2 className="text-gray-500 w-4 h-4" />
                        )}
                        <Chip
                          label={channel.status}
                          color={channel.status === 'connected' ? 'success' : 'secondary'}
                          size="small"
                          className="text-xs"
                        />
                        <Button
                          variant={channel.status === 'connected' ? 'outlined' : 'contained'}
                          color="primary"
                          size="small"
                          onClick={() => handleConnectChannel(channel.id)}
                          className="text-sm"
                        >
                          {channel.status === 'connected' ? 'Disconnect' : 'Connect'}
                        </Button>
                        <Button
                          variant="outlined"
                          color="primary"
                          size="small"
                          disabled={channel.status !== 'connected'}
                          className="text-sm"
                        >
                          <Settings size={16} className="mr-2" />
                          Settings
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Widget Link Section */}
          <div className="mb-6">
            <h6 className="text-lg font-semibold text-white mb-4">
              Website Widget
            </h6>
          </div>

          {/* Widget Code Card */}
          <Card className="mb-4">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <Code className="text-[#EE66AA] w-5 h-5" />
                <h6 className="text-lg font-semibold text-white">
                  Embed Code
                </h6>
              </div>

              <div className="relative">
                <textarea
                  readOnly
                  value={widgetCode}
                  className="w-full p-3 bg-[#1a1a1a] border border-gray-700 rounded-lg text-sm text-gray-300 font-mono resize-none focus:outline-none focus:border-[#EE66AA]"
                  rows={8}
                />
                <button
                  onClick={handleCopyCode}
                  className="absolute top-3 right-3 p-2 text-gray-400 hover:text-white transition-colors"
                >
                  {copySuccess ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  ) : (
                    <Copy className="w-5 h-5" />
                  )}
                </button>
              </div>

              <div className="mt-4 flex gap-3">
                <Button
                  variant="contained"
                  color="primary"
                  size="small"
                  onClick={handleCopyCode}
                  className="text-sm"
                >
                  <Copy size={16} className="mr-2" />
                  {copySuccess ? "Copied!" : "Copy Code"}
                </Button>
              </div>
            </CardContent>
          </Card>

          

          {/* Direct Widget Link Card */}
          <Card className="mt-4">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <MessageCircle className="text-[#EE66AA] w-5 h-5" />
                <h6 className="text-lg font-semibold text-white">
                  Your Widget Page Link
                </h6>
              </div>
              <div className="text-sm text-gray-300 mb-3">
                Share this link or open it to test your widget directly. For user-specific routing, it includes your userId.
              </div>
              <div className="relative">
                <Input
                  readOnly
                  value={widgetLink}
                  className="w-full pr-10 text-sm"
                />
                <button
                  onClick={handleCopyWidgetLink}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 text-gray-400 hover:text-white transition-colors"
                >
                  {copySuccess ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  ) : (
                    <Copy className="w-5 h-5" />
                  )}
                </button>
              </div>
              {session?.user?.id ? (
                <div className="mt-3 p-3 bg-blue-600/20 border border-blue-500 rounded-lg text-blue-400 text-sm">
                  Example user-specific link: <span className="underline">{widgetLink}</span>
                </div>
              ) : (
                <div className="mt-3 p-3 bg-yellow-600/20 border border-yellow-500 rounded-lg text-yellow-400 text-sm">
                  Log in to generate your user-specific link. Using generic: <span className="underline">{widgetLink}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Snackbar for copy feedback */}
          {copySuccess && (
            <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
              <div className="p-4 bg-green-600/20 border border-green-500 rounded-lg text-green-400 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                <span>Copied to clipboard!</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  );
};

export default ContactChannelsPage;
