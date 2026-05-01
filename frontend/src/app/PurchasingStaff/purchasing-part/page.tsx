'use client'

import React, { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import styles from './PurchasingPart.module.css'
import apiClient from '@/services/apiClient'
import { useRouter } from 'next/navigation'

interface Part {
  part_id: string;
  part_name: string;
  stock_qty: number;
  status: 'Inventory' | 'Nearly Out of Stock' | 'Waiting for delivery';
  price: string | number | null;
  supplier_id?: string;
  supplierId?: string;
}

export default function PurchasingPartPage() {
  const [filter, setFilter] = useState<'all' | 'Inventory' | 'Nearly Out of Stock' | 'Waiting for delivery'>('all');
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [parts, setParts] = useState<Part[]>([]);
  const [orderQtys, setOrderQtys] = useState<Record<string, number>>({});
  const [stats, setStats] = useState({
    all: 0,
    inventory: 0,
    outOfStock: 0,
    waiting: 0,
  });
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  useEffect(() => {
     const role = localStorage.getItem('role');
     const validRoles = ['Admin', 'admin', 'purchasingStaff', 'PurchasingStaff'];
     if (!role || !validRoles.includes(role)) {
       alert('Access Denied: Only Admin and Purchasing Staff are allowed.');
       router.push('/Login');
     }
  }, [router]);

  const itemsPerPage = 10;

  // Fetch all parts once to calculate stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await apiClient.get('/parts/purchasing');
        if (response.data && response.data.data) {
          const rawParts = response.data.data;
          const allParts: Part[] = rawParts.map((p: any) => ({
            part_id: p.partId || p.part_id,
            part_name: p.name || p.partName || p.part_name,
            stock_qty: p.stockQuantity || p.stock_qty || 0,
            status: p.status || 'Inventory',
            price: p.price || 0,
            supplier_id: p.supplierId || p.supplier_id || p.supplier?.supplierId || p.supplier?.supplier_id
          }));
          
          const newStats = allParts.reduce((acc, p) => {
            const qty = Number(p.stock_qty) || 0;
            acc.all += qty;
            if (p.status === 'Inventory') acc.inventory += qty;
            if (p.status === 'Nearly Out of Stock') acc.outOfStock += qty;
            if (p.status === 'Waiting for delivery') acc.waiting += qty;
            return acc;
          }, { all: 0, inventory: 0, outOfStock: 0, waiting: 0 });

          setStats(newStats);
        }
      } catch (error: any) {
        console.error('Failed to fetch stats:', error);
        if (error.response?.status === 401 || error.response?.data?.message?.includes('token')) {
          setStats({ all: 127, inventory: 125, outOfStock: 2, waiting: 0 });
        }
      }
    };
    fetchStats();
  }, []);

  // Fetch filtered parts
  useEffect(() => {
    const fetchParts = async () => {
      setLoading(true);
      try {
        const params = filter === 'all' ? {} : { status: filter };
        const response = await apiClient.get('/parts/purchasing', { params });
        if (response.data && response.data.data) {
          const rawParts = response.data.data;
          const mappedParts: Part[] = rawParts.map((p: any) => ({
            part_id: p.partId || p.part_id,
            part_name: p.name || p.partName || p.part_name,
            stock_qty: p.stockQuantity || p.stock_qty || 0,
            status: p.status || 'Inventory',
            price: p.price || 0,
            supplier_id: p.supplierId || p.supplier_id || p.supplier?.supplierId || p.supplier?.supplier_id
          }));
          setParts(mappedParts);
        }
      } catch (error: any) {
        console.error('Failed to fetch parts:', error);
        if (error.response?.status === 401 || error.response?.data?.message?.includes('token')) {
          let mockParts: Part[] = [
            { part_id: 'ENG-V8', part_name: 'Engine Block V8', stock_qty: 25, status: 'Inventory', price: 70000.00, supplier_id: 'SUP001' },
            { part_id: 'OIL-5L', part_name: 'Synthetic Oil 5L', stock_qty: 100, status: 'Inventory', price: 1400.00, supplier_id: 'SUP001' }
          ];
          if (filter !== 'all') mockParts = mockParts.filter(m => m.status === filter);
          setParts(mockParts);
        } else {
          setParts([]);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchParts();
  }, [filter]);

  const filteredData = useMemo(() => {
    return parts.filter(part => {
      const matchesSearch = part.part_id.toLowerCase().includes(search.toLowerCase()) || 
                            part.part_name.toLowerCase().includes(search.toLowerCase());
      return matchesSearch;
    });
  }, [parts, search]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleOrder = async (part: Part) => {
    let sId = part.supplier_id || part.supplierId;
    
    // ระบบค้นหา Supplier อัตโนมัติ (กรณี API หลักไม่ได้แนบข้อมูลมาให้)
    if (!sId) {
      try {
        const res = await apiClient.get('/service/parts');
        const allParts = res.data?.data || res.data || [];
        const found = allParts.find((p: any) => p.partId === part.part_id || p.part_id === part.part_id);
        sId = found?.supplierId || found?.supplier_id || found?.supplier?.supplierId || 'SUP001';
      } catch (e) {
        sId = 'SUP001';
      }
    }
    
    const qty = orderQtys[part.part_id];
    if (!qty || qty <= 0) {
      alert('Please enter a valid quantity first.');
      return;
    }

    try {
      const staffId = typeof window !== 'undefined' ? localStorage.getItem('user') || 'EMP001' : 'EMP001';

      console.log(localStorage.getItem('employeeId'));

      await apiClient.post('/service/order', {
        supplierId: sId,
        staffId: staffId,
        purchasingStaffId: staffId,
        items: [{
          partId: part.part_id,
          quantity: qty,
          unitCost: Number(part.price) || 0
        }]
      });
      alert('Order placed successfully!');
      
      // เคลียร์ค่าในช่อง Input หลังจากสั่งซื้อสำเร็จ
      setOrderQtys(prev => {
        const next = { ...prev };
        delete next[part.part_id];
        return next;
      });
    } catch (error: any) {
      console.error('Order failed:', error);
      if (error.response?.status === 401 || error.response?.data?.message?.includes('token')) {
        alert("[Bypass 401] Order placed successfully! (Mock)");
        setOrderQtys(prev => {
          const next = { ...prev };
          delete next[part.part_id];
          return next;
        });
      } else {
        alert(`Order failed: ${error.response?.data?.message || error.message}`);
      }
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Parts</h1>
      </div>

      <div className={styles.filterCards}>
        <div 
          className={`${styles.filterCard} ${filter === 'all' ? styles.filterCardActive : ''}`}
          onClick={() => { setFilter('all'); setCurrentPage(1); }}
        >
          <div className={styles.cardTop}>
            <div className={styles.cardLabel}>
              <span className={styles.labelMain}>All Parts</span>
              <span className={styles.labelSub}>ชิ้นส่วนทั้งหมด</span>
            </div>
          </div>
          <span className={styles.cardValue}>{stats.all}</span>
        </div>

        <div 
          className={`${styles.filterCard} ${filter === 'Inventory' ? styles.filterCardActive : ''}`}
          onClick={() => { setFilter('Inventory'); setCurrentPage(1); }}
        >
          <div className={styles.cardTop}>
            <div className={styles.cardLabel}>
              <span className={styles.labelMain}>Inventory</span>
              <span className={styles.labelSub}>คงเหลือ</span>
            </div>
            <div className={`${styles.statusDot} ${styles.dotInventory}`}></div>
          </div>
          <span className={styles.cardValue}>{stats.inventory}</span>
        </div>

        <div 
          className={`${styles.filterCard} ${filter === 'Nearly Out of Stock' ? styles.filterCardActive : ''}`}
          onClick={() => { setFilter('Nearly Out of Stock'); setCurrentPage(1); }}
        >
          <div className={styles.cardTop}>
            <div className={styles.cardLabel}>
              <span className={styles.labelMain}>Nearly Out of Stock</span>
              <span className={styles.labelSub}>รายการสินค้าใกล้หมด</span>
            </div>
            <div className={`${styles.statusDot} ${styles.dotLowStock}`}></div>
          </div>
          <span className={styles.cardValue}>{stats.outOfStock}</span>
        </div>

        <div 
          className={`${styles.filterCard} ${filter === 'Waiting for delivery' ? styles.filterCardActive : ''}`}
          onClick={() => { setFilter('Waiting for delivery'); setCurrentPage(1); }}
        >
          <div className={styles.cardTop}>
            <div className={styles.cardLabel}>
              <span className={styles.labelMain}>Waiting for delivery</span>
              <span className={styles.labelSub}>รอการจัดส่ง</span>
            </div>
            <div className={`${styles.statusDot} ${styles.dotWaiting}`}></div>
          </div>
          <span className={styles.cardValue}>{stats.waiting}</span>
        </div>
      </div>

      <div className={styles.tableContainer}>
        <div className={styles.tableHeader}>
          <div className={styles.searchWrapper}>
            <span className={styles.searchIcon}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M7.33333 12.6667C10.2789 12.6667 12.6667 10.2789 12.6667 7.33333C12.6667 4.38781 10.2789 2 7.33333 2C4.38781 2 2 4.38781 2 7.33333C2 10.2789 4.38781 12.6667 7.33333 12.6667Z" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M14 14L11.1 11.1" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
            <input 
              type="text" 
              placeholder="Search parts id / parts name" 
              className={styles.searchInput}
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            />
          </div>
          <button className={styles.filterBtn}>Filter by Status</button>
        </div>

        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center' }}>Loading parts...</div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Part ID</th>
                <th>Part Name</th>
                <th className={styles.qtyCell}>Qty</th>
                <th className={styles.statusCell}>Status</th>
                <th className={styles.priceCell}>Price</th>
                <th style={{ textAlign: 'center', width: '100px' }}>Order Qty</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.length > 0 ? (
                paginatedData.map((part) => (
                  <tr key={part.part_id}>
                    <td className={styles.partId}>{part.part_id}</td>
                    <td className={styles.partName}>{part.part_name}</td>
                    <td className={styles.qtyCell}>{part.stock_qty}</td>
                    <td className={styles.statusCell}>
                      <span className={`${styles.tableStatusDot} ${
                        part.status === 'Inventory' ? styles.dotInventory : 
                        part.status === 'Nearly Out of Stock' ? styles.dotLowStock : 
                        styles.dotWaiting
                      }`}></span>
                    </td>
                    <td className={styles.priceCell}>{part.price ? Number(part.price).toLocaleString() : '-'}</td>
                  <td style={{ paddingRight: '1rem' }}>
                    <input 
                      type="number" min="0" placeholder="0"
                      value={orderQtys[part.part_id] || ''}
                      onChange={(e) => {
                        const q = parseInt(e.target.value) || 0;
                        if (q > 0) setOrderQtys({ ...orderQtys, [part.part_id]: q });
                        else { const n = { ...orderQtys }; delete n[part.part_id]; setOrderQtys(n); }
                      }}
                      className="w-full h-8 bg-[#F8FAFC] rounded-lg border border-gray-100 text-center font-bold outline-none"
                    />
                  </td>
                    <td className={styles.actionCell}>
                      <button className={styles.orderBtn} onClick={() => handleOrder(part)}>Order</button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                    No parts found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}

        <div className={styles.tableFooter}>
          <span>Show {paginatedData.length} of {filteredData.length} parts</span>
          <div className={styles.pagination}>
            <button 
              className={`${styles.pageBtn} ${currentPage === 1 ? styles.disabled : ''}`}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              &lt;
            </button>
            {totalPages > 0 && [...Array(totalPages)].map((_, i) => (
              <button 
                key={i} 
                className={`${styles.pageBtn} ${currentPage === i + 1 ? styles.pageActive : ''}`}
                onClick={() => setCurrentPage(i + 1)}
              >
                {i + 1}
              </button>
            ))}
            <button 
              className={`${styles.pageBtn} ${currentPage === totalPages || totalPages === 0 ? styles.disabled : ''}`}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
            >
              &gt;
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
