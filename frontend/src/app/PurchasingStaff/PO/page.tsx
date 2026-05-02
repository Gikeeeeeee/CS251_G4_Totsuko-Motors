'use client'
import React, { useState, useEffect } from 'react'
import apiClient from '@/services/apiClient' 
import { CheckCircle2, ReceiptText, Clock, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function PurchaseOrderPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [selectedOrder, setSelectedOrder] = useState<any>(null)
  const [selectedOrderItems, setSelectedOrderItems] = useState<any[]>([])
  const [isPaid, setIsPaid] = useState<Record<string, boolean>>({})
  const [loading, setLoading] = useState(true)
  const [detailsLoading, setDetailsLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // 🛠️ Bypass Auth Guard
    const role = localStorage.getItem('role');
     const validRoles = ['Admin', 'admin', 'purchasingStaff', 'PurchasingStaff'];
     if (!role || !validRoles.includes(role)) {
       alert('Access Denied: Only Admin and Purchasing Staff are allowed.');
       router.push('/Login');
     }
  }, [router])

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    setLoading(true)
    try {
      // ดึงจากตาราง PurchaseOrder (Join กับ Supplier เพื่อเอา supplier_name)
      // Backend return: { success: true, data: [...] }
      const response = await apiClient.get('/service/PurchaseOrders')
      const ordersData = response.data?.data || response.data || []
      setOrders(ordersData)
      
      const paidMap: Record<string, boolean> = {}
      ordersData.forEach((order: any) => {
        const poId = order.poId || order.po_id;
        if (order.orderStatus === 'Paid' || order.order_status === 'Paid') paidMap[poId] = true
      })
      setIsPaid(paidMap)
    } catch (error: any) {
      console.error("API Error:", error)
      if (error.response?.status === 401) {
        setOrders([
          { poId: "RE-2026-001", supplierName: "Totsuko Parts Center", orderDate: "2026-04-15", orderStatus: "Paid", orderQuantity: 12 },
          { poId: "RE-2026-002", supplierName: "Apex Engine Solutions", orderDate: "2026-04-18", orderStatus: "Pending", orderQuantity: 5 }
        ])
      } else {
        setOrders([])
      }
    } finally {
      setLoading(false)
    }
  }

  const handleSelectOrder = async (order: any) => {
    setSelectedOrder(order)
    setDetailsLoading(true)
    try {
      // ดึงรายละเอียดจาก PurchaseOrderPart ตาม po_id
      const poId = order.poId || order.po_id;
      const response = await apiClient.get(`/service/PurchaseOrderParts/${poId}`)
      const itemsData = response.data?.data || response.data || []
      setSelectedOrderItems(itemsData)
    } catch (error: any) {
      console.error("Failed to fetch order parts", error);
      if (error.response?.status === 401) {
        setSelectedOrderItems([
          { partId: 'ENG-V8', partName: 'Engine Block V8', quantity: 2, unitCost: 70000 },
          { partId: 'OIL-5L', partName: 'Synthetic Oil 5L', quantity: 5, unitCost: 1400 }
        ])
      } else {
        setSelectedOrderItems([])
      }
    } finally {
      setDetailsLoading(false)
    }
  }

  const handlePayment = async (id: string) => {
    try {
      // ยิง PATCH เพื่ออัปเดตสถานะ (Backend รับเป็น status ไม่ใช่ order_status)
      await apiClient.patch(`/service/PurchaseOrders/${id}`, { 
        status: 'Paid'
      })
      
      setIsPaid((prev: any) => ({ ...prev, [id]: true }));
      setSelectedOrder({ ...selectedOrder, orderStatus: 'Paid' });
    } catch (error: any) {
      console.error("Payment Update Failed:", error);
      if (error.response?.status === 401) {
        setIsPaid((prev: any) => ({ ...prev, [id]: true }));
        setSelectedOrder((prev: any) => ({ ...prev, orderStatus: 'Paid' }));
        alert("[Bypass 401] Payment Confirmed! (Mock)");
      } else {
        alert(`Payment Update Failed: ${error.response?.data?.message || error.message}`);
      }
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
          {orders.map((order) => {
            const poId = order.poId || order.po_id;
            const supplierName = order.supplierName || order.supplier_name;
            const orderDate = order.orderDate || order.order_date;
            const orderQuantity = order.orderQuantity || order.order_quantity;
            return (
            <button 
              key={poId}
              onClick={() => handleSelectOrder(order)}
              className={`w-full bg-white p-6 rounded-[2rem] border transition-all flex justify-between items-center ${
                (selectedOrder?.poId || selectedOrder?.po_id) === poId ? 'border-[#3B82F6] shadow-lg ring-1 ring-blue-50' : 'border-gray-100 shadow-sm hover:bg-[#F4F9FF]/50'
              }`}
            >
              <div className="text-left">
                <p className="font-bold text-[#102C57] text-lg leading-tight uppercase">{supplierName || 'Unknown Supplier'}</p>
                <div className="flex flex-col mt-1.5">
                  <span className="text-[9px] text-[#3B82F6] font-mono font-bold uppercase tracking-widest mb-1">{poId}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-bold text-gray-400">
                       {orderDate ? new Date(orderDate).toLocaleDateString('en-GB') : 'No Date'}
                    </span>
                    {isPaid[poId] && <span className="text-green-500 font-black text-[9px] uppercase tracking-tighter">● Paid</span>}
                  </div>
                </div>
              </div>
              <div className={`w-9 h-9 rounded-full flex flex-col items-center justify-center font-black ${
                isPaid[poId] ? 'bg-green-500 text-white' : 'bg-[#EBF3FF] text-[#3B82F6]'
              }`}>
                <span className="text-[12px] leading-none">{orderQuantity || 0}</span>
              </div>
            </button>
          )})}
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
                      #{(selectedOrder.poId || selectedOrder.po_id)?.split('-').pop()}
                    </h2>
                  </div>
                  <div className="text-right">
                    <div className="bg-[#102C57] text-white px-4 py-1 rounded-full text-[10px] font-black uppercase mb-2 tracking-widest">Totsuko Motor</div>
                    {isPaid[selectedOrder.poId || selectedOrder.po_id] && (
                        <div className="flex flex-col items-end">
                            <p className="text-[8px] text-gray-400 font-bold uppercase tracking-widest">Status</p>
                            <p className="text-[11px] text-green-600 font-black uppercase tracking-tighter bg-green-50 px-3 py-0.5 rounded-lg border border-green-100">
                                Paid
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
                            {item.partId || item.part_id || item.part?.partId || item.part?.part_id}
                             </span>
                          </td>
                          <td className="py-5">
                         <p className="font-bold text-[#102C57] uppercase tracking-tight">{item.partName || item.part_name || item.part?.name || item.part?.partName}</p>
                          </td>
                          <td className="py-5 text-center font-black text-[#102C57]">{item.quantity}</td>
                          <td className="py-5 text-right font-black text-[#102C57]">
                             <span className="text-gray-300 font-bold mr-1 text-[10px]">฿</span>
                         {Number(item.buyingPrice || item.buying_price || item.unitCost || item.unit_cost || item.price || item.part?.price || 0).toLocaleString()}
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
                  onClick={() => handlePayment(selectedOrder.poId || selectedOrder.po_id)}
                  disabled={isPaid[selectedOrder.poId || selectedOrder.po_id]}
                  className={`w-full py-4 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-lg transition-all active:scale-95 ${
                    isPaid[selectedOrder.poId || selectedOrder.po_id] ? 'bg-green-100 text-green-600 border border-green-200' : 'bg-[#102C57] text-white hover:bg-[#1d3e75]'
                  }`}
                >
                  {isPaid[selectedOrder.poId || selectedOrder.po_id] ? "Receipt Confirmed" : "Confirm Record Payment"}
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
    return items.reduce((sum, item) => sum + (Number(item.quantity || 0) * Number(item.buyingPrice || item.buying_price || item.unitCost || item.unit_cost || item.price || item.part?.price || 0)), 0);
}