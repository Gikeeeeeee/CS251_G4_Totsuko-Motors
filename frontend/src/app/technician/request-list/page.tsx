'use client';

import apiClient from '@/services/apiClient';
import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import TopNav from '@/components/TopNav';

// Interface สำหรับกำหนดโครงสร้างข้อมูล
// interface ServiceRequest {
//     id: number;
//     vehiclePlate: string;
//     serviceId: string;
//     customerName: string;
//     vehicleModel: string;
//     vehicleColor: string;
//     problemDescription: string;
//     status: 'INTAKE' | 'IN_PROGRESS' | 'COMPLETED';
// }

interface ServiceRequest {
    requestId: string;
    plateNumber: string;
    customerName: string;
    requestStatus: string;
    problemDescription: string | null;
    checkingDate: string;
    odometer: number | null;
    clerkName: string;
}


export default function TechnicianPage() {
    const [requests, setRequests] = useState<ServiceRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const itemsPerPage = 10;

    useEffect(() => {
        const loadData = async () => {
            try {
                const response = await apiClient.get('/service/service-request', {
                    params: { page: currentPage, limit: itemsPerPage },
                });
                setRequests(response.data.data);
                setTotalPages(response.data.meta.totalPages);
                setTotalItems(response.data.meta.totalItems);
            } catch (error) {
                console.error('Error loading data:', error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [currentPage]);

    const indexOfFirstItem = (currentPage - 1) * itemsPerPage + 1;
    const indexOfLastItem = Math.min(currentPage * itemsPerPage, totalItems);

    // Function จัดการเมื่อคลิกปุ่ม Receive
    const handleReceive = (requestId: string) => {
        console.log('Receive request ID:', requestId);
        alert(`รับงาน ID: ${requestId}`);
        // TODO: เรียก API เพื่ออัพเดทสถานะ
    };

    // Function สำหรับเปลี่ยนหน้า
    const handlePageChange = (pageNumber: number) => {
        setCurrentPage(pageNumber);
    };

    // Function สำหรับไปหน้าถัดไป
    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    // Function สำหรับไปหน้าก่อนหน้า
    const handlePrevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    // ถ้ากำลังโหลด แสดง Loading
    if (loading) {
        return (
            <div className="flex min-h-screen ">
                <Sidebar />
                <div className="flex-1 bg-[#F3FAFF]">
                    <TopNav />
                    <main className="pt-24 px-[32px]">
                        <div className="flex items-center justify-center h-64">
                            <div className="text-center">
                                <div className="text-lg text-gray-600">Loading...</div>
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        );
    }

    return (
        <div className="flex">
            <Sidebar />
            <div className="flex-1 bg-[#F3FAFF]">
                <TopNav />
                <main className="flex flex-col pt-24 pb-[32px] pl-[288px] pr-[32px] gap-[32px]">

                    <p className='font-bold text-[32px] text-[#002446]'>Request & Checking</p>

                    <div className='flex flex-col rounded-xl overflow-hidden border border-gray-200'>
                        {/* Header Section */}
                        <div className="flex items-center justify-between px-[32px] py-[24px] bg-[#ffffff]">
                            {/* หัวข้อ */}
                            <h1 className="flex text-2xl font-bold text-[#002446]">
                                Recent Service
                            </h1>

                                {/* Search Box */}
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Search id / vehicle owner or plate..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-[533px] px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    {/* Search Icon */}
                                    <svg
                                        className="absolute left-3 top-2.5 w-5 h-5 text-gray-400"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>

                                {/* Filter Button */}
                                <button className="flex px-4 py-2 bg-[#D5ECF8] text-[#002446] rounded-lg hover:bg-blue-100 transition-colors font-medium">
                                    Filter by Status
                                </button>
                        </div>

                        {/* Table */}
                        <div className="bg-white">
                            <table className="w-full">
                                {/* Table Head */}
                                <thead className="bg-[#E6F6FF]">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Vehicle Plate / Service ID
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Customer
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Problem Description
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        </th>
                                    </tr>
                                </thead>

                                {/* Table Body */}
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {requests.map((request) => (
                                        <tr key={request.requestId} className="hover:bg-gray-50 transition-colors">

                                            {/* คอลัมน์ 1: Vehicle Plate / Service ID */}
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-md text-[#002448] font-semibold text-gray-900">
                                                    {request.plateNumber}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {request.requestId}
                                                </div>
                                            </td>

                                            {/* คอลัมน์ 2: Customer */}
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {request.customerName}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    Clerk: {request.clerkName}
                                                </div>
                                            </td>

                                            {/* คอลัมน์ 3: Problem Description */}
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-700">
                                                    {request.problemDescription}
                                                </div>
                                            </td>

                                            {/* คอลัมน์ 4: Status */}
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="px-4 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-[#D5ECF8] text-[#002448]">
                                                    {request.requestStatus}
                                                </span>
                                            </td>

                                            {/* คอลัมน์ 5: Action */}
                                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                                <button
                                                    onClick={() => handleReceive(request.requestId)}
                                                    className="px-9 py-2 bg-[#002446] text-white text-sm font-medium rounded-lg hover:bg-blue-800 transition-colors"
                                                >
                                                    Receive
                                                </button>
                                            </td>

                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Footer - Pagination */}
                        <div className="px-6 py-4 bg-white flex items-center justify-between">
                            {/* ซ้าย: จำนวนข้อมูล */}
                            <div className="text-sm text-gray-700">
                                Show <span className="font-medium">{indexOfFirstItem}</span> to{' '}
                                <span className="font-medium">{indexOfLastItem}</span> of{' '}
                                <span className="font-medium">{totalItems}</span> services
                            </div>

                            {/* ขวา: Pagination Buttons */}
                            <div className="flex gap-2 items-center">
                                {/* ปุ่มก่อนหน้า */}
                                <button
                                    onClick={handlePrevPage}
                                    disabled={currentPage === 1}
                                    className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                                        currentPage === 1
                                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                            : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                                    }`}
                                >
                                    ←
                                </button>

                                {/* ปุ่มเลขหน้า */}
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNumber) => (
                                    <button
                                        key={pageNumber}
                                        onClick={() => handlePageChange(pageNumber)}
                                        className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                                            currentPage === pageNumber
                                                ? 'bg-[#002448] text-white'
                                                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                                        }`}
                                    >
                                        {pageNumber}
                                    </button>
                                ))}

                                {/* ปุ่มถัดไป */}
                                <button
                                    onClick={handleNextPage}
                                    disabled={currentPage === totalPages}
                                    className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                                        currentPage === totalPages
                                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                            : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                                    }`}
                                >
                                    →
                                </button>
                            </div>
                        </div>
                    </div>

                </main>
            </div>
        </div>
    );
}
