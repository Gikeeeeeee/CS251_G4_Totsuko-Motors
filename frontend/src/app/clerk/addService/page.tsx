'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import SidebarClerk from '@/components/SidebarClerk'
import TopNavClerk from '@/components/TopNavClerk'
import styles from './page.module.css'

export default function AddServicePage() {
  const router = useRouter()

  useEffect(() => {
    const role = localStorage.getItem('role');
    const validRoles = ['Admin', 'admin', 'clerk', 'Clerk'];
    if (!role || !validRoles.includes(role)) {
      alert('Access Denied: Only Admin and Clerk are allowed.');
      router.push('/Login');
    }
  }, [router]);

  const [formData, setFormData] = useState({
    customerName: '',
    phoneNumber: '',
    backupPhone: '',
    email: '',
    vehiclePlate: '',
    brand: '',
    model: '',
    year: '',
    vehicleType: '',
    mileage: '',
    color: '',
    problemDescription: '',
    technician: ''
  })

  const [errors, setErrors] = useState<{[key: string]: string}>({})
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [serviceId, setServiceId] = useState('')

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

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'กรุณากรอกอีเมล'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'รูปแบบอีเมลไม่ถูกต้อง'
    }

    // Vehicle Plate validation
    if (!formData.vehiclePlate.trim()) {
      newErrors.vehiclePlate = 'กรุณากรอกทะเบียนรถ'
    }

    // Brand validation
    if (!formData.brand.trim()) {
      newErrors.brand = 'กรุณากรอกยี่ห้อรถ'
    }

    // Model validation
    if (!formData.model.trim()) {
      newErrors.model = 'กรุณากรอกรุ่นรถ'
    }

    // Year validation
    if (!formData.year.trim()) {
      newErrors.year = 'กรุณากรอกปีรถ'
    } else if (!/^[0-9]{4}$/.test(formData.year)) {
      newErrors.year = 'ปีรถต้องเป็นตัวเลข 4 หลัก'
    } else {
      const yearNum = parseInt(formData.year)
      const currentYear = new Date().getFullYear()
      if (yearNum < 1900 || yearNum > currentYear + 1) {
        newErrors.year = `ปีรถต้องอยู่ระหว่าง 1970-${currentYear}`
      }
    }

    // Vehicle Type validation
    if (!formData.vehicleType) {
      newErrors.vehicleType = 'กรุณาเลือกประเภทรถ'
    }

    // Mileage validation
    if (!formData.mileage.trim()) {
      newErrors.mileage = 'กรุณากรอกเลขไมล์'
    } else if (!/^[0-9,]+$/.test(formData.mileage)) {
      newErrors.mileage = 'เลขไมล์ต้องเป็นตัวเลขเท่านั้น'
    }

    // Color validation
    if (!formData.color.trim()) {
      newErrors.color = 'กรุณากรอกสีรถ'
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

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    if (validateForm()) {
      // Generate service ID
      const newServiceId = 'SV' + Math.random().toString(36).substring(2, 11).toUpperCase()
      setServiceId(newServiceId)
      
      console.log('Form submitted:', formData)
      setShowSuccessModal(true)
    }
  }

  const handleClear = () => {
    setFormData({
      customerName: '',
      phoneNumber: '',
      backupPhone: '',
      email: '',
      vehiclePlate: '',
      brand: '',
      model: '',
      year: '',
      vehicleType: '',
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
              {/* Customer Information Section */}
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Customer Information</h3>
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
                  <div className={styles.formField}>
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
                  <div className={styles.formField}>
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
                      Email<span className={styles.required}>*</span>
                    </label>
                    <input
                      type="email"
                      className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
                      placeholder="example@email.com"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                    {errors.email && <span className={styles.errorText}>{errors.email}</span>}
                  </div>
                </div>
              </div>

              {/* Vehicle Information Section */}
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Vehicle Information</h3>
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
                    <label className={styles.label}>
                      Brand<span className={styles.required}>*</span>
                    </label>
                    <input
                      type="text"
                      className={`${styles.input} ${errors.brand ? styles.inputError : ''}`}
                      placeholder="e.g. BMW"
                      value={formData.brand}
                      onChange={(e) => setFormData({...formData, brand: e.target.value})}
                    />
                    {errors.brand && <span className={styles.errorText}>{errors.brand}</span>}
                  </div>
                  <div className={styles.formField}>
                    <label className={styles.label}>
                      Model<span className={styles.required}>*</span>
                    </label>
                    <input
                      type="text"
                      className={`${styles.input} ${errors.model ? styles.inputError : ''}`}
                      placeholder="e.g. M3 GTR"
                      value={formData.model}
                      onChange={(e) => setFormData({...formData, model: e.target.value})}
                    />
                    {errors.model && <span className={styles.errorText}>{errors.model}</span>}
                  </div>
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formField}>
                    <label className={styles.label}>
                      Year<span className={styles.required}>*</span>
                    </label>
                    <input
                      type="text"
                      className={`${styles.input} ${errors.year ? styles.inputError : ''}`}
                      placeholder="2022"
                      value={formData.year}
                      onChange={(e) => setFormData({...formData, year: e.target.value})}
                    />
                    {errors.year && <span className={styles.errorText}>{errors.year}</span>}
                  </div>
                  <div className={styles.formField}>
                    <label className={styles.label}>
                      Vehicle Type<span className={styles.required}>*</span>
                    </label>
                    <select
                      className={`${styles.select} ${errors.vehicleType ? styles.inputError : ''}`}
                      value={formData.vehicleType}
                      onChange={(e) => setFormData({...formData, vehicleType: e.target.value})}
                    >
                      <option value="">Select vehicle type</option>
                      <option value="sedan">Sedan</option>
                      <option value="suv">SUV</option>
                      <option value="truck">Truck</option>
                      <option value="van">Van</option>
                      <option value="coupe">Coupe</option>
                      <option value="hatchback">Hatchback</option>
                      <option value="motorcycle">Motorcycle</option>
                    </select>
                    {errors.vehicleType && <span className={styles.errorText}>{errors.vehicleType}</span>}
                  </div>
                  <div className={styles.formField}>
                    <label className={styles.label}>
                      Color<span className={styles.required}>*</span>
                    </label>
                    <input
                      type="text"
                      className={`${styles.input} ${errors.color ? styles.inputError : ''}`}
                      placeholder="e.g. Red / Green / Blue"
                      value={formData.color}
                      onChange={(e) => setFormData({...formData, color: e.target.value})}
                    />
                    {errors.color && <span className={styles.errorText}>{errors.color}</span>}
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
                </div>
              </div>

              {/* Service Details Section */}
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Service Details</h3>
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
                  >
                    <option value="">Select a technician</option>
                    <option value="tech1">Technician 1</option>
                    <option value="tech2">Technician 2</option>
                    <option value="tech3">Technician 3</option>
                  </select>
                  {errors.technician && <span className={styles.errorText}>{errors.technician}</span>}
                </div>
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
                  {formData.brand} {formData.model} ({formData.vehiclePlate})
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
