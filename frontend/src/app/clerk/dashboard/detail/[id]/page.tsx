import SidebarClerk from '@/components/SidebarClerk'
import TopNavClerk from '@/components/TopNavClerk'
import Link from 'next/link'
import apiClient from '@/services/apiClient';

const mockServiceDetails: any = {
  "sv011": {
    id: "sv011",
    customer: "พีรภัทร เอกนิษฐ์",
    model: "Veroz",
    color: "White",
    plate: "4ขฒ 6931 กรุงเทพ",
    vehicleName: "Totoya",
    year: "2022",
    appointment: {
      checkIn: "12 / 01 / 2026",
      repair: "13 / 01 / 2026",
      estimatedDays: "3",
      estimatedHours: "-",
      estimatedMins: "-"
    },
    jobs: [
      {
        id: 1,
        startDate: "12 / 01 / 2026",
        endDate: "13 / 01 / 2026",
        status: "In Progress",
        detail: "เปลี่ยนเครื่องยนต์",
        part: "Engine AGx86-64",
        qty: "1",
        assignments: [
          { id: "321847430", name: "นาย ชราวุฒิ คงไครควรครอง" },
          { id: "321321284", name: "นาย ภัทรพี คลองหนึ่งปทุม" }
        ]
      },
      {
        id: 2,
        startDate: "12 / 01 / 2026",
        endDate: "12 / 01 / 2026",
        status: "Complete",
        detail: "เปลี่ยนเบาะรถ เบาะไฟฟ้าชำรุด สายพานเสีย",
        part: "เบาะไฟฟ้าสำหรับคนขับ",
        qty: "1",
        assignments: [
          { id: "321847429", name: "นาย ยากามาโตะ ซากาโมโต้" },
          { id: "321321276", name: "นาย แดง เสี่ยวซ้าย" }
        ]
      }
    ],
    invoice: {
      parts: [
        { name: "Engine AGx86-64", qty: 1, price: "136,000.00" },
        { name: "เบาะไฟฟ้าสำหรับคนขับ", qty: 1, price: "60,300.00" }
      ],
      labor: "1,500.00",
      tax: "14,196.00",
      total: "220,000.00"
    }
  },
  "sv012": {
    id: "sv012",
    customer: "ธีรเมธ บุญประเสริฐชัย",
    model: "Model 3",
    color: "Blue",
    plate: "สส 911 กรุงเทพ",
    vehicleName: "Tesla",
    year: "2019",
    appointment: {
      checkIn: "14 / 01 / 2026",
      repair: "15 / 01 / 2026",
      estimatedDays: "1",
      estimatedHours: "4",
      estimatedMins: "30"
    },
    jobs: [
      {
        id: 1,
        startDate: "15 / 01 / 2026",
        endDate: "15 / 01 / 2026",
        status: "In Progress",
        detail: "ซ่อมระบบเบรคหน้า",
        part: "Brake Pad T-332",
        qty: "2",
        assignments: [
          { id: "321847111", name: "นาย สมชาย สายเบรค" }
        ]
      }
    ],
    invoice: {
      parts: [
        { name: "Brake Pad T-332", qty: 2, price: "4,500.00" }
      ],
      labor: "800.00",
      tax: "371.00",
      total: "5,671.00"
    }
  }
};

export default async function ServiceDetailDynamic({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  let apiData = null;
  try {
    const response = await apiClient.get(`/services/${id}`);
    if (response.data) {
      apiData = response.data;
    }
  } catch (error) {
    console.error(`Error fetching service detail for ${id}:`, error);
  }
  
  // Try to find the detail in API response, or in our mock database, or fallback to a default/generic one if not found
  const data = apiData || mockServiceDetails[id] || {
    id: id,
    customer: "ข้อมูลจำลอง (ไม่ได้อยู่ใน Mock และ API)",
    model: "-",
    color: "-",
    plate: "-",
    vehicleName: "-",
    year: "-",
    appointment: {
      checkIn: "- / - / -",
      repair: "- / - / -",
      estimatedDays: "-",
      estimatedHours: "-",
      estimatedMins: "-"
    },
    jobs: [],
    invoice: {
      parts: [],
      labor: "0.00",
      tax: "0.00",
      total: "0.00"
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <SidebarClerk />
      <TopNavClerk />
      
      <main className="ml-[256px] pt-[64px] p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex justify-between items-end mb-6">
            <div>
              <h1 className="text-2xl font-[800] uppercase tracking-tight text-[#002446] mb-1">Service Detail - #{data.id}</h1>
              <Link href="/clerk/dashboard" className="text-blue-500 hover:text-blue-600 hover:underline text-sm font-semibold">
                &lt; back to dashboard
              </Link>
            </div>
          </div>

          {/* Customer Info Card */}
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-[0_10px_30px_rgba(7,30,39,0.05)] mb-8 flex flex-col lg:flex-row gap-12">
            {/* Left Side */}
            <div className="flex-1 grid grid-cols-3 gap-y-6">
              <div>
                <div className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">NAME</div>
                <div className="text-base font-bold text-[#002446]">{data.customer}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">MODEL</div>
                <div className="text-base font-bold text-[#002446]">{data.model}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">COLOR</div>
                <div className="text-base font-bold text-[#002446]">{data.color}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">PLATE NAME</div>
                <div className="text-base font-bold text-[#002446]">{data.plate}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">VEHICLE NAME</div>
                <div className="text-base font-bold text-[#002446]">{data.vehicleName}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">YEAR</div>
                <div className="text-base font-bold text-[#002446]">{data.year}</div>
              </div>
            </div>
            
            {/* Right Side */}
            <div className="flex-1 border-l border-gray-100 pl-8">
               <div className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-4">APPOINTMENT</div>
               <div className="flex flex-col gap-4">
                 <div className="flex items-center gap-4">
                    <div className="w-24 text-gray-600 font-medium text-sm">เข้ารับตรวจ :</div>
                    <div className="px-4 py-1.5 bg-[#F3FAFF] text-[#002446] rounded-md font-medium text-sm">{data.appointment.checkIn}</div>
                    <div className="w-16 text-gray-600 font-medium ml-4 text-sm text-right">นัดซ่อม :</div>
                    <div className="px-4 py-1.5 bg-[#F3FAFF] text-[#002446] rounded-md font-medium text-sm">{data.appointment.repair}</div>
                 </div>
                 <div className="flex items-center gap-3 mt-2">
                    <div className="text-gray-600 font-medium text-sm">เวลาคาดการณ์ดำเนินการซ่อม</div>
                    <div className="text-gray-600 font-medium ml-2 text-sm">จำนวนวัน :</div>
                    <div className="px-4 py-1 bg-[#F3FAFF] text-[#002446] rounded-md font-medium text-sm w-10 text-center">{data.appointment.estimatedDays}</div>
                    <div className="text-gray-600 font-medium text-sm">ชั่วโมง :</div>
                    <div className="px-4 py-1 bg-[#E6F6FF] text-[#0284C7] rounded-md font-medium text-sm w-10 text-center">{data.appointment.estimatedHours}</div>
                    <div className="text-gray-600 font-medium text-sm">นาที :</div>
                    <div className="px-4 py-1 bg-[#E6F6FF] text-[#0284C7] rounded-md font-medium text-sm w-10 text-center">{data.appointment.estimatedMins}</div>
                 </div>
               </div>
            </div>
          </div>

          {/* Service Job Section */}
          <h2 className="text-xl font-[800] uppercase tracking-tight text-[#002446] mb-4 mt-8">Service Job</h2>
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-[0_10px_30px_rgba(7,30,39,0.05)] mb-8 space-y-6">
            {data.jobs.length === 0 ? (
              <div className="text-center p-8 text-gray-400">ไม่มีข้อมูล Service Job (เนื่องจากเป็นข้อมูลจำลอง)</div>
            ) : (
              data.jobs.map((job: any) => (
                <div key={job.id} className="border border-gray-100 rounded-xl p-6 bg-[#F8FAFC]/50">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-[#002446] text-base">Service Job detail {job.id}</h3>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 text-gray-500">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <div className="px-3 py-1 bg-white border border-gray-200 rounded-md text-sm shadow-sm">{job.startDate}</div>
                        <span className="text-gray-300">-</span>
                        <div className="px-3 py-1 bg-white border border-gray-200 rounded-md text-sm shadow-sm">{job.endDate}</div>
                      </div>
                      {job.status === "Complete" ? (
                        <div className="px-4 py-1.5 bg-[#86EFAC] text-[#14532D] rounded-full text-xs font-bold tracking-wide">Complete</div>
                      ) : (
                        <div className="px-4 py-1.5 bg-[#FEF08A] text-[#854D0E] rounded-full text-xs font-bold tracking-wide">In Progress</div>
                      )}
                    </div>
                  </div>

                  <div className="mb-5">
                    <div className="text-sm font-semibold text-[#002446] mb-2">Detail</div>
                    <div className="w-full p-3.5 bg-white border border-gray-200 rounded-lg text-gray-600 text-sm shadow-sm">{job.detail}</div>
                  </div>

                  <div className="grid grid-cols-2 gap-8">
                    <div>
                      <div className="text-sm font-semibold text-[#002446] mb-2">Part</div>
                      <div className="w-full p-3.5 bg-white border border-gray-200 rounded-lg text-gray-600 text-sm flex justify-between shadow-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-gray-600"></div>
                          {job.part}
                        </div>
                        <span className="text-gray-500">{job.qty} เครื่อง</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-[#002446] mb-2">Assignment</div>
                      <div className="w-full border border-gray-200 rounded-lg overflow-hidden bg-white text-sm shadow-sm">
                        <div className="grid grid-cols-3 bg-[#E6F6FF] p-2.5 border-b border-gray-200 text-xs font-bold text-[#0284C7] uppercase tracking-wider">
                          <div className="col-span-1 pl-2">ID</div>
                          <div className="col-span-2">NAME</div>
                        </div>
                        {job.assignments.map((assignment: any, idx: number) => (
                          <div key={idx} className={`grid grid-cols-3 p-2.5 text-[#002446] ${idx % 2 === 0 ? 'border-b border-gray-100' : 'bg-[#F3FAFF]'}`}>
                            <div className="col-span-1 pl-2 text-gray-500">{assignment.id}</div>
                            <div className="col-span-2 font-medium">{assignment.name}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Invoice Section */}
          <h2 className="text-xl font-[800] uppercase tracking-tight text-[#002446] mb-4 mt-8">Invoice</h2>
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-[0_10px_30px_rgba(7,30,39,0.05)]">
             <div className="w-full text-sm">
               <div className="grid grid-cols-12 bg-[#E6F6FF] p-3.5 rounded-t-lg text-xs font-bold text-[#0284C7] uppercase tracking-wider">
                 <div className="col-span-8 pl-2">PART NAME</div>
                 <div className="col-span-2 text-center">Qty used</div>
                 <div className="col-span-2 text-right pr-4">PRICE</div>
               </div>
               
               {data.invoice.parts.length === 0 ? (
                 <div className="p-4 text-center text-gray-400">ไม่มีข้อมูล Invoice</div>
               ) : (
                 data.invoice.parts.map((part: any, idx: number) => (
                   <div key={idx} className={`grid grid-cols-12 p-3.5 border-b text-[#002446] ${idx % 2 === 0 ? 'border-gray-100 bg-white' : 'border-[#E6F6FF] bg-[#F3FAFF]'}`}>
                     <div className="col-span-8 pl-2 flex items-center gap-2 font-medium">
                       <div className="w-1.5 h-1.5 rounded-full bg-gray-500"></div>
                       {part.name}
                     </div>
                     <div className="col-span-2 text-center text-gray-600">{part.qty}</div>
                     <div className="col-span-2 text-right pr-4 text-gray-600 font-medium">{part.price}</div>
                   </div>
                 ))
               )}
               
               <div className="p-4 text-gray-600 text-sm">
                 <div className="flex justify-between mb-2.5">
                   <div>ค่าแรงรวม</div>
                   <div className="pr-4 font-medium">{data.invoice.labor}</div>
                 </div>
                 <div className="flex justify-between mb-2.5">
                   <div>ภาษี (7%)</div>
                   <div className="pr-4 font-medium">{data.invoice.tax}</div>
                 </div>
                 <div className="flex justify-between font-bold text-[#002446] mt-5 pt-4 border-t border-gray-100 text-base">
                   <div>สรุปรายการ</div>
                   <div className="pr-4">{data.invoice.total}</div>
                 </div>
               </div>
             </div>
          </div>
        </div>
      </main>
    </div>
  )
}
