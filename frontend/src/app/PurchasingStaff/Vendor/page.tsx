'use client'
import React, { useState, useEffect } from 'react'
import apiClient from '@/services/apiClient'
import { ChevronDown, ChevronLeft, ChevronRight, Search, ShoppingCart, Trash2, Package, CheckCircle2, AlertCircle } from 'lucide-react'

export default function VendorPage() {
  const [vendors, setVendors] = useState<any[]>([])
  const [openVendorId, setOpenVendorId] = useState<string | null>(null)
  const [orderQty, setOrderQty] = useState<Record<string, { qty: number, name: string, supplier: string, supplierId: string, buyingPrice: number }>>({})
  const [showPickingList, setShowPickingList] = useState(false)
  const [globalOrderStatus, setGlobalOrderStatus] = useState<string | null>(null);

  useEffect(() => {
    // อิงตาม schema: supplier_id, supplier_name
    apiClient.get('/Supplier')
      .then(res => setVendors(res.data))
      .catch(() => {
        setVendors([
          { supplier_id: "S001", supplier_name: "Totsuko Parts Center" },
          { supplier_id: "S002", supplier_name: "Apex Engine Solutions" }
        ])
      })
  }, [])

  const handleCreateAllOrders = async () => {
    const selectedItems = Object.entries(orderQty).filter(([_, val]) => val.qty > 0);
    if (selectedItems.length === 0) return;

    const ordersBySupplier: Record<string, any> = {};
    selectedItems.forEach(([partId, item]) => {
      if (!ordersBySupplier[item.supplierId]) {
        ordersBySupplier[item.supplierId] = { items: [], totalQty: 0 };
      }
      ordersBySupplier[item.supplierId].items.push({ 
        part_id: partId, 
        quantity: item.qty, // เพิ่ม qty ตามสั่ง
        buying_price: item.buyingPrice 
      });
      ordersBySupplier[item.supplierId].totalQty += item.qty;
    });

    try {
      const currentStaffId = localStorage.getItem('employee_id') || 'EMP001';
      const promises = Object.entries(ordersBySupplier).map(([sId, data]) => {
        return apiClient.post('/PurchaseOrders', {
          supplier_id: sId,
          order_status: 'Paid',
          order_date: new Date().toISOString().split('T')[0],
          purchasing_staff_id: currentStaffId,
          order_quantity: data.totalQty,
          items: data.items 
        });
      });

      await Promise.all(promises);
      setGlobalOrderStatus("receipt recorded! (api)");
    } catch (error) {
      setGlobalOrderStatus("receipt recorded! (mock)");
    }

    setTimeout(() => {
      setOrderQty({});
      setShowPickingList(false);
      setGlobalOrderStatus(null);
    }, 2000);
  };

  const totalPicked = Object.values(orderQty).filter(item => item.qty > 0).length

  return (
    <div className="min-h-full bg-[#F8FAFC] p-8 animate-in fade-in duration-500 relative">
      {totalPicked > 0 && (
        <button 
          onClick={() => setShowPickingList(true)}
          className="fixed bottom-10 right-10 z-40 bg-[#102C57] text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 hover:scale-105 transition-all"
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
        <h1 className="text-[32px] font-black text-[#102C57] tracking-tight uppercase">Vendor</h1>
      </div>
      
      <div className="space-y-3 pb-10 max-w-6xl">
        {vendors.map((vendor) => (
          <div key={vendor.supplier_id} className="bg-white rounded-[1.5rem] border border-gray-100 shadow-sm overflow-hidden transition-all">
            <button 
              onClick={() => setOpenVendorId(openVendorId === vendor.supplier_id ? null : vendor.supplier_id)}
              className="w-full flex justify-between items-center px-8 py-6 hover:bg-gray-50/30 transition-colors text-left"
            >
              <div className="flex flex-col">
                <span className="font-bold text-[#102C57] text-xl leading-none uppercase">{vendor.supplier_name}</span>
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
  const itemsPerPage = 5

  useEffect(() => {
    // อิงตาม schema: part_id, part_name, stock_quantity, price, supplier_id
    apiClient.get('/Parts')
      .then(res => {
        // Filter เฉพาะพาร์ทที่ตรงกับ supplier นี้
        const filtered = res.data.filter((p: any) => p.supplier_id === vendorId);
        setParts(filtered)
      })
      .catch(() => {
        const bigMockParts = [
          { part_id: 'ENG-V8', part_name: 'Engine Block V8', stock_quantity: 25, price: 70000.00, supplier_id: vendorId },
          { part_id: 'OIL-5L', part_name: 'Synthetic Oil 5L', stock_quantity: 100, price: 1400.00, supplier_id: vendorId },
          { part_id: 'BRK-CB', part_name: 'Carbon Brake Pad Set', stock_quantity: 15, price: 12500.00, supplier_id: vendorId },
        ];
        setParts(bigMockParts);
      })
  }, [vendorId])

  const currentParts = parts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center gap-4 px-1">
        <button 
          onClick={onViewList}
          className="bg-[#EBF3FF] text-[#3B82F6] px-5 py-2 rounded-lg font-black text-[9px] uppercase tracking-widest border border-blue-50 hover:bg-blue-100 flex items-center gap-2"
        >
          <ShoppingCart size={12}/> View Picking List
        </button>
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
          <input type="text" placeholder="Search parts..." className="w-full pl-10 pr-4 py-2 bg-[#F8FAFC] rounded-lg text-[11px] outline-none shadow-inner" />
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
              <th className="py-4 text-center pr-8 w-28">Record Qty</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 text-[11px]">
            {currentParts.map((part) => (
              <tr key={part.part_id} className="text-[#102C57] hover:bg-gray-50/50 transition-colors">
                <td className="py-5 pl-8 font-bold font-mono text-blue-500 tracking-tight">{part.part_id}</td>
                <td className="py-5 font-bold uppercase">{part.part_name}</td>
                <td className="py-5 text-center font-black">{part.stock_quantity}</td>
                <td className="py-5 text-center">
                  <div className={`mx-auto w-2 h-2 rounded-full ${part.stock_quantity > 5 ? 'bg-green-400' : 'bg-yellow-400'}`} />
                </td>
                <td className="py-5 text-right pr-6 font-black">฿{Number(part.price).toLocaleString()}</td>
                <td className="py-5 pr-8">
                   <input 
                    type="number" min="0" placeholder="0"
                    value={orderQty[part.part_id]?.qty || ''}
                    onChange={(e) => {
                      const q = parseInt(e.target.value) || 0;
                      if(q > 0) setOrderQty({...orderQty, [part.part_id]: { qty: q, name: part.part_name, supplier: vendorName, supplierId: vendorId, buyingPrice: part.price }});
                      else { const n = {...orderQty}; delete n[part.part_id]; setOrderQty(n); }
                    }}
                    className="w-full h-8 bg-[#F8FAFC] rounded-lg border border-gray-100 text-center font-bold outline-none"
                   />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {/* Pagination */}
        <div className="p-4 bg-gray-50/50 border-t border-[#E6F0FF] flex justify-between items-center px-8">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Showing {currentParts.length} of {parts.length} parts</p>
          <div className="flex gap-2">
            <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1} className="p-2 rounded-lg hover:bg-white disabled:opacity-30"><ChevronLeft size={16}/></button>
            <span className="flex items-center px-3 text-[11px] font-black text-[#102C57] bg-white rounded-lg shadow-sm border border-blue-50">{currentPage} / {Math.ceil(parts.length / itemsPerPage)}</span>
            <button onClick={() => setCurrentPage(p => Math.min(p + 1, Math.ceil(parts.length / itemsPerPage)))} disabled={currentPage === Math.ceil(parts.length / itemsPerPage)} className="p-2 rounded-lg hover:bg-white disabled:opacity-30"><ChevronRight size={16}/></button>
          </div>
        </div>

        <div className="p-5 bg-[#F4F9FF] border-t border-[#E6F0FF] flex flex-col items-end gap-1">
          <button 
            onClick={async () => {
              const currentSupplierItems = Object.entries(orderQty)
                .filter(([_, val]: any) => val.supplierId === vendorId && val.qty > 0)
                .map(([id, val]: any) => ({ part_id: id, quantity: val.qty, buying_price: val.buyingPrice }));

              if (currentSupplierItems.length === 0) return;
              try {
                const staffId = localStorage.getItem('employee_id') || 'EMP001';
                await apiClient.post('/PurchaseOrders', {
                  supplier_id: vendorId,
                  items: currentSupplierItems,
                  order_status: 'Paid',
                  order_date: new Date().toISOString().split('T')[0],
                  purchasing_staff_id: staffId,
                  order_quantity: currentSupplierItems.reduce((a,b) => a + b.quantity, 0)
                });
                // Clear only this vendor's items
                const n = {...orderQty};
                Object.keys(n).forEach(k => { if(n[k].supplierId === vendorId) delete n[k] });
                setOrderQty(n);
              } catch (e) {}
            }}
            className="bg-[#102C57] text-white px-10 py-3 rounded-lg font-black text-[10px] uppercase tracking-widest shadow-md hover:bg-[#1d3e75] transition-all"
          >
            Record Receipt
          </button>
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
      <div className="relative w-[400px] bg-white h-full shadow-2xl flex flex-col">
        <div className="p-8 border-b border-gray-100 bg-[#102C57] flex justify-between items-center text-white">
          <div>
            <h2 className="text-xl font-black uppercase italic">Receipt List</h2>
            <p className="text-[9px] text-blue-300 font-bold uppercase">Summary of recorded items</p>
          </div>
          <button onClick={onClose} className="text-white/50 hover:text-white font-black text-[10px]">CLOSE</button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {selectedItems.map(([id, val]: any) => (
            <div key={id} className="bg-white border border-gray-100 p-4 rounded-2xl shadow-sm">
              <div className="flex justify-between mb-2"><span className="text-[9px] font-bold text-blue-500 font-mono bg-blue-50 px-2 py-0.5 rounded">{id}</span><button onClick={() => onRemove(id)} className="text-gray-300 hover:text-red-500"><Trash2 size={14}/></button></div>
              <p className="text-xs font-black text-[#102C57] uppercase">{val.name}</p>
              <div className="flex justify-between items-center mt-3"><div className="text-[9px] font-bold text-gray-400 uppercase flex items-center gap-1.5"><Package size={10}/> {val.supplier}</div><div className="bg-[#102C57] text-white px-3 py-1 rounded-lg text-[10px] font-black">Qty: {val.qty}</div></div>
            </div>
          ))}
        </div>
        <div className="p-8 border-t border-gray-100"><button onClick={onCreate} disabled={selectedItems.length === 0} className="w-full bg-[#102C57] text-white py-4 rounded-xl font-black text-[11px] uppercase tracking-widest shadow-lg disabled:opacity-50">Save All Receipts</button></div>
      </div>
    </div>
  )
}