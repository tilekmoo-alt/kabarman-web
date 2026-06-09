import { useContext, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AppContext } from '../App'
import { listingsApi } from '../utils/api'
import styles from './HomePage.module.css'

const LISTING_CATS = [
  { emoji: '🚗', name: 'Транспорт' },
  { emoji: '🐄', name: 'Скот и животные' },
  { emoji: '🐑', name: 'Арашан' },
  { emoji: '🏠', name: 'Недвижимость' },
  { emoji: '🍎', name: 'Еда и продукты' },
  { emoji: '📱', name: 'Электроника' },
  { emoji: '👗', name: 'Одежда и обувь' },
  { emoji: '🏗', name: 'Стройматериалы' },
  { emoji: '📦', name: 'Другое' },
]

export default function HomePage() {
  const { categories } = useContext(AppContext)
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [recent, setRecent] = useState([])

  useEffect(() => {
    listingsApi.getAll({ limit: 12 })
      .then(r => setRecent(r.data.listings || []))
      .catch(() => {})
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    const q = search.trim()
    navigate(q ? `/search?q=${encodeURIComponent(q)}` : '/search')
  }

  return (
    <div className={styles.page}>

      {/* Hero */}
      <section className={styles.hero}>
        <div className="container">
          <div className={styles.heroContent}>
            <div className={styles.heroTag}>🇰🇬 Кыргызстан</div>
            <h1 className={styles.heroTitle}>
              Покупай, продавай<br/>
              <span>и находи услуги</span>
            </h1>
            <p className={styles.heroSub}>
              Объявления о товарах и справочник бизнеса — всё в одном месте
            </p>
            <form onSubmit={handleSearch} className={styles.searchBox}>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Поиск: Toyota, iPhone, сантехник..."
                className={styles.searchInput}
              />
              <button type="submit" className={styles.searchBtn}>🔍 Найти</button>
            </form>
          </div>
          <div className={styles.heroLogo}>
            <img src="/logo-icon.png" alt="Kabarman" className={styles.heroLogoImg} />
          </div>
        </div>
      </section>

      {/* Главное действие */}
      <section className={styles.actionsSection}>
        <div className="container">
          <div className={styles.actionCards}>
            <Link to="/post" className={styles.actionCard}>
              <div className={styles.actionIcon}>📢</div>
              <div className={styles.actionText}>
                <div className={styles.actionTitle}>Подать объявление</div>
                <div className={styles.actionSub}>Продайте товар или предложите услугу — бесплатно</div>
              </div>
              <span className={styles.actionArrow}>→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Свежие объявления */}
      {recent.length > 0 && (
        <section className={styles.section} style={{ paddingTop: 0 }}>
          <div className="container">
            <div className={styles.sectionHead}>
              <h2 className={styles.sectionTitle}>Свежие объявления</h2>
              <Link to="/listings" className={styles.seeAll}>Смотреть все →</Link>
            </div>
            <div className={styles.recentGrid}>
              {recent.map(l => <MiniCard key={l.id} l={l} />)}
            </div>
          </div>
        </section>
      )}


    </div>
  )
}

function MiniCard({ l }) {
  const price = l.is_negotiable
    ? 'Договорная'
    : l.price
    ? `${Number(l.price).toLocaleString('ru')} сом`
    : 'Бесплатно'

  return (
    <Link to={`/listings/${l.id}`} className={styles.miniCard}>
      {l.photos?.[0]
        ? <img src={l.photos[0]} alt={l.title} className={styles.miniImg} loading="lazy" />
        : <div className={styles.miniImgEmpty}><span>Нет фото</span></div>
      }
      <div className={styles.miniBody}>
        <div className={styles.miniCat}>{l.category}</div>
        <div className={styles.miniTitle}>{l.title}</div>
        <div className={styles.miniPrice}>{price}</div>
        {l.district_name && <div className={styles.miniLoc}>📍 {l.district_name}</div>}
      </div>
    </Link>
  )
}
