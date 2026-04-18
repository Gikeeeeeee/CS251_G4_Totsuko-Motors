'use client'
import React, { useState, useEffect } from 'react'
import apiClient from '@/services/apiClient'
import { ChevronDown, Search, ChevronLeft, ChevronRight } from 'lucide-react'

export default function VendorPage() {
  const [vendors, setVendors] = useState<any[]>([])
  const [openVendorId, setOpenVendorId] = useState<number | null>(null)

  useEffect(() => {
    // ดึงข้อมูล Supplier ทั้งหมดจาก API จริง
    apiClient.get('/Supplier')
      .then(res => setVendors(res.data))
      .catch(err => console.error("Error fetching suppliers:", err))
  }, [])

  return (
    <div className="min-h-full bg-[#F8FAFC] animate-in fade-in duration-500">
      <div className="pt-10 mb-10 px-2"> 
        <h1 className="text-[32px] font-black text-[#102C57] tracking-tight uppercase">Vendors</h1>
      </div>
      
      <div className="space-y-6 pb-20">
        {vendors.map((vendor) => (
          <div key={vendor.supplier_id} className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden transition-all">
            <button 
              onClick={() => setOpenVendorId(openVendorId === vendor.supplier_id ? null : vendor.supplier_id)}
              className="w-full flex justify-between items-center px-10 py-10 hover:bg-gray-50/30"
            >
              <div className="flex flex-col text-left">
                <span className="font-bold text-[#102C57] text-2xl leading-none">{vendor.supplier_name}</span>
                <span className="text-[11px] text-gray-400 font-bold uppercase tracking-[0.2em] mt-3">ID: {vendor.supplier_id}</span>
              </div>
              <ChevronDown className={`text-gray-300 transition-transform ${openVendorId === vendor.supplier_id ? 'rotate-180' : ''}`} size={28} />
            </button>

            {openVendorId === vendor.supplier_id && (
              <div className="px-10 pb-10 border-t border-gray-50 pt-10">
                <VendorPartsTable vendorId={vendor.supplier_id} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function VendorPartsTable({ vendorId }: { vendorId: number }) {
  const [parts, setParts] = useState<any[]>([])
  const [orderQty, setOrderQty] = useState<Record<string, number>>({})
  const [isOrdered, setIsOrdered] = useState(false)

  useEffect(() => {
    // ดึงรายการอะไหล่ของแต่ละ Vendor
    apiClient.get(`/vendors/${vendorId}/parts`)
      .then(res => setParts(res.data))
      .catch(err => console.error(err))
  }, [vendorId])

  const handlePreOrder = async () => {
    const selectedItems = Object.entries(orderQty)
      .filter(([_, qty]) => qty > 0)
      .map(([id, qty]) => ({ part_id: id, quantity: qty }))

    if (selectedItems.length === 0) return

    try {
      // ยิง API สร้าง PO จริง
      await apiClient.post('/PurchaseOrders', {
        supplier_id: vendorId,
        items: selectedItems,
        status: 'Pending'
      })
      setIsOrdered(true)
      setTimeout(() => setIsOrdered(false), 3000)
    } catch (err) {
      console.error("Order failed:", err)
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-[2rem] border border-[#E6F0FF] overflow-hidden bg-white">
        <table className="w-full text-left">
          <thead className="bg-[#F4F9FF]">
            <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-[#E6F0FF]">
              <th className="py-6 pl-12">Part ID</th>
              <th className="py-6">Part Name</th>
              <th className="py-6 text-center">Stock</th>
              <th className="py-6 text-right pr-10">Price</th>
              <th className="py-6 text-center pr-12 whitespace-nowrap">Order Qty</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {parts.map((part) => (
              <tr key={part.part_id} className="text-[#102C57]">
                <td className="py-6 pl-12 font-bold font-mono text-blue-500 uppercase">{part.part_id}</td>
                <td className="py-6 font-bold uppercase">{part.part_name}</td>
                <td className="py-6 text-center font-black">{part.stock_qty}</td>
                <td className="py-6 text-right pr-10 font-black">฿{part.price?.toLocaleString()}</td>
                <td className="py-6 pr-12">
                   <input 
                    type="number" min="0" placeholder="0"
                    onChange={(e) => setOrderQty({...orderQty, [part.part_id]: parseInt(e.target.value)})}
                    className="w-full h-10 bg-[#F8FAFC] rounded-xl border border-gray-100 text-center font-bold outline-none focus:border-blue-200"
                   />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        <div className="p-8 bg-[#F4F9FF] border-t border-[#E6F0FF] flex flex-col items-end gap-2">
          <button onClick={handlePreOrder} className="bg-[#102C57] text-white px-16 py-4 rounded-xl font-black text-[11px] uppercase tracking-[0.2em] shadow-lg active:scale-95 transition-all">
            Pre-Order Now
          </button>
          {isOrdered && <span className="text-[12px] font-black text-green-500 uppercase tracking-widest animate-bounce mr-10">order!</span>}
        </div>
      </div>
    </div>
  )
}