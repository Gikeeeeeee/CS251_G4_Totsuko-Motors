'use client'

import { useState } from 'react'
import SidebarClerk from '@/components/SidebarClerk'
import TopNavClerk from '@/components/TopNavClerk'
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (validateForm()) {
      console.log('Form submitted:', formData)
      alert('บันทึกข้อมูลสำเร็จ!')
      handleClear()
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
                >
                  <option value="">Select a technician</option>
                  <option value="tech1">Technician 1</option>
                  <option value="tech2">Technician 2</option>
                  <option value="tech3">Technician 3</option>
                </select>
                {errors.technician && <span className={styles.errorText}>{errors.technician}</span>}
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
    </div>
  )
}
