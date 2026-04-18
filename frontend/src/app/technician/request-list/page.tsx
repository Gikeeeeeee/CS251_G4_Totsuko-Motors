'use client';

import { useState } from 'react'
// import SidebarClerk from '@/components/SidebarClerk'
import Sidebar from '@/components/Sidebar';
// import TopNavClerk from '@/components/TopNavClerk'
import TopNav from '@/components/TopNav';

export default function TechnicianPage() {
    const [requests, setRequests] = useState([]);

    return (
        <div className='flex bg-[#F3FAFF]'>
            <Sidebar />
            <div className='flex flex-col w-full'>
                <TopNav />
                <div className='flex p-[32px]'>
                    <p className='text-[32px] font-bold text-[#002446]'>Request & Checking</p>
                </div>
            </div>

        </div>
    );
}