'use client'

import { useState, useEffect } from 'react'
import SidebarClerk from '@/components/SidebarClerk'
import TopNavClerk from '@/components/TopNavClerk'
import { getAvailableTechnicians, createService, type AvailableTechnician } from '@/services/addServiceApi'
import styles from './page.module.css'

export default function AddServicePage() {
  const [formData, setFormData] = useState({
    customerName: '',
    phoneNumber: '',
    backupPhone: '',
    vehiclePlate: '',
    brandModel: '',
    mileage: '',
    color: '',
    problemDescription: '',
    technician: ''
  })

  const [errors, setErrors] = useState<{[key: string]: string}>({})
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [serviceId, setServiceId] = useState('')
  const [availableTechnicians, setAvailableTechnicians] = useState<AvailableTechnician[]>([])
  const [isLoadingTechnicians, setIsLoadingTechnicians] = useState(true)

  useEffect(() => {
    const fetchTechnicians = async () => {
      try {
        setIsLoadingTechnicians(true)
        const technicians = await getAvailableTechnicians()
        setAvailableTechnicians(technicians)
      } catch (error) {
        console.error('Error fetching technicians:', error)
      } finally {
        setIsLoadingTechnicians(false)
      }
    }

    fetchTechnicians()
  }, [])

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {}

    // Customer Name validation
    if (!formData.customerName.trim()) {
      newErrors.customerName = 'กรุณากรอกชื่อลูกค้า'
    }

    // Phone Number validation
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'กรุณากรอกเบอร์โทรศัพท์'
    } else if (!/^[0-9]{9,10}$/.test(formData.phoneNumber.replace(/[-\s]/g, ''))) {
      newErrors.phoneNumber = 'เบอร์โทรศัพท์ไม่ถูกต้อง (ต้องเป็นตัวเลข 9-10 หลัก)'
    }

    // Vehicle Plate validation
    if (!formData.vehiclePlate.trim()) {
      newErrors.vehiclePlate = 'กรุณากรอกทะเบียนรถ'
    }

    // Mileage validation
    if (!formData.mileage.trim()) {
      newErrors.mileage = 'กรุณากรอกเลขไมล์'
    } else if (!/^[0-9,]+$/.test(formData.mileage)) {
      newErrors.mileage = 'เลขไมล์ต้องเป็นตัวเลขเท่านั้น'
    }

    // Problem Description validation
    if (!formData.problemDescription.trim()) {
      newErrors.problemDescription = 'กรุณากรอกรายละเอียดปัญหา'
    } else if (formData.problemDescription.trim().length < 10) {
      newErrors.problemDescription = 'รายละเอียดปัญหาต้องมีอย่างน้อย 10 ตัวอักษร'
    }

    // Technician validation
    if (!formData.technician) {
      newErrors.technician = 'กรุณาเลือกช่างผู้ตรวจสอบ'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    try {
      const response = await createService({
        name: formData.customerName,
        plate_number: formData.vehiclePlate,
        phone: formData.phoneNumber || undefined,
        model: formData.brandModel || undefined,
        color: formData.color || undefined,
        odometer: formData.mileage ? parseInt(formData.mileage.replace(/,/g, ''), 10) : undefined,
        problem_description: formData.problemDescription || undefined,
      })
      setServiceId(response.data.serviceRequest.requestId)
      setShowSuccessModal(true)
    } catch (error) {
      console.error('Error creating service:', error)
    }
  }

  const handleClear = () => {
    setFormData({
      customerName: '',
      phoneNumber: '',
      backupPhone: '',
      vehiclePlate: '',
      brandModel: '',
      mileage: '',
      color: '',
      problemDescription: '',
      technician: ''
    })
    setErrors({})
  }

  const handleCloseModal = () => {
    setShowSuccessModal(false)
    handleClear()
  }

  const handleGoToDashboard = () => {
    window.location.href = '/'
  }

  return (
    <div className={styles.pageContainer}>
      <SidebarClerk />
      <div className={styles.mainContent}>
        <TopNavClerk />
        <div className={styles.contentArea}>
          <div className={styles.formSection}>
            <div className={styles.header}>
              <div className={styles.headerText}>
                <h1 className={styles.heading}>Add New Service</h1>
                <p className={styles.subheading}>สร้าง service ในระบบ</p>
              </div>
            </div>

            <form className={styles.form} onSubmit={handleSubmit}>
              <div className={styles.formRow}>
                <div className={styles.formField}>
                  <label className={styles.label}>
                    Customer Name<span className={styles.required}>*</span>
                  </label>
                  <input
                    type="text"
                    className={`${styles.input} ${errors.customerName ? styles.inputError : ''}`}
                    placeholder="e.g. นวพรรณ เอกดิษฐ์"
                    value={formData.customerName}
                    onChange={(e) => setFormData({...formData, customerName: e.target.value})}
                  />
                  {errors.customerName && <span className={styles.errorText}>{errors.customerName}</span>}
                </div>
                <div className={styles.formFieldSmall}>
                  <label className={styles.label}>
                    Phone Number<span className={styles.required}>*</span>
                  </label>
                  <input
                    type="tel"
                    className={`${styles.input} ${errors.phoneNumber ? styles.inputError : ''}`}
                    placeholder="099889199"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                  />
                  {errors.phoneNumber && <span className={styles.errorText}>{errors.phoneNumber}</span>}
                </div>
                <div className={styles.formFieldSmall}>
                  <label className={styles.label}>Backup Phone</label>
                  <input
                    type="tel"
                    className={styles.input}
                    placeholder="099889199"
                    value={formData.backupPhone}
                    onChange={(e) => setFormData({...formData, backupPhone: e.target.value})}
                  />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formField}>
                  <label className={styles.label}>
                    Vehicle Plate<span className={styles.required}>*</span>
                  </label>
                  <input
                    type="text"
                    className={`${styles.input} ${errors.vehiclePlate ? styles.inputError : ''}`}
                    placeholder="ลว 1234"
                    value={formData.vehiclePlate}
                    onChange={(e) => setFormData({...formData, vehiclePlate: e.target.value})}
                  />
                  {errors.vehiclePlate && <span className={styles.errorText}>{errors.vehiclePlate}</span>}
                </div>
                <div className={styles.formField}>
                  <label className={styles.label}>Brand / Model</label>
                  <input
                    type="text"
                    className={styles.input}
                    placeholder="e.g. BMW M3 GTR"
                    value={formData.brandModel}
                    onChange={(e) => setFormData({...formData, brandModel: e.target.value})}
                  />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formField}>
                  <label className={styles.label}>
                    Mileage (Odometer)<span className={styles.required}>*</span>
                  </label>
                  <input
                    type="text"
                    className={`${styles.input} ${errors.mileage ? styles.inputError : ''}`}
                    placeholder="e.g. 25,000"
                    value={formData.mileage}
                    onChange={(e) => setFormData({...formData, mileage: e.target.value})}
                  />
                  {errors.mileage && <span className={styles.errorText}>{errors.mileage}</span>}
                </div>
                <div className={styles.formField}>
                  <label className={styles.label}>Color</label>
                  <input
                    type="text"
                    className={styles.input}
                    placeholder="e.g. Red / Green / Blue"
                    value={formData.color}
                    onChange={(e) => setFormData({...formData, color: e.target.value})}
                  />
                </div>
              </div>

              <div className={styles.formFieldFull}>
                <label className={styles.label}>
                  Problem Description<span className={styles.required}>*</span>
                </label>
                <textarea
                  className={`${styles.textarea} ${errors.problemDescription ? styles.inputError : ''}`}
                  placeholder="ลูกค้าบอกมีเสียงแปลกๆตอนเหยียบเบรคบริเวณด้านหน้าตัวรถ"
                  value={formData.problemDescription}
                  onChange={(e) => setFormData({...formData, problemDescription: e.target.value})}
                />
                {errors.problemDescription && <span className={styles.errorText}>{errors.problemDescription}</span>}
              </div>

              <div className={styles.formFieldFull}>
                <label className={styles.label}>
                  Select technician for inspection<span className={styles.required}>*</span>
                </label>
                <select
                  className={`${styles.select} ${errors.technician ? styles.inputError : ''}`}
                  value={formData.technician}
                  onChange={(e) => setFormData({...formData, technician: e.target.value})}
                  disabled={isLoadingTechnicians}
                >
                  <option value="">
                    {isLoadingTechnicians ? 'กำลังโหลดช่าง...' : 'เลือกช่างผู้ตรวจสอบ'}
                  </option>
                  {availableTechnicians.map((tech) => (
                    <option key={tech.employeeId} value={tech.employeeId}>
                      {tech.name} - {tech.specialization}
                    </option>
                  ))}
                </select>
                {errors.technician && <span className={styles.errorText}>{errors.technician}</span>}
                {!isLoadingTechnicians && availableTechnicians.length === 0 && (
                  <span className={styles.errorText}>ไม่มีช่างที่ว่างในขณะนี้</span>
                )}
              </div>

              <div className={styles.formActions}>
                <button type="button" className={styles.clearBtn} onClick={handleClear}>
                  Clear Form
                </button>
                <button type="submit" className={styles.submitBtn}>
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {showSuccessModal && (
        <div className={styles.modalOverlay} onClick={handleCloseModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeBtn} onClick={handleCloseModal}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18M6 6L18 18" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            <div className={styles.successIcon}>
              <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="32" cy="32" r="32" fill="#D1FAE5"/>
                <path d="M20 32L28 40L44 24" stroke="#10B981" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>

            <h2 className={styles.modalTitle}>Service Created Successfully</h2>
            <p className={styles.modalDescription}>
              The vehicle has been added to the active queue and assigned to a technician.
            </p>

            <div className={styles.serviceDetails}>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>SERVICE ID</span>
                <span className={styles.detailValue}>{serviceId}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>VEHICLE</span>
                <span className={styles.detailValue}>
                  {formData.brandModel || 'N/A'} ({formData.vehiclePlate})
                </span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>STATUS</span>
                <span className={styles.statusBadge}>
                  <span className={styles.statusDot}></span>
                  INTAKE
                </span>
              </div>
            </div>

            <button className={styles.dashboardBtn} onClick={handleGoToDashboard}>
              Go to Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  )
}