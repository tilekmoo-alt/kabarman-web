import { useContext, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AppContext } from '../App'
import { listingsApi } from '../utils/api'
import styles from './HomePage.module.css'

const LISTING_CATS = [
  { emoji: '🚗', name: 'Транспорт' },
  { emoji: '🐄', name: 'Скот и животные' },
  { emoji: '🏠', name: 'Недвижимость' },
  { emoji: '📱', name: 'Электроника' },
  { emoji: '👗', name: 'Одежда и обувь' },
  { emoji: '🛋', name: 'Мебель и дом' },
  { emoji: '🌾', name: 'С/х и техника' },
  { emoji: '💼', name: 'Работа' },
  { emoji: '📦', name: 'Другое' },
]

export default function HomePage() {
  const { categories } = useContext(AppContext)
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [recent, setRecent] = useState([])

  useEffect(() => {
    listingsApi.getAll({ limit: 6 })
      .then(r => setRecent(r.data.listings || []))
      .catch(() => {})
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    const q = search.trim()
    navigate(q ? `/listings?q=${encodeURIComponent(q)}` : '/listings')
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

      {/* Два главных действия */}
      <section className={styles.actionsSection}>
        <div className="container">
          <div className={styles.actionCards}>
            <Link to="/listings/new" className={styles.actionCard}>
              <div className={styles.actionIcon}>📢</div>
              <div className={styles.actionText}>
                <div className={styles.actionTitle}>Подать объявление</div>
                <div className={styles.actionSub}>Продайте товар или предложите услугу — бесплатно</div>
              </div>
              <span className={styles.actionArrow}>→</span>
            </Link>
            <Link to="/register" className={`${styles.actionCard} ${styles.actionCardAlt}`}>
              <div className={styles.actionIcon}>🏢</div>
              <div className={styles.actionText}>
                <div className={styles.actionTitle}>Добавить бизнес</div>
                <div className={styles.actionSub}>Зарегистрируйте компанию или мастера в каталоге</div>
              </div>
              <span className={styles.actionArrow}>→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Категории объявлений */}
      <section className={styles.section}>
        <div className="container">
          <div className={styles.sectionHead}>
            <h2 className={styles.sectionTitle}>Объявления по категориям</h2>
            <Link to="/listings" className={styles.seeAll}>Все объявления →</Link>
          </div>
          <div className={styles.catsGrid}>
            {LISTING_CATS.map(cat => (
              <Link key={cat.name}
                to={`/listings?category=${encodeURIComponent(cat.name)}`}
                className={styles.catCard}>
                <span className={styles.catEmoji}>{cat.emoji}</span>
                <span className={styles.catName}>{cat.name}</span>
              </Link>
            ))}
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

      {/* Услуги и бизнес */}
      <section className={styles.serviceSection}>
        <div className="container">
          <div className={styles.sectionHead}>
            <h2 className={styles.sectionTitle}>Услуги и бизнес</h2>
            <Link to="/catalog" className={styles.seeAll}>Весь каталог →</Link>
          </div>
          <p className={styles.serviceSub}>
            Кафе, мастера, СТО, репетиторы — проверенные компании и специалисты
          </p>
          <div className={styles.serviceCats}>
            {categories.slice(0, 8).map(cat => (
              <Link key={cat.id}
                to={`/catalog?category=${encodeURIComponent(cat.name)}`}
                className={styles.serviceCat}>
                <span className={styles.serviceCatEmoji}>{cat.emoji}</span>
                <span>{cat.name}</span>
              </Link>
            ))}
          </div>
          <div className={styles.serviceActions}>
            <Link to="/catalog" className="btn btn-primary">🔍 Найти мастера или компанию</Link>
            <a href="https://t.me/kabarmanbot" target="_blank" className="btn btn-outline">
              ✈️ Бот в Telegram
            </a>
          </div>
        </div>
      </section>

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
    <Link to="/listings" className={styles.miniCard}>
      {l.photos?.[0]
        ? <img src={l.photos[0]} alt={l.title} className={styles.miniImg} loading="lazy" />
        : <div className={styles.miniImgEmpty}>📷</div>
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
