import { useState, useEffect, useContext, useRef } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { listingsApi } from '../utils/api'
import { AppContext } from '../App'
import styles from './ListingsPage.module.css'

const CATS = [
  { emoji: '🚗', name: 'Транспорт' },
  { emoji: '🐄', name: 'Скот и животные' },
  { emoji: '🐑', name: 'Арашан' },
  { emoji: '🏠', name: 'Недвижимость' },
  { emoji: '🍎', name: 'Еда и продукты' },
  { emoji: '📱', name: 'Электроника' },
  { emoji: '👗', name: 'Одежда и обувь' },
  { emoji: '🏗', name: 'Стройматериалы' },
  { emoji: '💼', name: 'Работа' },
  { emoji: '🏨', name: 'Отели и гостиницы' },
  { emoji: '🛍', name: 'Барахолка' },
  { emoji: '⚽', name: 'Спорт' },
  { emoji: '🐾', name: 'Домашние животные' },
  { emoji: '🎁', name: 'Отдам даром' },
  { emoji: '🧸', name: 'Для детей' },
  { emoji: '📦', name: 'Другое' },
]

function ListingCard({ l }) {
  const price = l.is_negotiable
    ? 'Договорная'
    : l.price === 0
    ? 'Бесплатно'
    : l.price
    ? `${Number(l.price).toLocaleString('ru')} сом`
    : '—'

  const photo = l.photos?.[0]

  return (
    <Link to={`/listings/${l.id}`} className={styles.card}>
      {photo
        ? <img src={photo} alt={l.title} className={styles.cardImg} loading="lazy" />
        : <div className={styles.cardImgEmpty}><span>Нет фото</span></div>
      }
      <div className={styles.cardBody}>
        <div className={styles.cardMeta}>
          <span className="badge badge-green">{l.category}</span>
          {l.district_name && <span className="badge badge-gray">📍 {l.district_name}</span>}
        </div>
        <div className={styles.cardTitle}>{l.title}</div>
        <div className={styles.cardPrice}>{price}</div>
        {l.description && <p className={styles.cardDesc}>{l.description.slice(0, 80)}{l.description.length > 80 ? '...' : ''}</p>}
      </div>
    </Link>
  )
}

export default function ListingsPage() {
  const { oblasts, districts } = useContext(AppContext)
  const [params, setParams] = useSearchParams()
  const [listings, setListings] = useState([])
  const [total, setTotal]       = useState(0)
  const [loading, setLoading]   = useState(false)
  const [hasMore, setHasMore]   = useState(true)
  const [page, setPage]         = useState(1)
  const [filterVersion, setFilterVersion] = useState(0)
  const sentinelRef = useRef()

  const category = params.get('category') || ''
  const oblast   = params.get('oblast')   || ''
  const district = params.get('district') || ''
  const q        = params.get('q')        || ''
  const [searchInput, setSearchInput] = useState(q)

  const filteredDistricts = oblast
    ? districts.filter(d => String(d.oblast_id) === oblast)
    : districts

  const setFilter = (key, val) => {
    const next = new URLSearchParams(params)
    if (val) next.set(key, val); else next.delete(key)
    if (key === 'oblast') next.delete('district')
    setParams(next)
  }

  const handleSearch = (e) => {
    e.preventDefault()
    setFilter('q', searchInput.trim())
  }

  const hasFilters = category || oblast || district || q

  // При смене фильтров — сбрасываем список и страницу
  useEffect(() => {
    setListings([])
    setPage(1)
    setHasMore(true)
    setFilterVersion(v => v + 1)
  }, [category, oblast, district, q])

  // Загрузка данных
  useEffect(() => {
    setLoading(true)
    const p = { page, limit: 20 }
    if (category) p.category = category
    if (oblast)   p.oblast_id = oblast
    if (district) {
      const d = districts.find(d => d.name === district)
      if (d) p.district_id = d.id
    }
    if (q) p.q = q

    listingsApi.getAll(p)
      .then(r => {
        const newItems = r.data.listings || []
        setListings(prev => page === 1 ? newItems : [...prev, ...newItems])
        setTotal(r.data.total || 0)
        setHasMore(page < (r.data.pages || 1))
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [filterVersion, page])

  // IntersectionObserver — загружает следующую страницу при скролле
  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasMore && !loading) {
          setPage(p => p + 1)
        }
      },
      { rootMargin: '300px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [hasMore, loading])

  return (
    <div className={styles.page}>
      <div className="container">

        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>📢 Объявления</h1>
            <p className={styles.sub}>Купля-продажа, аренда, скот, транспорт и многое другое</p>
          </div>
          <Link to="/listings/new" className="btn btn-primary">+ Подать объявление</Link>
        </div>

        <form onSubmit={handleSearch} className={styles.searchRow}>
          <input
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            placeholder="Поиск по объявлениям..."
            className={`form-input ${styles.searchInput}`}
          />
          <button type="submit" className="btn btn-primary">🔍 Найти</button>
          {q && (
            <button type="button" className="btn btn-outline btn-sm"
              onClick={() => { setSearchInput(''); setFilter('q', '') }}>
              ✕ Сбросить
            </button>
          )}
        </form>

        <div className={styles.catRow}>
          <button onClick={() => setFilter('category', '')}
            className={`${styles.catBtn} ${!category ? styles.catActive : ''}`}>
            Все
          </button>
          {CATS.map(c => (
            <button key={c.name} onClick={() => setFilter('category', c.name)}
              className={`${styles.catBtn} ${category === c.name ? styles.catActive : ''}`}>
              {c.emoji} {c.name}
            </button>
          ))}
        </div>

        <div className={styles.filters}>
          <select value={oblast} onChange={e => setFilter('oblast', e.target.value)} className="form-select">
            <option value="">Все области</option>
            {oblasts.map(o => <option key={o.id} value={String(o.id)}>🗺 {o.name}</option>)}
          </select>
          <select value={district} onChange={e => setFilter('district', e.target.value)} className="form-select">
            <option value="">Все районы</option>
            {filteredDistricts.map(d => <option key={d.id} value={d.name}>📍 {d.name}</option>)}
          </select>
          {hasFilters && (
            <button onClick={() => { setSearchInput(''); setParams({}) }} className="btn btn-outline btn-sm">
              ✕ Сбросить всё
            </button>
          )}
        </div>

        <div className={styles.resultsLine}>
          {loading && page === 1
            ? 'Загрузка...'
            : q
            ? `По запросу «${q}»: ${total}`
            : `Найдено: ${total}`
          }
        </div>

        {!loading && listings.length === 0 ? (
          <div className={styles.empty}>
            <div style={{fontSize: 48}}>😔</div>
            <h3>{q ? `Ничего не найдено по «${q}»` : 'Объявлений нет'}</h3>
            <p>Будьте первым — <Link to="/listings/new">подайте объявление</Link></p>
          </div>
        ) : (
          <div className={styles.grid}>
            {listings.map(l => <ListingCard key={l.id} l={l} />)}
          </div>
        )}

        {/* Sentinel для IntersectionObserver */}
        <div ref={sentinelRef} />

        {loading && page > 1 && (
          <div className={styles.loadingMore}>Загрузка...</div>
        )}

        {!hasMore && listings.length > 0 && (
          <div className={styles.endMsg}>Все объявления загружены</div>
        )}

      </div>
    </div>
  )
}
