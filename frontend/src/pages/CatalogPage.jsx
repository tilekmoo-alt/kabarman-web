import { useState, useEffect, useContext } from 'react'
import { useSearchParams } from 'react-router-dom'
import { catalogApi } from '../utils/api'
import { AppContext } from '../App'
import styles from './CatalogPage.module.css'

function ProviderCard({ p }) {
  const wa = `https://wa.me/${p.phone.replace(/\D/g, '')}?text=${encodeURIComponent('Здравствуйте! Нашёл вас на Кабарман.')}`
  const tg = p.tg_username ? `https://t.me/${p.tg_username}` : null
  const ig = p.social_link

  const mapsAddr = encodeURIComponent(p.address || p.district)
  return (
    <div className={styles.card}>
      <div className={styles.cardHead}>
        <div className={styles.cardAvatar}>
          {p.name.charAt(0).toUpperCase()}
        </div>
        <div className={styles.cardInfo}>
          <div className={styles.cardName}>{p.name}</div>
          <div className={styles.cardMeta}>
            <span className="badge badge-green">{p.emoji} {p.category}</span>
            <span className="badge badge-gray">📍 {p.district}</span>
          </div>
        </div>
      </div>

      {p.description && <p className={styles.cardDesc}>{p.description}</p>}
      {p.address    && <div className={styles.cardAddr}>🏠 {p.address}</div>}
      <div className={styles.cardPhone}>📞 {p.phone}</div>

      <div className={styles.cardActions}>
        <a href={wa} target="_blank" className={`btn btn-primary btn-sm ${styles.btnWa}`}>
          💬 WhatsApp
        </a>
        {tg && <a href={tg} target="_blank" className="btn btn-outline btn-sm">✈️ TG</a>}
        {ig && <a href={ig} target="_blank" className="btn btn-outline btn-sm">📸 Instagram</a>}
        <a href={`https://2gis.kg/search/${mapsAddr}`} target="_blank" className="btn btn-outline btn-sm">🗺 2GIS</a>
      </div>
    </div>
  )
}

export default function CatalogPage() {
  const { categories, oblasts, districts } = useContext(AppContext)
  const [params, setParams] = useSearchParams()
  const [providers, setProviders] = useState([])
  const [total, setTotal]         = useState(0)
  const [loading, setLoading]     = useState(true)
  const [q, setQ]                 = useState('')

  const category = params.get('category') || ''
  const oblast   = params.get('oblast')   || ''
  const district = params.get('district') || ''

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
    catalogApi.getProviders({ category, district, q: q || undefined })
      .then(r => { setProviders(r.data.providers); setTotal(r.data.total) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [category, district, q])

  return (
    <div className={styles.page}>
      <div className="container">

        {/* Фильтры */}
        <div className={styles.filters}>
          <input
            type="text" placeholder="🔍 Поиск..."
            value={q} onChange={e => setQ(e.target.value)}
            className={`form-input ${styles.searchInput}`}
          />
          <select value={category} onChange={e => setFilter('category', e.target.value)} className="form-select">
            <option value="">Все категории</option>
            {categories.map(c => <option key={c.id} value={c.name}>{c.emoji} {c.name}</option>)}
          </select>
          <select value={oblast} onChange={e => setFilter('oblast', e.target.value)} className="form-select">
            <option value="">Все области</option>
            {oblasts.map(o => <option key={o.id} value={String(o.id)}>🗺 {o.name}</option>)}
          </select>
          <select value={district} onChange={e => setFilter('district', e.target.value)} className="form-select">
            <option value="">Все районы</option>
            {filteredDistricts.map(d => <option key={d.id} value={d.name}>📍 {d.name}</option>)}
          </select>
          {(category || oblast || district || q) && (
            <button onClick={() => { setParams({}); setQ('') }} className="btn btn-outline btn-sm">
              ✕ Сбросить
            </button>
          )}
        </div>

        <div className={styles.resultsLine}>
          {loading ? 'Загрузка...' : `Найдено: ${total}`}
        </div>

        {loading ? (
          <div className={styles.grid}>
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className={styles.skeletonCard}>
                <div className="skeleton" style={{height: 20, width: '60%', marginBottom: 12}} />
                <div className="skeleton" style={{height: 14, width: '40%', marginBottom: 8}} />
                <div className="skeleton" style={{height: 14, width: '80%', marginBottom: 8}} />
                <div className="skeleton" style={{height: 36, marginTop: 16}} />
              </div>
            ))}
          </div>
        ) : providers.length === 0 ? (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>😔</div>
            <h3>Ничего не найдено</h3>
            <p>Попробуйте изменить фильтры или <a href="/register">зарегистрируйте свой бизнес</a></p>
          </div>
        ) : (
          <div className={styles.grid}>
            {providers.map(p => <ProviderCard key={p.id} p={p} />)}
          </div>
        )}

      </div>
    </div>
  )
}
