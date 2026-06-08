import { Link } from 'react-router-dom'
import styles from './PostChoicePage.module.css'

export default function PostChoicePage() {
  return (
    <div className={styles.page}>
      <div className="container">
        <h1 className={styles.title}>Что хотите разместить?</h1>
        <p className={styles.sub}>Выберите тип объявления</p>

        <div className={styles.cards}>
          <Link to="/listings/new" className={styles.card}>
            <div className={styles.icon}>🛍</div>
            <div className={styles.cardTitle}>Продаю товар</div>
            <div className={styles.cardDesc}>
              Авто, скот, электроника, одежда, мебель и всё остальное
            </div>
            <span className={styles.arrow}>→</span>
          </Link>

          <Link to="/register" className={`${styles.card} ${styles.cardService}`}>
            <div className={styles.icon}>🔧</div>
            <div className={styles.cardTitle}>Предлагаю услугу</div>
            <div className={styles.cardDesc}>
              Мастер, компания, кафе, СТО, репетитор — любой бизнес или услуга
            </div>
            <span className={styles.arrow}>→</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
