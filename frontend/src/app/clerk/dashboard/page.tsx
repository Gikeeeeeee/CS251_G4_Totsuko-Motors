'use client';

import React, { useState, useEffect } from 'react';
import SidebarClerk from '@/components/SidebarClerk'
import TopNavClerk from '@/components/TopNavClerk'
import Link from 'next/link'
import apiClient from '@/services/apiClient';

export default function ClerkDashboard() {
  const mockData = [
    { plate: "4ขฒ693", id: "sv011", customer: "พีรภัทร เอกนิษฐ์", car: "Toyota Yaris 2022 (white)", problem: "ลืมเก็บขยะในรถ, ยางระเบิด, Amazon Web Service", status: "REPAIRING", time: "14:30" },
    { plate: "สส 911", id: "sv012", customer: "ธีรเมธ บุญประเสริฐชัย", car: "Tesla Model 3 2019 (blue)", problem: "ระบบเบรคมีปัญหา", status: "RECIEVED", time: "14:45" },
    { plate: "อมก 6773", id: "sv013", customer: "นวพรรณ กำไรสุข", car: "Ford F-150 2014 (black)", problem: "Steering wheel มีปัญหา", status: "CANCELED", time: "-----" },
    { plate: "ตกก 8934", id: "sv014", customer: "ปวริศร มั่งนิมิตร", car: "Honda Civic 2020 (grey)", problem: "ตรวจเช็คน้ำมันเครื่อง, ต้องตรวจเช็คสภาพยาง", status: "COMPLETED", time: "READY" },
    { plate: "กก 4321", id: "sv015", customer: "เห้ย เจมส์เจมส์", car: "Honda Civic 2020 (grey)", problem: "เช็คน้ำมันเครื่อง, ตรวจเช็คสภาพทั่วไป", status: "COMPLETED", time: "READY" },
    { plate: "6สด 403", id: "sv015", customer: "สุข สมานแผล", car: "Honda Civic 2020 (grey)", problem: "เช็คน้ำมันเครื่อง, ตรวจเช็คสภาพทั่วไป", status: "COMPLETED", time: "READY" },
    { plate: "ทย 981", id: "sv016", customer: "ไข่ แมวดำ", car: "Honda Civic 2020 (grey)", problem: "ยางหน้ารั่ว", status: "COMPLETED", time: "READY" },
    { plate: "นด 6969", id: "sv017", customer: "อนุถวย หัวคิน", car: "Honda Civic 2020 (grey)", problem: "ตรวจเช็คน้ำมันเครื่อง, ต้องตรวจเช็คสภาพยาง", status: "COMPLETED", time: "READY" },
    { plate: "ยก 3214", id: "sv018", customer: "สมใจ กันบ้าง", car: "Honda Civic 2020 (grey)", problem: "ประตูฝั่งคนขับบุบ, สีรถร่อนและเสียหาย", status: "COMPLETED", time: "READY" },
    { plate: "ทป 7654", id: "sv019", customer: "เมิน ห่างเหินเดินหนี", car: "Honda Civic 2020 (grey)", problem: "ตรวจเช็คน้ำมันเครื่อง, ต้องตรวจเช็คสภาพยาง", status: "COMPLETED", time: "READY" },
    { plate: "ทค 1122", id: "sv020", customer: "สมเกียรติ ยิ่งเจริญ", car: "Nissan Almera 2021 (red)", problem: "เปลี่ยนถ่ายน้ำมันเครื่อง", status: "RECIEVED", time: "10:00" },
    { plate: "งจ 9999", id: "sv021", customer: "วิภาดา สุขใจ", car: "Mazda 2 2018 (white)", problem: "แอร์ไม่เย็น", status: "REPAIRING", time: "16:00" }
  ];

  const [recentServices, setRecentServices] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await apiClient.get('/services');
        if (response.data && response.data.length > 0) {
          setRecentServices(response.data);
        } else {
          setRecentServices(mockData);
        }
      } catch (error) {
        console.error("Error fetching services:", error);
        setRecentServices(mockData);
      }
    };
    fetchServices();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  const filteredServices = recentServices.filter(service => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch =
      service.customer.toLowerCase().includes(searchLower) ||
      service.id.toLowerCase().includes(searchLower) ||
      service.plate.toLowerCase().includes(searchLower);
    const matchesStatus = statusFilter === 'ALL' || service.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredServices.length / itemsPerPage);
  const currentServices = filteredServices.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'REPAIRING':
        return <span className="px-3 py-1 bg-[#E0F2FE] text-[#0284C7] rounded-full text-[10px] font-bold tracking-wider">REPAIRING</span>;
      case 'RECIEVED':
        return <span className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-[10px] font-bold tracking-wider">RECIEVED</span>;
      case 'CANCELED':
        return <span className="px-3 py-1 bg-[#FEE2E2] text-[#B91C1C] rounded-full text-[10px] font-bold tracking-wider">CANCELED</span>;
      case 'COMPLETED':
        return <span className="px-3 py-1 bg-[#DCFCE7] text-[#15803D] rounded-full text-[10px] font-bold tracking-wider">COMPLETED</span>;
      default:
        return null;
    }
  }

  const getStatusColorClass = (status: string) => {
    switch (status) {
      case 'REPAIRING': return 'bg-[#3B82F6]'; // Blue
      case 'RECIEVED': return 'bg-[#94A3B8]'; // Gray
      case 'CANCELED': return 'bg-[#EF4444]'; // Red
      case 'COMPLETED': return 'bg-[#22C55E]'; // Green
      default: return 'bg-gray-500';
    }
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <SidebarClerk />
      <TopNavClerk />

      <main className="ml-[256px] pt-[64px] p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex justify-between items-end">
            <div>
              <h1 className="text-2xl font-[800] uppercase tracking-tight text-[#002446] mb-1">Dashboard</h1>
              <p className="text-sm text-[#64748B]">Overview & Recent Services</p>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          {/* Card 1 */}
          <div className="bg-white p-6 rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.05)] border border-gray-100 flex flex-col justify-between h-32">
            <div className="flex items-start">
              <div className="w-10 h-10 rounded-lg bg-[#E0F2FE] text-[#0284C7] flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M16 17L21 12L16 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
            <div>
              <div className="text-[10px] font-bold text-gray-500 tracking-wider mb-1">CARS IN SERVICE</div>
              <div className="text-3xl font-bold text-[#0F172A]">6</div>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white p-6 rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.05)] border border-gray-100 flex flex-col justify-between h-32">
            <div className="flex items-start">
              <div className="w-10 h-10 rounded-lg bg-[#FEE2E2] text-[#B91C1C] flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 5H7C5.89543 5 5 5.89543 5 7V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V7C19 5.89543 18.1046 5 17 5H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M9 5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 5V5H9V5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M9 14L11 16L15 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
            <div>
              <div className="text-[10px] font-bold text-gray-500 tracking-wider mb-1">PARTS APPROVALS</div>
              <div className="text-3xl font-bold text-[#0F172A]">3</div>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-white p-6 rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.05)] border border-gray-100 flex flex-col justify-between h-32">
            <div className="flex items-start">
              <div className="w-10 h-10 rounded-lg bg-[#E0F2FE] text-[#0284C7] flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M8 12L11 15L16 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
            <div>
              <div className="text-[10px] font-bold text-gray-500 tracking-wider mb-1">READY FOR PICK-UP</div>
              <div className="text-3xl font-bold text-[#0F172A]">2</div>
            </div>
          </div>

          {/* Card 4 */}
          <div className="bg-[#1e293b] p-6 rounded-xl shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-1px_rgba(0,0,0,0.06)] flex flex-col justify-between h-32">
            <div className="flex items-start">
              <div className="w-10 h-10 rounded-full border border-white/20 bg-transparent flex items-center justify-center text-white">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M12 8V16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M9.5 10C9.5 9.44772 9.94772 9 10.5 9H13.5C14.0523 9 14.5 9.44772 14.5 10C14.5 10.5523 14.0523 11 13.5 11H10.5C9.94772 11 9.5 11.4477 9.5 12C9.5 12.5523 9.94772 13 10.5 13H13.5C14.0523 13 14.5 13.4477 14.5 14C14.5 14.5523 14.0523 15 13.5 15H10.5C9.94772 15 9.5 14.5523 9.5 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
            <div>
              <div className="text-[10px] font-bold text-gray-300 tracking-wider mb-1">TOTAL REVENUE TODAY</div>
              <div className="text-2xl font-bold text-white">B 4,280.50</div>
            </div>
          </div>
        </div>

        {/* Recent Service Table */}
        <div className="bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.05)] border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-white">
            <h2 className="text-base font-bold text-[#0F172A]">Recent Service</h2>
            <div className="flex gap-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M11 19C15.4183 19 19 15.4183 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19Z" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M21 21L16.65 16.65" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search id / vehicle owner or plate..."
                  className="pl-10 pr-4 py-2 border-none bg-[#F1F5F9] rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 w-80 text-gray-600 font-medium"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <select
                className="px-4 py-2 bg-[#E0F2FE] text-[#0284C7] text-sm font-bold rounded-md hover:bg-blue-100 transition-colors outline-none cursor-pointer"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="ALL">All Status</option>
                <option value="REPAIRING">Repairing</option>
                <option value="RECIEVED">Received</option>
                <option value="CANCELED">Canceled</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-xs text-[#002446] font-bold uppercase tracking-wider bg-white">
                  <th className="py-4 px-6 font-bold w-[180px]">VEHICLE PLATE<br />/ SERVICE ID</th>
                  <th className="py-4 px-6 font-bold w-[200px]">CUSTOMER</th>
                  <th className="py-4 px-6 font-bold w-[350px]">PROBLEM DESCRIPTION</th>
                  <th className="py-4 px-6 font-bold">STATUS</th>
                  <th className="py-4 px-6 text-center font-bold">ESTIMATED<br />TIME</th>
                  <th className="py-4 px-6 w-[100px]"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-sm">
                {currentServices.map((service, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/50 transition-colors bg-white">
                    <td className="py-4 px-6">
                      <div className="flex items-center">
                        <div className={`w-[3px] h-8 rounded-full ${getStatusColorClass(service.status)} mr-4 flex-shrink-0`}></div>
                        <div>
                          <div className="font-bold text-[#0F172A] text-sm">{service.plate}</div>
                          <div className="text-xs text-gray-500">{service.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-bold text-[#0F172A] text-sm">{service.customer}</div>
                      <div className="text-xs text-gray-500">{service.car}</div>
                    </td>
                    <td className="py-4 px-6 text-gray-600 text-sm pr-10">{service.problem}</td>
                    <td className="py-4 px-6">
                      {getStatusBadge(service.status)}
                    </td>
                    <td className="py-4 px-6 text-center font-bold text-[#0F172A] text-sm">{service.time}</td>
                    <td className="py-4 px-6 text-right">
                      <Link href={`/clerk/dashboard/detail/${service.id}`} className="inline-block px-4 py-1.5 bg-[#1E293B] text-white text-xs font-bold rounded-full hover:bg-slate-700 transition-colors tracking-wider text-center">
                        DETAIL
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-4 border-t border-gray-100 flex justify-between items-center text-[11px] text-gray-500 font-medium bg-white">
            <div>Show {currentServices.length} of {filteredServices.length} services</div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="w-6 h-6 flex items-center justify-center rounded text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-6 h-6 flex items-center justify-center rounded text-xs font-bold transition-colors ${currentPage === page
                      ? "bg-[#1E293B] text-white"
                      : "text-gray-600 hover:bg-gray-100"
                    }`}
                >
                  {page}
                </button>
              ))}

              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages || totalPages === 0}
                className="w-6 h-6 flex items-center justify-center rounded text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
