import { useState, useEffect, useContext } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { listingsApi } from '../utils/api'
import { AppContext } from '../App'
import styles from './ListingsPage.module.css'

const CATS = [
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
    <div className={styles.card}>
      {photo
        ? <img src={photo} alt={l.title} className={styles.cardImg} loading="lazy" />
        : <div className={styles.cardImgEmpty}>📷</div>
      }
      <div className={styles.cardBody}>
        <div className={styles.cardMeta}>
          <span className="badge badge-green">{l.category}</span>
          {l.district_name && <span className="badge badge-gray">📍 {l.district_name}</span>}
        </div>
        <div className={styles.cardTitle}>{l.title}</div>
        <div className={styles.cardPrice}>{price}</div>
        {l.description && <p className={styles.cardDesc}>{l.description.slice(0, 80)}{l.description.length > 80 ? '...' : ''}</p>}
        <a href={`https://wa.me/${l.contact_phone.replace(/\D/g,'')}`}
           target="_blank" className={`btn btn-primary btn-sm ${styles.cardBtn}`}>
          💬 {l.contact_phone}
        </a>
      </div>
    </div>
  )
}

export default function ListingsPage() {
  const { oblasts, districts } = useContext(AppContext)
  const [params, setParams] = useSearchParams()
  const [listings, setListings] = useState([])
  const [total, setTotal]       = useState(0)
  const [loading, setLoading]   = useState(true)

  const category  = params.get('category')  || ''
  const oblast    = params.get('oblast')    || ''
  const district  = params.get('district')  || ''

  const filteredDistricts = oblast
    ? districts.filter(d => String(d.oblast_id) === oblast)
    : districts

  const setFilter = (key, val) => {
    const next = new URLSearchParams(params)
    if (val) next.set(key, val); else next.delete(key)
    if (key === 'oblast') next.delete('district')
    setParams(next)
  }

  useEffect(() => {
    setLoading(true)
    const p = {}
    if (category) p.category = category
    if (oblast)   p.oblast_id = oblast
    if (district) {
      const d = districts.find(d => d.name === district)
      if (d) p.district_id = d.id
    }
    listingsApi.getAll(p)
      .then(r => { setListings(r.data.listings); setTotal(r.data.total) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [category, oblast, district])

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

        {/* Категории */}
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

        {/* Фильтры */}
        <div className={styles.filters}>
          <select value={oblast} onChange={e => setFilter('oblast', e.target.value)} className="form-select">
            <option value="">Все области</option>
            {oblasts.map(o => <option key={o.id} value={String(o.id)}>🗺 {o.name}</option>)}
          </select>
          <select value={district} onChange={e => setFilter('district', e.target.value)} className="form-select">
            <option value="">Все районы</option>
            {filteredDistricts.map(d => <option key={d.id} value={d.name}>📍 {d.name}</option>)}
          </select>
          {(category || oblast || district) && (
            <button onClick={() => setParams({})} className="btn btn-outline btn-sm">✕ Сбросить</button>
          )}
        </div>

        <div className={styles.resultsLine}>
          {loading ? 'Загрузка...' : `Найдено: ${total}`}
        </div>

        {!loading && listings.length === 0 ? (
          <div className={styles.empty}>
            <div style={{fontSize: 48}}>😔</div>
            <h3>Объявлений нет</h3>
            <p>Будьте первым — <Link to="/listings/new">подайте объявление</Link></p>
          </div>
        ) : (
          <div className={styles.grid}>
            {listings.map(l => <ListingCard key={l.id} l={l} />)}
          </div>
        )}

      </div>
    </div>
  )
}
