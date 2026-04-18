import styles from './TopNavClerk.module.css'

export default function TopNavClerk() {
  return (
    <header className={styles.topNav}>
      <div className={styles.spacer}></div>
      <div className={styles.userSection}>
        <div className={styles.divider}></div>
        <div className={styles.userInfo}>
          <div className={styles.userText}>
            <div className={styles.userName}>Jamelo</div>
            <div className={styles.userRole}>Tecnician</div>
          </div>
          <div className={styles.avatar}></div>
        </div>
      </div>
    </header>
  )
}
