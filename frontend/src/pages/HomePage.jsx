import { useContext } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { AppContext } from '../App'
import styles from './HomePage.module.css'

const DISTRICTS = ['Каракол', 'Ак-Суу', 'Тюп', 'Жети-Огуз', 'Тон', 'Чолпон-Ата']

export default function HomePage() {
  const { categories } = useContext(AppContext)
  const navigate = useNavigate()

  const goCategory = (name) => navigate(`/catalog?category=${encodeURIComponent(name)}`)
  const goDistrict = (name) => navigate(`/catalog?district=${encodeURIComponent(name)}`)

  return (
    <div className={styles.page}>

      {/* Hero */}
      <section className={styles.hero}>
        <div className="container">
          <div className={styles.heroContent}>
            <div className={styles.heroTag}>📍 Иссык-Кульская область</div>
            <h1 className={styles.heroTitle}>
              Найдите нужный<br/>
              <span>бизнес или мастера</span>
            </h1>
            <p className={styles.heroSub}>
              Бесплатный справочник услуг Каракола и Иссык-Куля.
              Кафе, мастера, репетиторы — всё в одном месте.
            </p>
            <div className={styles.heroActions}>
              <Link to="/catalog" className="btn btn-primary">
                🔍 Найти услугу
              </Link>
              <Link to="/register" className="btn btn-outline">
                📋 Добавить бизнес
              </Link>
            </div>
          </div>
          <div className={styles.heroLogo}>
            <img src="/logo-icon.png" alt="Kabarman" className={styles.heroLogoImg} />
          </div>
        </div>
      </section>

      {/* Категории */}
      <section className={styles.section}>
        <div className="container">
          <h2 className={styles.sectionTitle}>Категории услуг</h2>
          <div className={styles.catsGrid}>
            {categories.map(cat => (
              <button key={cat.id} onClick={() => goCategory(cat.name)} className={styles.catCard}>
                <span className={styles.catEmoji}>{cat.emoji}</span>
                <span className={styles.catName}>{cat.name}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Районы */}
      <section className={styles.section} style={{background: 'var(--gray-light)', padding: '48px 0'}}>
        <div className="container">
          <h2 className={styles.sectionTitle}>Районы Иссык-Куля</h2>
          <div className={styles.districtsGrid}>
            {DISTRICTS.map(d => (
              <button key={d} onClick={() => goDistrict(d)} className={styles.districtCard}>
                <span>📍</span> {d}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className={styles.ctaSection}>
        <div className="container">
          <div className={styles.ctaBox}>
            <img src="/logo-icon.png" alt="" className={styles.ctaLogo} />
            <div className={styles.ctaText}>
              <h2>Вы владелец бизнеса или мастер?</h2>
              <p>Разместите профиль бесплатно. После проверки вы появитесь в каталоге и начнёте получать клиентов.</p>
            </div>
            <div className={styles.ctaButtons}>
              <Link to="/register" className="btn btn-primary">
                Добавить бесплатно →
              </Link>
              <a href="https://t.me/kabarmanbot" target="_blank" className="btn btn-outline">
                ✈️ Через Telegram
              </a>
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}
