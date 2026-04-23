'use client'
import React, { useState, useEffect } from 'react'
import apiClient from '@/services/apiClient' 
import { CheckCircle2, ReceiptText, Clock, Loader2 } from 'lucide-react'

export default function PurchaseOrderPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [selectedOrder, setSelectedOrder] = useState<any>(null)
  const [selectedOrderItems, setSelectedOrderItems] = useState<any[]>([])
  const [isPaid, setIsPaid] = useState<Record<string, boolean>>({})
  const [loading, setLoading] = useState(true)
  const [detailsLoading, setDetailsLoading] = useState(false)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    setLoading(true)
    try {
      // ดึงจากตาราง PurchaseOrder (Join กับ Supplier เพื่อเอา supplier_name)
      const response = await apiClient.get('/PurchaseOrders')
      setOrders(response.data)
      
      const paidMap: Record<string, boolean> = {}
      response.data.forEach((order: any) => {
        // อิงตาม database schema: order_status และ po_id
        if (order.order_status === 'Paid') paidMap[order.po_id] = true
      })
      setIsPaid(paidMap)
    } catch (error) {
      console.error("API Error:", error)
      // Mock ข้อมูลกรณี API ยังไม่พร้อม (อิงตามชื่อคอลัมน์ใน DBeaver)
      setOrders([
        { po_id: "RE-2026-001", supplier_name: "Totsuko Parts Center", order_date: "2026-04-15", order_status: "Paid", order_quantity: 12, purchasing_staff_id: "EMP001" },
        { po_id: "RE-2026-002", supplier_name: "Apex Engine Solutions", order_date: "2026-04-18", order_status: "Pending", order_quantity: 5, purchasing_staff_id: "EMP001" }
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleSelectOrder = async (order: any) => {
    setSelectedOrder(order)
    setDetailsLoading(true)
    try {
      // ดึงรายละเอียดจาก PurchaseOrderPart ตาม po_id (Join กับ Part เพื่อเอา part_name)
      const response = await apiClient.get(`/PurchaseOrderParts/${order.po_id}`)
      setSelectedOrderItems(response.data)
    } catch (error) {
      // Mock ข้อมูลพาร์ท (อิงตาม schema: part_id, quantity, buying_price)
      setSelectedOrderItems([
        { part_id: "ENG-V8", part_name: "Engine Block V8", quantity: 2, buying_price: 70000 },
        { part_id: "OIL-5L", part_name: "Synthetic Oil 5L", quantity: 10, buying_price: 1400 }
      ])
    } finally {
      setDetailsLoading(false)
    }
  }

  const handlePayment = async (id: string) => {
    // ดึง employee_id จากระบบ Login (ที่เก็บไว้ใน localStorage ตอนเข้าแอป)
    const currentEmployeeId = localStorage.getItem('employee_id') || 'EMP001'; 
    
    try {
      // ยิง PATCH เพื่ออัปเดตสถานะและบันทึกผู้ตรวจรับ (purchasing_staff_id)
      await apiClient.patch(`/PurchaseOrders/${id}`, { 
        order_status: 'Paid',
        purchasing_staff_id: currentEmployeeId 
      })
      
      setIsPaid(prev => ({ ...prev, [id]: true }));
      setSelectedOrder({ ...selectedOrder, order_status: 'Paid', purchasing_staff_id: currentEmployeeId });
    } catch (error) {
      console.error("Payment Update Failed:", error);
      // กรณี Mock หรือ Error ใน Dev
      setIsPaid(prev => ({ ...prev, [id]: true }));
    }
  }

  return (
    <div className="min-h-full bg-[#F8FAFC] p-12 animate-in fade-in duration-500 overflow-hidden">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-[32px] font-black text-[#102C57] tracking-tight uppercase italic">Purchase Order</h1>
        {loading && <Loader2 className="animate-spin text-blue-500" size={24} />}
      </div>

      <div className="flex gap-6 items-start h-[calc(100vh-220px)]">
        {/* ฝั่งซ้าย: List of Orders (Master) */}
        <div className="w-[30%] space-y-3 overflow-y-auto pr-2 h-full custom-scrollbar">
          {orders.map((order) => (
            <button 
              key={order.po_id}
              onClick={() => handleSelectOrder(order)}
              className={`w-full bg-white p-6 rounded-[2rem] border transition-all flex justify-between items-center ${
                selectedOrder?.po_id === order.po_id ? 'border-[#3B82F6] shadow-lg ring-1 ring-blue-50' : 'border-gray-100 shadow-sm hover:bg-[#F4F9FF]/50'
              }`}
            >
              <div className="text-left">
                <p className="font-bold text-[#102C57] text-lg leading-tight uppercase">{order.supplier_name}</p>
                <div className="flex flex-col mt-1.5">
                  <span className="text-[9px] text-[#3B82F6] font-mono font-bold uppercase tracking-widest mb-1">{order.po_id}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-bold text-gray-400">
                       {order.order_date ? new Date(order.order_date).toLocaleDateString('en-GB') : 'No Date'}
                    </span>
                    {isPaid[order.po_id] && <span className="text-green-500 font-black text-[9px] uppercase tracking-tighter">● Paid</span>}
                  </div>
                </div>
              </div>
              <div className={`w-9 h-9 rounded-full flex flex-col items-center justify-center font-black ${
                isPaid[order.po_id] ? 'bg-green-500 text-white' : 'bg-[#EBF3FF] text-[#3B82F6]'
              }`}>
                <span className="text-[12px] leading-none">{order.order_quantity || 0}</span>
              </div>
            </button>
          ))}
        </div>

        {/* ฝั่งขวา: Invoice Detail (Detail) */}
        <div className="flex-1 h-full">
          {selectedOrder ? (
            <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 h-full flex flex-col overflow-hidden relative">
              
              {/* ส่วนหัว Invoice */}
              <div className="p-8 pb-6 bg-gradient-to-br from-[#F4F9FF] to-white border-b border-[#EBF3FF]">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-black text-[#3B82F6] uppercase tracking-[0.3em]">Receipt Details</span>
                    <h2 className="text-4xl font-black text-[#102C57] italic tracking-tighter mt-1 uppercase font-mono">
                      #{selectedOrder.po_id.split('-').pop()}
                    </h2>
                  </div>
                  <div className="text-right">
                    <div className="bg-[#102C57] text-white px-4 py-1 rounded-full text-[10px] font-black uppercase mb-2 tracking-widest">Totsuko Motor</div>
                    {isPaid[selectedOrder.po_id] && (
                        <div className="flex flex-col items-end">
                            <p className="text-[8px] text-gray-400 font-bold uppercase tracking-widest">Recorded By (Employee ID)</p>
                            <p className="text-[11px] text-green-600 font-black uppercase tracking-tighter bg-green-50 px-3 py-0.5 rounded-lg border border-green-100">
                                {selectedOrder.purchasing_staff_id || 'EMP-NULL'}
                            </p>
                        </div>
                    )}
                  </div>
                </div>
              </div>

              {/* ส่วนตารางรายการพาร์ท */}
              <div className="flex-1 overflow-y-auto px-8 custom-scrollbar">
                {detailsLoading ? (
                  <div className="h-full flex items-center justify-center gap-2 text-gray-400 font-bold uppercase text-[10px] tracking-widest">
                    <Loader2 className="animate-spin" size={16}/> Loading Parts...
                  </div>
                ) : (
                  <table className="w-full text-left border-separate border-spacing-0">
                    <thead className="sticky top-0 bg-white z-10">
                      <tr className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                        <th className="py-5 border-b border-[#F8FAFC] w-[18%]">Part ID</th>
                        <th className="py-5 border-b border-[#F8FAFC] w-[42%]">Part Description</th>
                        <th className="py-5 text-center border-b border-[#F8FAFC] w-[12%]">Qty</th>
                        <th className="py-5 text-right border-b border-[#F8FAFC] w-[28%]">Unit Price</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 text-[12px]">
                      {selectedOrderItems.map((item: any, idx: number) => (
                        <tr key={idx} className="hover:bg-[#F4F9FF]/20 group">
                          <td className="py-5">
                             <span className="font-mono text-[11px] bg-gray-50 text-blue-600 font-bold px-2 py-1 rounded-md border border-gray-100 group-hover:bg-blue-50 transition-colors">
                                {item.part_id}
                             </span>
                          </td>
                          <td className="py-5">
                             <p className="font-bold text-[#102C57] uppercase tracking-tight">{item.part_name}</p>
                          </td>
                          <td className="py-5 text-center font-black text-[#102C57]">{item.quantity}</td>
                          <td className="py-5 text-right font-black text-[#102C57]">
                             <span className="text-gray-300 font-bold mr-1 text-[10px]">฿</span>
                             {item.buying_price?.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {/* ส่วนสรุปยอดเงิน */}
              <div className="p-8 bg-[#F4F9FF] border-t border-[#EBF3FF]">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex flex-col">
                    <p className="text-[10px] font-black text-[#102C57] uppercase tracking-widest">Grand Total</p>
                    <p className="text-[8px] text-gray-400 font-bold uppercase italic">* Including all parts in this receipt</p>
                  </div>
                  <p className="text-3xl font-black text-[#102C57] tracking-tighter italic">฿{calculateTotal(selectedOrderItems).toLocaleString()}.00</p>
                </div>
                <button 
                  onClick={() => handlePayment(selectedOrder.po_id)}
                  disabled={isPaid[selectedOrder.po_id]}
                  className={`w-full py-4 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-lg transition-all active:scale-95 ${
                    isPaid[selectedOrder.po_id] ? 'bg-green-100 text-green-600 border border-green-200' : 'bg-[#102C57] text-white hover:bg-[#1d3e75]'
                  }`}
                >
                  {isPaid[selectedOrder.po_id] ? "Receipt Confirmed" : "Confirm Record Payment"}
                </button>
              </div>
            </div>
          ) : (
             <div className="h-full bg-white rounded-[2.5rem] border-2 border-dashed border-[#E2E8F0] flex flex-col items-center justify-center text-center opacity-40">
               <ReceiptText size={48} className="text-gray-300 mb-4" />
               <p className="text-[#CBD5E1] font-black uppercase tracking-widest text-xs">Select a Receipt to View Details</p>
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

function calculateTotal(items: any[]) {
    return items.reduce((sum, item) => sum + (item.quantity * (item.buying_price || 0)), 0);
}