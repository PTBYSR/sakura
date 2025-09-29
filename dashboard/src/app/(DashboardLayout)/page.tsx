'use client'
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const Dashboard = () => {
  const router = useRouter();

  useEffect(() => {
    // Redirect to inbox by default
    router.replace('/inbox');
  }, [router]);

  return null;
}

export default Dashboard;
