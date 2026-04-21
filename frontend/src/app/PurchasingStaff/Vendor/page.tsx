'use client'
import React, { useState, useEffect } from 'react'
import apiClient from '@/services/apiClient'
import { ChevronDown, Search, ChevronLeft, ChevronRight, ShoppingCart, Trash2, Package, CheckCircle2, AlertCircle } from 'lucide-react'

export default function VendorPage() {
  const [vendors, setVendors] = useState<any[]>([])
  const [openVendorId, setOpenVendorId] = useState<number | null>(null)
  const [orderQty, setOrderQty] = useState<Record<string, { qty: number, name: string, supplier: string, supplierId: number }>>({})
  const [showPickingList, setShowPickingList] = useState(false)
  
  // เพิ่ม State สำหรับแจ้งเตือนสถานะในหน้า Picking List
  const [globalOrderStatus, setGlobalOrderStatus] = useState<string | null>(null);

  useEffect(() => {
    apiClient.get('/Suppliers')
      .then(res => setVendors(res.data))
      .catch(err => {
        setVendors([
          { supplier_id: 1, supplier_name: "Totsuko Parts Center" },
          { supplier_id: 2, supplier_name: "Apex Engine Solutions" }
        ])
      })
  }, [])

  const handleCreateAllOrders = async () => {
    const selectedItems = Object.entries(orderQty).filter(([_, val]) => val.qty > 0);
    if (selectedItems.length === 0) return;

    const ordersBySupplier: Record<number, any[]> = {};
    selectedItems.forEach(([partId, item]) => {
      if (!ordersBySupplier[item.supplierId]) ordersBySupplier[item.supplierId] = [];
      ordersBySupplier[item.supplierId].push({ part_id: partId, quantity: item.qty });
    });

    try {
      const promises = Object.entries(ordersBySupplier).map(([sId, items]) => {
        return apiClient.post('/PurchaseOrders', {
          supplier_id: parseInt(sId),
          items: items,
          status: 'Pending'
        });
      });

      await Promise.all(promises);
      
      // ✅ สถานะเมื่อสำเร็จผ่าน API
      setGlobalOrderStatus("order success! (api)");
      setTimeout(() => {
        setOrderQty({});
        setShowPickingList(false);
        setGlobalOrderStatus(null);
      }, 2000);

    } catch (error) {
      // ✅ สถานะเมื่อ API แดง (Mock Mode)
      setGlobalOrderStatus("order success! (mock)");
      setTimeout(() => {
        setOrderQty({});
        setShowPickingList(false);
        setGlobalOrderStatus(null);
      }, 2000);
    }
  };

  const totalPicked = Object.values(orderQty).filter(item => item.qty > 0).length

  return (
    <div className="min-h-full bg-[#F8FAFC] p-8 animate-in fade-in duration-500 relative">
      
      {totalPicked > 0 && (
        <button 
          onClick={() => setShowPickingList(true)}
          className="fixed bottom-10 right-10 z-40 bg-[#102C57] text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-4 duration-500 hover:scale-105 transition-all active:scale-95"
        >
          <div className="relative">
            <ShoppingCart size={20} />
            <span className="absolute -top-2 -right-2 bg-red-500 text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-black">
              {totalPicked}
            </span>
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest">View Picking List</span>
        </button>
      )}

      <div className="mb-6 px-1"> 
        <h1 className="text-[32px] font-black text-[#102C57] tracking-tight uppercase">Vendors</h1>
      </div>
      
      <div className="space-y-3 pb-10 max-w-6xl">
        {vendors.map((vendor) => (
          <div key={vendor.supplier_id} className="bg-white rounded-[1.5rem] border border-gray-100 shadow-sm overflow-hidden transition-all">
            <button 
              onClick={() => setOpenVendorId(openVendorId === vendor.supplier_id ? null : vendor.supplier_id)}
              className="w-full flex justify-between items-center px-8 py-6 hover:bg-gray-50/30 transition-colors text-left"
            >
              <div className="flex flex-col">
                <span className="font-bold text-[#102C57] text-xl leading-none">{vendor.supplier_name}</span>
                <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-2">ID: {vendor.supplier_id}</span>
              </div>
              <ChevronDown className={`text-gray-300 transition-transform duration-300 ${openVendorId === vendor.supplier_id ? 'rotate-180 text-blue-500' : ''}`} size={20} />
            </button>

            {openVendorId === vendor.supplier_id && (
              <div className="px-8 pb-8 animate-in fade-in slide-in-from-top-2 border-t border-gray-50 pt-6">
                <VendorPartsTable 
                  vendorId={vendor.supplier_id} 
                  vendorName={vendor.supplier_name}
                  orderQty={orderQty}
                  setOrderQty={setOrderQty}
                  onViewList={() => setShowPickingList(true)}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {showPickingList && (
        <PickingListDrawer 
          items={orderQty} 
          onClose={() => setShowPickingList(false)}
          onCreate={handleCreateAllOrders}
          statusText={globalOrderStatus}
          onRemove={(id: string) => {
            const newQty = { ...orderQty };
            delete newQty[id];
            setOrderQty(newQty);
          }}
        />
      )}
    </div>
  )
}

function VendorPartsTable({ vendorId, vendorName, orderQty, setOrderQty, onViewList }: any) {
  const [parts, setParts] = useState<any[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [isOrdered, setIsOrdered] = useState<string | null>(null)

  useEffect(() => {
    apiClient.get(`/vendors/${vendorId}/parts`)
      .then(res => setParts(res.data))
      .catch(() => {
        const mockParts = Array.from({ length: 8 }, (_, i) => ({
          part_id: `PT-${vendorId}-${100 + i}`,
          part_name: `Spare Part Model ${i + 1}`,
          stock_qty: Math.floor(Math.random() * 25),
          price: 1200 + (i * 150)
        }))
        setParts(mockParts)
      })
  }, [vendorId])

  const handleInputChange = (partId: string, partName: string, val: string) => {
    const qty = parseInt(val) || 0;
    if (qty > 0) {
      setOrderQty({ ...orderQty, [partId]: { qty, name: partName, supplier: vendorName, supplierId: vendorId } });
    } else {
      const newQty = { ...orderQty };
      delete newQty[partId];
      setOrderQty(newQty);
    }
  };

  const handleSingleSupplierOrder = async () => {
    const currentSupplierItems = Object.entries(orderQty)
      .filter(([_, val]: any) => val.supplierId === vendorId && val.qty > 0)
      .map(([id, val]: any) => ({ part_id: id, quantity: val.qty }));

    if (currentSupplierItems.length === 0) return;

    try {
      await apiClient.post('/PurchaseOrders', {
        supplier_id: vendorId,
        items: currentSupplierItems,
        status: 'Pending'
      });
      setIsOrdered("order success! (api)");
      setTimeout(() => {
        const newOrderQty = { ...orderQty };
        Object.keys(newOrderQty).forEach(key => {
          if (newOrderQty[key].supplierId === vendorId) delete newOrderQty[key];
        });
        setOrderQty(newOrderQty);
        setIsOrdered(null);
      }, 2000);
    } catch (error) {
      setIsOrdered("order success! (mock)");
      setTimeout(() => {
        const newOrderQty = { ...orderQty };
        Object.keys(newOrderQty).forEach(key => {
          if (newOrderQty[key].supplierId === vendorId) delete newOrderQty[key];
        });
        setOrderQty(newOrderQty);
        setIsOrdered(null);
      }, 2000);
    }
  };

  const itemsPerPage = 5
  const currentParts = parts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center gap-4 px-1">
        <button 
          onClick={onViewList}
          className="bg-[#EBF3FF] text-[#3B82F6] px-5 py-2 rounded-lg font-black text-[9px] uppercase tracking-widest border border-blue-50 hover:bg-blue-100 transition-all flex items-center gap-2"
        >
          <ShoppingCart size={12}/> View Picking List
        </button>
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
          <input type="text" placeholder="Search parts..." className="w-full pl-10 pr-4 py-2 bg-[#F8FAFC] rounded-lg text-[11px] outline-none border border-transparent focus:border-blue-100 transition-all shadow-inner" />
        </div>
      </div>

      <div className="rounded-[1.2rem] border border-[#E6F0FF] overflow-hidden bg-white">
        <table className="w-full text-left">
          <thead className="bg-[#F4F9FF]">
            <tr className="text-[9px] font-black text-gray-400 uppercase tracking-widest border-b border-[#E6F0FF]">
              <th className="py-4 pl-8">Part ID</th>
              <th className="py-4">Part Name</th>
              <th className="py-4 text-center">Stock</th>
              <th className="py-4 text-center">Status</th>
              <th className="py-4 text-right pr-6">Price</th>
              <th className="py-4 text-center pr-8 w-28">Order Qty</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 text-[11px]">
            {currentParts.map((part) => (
              <tr key={part.part_id} className="text-[#102C57] hover:bg-gray-50/50 transition-colors">
                <td className="py-5 pl-8 font-bold font-mono text-blue-500 tracking-tight">{part.part_id}</td>
                <td className="py-5 font-bold uppercase">{part.part_name}</td>
                <td className="py-5 text-center font-black">{part.stock_qty}</td>
                <td className="py-5 text-center">
                  <div className={`mx-auto w-2 h-2 rounded-full ${part.stock_qty > 5 ? 'bg-green-400' : 'bg-yellow-400'}`} />
                </td>
                <td className="py-5 text-right pr-6 font-black">฿{part.price.toLocaleString()}</td>
                <td className="py-5 pr-8">
                   <input 
                    type="number" min="0" placeholder="0"
                    value={orderQty[part.part_id]?.qty || ''}
                    onChange={(e) => handleInputChange(part.part_id, part.part_name, e.target.value)}
                    className="w-full h-8 bg-[#F8FAFC] rounded-lg border border-gray-100 text-center text-[11px] font-bold focus:border-blue-200 outline-none transition-all"
                   />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        <div className="p-5 bg-[#F4F9FF] border-t border-[#E6F0FF] flex flex-col items-end gap-1">
          <button 
            onClick={handleSingleSupplierOrder}
            className="bg-[#102C57] text-white px-10 py-3 rounded-lg font-black text-[10px] uppercase tracking-widest shadow-md hover:bg-[#1d3e75] active:scale-95 transition-all"
          >
            Pre-Order Now
          </button>
          {isOrdered && (
            <span className={`text-[10px] font-black uppercase tracking-widest animate-bounce mr-6 ${isOrdered.includes('api') ? 'text-green-500' : 'text-blue-400'}`}>
              {isOrdered}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

function PickingListDrawer({ items, onClose, onRemove, onCreate, statusText }: any) {
  const selectedItems = Object.entries(items).filter(([_, val]: any) => val.qty > 0);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-[400px] bg-white h-full shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col">
        <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-[#102C57]">
          <div>
            <h2 className="text-xl font-black text-white uppercase tracking-tighter italic">Picking List</h2>
            <p className="text-[9px] text-blue-300 font-bold uppercase tracking-[0.2em]">Summary of selected items</p>
          </div>
          <button onClick={onClose} className="text-white/50 hover:text-white font-black text-[10px] uppercase">Close</button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
          {selectedItems.length > 0 ? (
            selectedItems.map(([id, val]: any) => (
              <div key={id} className="bg-white border border-gray-100 p-4 rounded-2xl shadow-sm group hover:border-blue-200 transition-all">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[9px] font-bold text-blue-500 font-mono uppercase bg-blue-50 px-2 py-0.5 rounded">{id}</span>
                  <button onClick={() => onRemove(id)} className="text-gray-300 hover:text-red-500 transition-colors"><Trash2 size={14}/></button>
                </div>
                <p className="text-xs font-black text-[#102C57] uppercase mb-1">{val.name}</p>
                <div className="flex justify-between items-center mt-3">
                  <div className="flex items-center gap-1.5 text-[9px] font-bold text-gray-400 uppercase">
                    <Package size={10}/> {val.supplier}
                  </div>
                  <div className="bg-[#102C57] text-white px-3 py-1 rounded-lg text-[10px] font-black">Qty: {val.qty}</div>
                </div>
              </div>
            ))
          ) : (
            <div className="h-full flex flex-col items-center justify-center opacity-20 grayscale">
              <ShoppingCart size={48} />
              <p className="text-[10px] font-black uppercase mt-4">Empty Picking List</p>
            </div>
          )}
        </div>

        <div className="p-8 border-t border-gray-100 flex flex-col items-center gap-3">
          {statusText && (
            <div className={`flex items-center gap-2 animate-bounce ${statusText.includes('api') ? 'text-green-500' : 'text-blue-400'}`}>
               {statusText.includes('api') ? <CheckCircle2 size={16}/> : <AlertCircle size={16}/>}
               <span className="text-[11px] font-black uppercase tracking-widest">{statusText}</span>
            </div>
          )}
          <button 
            onClick={onCreate}
            disabled={selectedItems.length === 0 || !!statusText}
            className="w-full bg-[#102C57] text-white py-4 rounded-xl font-black text-[11px] uppercase tracking-[0.2em] shadow-lg hover:bg-[#1d3e75] active:scale-95 disabled:opacity-50 transition-all"
          >
            Create Order for All
          </button>
        </div>
      </div>
    </div>
  )
}