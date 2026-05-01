'use client';

import React, { useState, useEffect } from 'react';
import SidebarClerk from '@/components/SidebarClerk';
import TopNavClerk from '@/components/TopNavClerk';
import styles from './page.module.css';
import apiClient from '@/services/apiClient';

export default function ClerkBilling() {
  const [billingList, setBillingList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    const fetchBillingData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // ใช้ API เส้นเดียวที่ Join ข้อมูลมาให้ครบแล้ว
        const res = await apiClient.get('/invoices');
        const invoices = res.data?.data ?? [];

        const merged: any[] = invoices.map((invoice: any) => ({
          invoiceId: invoice.invoice_id,
          requestId: invoice.request_id,
          customer: invoice.customer_name ?? '-',
          plate: invoice.plate_number ?? '-',
          vehicle: [
            invoice.brand,
            invoice.model,
            invoice.year ? `${invoice.year}` : '',
          ]
            .filter(Boolean)
            .join(' ') || '-',
          color: invoice.color,
          amount: parseFloat(invoice.total_amount ?? '0'),
          status: (invoice.payment_status ?? 'Unpaid').toUpperCase(),
          date: invoice.created_date ?? '-',
          problemDescription: invoice.problem_description ?? 'ซ่อมบำรุงทั่วไป',
          parts: (invoice.invoice_details ?? []).map((d: any) => ({
            name: d.details ?? '-',
            qty: 1,
            price: parseFloat(d.amount ?? '0'),
          })),
        }));

        // คำนวณ VAT (7%) และค่าแรง โดยให้ amount จาก DB เป็นยอดก่อน VAT (Subtotal)
        const withCalc = merged.map((item) => {
          const subtotal = item.amount;                           // ยอดรวมอะไหล่ + ค่าแรง
          const tax = subtotal * 0.07;                            // คำนวณ VAT 7%
          const grandTotal = subtotal + tax;                      // ยอดสุทธิรวม VAT

          const partsTotal = item.parts.reduce((sum: number, p: any) => sum + p.qty * p.price, 0);
          const labor = Math.max(0, subtotal - partsTotal);       // หาค่าแรงส่วนต่าง

          return {
            ...item,
            amount: parseFloat(grandTotal.toFixed(2)),            // อัปเดตยอด Total ให้รวม VAT แล้ว
            labor: parseFloat(labor.toFixed(2)),
            tax: parseFloat(tax.toFixed(2))
          };
        });

        setBillingList(withCalc);
        if (withCalc.length > 0) setSelectedInvoice(withCalc[0]);
      } catch (err) {
        console.error('Error fetching billing data:', err);
        setError('ไม่สามารถดึงข้อมูลบิลได้ กรุณาลองใหม่อีกครั้ง');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBillingData();
  }, []);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);

  const filteredInvoices = billingList.filter(inv => {
    const q = searchQuery.toLowerCase();
    return (
      inv.customer.toLowerCase().includes(q) ||
      inv.invoiceId.toLowerCase().includes(q) ||
      inv.requestId.toLowerCase().includes(q) ||
      inv.plate.toLowerCase().includes(q)
    );
  });

  const handlePayInvoice = async (invoiceId: string) => {
    try {
      // 1. ส่งคำสั่งไปยัง Backend เพื่ออัปเดตสถานะใน Database
      await apiClient.patch(`/invoices/${invoiceId}/pay`);

      // 2. อัปเดตข้อมูลบนหน้าจอทันที
      const updated = billingList.map(item =>
        item.invoiceId === invoiceId ? { ...item, status: 'PAID' } : item
      );
      setBillingList(updated);

      if (selectedInvoice?.invoiceId === invoiceId) {
        setSelectedInvoice({ ...selectedInvoice, status: 'PAID' });
      }

      showToast('ชำระเงินสำเร็จ!', 'success');
    } catch (err) {
      console.error('Failed to record payment', err);
      showToast('เกิดข้อผิดพลาดในการบันทึกการชำระเงิน', 'error');
    }
  };

  const handleCancelInvoice = (invoiceId: string) => {
    const updated = billingList.map(item =>
      item.invoiceId === invoiceId ? { ...item, status: 'CANCELED' } : item
    );
    setBillingList(updated);
    if (selectedInvoice?.invoiceId === invoiceId) {
      setSelectedInvoice({ ...selectedInvoice, status: 'CANCELED' });
    }
  };

  const fmt = (n: number) => n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className={styles.page}>
      <SidebarClerk />
      <TopNavClerk />

      <main className={styles.main}>
        <div className={styles.container}>
          {/* Page Header */}
          <div className={styles.pageHeader}>
            <h1 className={styles.pageTitle}>Billing</h1>
            <p className={styles.pageSubtitle}>Search for billing invoices and complete invoices.</p>
          </div>

          {/* Two-column layout */}
          <div className={styles.grid}>

            {/* ── Column 1: Search + Cards ── */}
            <div className={styles.leftPanel}>
              {/* Search */}
              <div className={styles.searchWrapper}>
                <div className={styles.searchIcon}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M11 19C15.4183 19 19 15.4183 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19Z" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M21 21L16.65 16.65" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="ค้นหาชื่อเจ้าของรถ, ทะเบียน, หรือ Invoice ID..."
                  className={styles.searchInput}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Card List */}
              <div className={styles.cardList}>
                {isLoading ? (
                  <div className={styles.emptyText}>กำลังโหลดข้อมูล...</div>
                ) : error ? (
                  <div className={styles.emptyText} style={{ color: '#ef4444' }}>{error}</div>
                ) : filteredInvoices.length === 0 ? (
                  <div className={styles.emptyText}>ไม่พบข้อมูลที่ค้นหา</div>
                ) : (
                  filteredInvoices.map((inv) => {
                    const isActive = selectedInvoice?.invoiceId === inv.invoiceId;
                    return (
                      <div
                        key={inv.invoiceId}
                        onClick={() => setSelectedInvoice(inv)}
                        className={`${styles.invoiceCard} ${isActive ? styles.active : styles.inactive}`}
                      >
                        {/* Left accent bar */}
                        <div className={`${styles.accentBar} ${isActive ? styles.visible : styles.hidden}`} />

                        <div className={styles.cardBody}>
                          {/* Top */}
                          <div>
                            <div className={styles.cardVehicle}>{inv.vehicle}</div>
                            <div className={styles.cardPlate}>{inv.plate}</div>
                          </div>
                          {/* Bottom */}
                          <div className={styles.cardBottomRow}>
                            <div className={styles.cardOwner}>
                              <div className={styles.cardOwnerIconWrapper}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                                  <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                  <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                              </div>
                              <span className={styles.cardOwnerName}>{inv.customer}</span>
                            </div>
                            <span className={styles.cardAmount}>B {fmt(inv.amount)}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* ── Column 2: Invoice Detail (centered) ── */}
            <div className={styles.rightPanel}>
              <div className={styles.detailCard}>
                {selectedInvoice ? (
                  <>
                    {/* Body */}
                    <div className={styles.detailBody}>
                      {/* PREVIEWING INVOICE header */}
                      <div className={styles.invoiceHeader}>
                        <div>
                          <div className={styles.previewingLabel}>Previewing Invoice</div>
                          <div className={styles.invoiceIdDisplay}>{selectedInvoice.invoiceId}</div>
                          <div className={styles.invoiceDateDisplay}>
                            date: {new Date(selectedInvoice.date).toLocaleDateString('en-US', { month: 'long', day: '2-digit', year: 'numeric' })}
                          </div>
                        </div>
                        <div className={styles.companyInfo}>
                          <div className={styles.companyName}>Totsuko Motor</div>
                          <div className={styles.companyAddress}>Thammasat University</div>
                          <div className={styles.companyEmail}>contact@totsukomotor.com</div>
                        </div>
                      </div>

                      {/* TO / SERVICE */}
                      <div className={styles.toServiceRow}>
                        <div className={styles.toServiceCol}>
                          <div className={styles.metaLabel}>TO</div>
                          <div className={styles.toName}>{selectedInvoice.customer}</div>
                          <div className={styles.vehicleBlock}>
                            <div className={styles.metaLabel}>VEHICLE DETAILS</div>
                            <div className={styles.vehicleModel}>
                              {selectedInvoice.vehicle} {selectedInvoice.color ? `(${selectedInvoice.color})` : ''}
                            </div>
                            <div className={styles.vehiclePlate}>{selectedInvoice.plate}</div>
                          </div>
                        </div>
                        <div className={styles.toServiceCol}>
                          <div className={styles.metaLabel}>SERVICE</div>
                          <div className={styles.serviceText}>
                            {selectedInvoice.problemDescription}
                          </div>
                        </div>
                      </div>

                      {/* Items Table */}
                      <div className={styles.tableWrapper}>
                        <table className={styles.itemsTable}>
                          <thead className={styles.tableHead}>
                            <tr>
                              <th>Description</th>
                              <th className={styles.thCenter}>Quantity</th>
                              <th className={styles.thRight}>Total</th>
                            </tr>
                          </thead>
                          <tbody className={styles.tableBody}>
                            {selectedInvoice.parts.map((p: any, idx: number) => (
                              <tr key={idx}>
                                <td><div className={styles.tdName}>{p.name}</div></td>
                                <td className={styles.tdQty}>{p.qty}</td>
                                <td className={styles.tdTotal}>฿ {fmt(p.qty * p.price)}</td>
                              </tr>
                            ))}

                            <tr>
                              <td><div className={styles.tdName}>VAT (7%)</div></td>
                              <td className={styles.tdQty}>1</td>
                              <td className={styles.tdTotal}>฿ {fmt(selectedInvoice.tax)}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>

                      {/* Total */}
                      <div className={styles.totalRow}>
                        <span className={styles.totalLabel}>Total Amount</span>
                        <span className={styles.totalValue}>฿ {fmt(selectedInvoice.amount)}</span>
                      </div>
                    </div>

                    {/* Footer buttons */}
                    <div className={styles.detailFooter}>
                      {selectedInvoice.status === 'UNPAID' ? (
                        <button
                          className={styles.btnPay}
                          onClick={() => handlePayInvoice(selectedInvoice.invoiceId)}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M9 12L11 14L15 10M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          Record Payment
                        </button>
                      ) : selectedInvoice.status === 'PAID' ? (
                        <div className={styles.btnPaid}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                            <path d="M5 13L9 17L19 7" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          Paid Successfully
                        </div>
                      ) : (
                        <div className={styles.btnDisabled}>
                          Canceled
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className={styles.emptyState}>
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" style={{ color: '#d1d5db', marginBottom: '1rem' }}>
                      <path d="M19.5 14.25V5.25C19.5 4.587 18.963 4.05 18.3 4.05H5.7C5.037 4.05 4.5 4.587 4.5 5.25V14.25M19.5 14.25C19.5 14.913 18.963 15.45 18.3 15.45H5.7C5.037 15.45 4.5 14.913 4.5 14.25M19.5 14.25H21V16.8M4.5 14.25H3V16.8M7.5 19.35H16.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <div className={styles.emptyStateTitle}>เลือกบิลเพื่อดูรายละเอียด</div>
                    <div className={styles.emptyStateSubtitle}>คลิกที่ Card ทางด้านซ้ายมือเพื่อดูข้อมูลบิลตัวเต็ม</div>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* Toast Notification */}
      {toast && (
        <div className={`${styles.toastContainer} ${toast.type === 'success' ? styles.toastSuccess : styles.toastError}`}>
          <div className={`${styles.toastIcon} ${toast.type === 'success' ? styles.success : styles.error}`}>
            {toast.type === 'success' ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M9 12L11 14L15 10M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22ZM12 8V12M12 16H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </div>
          <span className={styles.toastMessage}>{toast.message}</span>
        </div>
      )}
    </div>
  );
}
