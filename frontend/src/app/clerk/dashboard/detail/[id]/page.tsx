import SidebarClerk from '@/components/SidebarClerk'
import TopNavClerk from '@/components/TopNavClerk'
import Link from 'next/link'
import apiClient from '@/services/apiClient';
import styles from './page.module.css';



export default async function ServiceDetailDynamic({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  let apiData = null;
  try {
    const response = await apiClient.get('/service/service-request');
    if (response.data && response.data.data) {
      const match = response.data.data.find((item: any) => String(item.requestId) === id || item.requestId === id);
      if (match) {
        apiData = {
          id: match.requestId,
          customer: match.customerName || "-",
          model: "-",
          color: "-",
          plate: match.plateNumber || "-",
          vehicleName: "-",
          year: "-",
          appointment: {
            checkIn: match.checkingDate ? new Date(match.checkingDate).toLocaleDateString('th-TH') : "- / - / -",
            repair: "- / - / -",
            estimatedDays: "-",
            estimatedHours: "-",
            estimatedMins: "-"
          },
          jobs: match.problemDescription ? [{
            id: 1,
            startDate: match.checkingDate ? new Date(match.checkingDate).toLocaleDateString('th-TH') : "-",
            endDate: "-",
            status: match.requestStatus || "Pending",
            detail: match.problemDescription,
            assignments: match.clerkName ? [{ id: "clerk", name: match.clerkName }] : []
          }] : [],
          invoice: {
            parts: [],
            labor: "0.00",
            tax: "0.00",
            total: "0.00"
          }
        };
      }
    }
  } catch (error) {
    console.error(`Error fetching service detail for ${id}:`, error);
  }
  
  // Only use API data or a default empty structure if not found
  const data = apiData || {
    id: id,
    customer: "ไม่พบข้อมูลในระบบ",
    model: "-",
    color: "-",
    plate: "-",
    vehicleName: "-",
    year: "-",
    appointment: {
      checkIn: "- / - / -",
      repair: "- / - / -",
      estimatedDays: "-",
      estimatedHours: "-",
      estimatedMins: "-"
    },
    jobs: [],
    invoice: {
      parts: [],
      labor: "0.00",
      tax: "0.00",
      total: "0.00"
    }
  };

  return (
    <div className={styles.container}>
      <SidebarClerk />
      <TopNavClerk />
      
      <main className={styles.main}>
        <div className={styles.content}>
          <div className={styles.header}>
            <div>
              <h1 className={styles.title}>Service Detail - #{data.id}</h1>
              <Link href="/clerk/dashboard" className={styles.backLink}>
                &lt; back to dashboard
              </Link>
            </div>
          </div>

          {/* Customer Info Card */}
          <div className={styles.infoCard}>
            {/* Left Side */}
            <div className={styles.infoGrid}>
              <div>
                <div className={styles.infoLabel}>NAME</div>
                <div className={styles.infoValue}>{data.customer}</div>
              </div>
              <div>
                <div className={styles.infoLabel}>MODEL</div>
                <div className={styles.infoValue}>{data.model}</div>
              </div>
              <div>
                <div className={styles.infoLabel}>COLOR</div>
                <div className={styles.infoValue}>{data.color}</div>
              </div>
              <div>
                <div className={styles.infoLabel}>PLATE NAME</div>
                <div className={styles.infoValue}>{data.plate}</div>
              </div>
              <div>
                <div className={styles.infoLabel}>VEHICLE NAME</div>
                <div className={styles.infoValue}>{data.vehicleName}</div>
              </div>
              <div>
                <div className={styles.infoLabel}>YEAR</div>
                <div className={styles.infoValue}>{data.year}</div>
              </div>
            </div>
            
            {/* Right Side */}
            <div className={styles.appointmentSection}>
               <div className={styles.infoLabel}>APPOINTMENT</div>
               <div className={styles.appointmentRows}>
                 <div className={styles.appointmentRow}>
                    <div className={styles.appointmentLabel}>เข้ารับตรวจ :</div>
                    <div className={styles.appointmentValue}>{data.appointment.checkIn}</div>
                    <div className={styles.appointmentLabelRight}>นัดซ่อม :</div>
                    <div className={styles.appointmentValue}>{data.appointment.repair}</div>
                 </div>
                 <div className={styles.estimationRow}>
                    <div className={styles.estimationLabel}>เวลาคาดการณ์ดำเนินการซ่อม</div>
                    <div className={styles.estimationLabelMargin}>จำนวนวัน :</div>
                    <div className={styles.estimationValue}>{data.appointment.estimatedDays}</div>
                    <div className={styles.estimationLabel}>ชั่วโมง :</div>
                    <div className={styles.estimationValueHighlight}>{data.appointment.estimatedHours}</div>
                    <div className={styles.estimationLabel}>นาที :</div>
                    <div className={styles.estimationValueHighlight}>{data.appointment.estimatedMins}</div>
                 </div>
               </div>
            </div>
          </div>

          {/* Service Job Section */}
          <h2 className={styles.sectionTitle}>Service Job</h2>
          <div className={styles.jobSection}>
            {data.jobs.length === 0 ? (
              <div className={styles.emptyMessage}>ไม่มีข้อมูล Service Job (เนื่องจากเป็นข้อมูลจำลอง)</div>
            ) : (
              data.jobs.map((job: any) => (
                <div key={job.id} className={styles.jobCard}>
                  <div className={styles.jobHeader}>
                    <h3 className={styles.jobTitle}>Service Job detail {job.id}</h3>
                    <div className={styles.jobControls}>
                      <div className={styles.dateGroup}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <div className={styles.dateBox}>{job.startDate}</div>
                        <span className={styles.dateSeparator}>-</span>
                        <div className={styles.dateBox}>{job.endDate}</div>
                      </div>
                      {job.status === "Complete" ? (
                        <div className={styles.statusComplete}>Complete</div>
                      ) : (
                        <div className={styles.statusInProgress}>In Progress</div>
                      )}
                    </div>
                  </div>

                  <div className={styles.detailBlock}>
                    <div className={styles.detailLabel}>Detail</div>
                    <div className={styles.detailBox}>{job.detail}</div>
                  </div>

                  <div className={styles.grid2}>
                    <div>
                      <div className={styles.detailLabel}>Part</div>
                      <div className={styles.partBox}>
                        <div className={styles.partIconGroup}>
                          <div className={styles.partDot}></div>
                          {job.part}
                        </div>
                        <span className={styles.partQty}>{job.qty} เครื่อง</span>
                      </div>
                    </div>
                    <div>
                      <div className={styles.detailLabel}>Assignment</div>
                      <div className={styles.assignBox}>
                        <div className={styles.assignHeader}>
                          <div className={styles.assignCol1}>ID</div>
                          <div className={styles.assignCol2}>NAME</div>
                        </div>
                        {job.assignments.map((assignment: any, idx: number) => (
                          <div key={idx} className={idx % 2 === 0 ? styles.assignRowEven : styles.assignRowOdd}>
                            <div className={styles.assignId}>{assignment.id}</div>
                            <div className={styles.assignName}>{assignment.name}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Invoice Section */}
          <h2 className={styles.sectionTitle}>Invoice</h2>
          <div className={styles.invoiceSection}>
             <div className={styles.invoiceWrapper}>
               <div className={styles.invoiceHeader}>
                 <div className={styles.invColName}>PART NAME</div>
                 <div className={styles.invColQty}>Qty used</div>
                 <div className={styles.invColPrice}>PRICE</div>
               </div>
               
               {data.invoice.parts.length === 0 ? (
                 <div className={styles.emptyMessage}>ไม่มีข้อมูล Invoice</div>
               ) : (
                 data.invoice.parts.map((part: any, idx: number) => (
                   <div key={idx} className={idx % 2 === 0 ? styles.invRowEven : styles.invRowOdd}>
                     <div className={styles.invNameGroup}>
                       <div className={styles.invDot}></div>
                       {part.name}
                     </div>
                     <div className={styles.invQtyVal}>{part.qty}</div>
                     <div className={styles.invPriceVal}>{part.price}</div>
                   </div>
                 ))
               )}
               
               <div className={styles.invSummary}>
                 <div className={styles.invSumRow}>
                   <div>ค่าแรงรวม</div>
                   <div className={styles.invSumVal}>{data.invoice.labor}</div>
                 </div>
                 <div className={styles.invSumRow}>
                   <div>ภาษี (7%)</div>
                   <div className={styles.invSumVal}>{data.invoice.tax}</div>
                 </div>
                 <div className={styles.invTotalRow}>
                   <div>สรุปรายการ</div>
                   <div className={styles.invTotalVal}>{data.invoice.total}</div>
                 </div>
               </div>
             </div>
          </div>
        </div>
      </main>
    </div>
  )
}
