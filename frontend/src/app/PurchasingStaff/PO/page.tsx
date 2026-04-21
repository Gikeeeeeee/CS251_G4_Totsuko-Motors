'use client'
import React, { useState, useEffect } from 'react'
import apiClient from '@/services/apiClient' 
import { CheckCircle2, ReceiptText, Clock, Loader2 } from 'lucide-react'

export default function PurchaseOrderPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [selectedOrder, setSelectedOrder] = useState<any>(null)
  const [isPaid, setIsPaid] = useState<Record<string, boolean>>({})
  const [loading, setLoading] = useState(true)

  // ข้อมูล Mock สำหรับใช้เมื่อ API ดึงไม่ได้ (API แดง)
  const mockOrders = [
    {
      po_id: "PO-2026-001",
      supplier_name: "Totsuko Parts Center",
      created_at: "2026-04-15T10:30:00Z",
      status: "Paid",
      recorded_by: "Nawapat T.",
      total_amount: 154000,
      items: [
        { part_id: "ENG-V8", part_name: "Engine Block V8", quantity: 2, price_per_unit: 70000 },
        { part_id: "OIL-5L", part_name: "Synthetic Oil 5L", quantity: 10, price_per_unit: 1400 }
      ]
    },
    {
      po_id: "PO-2026-002",
      supplier_name: "Apex Engine Solutions",
      created_at: "2026-04-18T14:45:00Z",
      status: "Pending",
      total_amount: 25000,
      items: [
        { part_id: "BRK-CB", part_name: "Carbon Brake Pad", quantity: 2, price_per_unit: 12500 }
      ]
    },
    {
      po_id: "PO-2026-003",
      supplier_name: "Global Logistics Co.",
      created_at: "2026-04-19T09:15:00Z",
      status: "Pending",
      total_amount: 12000,
      items: Array.from({ length: 20 }, (_, i) => ({
        part_id: `SKU-00${i + 1}`,
        part_name: `General Spare Part Model ${String.fromCharCode(65 + i)}`,
        quantity: i + 1,
        price_per_unit: 100 * (i + 1)
      }))
    }
  ]

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const response = await apiClient.get('/PurchaseOrders')
      setOrders(response.data)
      
      const paidMap: Record<string, boolean> = {}
      response.data.forEach((order: any) => {
        if (order.status === 'Paid') paidMap[order.po_id] = true
      })
      setIsPaid(paidMap)
    } catch (error) {
      console.error("API Error - Switching to Mock Data:", error)
      setOrders(mockOrders)
      setIsPaid({ "PO-2026-001": true })
    } finally {
      setLoading(false)
    }
  }

  const handlePayment = async (id: string) => {
  // สมมติว่าคุณเก็บชื่อผู้ใช้ไว้ใน localStorage หลัง Login
  const currentUser = localStorage.getItem('user_name') || 'Unknown Staff';

  try {
    await apiClient.patch(`/PurchaseOrders/${id}`, { 
      status: 'Paid',
      recorded_by: currentUser // ส่งชื่อคนที่ Login จริงๆ ไป
    })
    
    // อัปเดต State ในหน้าจอทันทีเพื่อให้ UI แสดงชื่อผู้กด
    setIsPaid(prev => ({ ...prev, [id]: true }));
    setSelectedOrder({ ...selectedOrder, recorded_by: currentUser });

  } catch (error) {
    console.error("Payment Update Error:", error);
    // กรณี Error หรือ Dev mode
    setIsPaid(prev => ({ ...prev, [id]: true }));
  }
}

  return (
    <div className="min-h-full bg-[#F8FAFC] p-12 animate-in fade-in duration-500 overflow-hidden">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-[32px] font-black text-[#102C57] tracking-tight uppercase">Purchase Order</h1>
        {loading && <Loader2 className="animate-spin text-blue-500" size={24} />}
      </div>

      <div className="flex gap-6 items-start h-[calc(100vh-220px)]">
        {/* ฝั่งซ้าย: List of Orders */}
        <div className="w-[30%] space-y-3 overflow-y-auto pr-2 h-full custom-scrollbar">
          {orders.map((order) => {
            const dateObj = new Date(order.created_at);
            const formattedDate = dateObj.toLocaleDateString('en-GB');
            const formattedTime = dateObj.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

            return (
              <button 
                key={order.po_id}
                onClick={() => setSelectedOrder(order)}
                className={`w-full bg-white p-6 rounded-[2rem] border transition-all flex justify-between items-center ${
                  selectedOrder?.po_id === order.po_id ? 'border-[#3B82F6] shadow-lg ring-1 ring-blue-50' : 'border-gray-100 shadow-sm hover:bg-[#F4F9FF]/50'
                }`}
              >
                <div className="text-left">
                  <p className="font-bold text-[#102C57] text-lg leading-tight">{order.supplier_name}</p>
                  <div className="flex flex-col gap-0.5 mt-1.5">
                    <div className="flex items-center gap-2 text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                      <span>{formattedDate}</span>
                      <span className="text-[#3B82F6] opacity-30">|</span>
                      <span>{formattedTime}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] text-[#3B82F6] font-mono font-bold">{order.po_id}</span>
                      {isPaid[order.po_id] && <span className="text-green-500 font-black text-[9px] uppercase tracking-tighter">● Paid</span>}
                    </div>
                  </div>
                </div>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-[10px] ${
                  isPaid[order.po_id] ? 'bg-green-500 text-white' : 'bg-[#EBF3FF] text-[#3B82F6]'
                }`}>
                  {isPaid[order.po_id] ? <CheckCircle2 size={14}/> : (order.items?.length || 0)}
                </div>
              </button>
            );
          })}
        </div>

        {/* ฝั่งขวา: Invoice Preview */}
        <div className="flex-1 h-full">
          {selectedOrder ? (
            <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 h-full flex flex-col overflow-hidden relative animate-in zoom-in-95 duration-200">
              
              {/* ตรายาง PAID */}
              {isPaid[selectedOrder.po_id] && (
                <div className="absolute top-10 right-10 z-20 pointer-events-none rotate-12 animate-in zoom-in-50 duration-300">
                  <div className="border-4 border-green-500/30 text-green-500/40 px-4 py-1 rounded-xl font-black text-2xl uppercase tracking-widest flex items-center gap-2">
                    <CheckCircle2 size={24} /> PAID
                  </div>
                </div>
              )}

              {/* Invoice Header */}
              <div className="relative p-8 pb-6 bg-gradient-to-br from-[#F4F9FF] to-white border-b border-[#EBF3FF]">
                <div className="absolute top-0 right-0 p-4 opacity-5">
                   <ReceiptText size={100} className="rotate-12 text-[#102C57]" />
                </div>

                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-8">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-6 bg-[#3B82F6] rounded-full"></div>
                        <span className="text-[10px] font-black text-[#3B82F6] uppercase tracking-[0.3em]">Purchase Order</span>
                      </div>
                      <h2 className="text-4xl font-black text-[#102C57] italic tracking-tighter drop-shadow-sm">
                        #{selectedOrder.po_id.split('-').pop()}
                      </h2>
                    </div>
                    
                    <div className="text-right">
                      <div className="bg-[#102C57] text-white px-4 py-1.5 rounded-full inline-block mb-2">
                        <p className="font-black text-[10px] uppercase tracking-widest">Totsuko Motor</p>
                      </div>
                      {isPaid[selectedOrder.po_id] && (
                        <div className="text-[9px] text-green-600 font-bold uppercase tracking-tight flex flex-col items-end">
                          <p>Payment Verified By:</p>
                          <p className="text-[#102C57]">{selectedOrder.recorded_by || 'Samorn M.'} | {new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 bg-white/60 backdrop-blur-md p-5 rounded-3xl border border-white shadow-sm">
                    <div className="border-r border-gray-100 pr-4">
                      <p className="text-gray-400 font-bold uppercase text-[8px] mb-1 tracking-widest">Issued To (Supplier)</p>
                      <p className="font-black text-[#102C57] uppercase text-sm leading-tight">{selectedOrder.supplier_name}</p>
                    </div>
                    <div className="pl-4">
                      <p className="text-gray-400 font-bold uppercase text-[8px] mb-1 tracking-widest">Issue Date</p>
                      <p className="font-black text-[#102C57] text-sm uppercase">
                        {new Date(selectedOrder.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Table Body (Sticky Header) */}
              <div className="flex-1 overflow-y-auto px-8 custom-scrollbar bg-white">
                <table className="w-full text-left border-separate border-spacing-0">
                  <thead className="sticky top-0 bg-white z-10">
                    <tr className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                      <th className="py-4 border-b border-[#F8FAFC] w-[20%]">Part ID</th>
                      <th className="py-4 border-b border-[#F8FAFC] w-[45%]">Part Name</th>
                      <th className="py-4 text-center border-b border-[#F8FAFC] w-[15%]">Qty</th>
                      <th className="py-4 text-right border-b border-[#F8FAFC] w-[20%]">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 text-[12px]">
                    {(selectedOrder.items || []).map((item: any, idx: number) => (
                      <tr key={idx} className="group hover:bg-[#F4F9FF]/20">
                        <td className="py-4 font-mono text-[10px] text-blue-500 font-bold uppercase">{item.part_id}</td>
                        <td className="py-4 font-bold text-[#102C57] uppercase leading-tight">{item.part_name}</td>
                        <td className="py-4 text-center font-black text-[#102C57]">{item.quantity}</td>
                        <td className="py-4 text-right font-black text-[#102C57]">฿{(item.quantity * item.price_per_unit).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Bottom Section */}
              <div className="p-8 pt-6 bg-[#F4F9FF] border-t border-[#EBF3FF]">
                <div className="flex justify-between items-center mb-6 px-1">
                  <p className="text-[11px] font-black text-[#102C57] uppercase tracking-widest">Grand Total</p>
                  <p className="text-3xl font-black text-[#102C57] tracking-tight">฿{selectedOrder.total_amount?.toLocaleString()}.00</p>
                </div>
                <button 
                  onClick={() => handlePayment(selectedOrder.po_id)}
                  disabled={isPaid[selectedOrder.po_id]}
                  className={`w-full py-4 rounded-[1.2rem] font-black text-[11px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 shadow-lg transition-all active:scale-[0.98] ${
                    isPaid[selectedOrder.po_id] 
                    ? 'bg-green-100 text-green-600 cursor-default shadow-none border border-green-200' 
                    : 'bg-[#102C57] text-white hover:bg-[#1d3e75]'
                  }`}
                >
                  {isPaid[selectedOrder.po_id] ? <><CheckCircle2 size={18}/> Transaction Completed</> : <><Clock size={18}/> Record Payment</>}
                </button>
              </div>
            </div>
          ) : (
            <div className="h-full bg-white rounded-[2.5rem] border-2 border-dashed border-[#E2E8F0] flex flex-col items-center justify-center text-center p-20">
              <div className="w-16 h-16 bg-[#F4F9FF] rounded-full flex items-center justify-center mb-6 shadow-sm">
                <ReceiptText size={28} className="text-[#3B82F6] opacity-20" />
              </div>
              <h3 className="text-xl font-black text-[#CBD5E1] uppercase tracking-tighter">Nothing here yet</h3>
              <p className="text-[#94A3B8] text-[10px] font-bold mt-2 uppercase tracking-[0.15em]">Select an order from the list</p>
            </div>
          )}
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 10px; }
      `}</style>
    </div>
  )
}