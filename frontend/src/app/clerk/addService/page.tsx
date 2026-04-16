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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Form submitted:', formData)
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
                  <label className={styles.label}>Customer Name*</label>
                  <input
                    type="text"
                    className={styles.input}
                    placeholder="e.g. นวพรรณ เอกดิษฐ์"
                    value={formData.customerName}
                    onChange={(e) => setFormData({...formData, customerName: e.target.value})}
                  />
                </div>
                <div className={styles.formFieldSmall}>
                  <label className={styles.label}>Phone Number*</label>
                  <input
                    type="tel"
                    className={styles.input}
                    placeholder="099889199"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                  />
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
                  <label className={styles.label}>Vehicle Plate*</label>
                  <input
                    type="text"
                    className={styles.input}
                    placeholder="ลว 1234"
                    value={formData.vehiclePlate}
                    onChange={(e) => setFormData({...formData, vehiclePlate: e.target.value})}
                  />
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
                  <label className={styles.label}>Mileage (Odometer)*</label>
                  <input
                    type="text"
                    className={styles.input}
                    placeholder="e.g. 25,000"
                    value={formData.mileage}
                    onChange={(e) => setFormData({...formData, mileage: e.target.value})}
                  />
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
                <label className={styles.label}>Problem Description*</label>
                <textarea
                  className={styles.textarea}
                  placeholder="ลูกค้าบอกมีเสียงแปลกๆตอนเหยียบเบรคบริเวณด้านหน้าตัวรถ"
                  value={formData.problemDescription}
                  onChange={(e) => setFormData({...formData, problemDescription: e.target.value})}
                />
              </div>

              <div className={styles.formFieldFull}>
                <label className={styles.label}>Select technician for inspection*</label>
                <select
                  className={styles.select}
                  value={formData.technician}
                  onChange={(e) => setFormData({...formData, technician: e.target.value})}
                >
                  <option value="">Select a technician</option>
                  <option value="tech1">Technician 1</option>
                  <option value="tech2">Technician 2</option>
                  <option value="tech3">Technician 3</option>
                </select>
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
