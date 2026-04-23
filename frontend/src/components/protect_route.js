'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Protect({ children, allow }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const role = localStorage.getItem('role');

    if (!role || !allow.includes(role)) {
      router.push('/');
    } else {
      setLoading(false);
    }
  }, [router, allow]);

  if (loading) return null;

  return children;
}