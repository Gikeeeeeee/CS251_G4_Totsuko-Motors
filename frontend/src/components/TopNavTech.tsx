import Image from 'next/image'
import UserAvatar from '@/public/User.png'
import styles from './TopNavTech.module.css'

export default function TopNavTech() {
  return (
    <header className={styles.topNav}>
      <div className={styles.spacer}></div>
      <div className={styles.userSection}>
        <div className={styles.divider}></div>
        <div className={styles.userInfo}>
          <div className={styles.userText}>
            <div className={styles.userName}>Theethad Pooad</div>
            <div className={styles.userRole}>Technician</div>
          </div>
          <Image
            src={UserAvatar}
            alt="User"
            width={40}
            height={40}
            className={styles.avatar}
          />
        </div>
      </div>
    </header>
  )
}
