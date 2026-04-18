'use client';

import Image from 'next/image';

interface TopNavProps {
  userName?: string;
  userRole?: string;
  userImage?: string;
}

// กำหนดชื่อและ role ตรงนี้
export default function TopNav({ 
  userName = 'Theethad Pooad',
  userRole = 'Technician',
  userImage = '/logo.png'
}: TopNavProps) {

  return (
    <nav className="h-16 bg-white border-b border-gray-200 px-[32px] flex items-center justify-end">
      
      <div className="flex items-center gap-3">
        {/* ข้อความ: ชื่อและ Role */}
        <div className="text-right border-l-1 border-gray-200 pl-4">
          <p className="text-sm font-semibold text-gray-800">
            {userName}
          </p>
          <p className="text-xs text-gray-500">
            {userRole}
          </p>
        </div>

        <div className="w-10 h-10 rounded-xl overflow-hidden bg-gray-200 flex items-center justify-center">
          <Image
            src={userImage}
            alt={userName}
            width={40}
            height={40}
            className="object-cover"
          />
        </div>
      </div>
    </nav>
  );
}
