'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import styles from './PurchasingPart.module.css'

interface Part {
  id: string;
  name: string;
  qty: number;
  status: 'inventory' | 'out_of_stock' | 'waiting';
  price: number;
}

const MOCK_DATA: Part[] = [
  { id: 'EDEJ3210490D', name: 'ENGINE AGX86-64', qty: 12, status: 'inventory', price: 130000 },
  { id: 'EDEJ3210490B', name: 'ENGINE AGX86-64 A', qty: 16, status: 'inventory', price: 145000 },
  { id: 'EDEJ3210490DA', name: 'ENGINE AGX86-64 P', qty: 20, status: 'inventory', price: 320000 },
  { id: 'EDEJ321049213', name: 'BRIDGESTONE F A(ยางหน้า)', qty: 60, status: 'inventory', price: 3000 },
  { id: 'EDEJ321049212', name: 'BRIDGESTONE B A(ยางหลัง)', qty: 65, status: 'inventory', price: 3500 },
  { id: 'EDEJ321049202', name: 'BRIDGESTONE F 02B (ยางหน้า)', qty: 12, status: 'inventory', price: 2200 },
  { id: 'EDEJ321049203', name: 'BRIDGESTONE B 02B (ยางหลัง)', qty: 9, status: 'inventory', price: 2500 },
  { id: 'EDEJ321049RF3', name: 'SPARKING PLUG', qty: 47, status: 'inventory', price: 400 },
  { id: 'FFEJOWPJPO123', name: 'HEADLIGHT', qty: 30, status: 'inventory', price: 22000 },
  { id: '4U90JFI9392772', name: 'TAIL LAMP', qty: 28, status: 'inventory', price: 30000 },
  // More data for pagination testing
  { id: 'PART-011', name: 'BRAKE PAD', qty: 5, status: 'out_of_stock', price: 1500 },
  { id: 'PART-012', name: 'AIR FILTER', qty: 2, status: 'out_of_stock', price: 800 },
  { id: 'PART-013', name: 'OIL FILTER', qty: 0, status: 'waiting', price: 500 },
  { id: 'PART-014', name: 'WIPER BLADE', qty: 15, status: 'waiting', price: 300 },
];

export default function PurchasingPartPage() {
  const [filter, setFilter] = useState<'all' | 'inventory' | 'out_of_stock' | 'waiting'>('all');
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredData = useMemo(() => {
    return MOCK_DATA.filter(part => {
      const matchesFilter = filter === 'all' || part.status === filter;
      const matchesSearch = part.id.toLowerCase().includes(search.toLowerCase()) || 
                            part.name.toLowerCase().includes(search.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [filter, search]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const stats = {
    all: MOCK_DATA.length,
    inventory: MOCK_DATA.filter(p => p.status === 'inventory').length,
    out_of_stock: MOCK_DATA.filter(p => p.status === 'out_of_stock').length,
    waiting: MOCK_DATA.filter(p => p.status === 'waiting').length,
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
          className={`${styles.filterCard} ${filter === 'inventory' ? styles.filterCardActive : ''}`}
          onClick={() => { setFilter('inventory'); setCurrentPage(1); }}
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
          className={`${styles.filterCard} ${filter === 'out_of_stock' ? styles.filterCardActive : ''}`}
          onClick={() => { setFilter('out_of_stock'); setCurrentPage(1); }}
        >
          <div className={styles.cardTop}>
            <div className={styles.cardLabel}>
              <span className={styles.labelMain}>Nearly Out of Stock</span>
              <span className={styles.labelSub}>รายการสินค้าใกล้หมด</span>
            </div>
            <div className={`${styles.statusDot} ${styles.dotLowStock}`}></div>
          </div>
          <span className={styles.cardValue}>{stats.out_of_stock}</span>
        </div>

        <div 
          className={`${styles.filterCard} ${filter === 'waiting' ? styles.filterCardActive : ''}`}
          onClick={() => { setFilter('waiting'); setCurrentPage(1); }}
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

        <table className={styles.table}>
          <thead>
            <tr>
              <th>Part ID</th>
              <th>Part Name</th>
              <th className={styles.qtyCell}>Qty</th>
              <th className={styles.statusCell}>Status</th>
              <th className={styles.priceCell}>Price</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((part) => (
              <tr key={part.id}>
                <td className={styles.partId}>{part.id}</td>
                <td className={styles.partName}>{part.name}</td>
                <td className={styles.qtyCell}>{part.qty}</td>
                <td className={styles.statusCell}>
                  <span className={`${styles.tableStatusDot} ${
                    part.status === 'inventory' ? styles.dotInventory : 
                    part.status === 'out_of_stock' ? styles.dotLowStock : 
                    styles.dotWaiting
                  }`}></span>
                </td>
                <td className={styles.priceCell}>{part.price.toLocaleString()}</td>
                <td className={styles.actionCell}>
                  <Link href="/PurchasingStaff/Vendor">
                    <button className={styles.orderBtn}>Order</button>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

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
            {[...Array(totalPages)].map((_, i) => (
              <button 
                key={i} 
                className={`${styles.pageBtn} ${currentPage === i + 1 ? styles.pageActive : ''}`}
                onClick={() => setCurrentPage(i + 1)}
              >
                {i + 1}
              </button>
            ))}
            <button 
              className={`${styles.pageBtn} ${currentPage === totalPages ? styles.disabled : ''}`}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              &gt;
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
