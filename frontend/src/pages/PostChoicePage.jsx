import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useGoogleLogin } from '@react-oauth/google'
import styles from './PostChoicePage.module.css'

function LoginPrompt() {
  const { handleGoogleSuccess } = useAuth()

  const login = useGoogleLogin({
    onSuccess: handleGoogleSuccess,
    onError: (err) => console.error('Login failed:', err),
  })

  return (
    <div className={styles.loginPrompt}>
      <div className={styles.loginIcon}>🔐</div>
      <h1 className={styles.title}>Войдите чтобы подать объявление</h1>
      <p className={styles.sub}>Это бесплатно и займёт 10 секунд</p>
      <button className={styles.googleBtn} onClick={() => login()}>
        <img src="https://www.google.com/favicon.ico" alt="" width={18} height={18} />
        Войти через Google
      </button>
    </div>
  )
}

export default function PostChoicePage() {
  const { user, loading } = useAuth()

  if (loading) return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32 }}>
      ⏳
    </div>
  )

  if (!user) {
    return (
      <div className={styles.page}>
        <div className="container">
          <LoginPrompt />
        </div>
      </div>
    )
  }

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
