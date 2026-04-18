'use client';

import { useState } from 'react'
// import SidebarClerk from '@/components/SidebarClerk'
import Sidebar from '@/components/Sidebar';
import TopNavClerk from '@/components/TopNavClerk'

export default function TechnicianPage() {
    const [requests, setRequests] = useState([]);

    return (
        <div>
            <Sidebar />
            <div>
                <TopNavClerk />
            </div>

        </div>
    );
}