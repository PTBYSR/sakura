/**
 * User-specific widget route: /widget/[userId]
 * 
 * This route creates a personalized widget for each authenticated user.
 * When messages are sent, they create chat instances tied to the userId.
 */
'use client';

import Widget from "../page";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function UserWidgetPage() {
  const params = useParams();
  const [userId, setUserId] = useState<string | undefined>(undefined);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Get userId from params
    const id = params?.userId;
    if (id && typeof id === 'string') {
      setUserId(id);
    } else if (Array.isArray(id) && id.length > 0) {
      setUserId(id[0]);
    }
  }, [params]);

  if (!mounted) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p>Loading widget...</p>
      </div>
    );
  }

  if (!userId) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p>Error: Invalid user ID</p>
      </div>
    );
  }

  // Pass userId to the Widget component
  return <Widget userId={userId} />;
}

