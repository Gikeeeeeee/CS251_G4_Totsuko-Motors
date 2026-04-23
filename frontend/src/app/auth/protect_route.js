'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ClerkPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const role = localStorage.getItem('role');

    if (role !== 'clerk') {
      router.push('/');
    } else {
      setLoading(false);
    }
  }, [router]);

  if (loading) return null; // กันกระพริบ

  return <h1>Clerk Page</h1>;
}