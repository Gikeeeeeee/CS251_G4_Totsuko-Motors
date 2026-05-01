'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/auth.service'; 
import { setUser, logoutClient } from '@/auth/auth';
import Loading from '@/components/shared/Loading';
// 1. Import ฟังก์ชันจากไฟล์ Utility ที่เราเพิ่งสร้าง
import { getRedirectPathByRole } from '@/utils/roleRedirect'; 

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    authService.verify()
      .then((data) => {
        if (data.success) { 
          setUser(data.user);
          const redirectPath = getRedirectPathByRole(data.user.role);
          router.push(redirectPath);
        }
      })
      .catch(() => {
        logoutClient();
        router.push('/login');
      });
  }, [router]);

  return (
    <div className="min-h-screen bg-[#cfd6dc] flex justify-center items-center">
      <Loading />
    </div>
  );
}