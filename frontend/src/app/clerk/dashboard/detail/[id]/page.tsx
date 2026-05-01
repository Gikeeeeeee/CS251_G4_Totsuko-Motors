import SidebarClerk from '@/components/SidebarClerk'
import TopNavClerk from '@/components/TopNavClerk'
import Link from 'next/link'
import apiClient from '@/services/apiClient';
import styles from './page.module.css';



export default async function ServiceDetailDynamic({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let apiData = null;
  try {
    const [requestRes, invoiceRes, apptRes, jobRes] = await Promise.allSettled([
      apiClient.get('/service/service-request?limit=1000'),
      apiClient.get(`/invoices/request/${id}`),
      apiClient.get(`/appointments/request/${id}`),
      apiClient.get(`/service/service-job/${id}`)
    ]);

    let match = null;
    if (requestRes.status === 'fulfilled' && requestRes.value.data && requestRes.value.data.data) {
      match = requestRes.value.data.data.find((item: any) => String(item.requestId) === id || item.requestId === id);
    }

    const invoiceData = invoiceRes.status === 'fulfilled' ? invoiceRes.value.data?.data : null;
    const apptData = apptRes.status === 'fulfilled' ? apptRes.value.data?.data : null;
    const jobData = jobRes.status === 'fulfilled' ? jobRes.value.data?.data : null;

    if (match) {
      // Process Appointment
      let apptObj = {
        checkIn: match.checkingDate ? new Date(match.checkingDate).toLocaleDateString('th-TH') : "- / - / -",
        repair: "- / - / -",
        estimatedDays: "-",
        estimatedHours: "-",
        estimatedMins: "-"
      };
      if (apptData && Array.isArray(apptData) && apptData.length > 0) {
        const firstAppt = apptData[0];
        if (firstAppt.appointmentDate) {
          apptObj.repair = new Date(firstAppt.appointmentDate).toLocaleDateString('th-TH');
        }
      }

      // Process Invoice
      let invoiceObj = {
        parts: [],
        labor: "0.00",
        tax: "0.00",
        total: "0.00"
      };
      if (invoiceData) {
        invoiceObj.total = invoiceData.total_amount || invoiceData.totalAmount || "0.00";
        // Calculate tax roughly or leave as 0.00 if API doesn't provide
        const totalNum = parseFloat(invoiceObj.total);
        if (!isNaN(totalNum)) {
          invoiceObj.labor = totalNum.toFixed(2);
          invoiceObj.tax = (totalNum * 0.07).toFixed(2);
          invoiceObj.total = (totalNum + parseFloat(invoiceObj.tax)).toFixed(2);
        }

        if (invoiceData.invoiceDetails && Array.isArray(invoiceData.invoiceDetails)) {
          invoiceObj.parts = invoiceData.invoiceDetails.map((detail: any) => ({
            name: detail.details || "-",
            qty: 1,
            price: detail.amount || "0.00"
          }));
        }
      }

      // Process Job
      let jobsArr: any[] = [];
      if (jobData && Array.isArray(jobData)) {
        jobsArr = jobData.map((job: any) => ({
          id: job.service_id || job.serviceId || "-",
          startDateRaw: job.start_time || job.startTime,
          endDateRaw: job.end_time || job.endTime,
          startDate: job.start_time || job.startTime ? new Date(job.start_time || job.startTime).toLocaleDateString('th-TH') : "-",
          endDate: job.end_time || job.endTime ? new Date(job.end_time || job.endTime).toLocaleDateString('th-TH') : "-",
          status: job.service_status || job.serviceStatus || "Pending",
          detail: job.service_details || job.serviceDetails || "-",
          assignments: job.technicians ? job.technicians.map((t: any) => ({ id: t.technician_id, name: t.name })) : [],
          parts: job.parts || [],
          part: job.parts && job.parts.length > 0 ? job.parts[0].part_name : "-",
          qty: job.parts && job.parts.length > 0 ? job.parts[0].quantity : 0
        }));
      } else if (jobData && (jobData.service_id || jobData.serviceId)) {
        jobsArr.push({
          id: jobData.service_id || jobData.serviceId || "-",
          startDateRaw: jobData.start_time || jobData.startTime,
          endDateRaw: jobData.end_time || jobData.endTime,
          startDate: jobData.start_time || jobData.startTime ? new Date(jobData.start_time || jobData.startTime).toLocaleDateString('th-TH') : "-",
          endDate: jobData.end_time || jobData.endTime ? new Date(jobData.end_time || jobData.endTime).toLocaleDateString('th-TH') : "-",
          status: jobData.service_status || jobData.serviceStatus || "Pending",
          detail: jobData.service_details || jobData.serviceDetails || "-",
          assignments: jobData.technicians ? jobData.technicians.map((t: any) => ({ id: t.technician_id, name: t.name })) : [],
          parts: jobData.parts || [],
          part: jobData.parts && jobData.parts.length > 0 ? jobData.parts[0].part_name : "-",
          qty: jobData.parts && jobData.parts.length > 0 ? jobData.parts[0].quantity : 0
        });
      }

      // Calculate estimated repair time from "In Progress" jobs
      const inProgressJobs = jobsArr.filter(j => 
        (j.status === "In Progress" || j.status === "In_progress") && 
        j.startDateRaw && j.endDateRaw
      );

      if (inProgressJobs.length > 0) {
        let earliestStart = new Date(inProgressJobs[0].startDateRaw).getTime();
        let latestEnd = new Date(inProgressJobs[0].endDateRaw).getTime();
        
        inProgressJobs.forEach(j => {
          const sTime = new Date(j.startDateRaw).getTime();
          const eTime = new Date(j.endDateRaw).getTime();
          if (sTime < earliestStart) earliestStart = sTime;
          if (eTime > latestEnd) latestEnd = eTime;
        });
        
        if (latestEnd > earliestStart) {
          const diffMs = latestEnd - earliestStart;
          const diffMins = Math.floor(diffMs / (1000 * 60));
          const days = Math.floor(diffMins / (24 * 60));
          const hours = Math.floor((diffMins % (24 * 60)) / 60);
          const mins = diffMins % 60;
          
          apptObj.estimatedDays = days.toString();
          apptObj.estimatedHours = hours.toString();
          apptObj.estimatedMins = mins.toString();
        }
      }

      apiData = {
        id: match.requestId,
        customer: match.customerName || "-",
        model: match.vehicleDetail?.model || match.vehicleModel || "-",
        color: match.vehicleDetail?.color || match.vehicleColor || "-",
        plate: match.vehicleDetail?.plateNumber || match.plateNumber || "-",
        vehicleName: match.vehicleDetail?.brand || match.vehicleMake || "-",
        year: match.vehicleDetail?.year || match.vehicleYear || "-",
        appointment: apptObj,
        jobs: jobsArr,
        invoice: invoiceObj
      };
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
              <div className={styles.emptyMessage}>ไม่มีข้อมูล ServiceJob</div>
            ) : (
              data.jobs.map((job: any) => (
                <div key={job.id} className={styles.jobCard}>
                  <div className={styles.jobHeader}>
                    <h3 className={styles.jobTitle}>Service Job detail {job.id}</h3>
                    <div className={styles.jobControls}>
                      <div className={styles.dateGroup}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <div className={styles.dateBox}>{job.startDate}</div>
                        <span className={styles.dateSeparator}>-</span>
                        <div className={styles.dateBox}>{job.endDate}</div>
                      </div>
                      {job.status === "Completed" ? (
                        <div className={styles.statusComplete}>Completed</div>
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
                      <div className={styles.partBox} style={{ flexDirection: 'column', gap: '0.5rem' }}>
                        {job.parts && job.parts.length > 0 ? (
                          job.parts.map((p: any, pidx: number) => (
                            <div key={pidx} style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                              <div className={styles.partIconGroup}>
                                <div className={styles.partDot}></div>
                                {p.part_name}
                              </div>
                              <span className={styles.partQty}>{p.quantity} เครื่อง</span>
                            </div>
                          ))
                        ) : (
                          <div className={styles.partIconGroup}>
                            <div className={styles.partDot}></div>
                            -
                          </div>
                        )}
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
