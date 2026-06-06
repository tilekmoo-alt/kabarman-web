import { useState, useEffect } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { catalogApi, listingsApi, reportApi } from '../utils/api'
import styles from './SearchPage.module.css'

export default function SearchPage() {
  const [params] = useSearchParams()
  const navigate  = useNavigate()
  const q         = params.get('q') || ''

  const [input, setInput]         = useState(q)
  const [listings, setListings]   = useState([])
  const [providers, setProviders] = useState([])
  const [loading, setLoading]     = useState(false)

  useEffect(() => {
    setInput(q)
    if (!q.trim()) return
    setLoading(true)
    Promise.all([
      listingsApi.getAll({ q, limit: 6 }),
      catalogApi.getProviders({ q, limit: 6 })
    ])
      .then(([lr, pr]) => {
        setListings(lr.data.listings || [])
        setProviders(pr.data.providers || [])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [q])

  const handleSearch = (e) => {
    e.preventDefault()
    const trimmed = input.trim()
    if (trimmed) navigate(`/search?q=${encodeURIComponent(trimmed)}`)
  }

  const hasResults = listings.length > 0 || providers.length > 0

  return (
    <div className={styles.page}>
      <div className="container">

        <form onSubmit={handleSearch} className={styles.searchBox}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Поиск по объявлениям и услугам..."
            className={styles.searchInput}
            autoFocus
          />
          <button type="submit" className={styles.searchBtn}>🔍 Найти</button>
        </form>

        {!q && (
          <div className={styles.hint}>
            <div style={{ fontSize: 48 }}>🔍</div>
            <p>Введите запрос — например, <strong>Toyota</strong>, <strong>сантехник</strong>, <strong>пилорама</strong></p>
          </div>
        )}

        {q && loading && (
          <div className={styles.hint}>
            <p>Ищем «{q}»...</p>
          </div>
        )}

        {q && !loading && !hasResults && (
          <div className={styles.empty}>
            <div style={{ fontSize: 48 }}>😔</div>
            <h3>Ничего не найдено по «{q}»</h3>
            <p>Попробуйте другой запрос или посмотрите все объявления и услуги</p>
            <div className={styles.emptyLinks}>
              <Link to="/listings" className="btn btn-primary">📢 Все объявления</Link>
              <Link to="/catalog"  className="btn btn-outline">🏢 Все услуги</Link>
            </div>
          </div>
        )}

        {q && !loading && hasResults && (
          <>
            <p className={styles.summary}>
              По запросу <strong>«{q}»</strong>: объявлений — {listings.length}, услуг — {providers.length}
            </p>

            {/* Объявления */}
            {listings.length > 0 && (
              <section className={styles.section}>
                <div className={styles.sectionHead}>
                  <h2 className={styles.sectionTitle}>📢 Объявления</h2>
                  <Link to={`/listings?q=${encodeURIComponent(q)}`} className={styles.seeAll}>
                    Все результаты →
                  </Link>
                </div>
                <div className={styles.listingGrid}>
                  {listings.map(l => <ListingCard key={l.id} l={l} />)}
                </div>
              </section>
            )}

            {/* Услуги */}
            {providers.length > 0 && (
              <section className={styles.section}>
                <div className={styles.sectionHead}>
                  <h2 className={styles.sectionTitle}>🏢 Услуги и бизнес</h2>
                  <Link to={`/catalog?q=${encodeURIComponent(q)}`} className={styles.seeAll}>
                    Все результаты →
                  </Link>
                </div>
                <div className={styles.providerGrid}>
                  {providers.map(p => <ProviderCard key={p.id} p={p} />)}
                </div>
              </section>
            )}
          </>
        )}

      </div>
    </div>
  )
}

function ListingCard({ l }) {
  const price = l.is_negotiable
    ? 'Договорная'
    : l.price
    ? `${Number(l.price).toLocaleString('ru')} сом`
    : 'Бесплатно'

  return (
    <Link to={`/listings/${l.id}`} className={styles.lCard}>
      {l.photos?.[0]
        ? <img src={l.photos[0]} alt={l.title} className={styles.lImg} loading="lazy" />
        : <div className={styles.lImgEmpty}>📷</div>
      }
      <div className={styles.lBody}>
        <div className={styles.lCat}>{l.category}</div>
        <div className={styles.lTitle}>{l.title}</div>
        <div className={styles.lPrice}>{price}</div>
        {l.district_name && <div className={styles.lLoc}>📍 {l.district_name}</div>}
      </div>
    </Link>
  )
}

function ProviderCard({ p }) {
  const [reported, setReported] = useState(false)
  const wa = `https://wa.me/${p.phone.replace(/\D/g, '')}?text=${encodeURIComponent('Здравствуйте! Нашёл вас на Кабарман.')}`
  const tg = p.tg_username ? `https://t.me/${p.tg_username}` : null
  const ig = p.social_link
    ? p.social_link.startsWith('http') ? p.social_link : `https://instagram.com/${p.social_link.replace(/^@/, '')}`
    : null
  const mapsAddr = encodeURIComponent(p.address || p.district)

  return (
    <div className={styles.pCard}>
      <div className={styles.pHead}>
        <div className={styles.pAvatar}>{p.name.charAt(0).toUpperCase()}</div>
        <div>
          <div className={styles.pName}>{p.name}</div>
          <div className={styles.pMeta}>
            <span className="badge badge-green">{p.emoji} {p.category}</span>
            <span className="badge badge-gray">📍 {p.district}</span>
          </div>
        </div>
      </div>
      {p.description && <p className={styles.pDesc}>{p.description}</p>}
      {p.address    && <div className={styles.pDetail}>🏠 {p.address}</div>}
      <div className={styles.pDetail}>📞 {p.phone}</div>
      <div className={styles.pActions}>
        <a href={wa} target="_blank" className="btn btn-primary btn-sm">💬 WhatsApp</a>
        {tg && <a href={tg} target="_blank" className="btn btn-outline btn-sm">✈️ TG</a>}
        {ig && <a href={ig} target="_blank" className="btn btn-outline btn-sm">📸 Instagram</a>}
        <a href={`https://2gis.kg/search/${mapsAddr}`} target="_blank" className="btn btn-outline btn-sm">🗺 2GIS</a>
      </div>
      <button onClick={() => { reportApi.send('provider', p.id).catch(()=>{}); setReported(true) }}
        disabled={reported} className={styles.reportBtn}>
        {reported ? '✅ Жалоба отправлена' : '🚩 Пожаловаться'}
      </button>
    </div>
  )
}
