import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { listingsApi } from '../utils/api'
import styles from './MyListingsPage.module.css'

export default function MyListingsPage() {
  const { user, loading, login } = useAuth()
  const navigate = useNavigate()
  const [listings, setListings] = useState([])
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    if (!loading && !user) return
    if (!user) return
    listingsApi.getMine()
      .then(r => setListings(r.data))
      .catch(() => {})
      .finally(() => setFetching(false))
  }, [user, loading])

  if (loading || fetching) return <div className={styles.center}>Загрузка...</div>

  if (!user) return (
    <div className={styles.center}>
      <div style={{ fontSize: 48 }}>🔒</div>
      <h2>Войдите чтобы видеть свои объявления</h2>
      <button className="btn btn-primary" onClick={login}>Войти через Google</button>
    </div>
  )

  return (
    <div className={styles.page}>
      <div className="container">
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Мои объявления</h1>
            <p className={styles.sub}>{user.name}</p>
          </div>
          <Link to="/post" className="btn btn-primary">+ Подать объявление</Link>
        </div>

        {listings.length === 0 ? (
          <div className={styles.empty}>
            <div style={{ fontSize: 48 }}>📭</div>
            <h3>У вас ещё нет объявлений</h3>
            <Link to="/post" className="btn btn-primary">Подать первое объявление</Link>
          </div>
        ) : (
          <div className={styles.grid}>
            {listings.map(l => <MyCard key={l.id} l={l} onDelete={() => setListings(prev => prev.filter(x => x.id !== l.id))} />)}
          </div>
        )}
      </div>
    </div>
  )
}

function MyCard({ l, onDelete }) {
  const price = l.is_negotiable ? 'Договорная' : l.price ? `${Number(l.price).toLocaleString('ru')} сом` : 'Бесплатно'
  const daysLeft = Math.max(0, Math.ceil((new Date(l.expires_at) - Date.now()) / 86400000))

  const handleDelete = async () => {
    if (!confirm('Удалить объявление?')) return
    try {
      await listingsApi.deleteMine(l.id)
      onDelete()
    } catch {
      alert('Ошибка удаления')
    }
  }

  return (
    <div className={styles.card}>
      <Link to={`/listings/${l.id}`} className={styles.cardImg}>
        {l.photos?.[0]
          ? <img src={l.photos[0]} alt={l.title} />
          : <div className={styles.noPhoto}>🖼</div>
        }
      </Link>
      <div className={styles.cardBody}>
        <div className={styles.cardCat}>{l.category}</div>
        <Link to={`/listings/${l.id}`} className={styles.cardTitle}>{l.title}</Link>
        <div className={styles.cardPrice}>{price}</div>
        <div className={styles.cardMeta}>
          <span className={daysLeft < 5 ? styles.expireSoon : styles.expireOk}>
            {daysLeft > 0 ? `⏳ ${daysLeft} дн.` : '❌ Истекло'}
          </span>
        </div>
        <div className={styles.cardActions}>
          <button className={styles.btnDelete} onClick={handleDelete}>Удалить</button>
        </div>
      </div>
    </div>
  )
}
