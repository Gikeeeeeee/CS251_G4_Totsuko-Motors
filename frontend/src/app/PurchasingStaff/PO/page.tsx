'use client'
import React, { useState, useEffect } from 'react'
import apiClient from '@/services/apiClient'
import { CheckCircle2, ReceiptText, Clock } from 'lucide-react'

export default function PurchaseOrderPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [selectedOrder, setSelectedOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // ดึงข้อมูล PO จริงจาก Database
    apiClient.get('/PurchaseOrders')
      .then(res => {
        setOrders(res.data)
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setLoading(false)
      })
  }, [])

  const handlePayment = async (id: string) => {
    try {
      // ส่งคำสั่งอัปเดตสถานะเป็น Paid ไปยัง API
      await apiClient.patch(`/PurchaseOrders/${id}`, { status: 'Paid' })
      // อัปเดต UI ทันที
      setOrders(orders.map(o => o.po_id === id ? { ...o, status: 'Paid' } : o))
      if (selectedOrder?.po_id === id) {
        setSelectedOrder({ ...selectedOrder, status: 'Paid' })
      }
    } catch (err) {
      console.error("Payment failed:", err)
    }
  }

  return (
    <div className="min-h-full bg-[#F8FAFC] p-12 animate-in fade-in duration-500 overflow-hidden">
      <h1 className="text-[32px] font-black text-[#102C57] mb-8 tracking-tight uppercase">Purchase Order</h1>

      <div className="flex gap-6 items-start h-[calc(100vh-220px)]">
        {/* ฝั่งซ้าย: List of Orders */}
        <div className="w-[30%] space-y-3 overflow-y-auto pr-2 h-full custom-scrollbar">
          {orders.map((order) => (
            <button 
              key={order.po_id}
              onClick={() => setSelectedOrder(order)}
              className={`w-full bg-white p-6 rounded-[2rem] border transition-all flex justify-between items-center ${
                selectedOrder?.po_id === order.po_id ? 'border-[#3B82F6] shadow-lg ring-1 ring-blue-50' : 'border-gray-100 shadow-sm'
              }`}
            >
              <div className="text-left">
                <p className="font-bold text-[#102C57] text-lg leading-tight">{order.supplier_name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">{order.po_id}</span>
                  {order.status === 'Paid' && <span className="text-green-500 font-black text-[9px] uppercase">● Paid</span>}
                </div>
              </div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-[10px] ${
                order.status === 'Paid' ? 'bg-green-500 text-white' : 'bg-[#EBF3FF] text-[#3B82F6]'
              }`}>
                {order.status === 'Paid' ? <CheckCircle2 size={14}/> : (order.items?.length || 0)}
              </div>
            </button>
          ))}
        </div>

        {/* ฝั่งขวา: Invoice Preview (Sticky Header & Scrollable) */}
        <div className="flex-1 h-full">
          {selectedOrder ? (
            <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 h-full flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
              
              <div className="p-8 pb-4 border-b border-[#F8FAFC]">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <span className="text-[9px] font-black text-[#3B82F6] uppercase tracking-[0.2em]">Invoice Detail</span>
                    <h2 className="text-3xl font-black text-[#102C57] mt-1 italic tracking-tighter">#{selectedOrder.po_id.split('-').pop()}</h2>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-[#102C57] text-lg uppercase tracking-tighter">Totsuko Motor</p>
                    <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Finance Unit</p>
                  </div>
                </div>
                <div className="flex justify-between text-[11px]">
                  <p className="font-bold text-[#102C57] uppercase">Supplier: {selectedOrder.supplier_name}</p>
                  <p className="font-bold text-[#102C57]">Date: {new Date(selectedOrder.created_at).toLocaleDateString()}</p>
                </div>
              </div>

              {/* Table Body (Scrollable) */}
              <div className="flex-1 overflow-y-auto px-8 custom-scrollbar">
                <table className="w-full text-left border-separate border-spacing-0">
                  <thead className="sticky top-0 bg-white z-10">
                    <tr className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                      <th className="py-4 border-b border-[#F8FAFC]">Description</th>
                      <th className="py-4 text-center border-b border-[#F8FAFC]">Qty</th>
                      <th className="py-4 text-right border-b border-[#F8FAFC]">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 text-[12px]">
                    {selectedOrder.items?.map((item: any, idx: number) => (
                      <tr key={idx} className="group hover:bg-[#F4F9FF]/20">
                        <td className="py-4">
                          <p className="font-bold text-[#102C57] uppercase leading-tight">{item.part_name}</p>
                          <p className="text-[9px] text-gray-300 font-mono">{item.part_id}</p>
                        </td>
                        <td className="py-4 text-center font-black text-[#102C57]">{item.quantity}</td>
                        <td className="py-4 text-right font-black text-[#102C57]">฿{(item.quantity * item.price).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Bottom Panel */}
              <div className="p-8 pt-6 bg-[#F4F9FF] border-t border-[#EBF3FF]">
                <div className="flex justify-between items-center mb-6 px-1">
                  <p className="text-[11px] font-black text-[#102C57] uppercase tracking-widest">Grand Total</p>
                  <p className="text-3xl font-black text-[#102C57]">฿{selectedOrder.total_amount?.toLocaleString()}.00</p>
                </div>
                
                <button 
                  onClick={() => handlePayment(selectedOrder.po_id)}
                  disabled={selectedOrder.status === 'Paid'}
                  className={`w-full py-4 rounded-[1.2rem] font-black text-[11px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 shadow-lg transition-all ${
                    selectedOrder.status === 'Paid' 
                    ? 'bg-green-500 text-white cursor-default' 
                    : 'bg-[#102C57] text-white hover:bg-[#1d3e75]'
                  }`}
                >
                  {selectedOrder.status === 'Paid' ? (
                    <><CheckCircle2 size={18}/> Payment Recorded</>
                  ) : (
                    <><Clock size={18}/> Record Payment</>
                  )}
                </button>
              </div>

            </div>
          ) : (
            <div className="h-full bg-white rounded-[2.5rem] border-2 border-dashed border-[#E2E8F0] flex flex-col items-center justify-center text-center p-20">
              <div className="w-16 h-16 bg-[#F4F9FF] rounded-full flex items-center justify-center mb-6">
                <ReceiptText size={28} className="text-[#3B82F6] opacity-20" />
              </div>
              <h3 className="text-xl font-black text-[#CBD5E1] uppercase tracking-tighter">Nothing here yet</h3>
              <p className="text-[#94A3B8] text-[10px] font-bold mt-2 uppercase tracking-[0.15em]">Select an order to preview</p>
            </div>
          )}
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 10px; }
      `}</style>
    </div>
  )
}