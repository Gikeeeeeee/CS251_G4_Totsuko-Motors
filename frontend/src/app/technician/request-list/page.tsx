'use client';

import apiClient from '@/services/apiClient';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Interface สำหรับกำหนดโครงสร้างข้อมูลที่มาจาก API
interface ServiceRequest {
    id: string; 
    vehiclePlate: string;
    serviceId: string;
    customerName: string;
    vehicleModel: string;
    vehicleColor: string;
    problemDescription: string;
    status: string; // 👈 เก็บสถานะจริงๆ ที่ส่งมาจาก Backend
}

export default function TechnicianPage() {
    const router = useRouter(); 
    
    const [requests, setRequests] = useState<ServiceRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    
    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        const role = localStorage.getItem('role');
        const validRoles = ['Admin', 'admin', 'technician', 'Technician'];
        if (!role || !validRoles.includes(role)) {
            alert('Access Denied: Only Admin and Technician are allowed.');
            router.push('/Login');
        }
    }, [router]);

    // โหลดข้อมูลเมื่อหน้าเปิดครั้งแรก
    useEffect(() => {
        const loadData = async () => {
            try {
                
                const res = await apiClient.get('/technicians/requests'); 
                const apiData = res.data?.data || res.data || [];

                // แมปข้อมูลจาก API เข้าโครงสร้าง
                const formattedData: ServiceRequest[] = apiData.map((item: any) => ({
                    id: item.requestId,
                    vehiclePlate: item.plateNumber || '-',
                    serviceId: item.requestId,
                    customerName: item.customerName || 'ไม่ระบุชื่อ',
                    vehicleModel: item.vehicleModel || '-',
                    vehicleColor: item.vehicleColor || '-',
                    problemDescription: item.problemDescription || 'ไม่มีรายละเอียด',
                    status: item.requestStatus || 'Unknown' // 👈 ใช้ค่าจริงจาก API 
                }));

                setRequests(formattedData);
            } catch (error) {
                console.error('Error loading data:', error);
                // Fallback เผื่อ API ร่วง
                setRequests([]); 
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [currentPage]);

    // Filter ข้อมูล
    const filteredRequests = requests.filter(req => 
        req.vehiclePlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.serviceId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.customerName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredRequests.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);

    // 🚀 เมื่อกด Receive -> เปลี่ยนสถานะเป็น In Progress แล้วไปหน้า Operation
    const handleReceive = async (requestId: string) => {
        try {
            await apiClient.patch(`/service/service-request/${requestId}/status`, { status: 'In Progress' });
            setRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: 'In Progress' } : r));
        } catch (error) {
            console.error('Failed to update status:', error);
        }
        router.push(`/technician/operation?requestId=${requestId}`);
    };

    const handlePageChange = (pageNumber: number) => setCurrentPage(pageNumber);
    const handleNextPage = () => { if (currentPage < totalPages) setCurrentPage(currentPage + 1); };
    const handlePrevPage = () => { if (currentPage > 1) setCurrentPage(currentPage - 1); };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-lg text-gray-600">Loading...</div>
            </div>
        );
    }

    // กำหนดสีของ Badge ตามสถานะคร่าวๆ
    const getStatusColor = (status: string) => {
        const lowerStatus = status.toLowerCase();
        if (lowerStatus.includes('pending') || lowerStatus.includes('intake')) return 'bg-[#D5ECF8] text-[#002448]';
        if (lowerStatus.includes('progress')) return 'bg-yellow-100 text-yellow-800';
        if (lowerStatus.includes('complete')) return 'bg-green-100 text-green-800';
        return 'bg-gray-100 text-gray-800';
    };

    return (
        <div className="flex flex-col gap-[32px]">

                    <p className='font-bold text-[32px] text-[#002446]'>Request & Checking</p>

                    <div className='flex flex-col rounded-xl overflow-hidden border border-gray-200'>
                        <div className="flex items-center justify-between px-[32px] py-[24px] bg-[#ffffff]">
                            <h1 className="flex text-2xl font-bold text-[#002446]">
                                Recent Service
                            </h1>

                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Search id / vehicle owner or plate..."
                                    value={searchTerm}
                                    onChange={(e) => {
                                        setSearchTerm(e.target.value);
                                        setCurrentPage(1); 
                                    }}
                                    className="w-[533px] px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <svg className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>

                            <button className="flex px-4 py-2 bg-[#D5ECF8] text-[#002446] rounded-lg hover:bg-blue-100 transition-colors font-medium">
                                Filter by Status
                            </button>
                        </div>

                        <div className="bg-white">
                            <table className="w-full">
                                <thead className="bg-[#E6F6FF]">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle Plate / Service ID</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Problem Description</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {currentItems.length > 0 ? (
                                        currentItems.map((request) => (
                                            <tr key={request.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-md text-[#002448] font-semibold text-gray-900">{request.vehiclePlate}</div>
                                                    <div className="text-xs text-gray-500">{request.serviceId}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm font-medium text-gray-900">{request.customerName}</div>
                                                    <div className="text-xs text-gray-500">{request.vehicleModel}</div>
                                                    <div className="text-xs text-gray-500">({request.vehicleColor})</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm text-gray-700">{request.problemDescription}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-4 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(request.status)}`}>
                                                        {request.status.toUpperCase()}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                                    <button
                                                        onClick={() => handleReceive(request.id)}
                                                        className="px-9 py-2 bg-[#002446] text-white text-sm font-medium rounded-lg hover:bg-blue-800 transition-colors"
                                                    >
                                                        Receive
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-10 text-center text-gray-500">
                                                No service requests found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div className="px-6 py-4 bg-white flex items-center justify-between border-t border-gray-200">
                            <div className="text-sm text-gray-700">
                                Show <span className="font-medium">{filteredRequests.length > 0 ? indexOfFirstItem + 1 : 0}</span> to{' '}
                                <span className="font-medium">{Math.min(indexOfLastItem, filteredRequests.length)}</span> of{' '}
                                <span className="font-medium">{filteredRequests.length}</span> services
                            </div>

                            <div className="flex gap-2 items-center">
                                <button
                                    onClick={handlePrevPage}
                                    disabled={currentPage === 1 || filteredRequests.length === 0}
                                    className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                                        currentPage === 1 || filteredRequests.length === 0
                                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                            : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                                    }`}
                                >
                                    ←
                                </button>

                                {Array.from({ length: totalPages || 1 }, (_, i) => i + 1).map((pageNumber) => (
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

                                <button
                                    onClick={handleNextPage}
                                    disabled={currentPage === totalPages || filteredRequests.length === 0}
                                    className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                                        currentPage === totalPages || filteredRequests.length === 0
                                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                            : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                                    }`}
                                >
                                    →
                                </button>
                            </div>
                        </div>
                    </div>

        </div>
    );
}