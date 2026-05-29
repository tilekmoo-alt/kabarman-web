import { useState, useEffect } from 'react'
import { adminApi } from '../utils/api'
import styles from './AdminPage.module.css'

function LoginForm({ onLogin }) {
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const r = await adminApi.login(form)
      localStorage.setItem('kabarman_admin_token', r.data.token)
      onLogin()
    } catch {
      setError('Неверный логин или пароль')
    } finally { setLoading(false) }
  }

  return (
    <div className={styles.loginWrap}>
      <div className={styles.loginBox}>
        <div className={styles.loginLogo}>📣 KABARMAN</div>
        <h2>Панель администратора</h2>
        {error && <div className={styles.error}>{error}</div>}
        <form onSubmit={submit} className={styles.loginForm}>
          <input className="form-input" placeholder="Логин"
            value={form.username} onChange={e => setForm(f => ({...f, username: e.target.value}))} />
          <input className="form-input" type="password" placeholder="Пароль"
            value={form.password} onChange={e => setForm(f => ({...f, password: e.target.value}))} />
          <button type="submit" disabled={loading} className="btn btn-primary" style={{width:'100%'}}>
            {loading ? 'Вход...' : 'Войти'}
          </button>
        </form>
      </div>
    </div>
  )
}

function Dashboard() {
  const [stats, setStats]     = useState(null)
  const [pending, setPending] = useState([])
  const [tab, setTab]         = useState('stats')

  useEffect(() => {
    adminApi.getStats().then(r => setStats(r.data)).catch(() => {})
    adminApi.getPending().then(r => setPending(r.data)).catch(() => {})
  }, [])

  const approve = async (id) => {
    await adminApi.approve(id)
    setPending(p => p.filter(x => x.id !== id))
  }
  const reject = async (id) => {
    await adminApi.reject(id)
    setPending(p => p.filter(x => x.id !== id))
  }
  const logout = () => {
    localStorage.removeItem('kabarman_admin_token')
    window.location.reload()
  }

  return (
    <div className={styles.dash}>
      <div className={styles.dashHeader}>
        <div className={styles.dashLogo}>📣 KABARMAN — Администратор</div>
        <button onClick={logout} className="btn btn-outline btn-sm">Выйти</button>
      </div>

      <div className="container">
        <div className={styles.tabs}>
          <button onClick={() => setTab('stats')}   className={tab==='stats'   ? styles.tabActive : styles.tab}>📊 Статистика</button>
          <button onClick={() => setTab('pending')} className={tab==='pending' ? styles.tabActive : styles.tab}>
            ⏳ На проверке {pending.length > 0 && <span className={styles.badge}>{pending.length}</span>}
          </button>
        </div>

        {tab === 'stats' && stats && (
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statNum}>{stats.active}</div>
              <div className={styles.statLabel}>Активных в каталоге</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statNum}>{stats.pending}</div>
              <div className={styles.statLabel}>На проверке</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statNum}>{stats.clients}</div>
              <div className={styles.statLabel}>Клиентов в боте</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statNum}>{stats.searches}</div>
              <div className={styles.statLabel}>Поисков</div>
            </div>
            <div className={styles.districtStats}>
              <h3>По районам</h3>
              {stats.by_district?.map(d => (
                <div key={d.name} className={styles.districtRow}>
                  <span>📍 {d.name}</span>
                  <span className={styles.districtCount}>{d.cnt}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'pending' && (
          <div className={styles.pendingList}>
            {pending.length === 0 && (
              <div className={styles.empty}>✅ Нет заявок на проверку</div>
            )}
            {pending.map(p => (
              <div key={p.id} className={styles.pendingCard}>
                <div className={styles.pendingHead}>
                  <div>
                    <div className={styles.pendingName}>{p.name}</div>
                    <div className={styles.pendingMeta}>
                      <span className="badge badge-green">{p.emoji} {p.category}</span>
                      <span className="badge badge-gray">📍 {p.district}</span>
                    </div>
                  </div>
                  <div className={styles.pendingActions}>
                    <button onClick={() => approve(p.id)} className="btn btn-primary btn-sm">✅ Одобрить</button>
                    <button onClick={() => reject(p.id)}  className="btn btn-danger btn-sm">❌ Отклонить</button>
                  </div>
                </div>
                <div className={styles.pendingDetails}>
                  <div>📞 {p.phone}</div>
                  {p.description && <div>📝 {p.description}</div>}
                  {p.address     && <div>🏠 {p.address}</div>}
                  {p.social_link && <div>🔗 {p.social_link}</div>}
                  <div className={styles.pendingDate}>
                    {new Date(p.created_at).toLocaleString('ru-RU')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function AdminPage() {
  const [auth, setAuth] = useState(!!localStorage.getItem('kabarman_admin_token'))
  if (!auth) return <LoginForm onLogin={() => setAuth(true)} />
  return <Dashboard />
}
