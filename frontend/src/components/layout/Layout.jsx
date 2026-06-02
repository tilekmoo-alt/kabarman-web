import { Outlet, Link, useLocation } from 'react-router-dom'
import styles from './Layout.module.css'
import InstallBanner from '../InstallBanner'

export default function Layout() {
  const loc = useLocation()

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <div className="container">
          <div className={styles.headerInner}>
            <Link to="/" className={styles.logo}>
              <img src="/logo-icon.png" alt="Kabarman" className={styles.logoImg} />
              <span>KABARMAN</span>
            </Link>
            <nav className={styles.nav}>
              <Link to="/catalog"  className={loc.pathname === '/catalog'  ? styles.active : ''}>Каталог</Link>
              <Link to="/register" className={loc.pathname === '/register' ? styles.active : ''}>Добавить бизнес</Link>
            </nav>
            <a href="https://t.me/kabarmanbot" target="_blank" className={`btn btn-primary btn-sm ${styles.tgBtn}`}>
              ✈️ Бот в Telegram
            </a>
          </div>
        </div>
      </header>

      <main className={styles.main}>
        <Outlet />
      </main>

      <InstallBanner />

      <footer className={styles.footer}>
        <div className="container">
          <div className={styles.footerInner}>
            <div className={styles.footerBrand}>
              <div className={styles.footerLogo}>
                <img src="/logo-icon.png" alt="Kabarman" className={styles.footerLogoImg} />
                <span>KABARMAN</span>
              </div>
              <p>Справочник услуг и бизнеса<br/>Иссык-Кульской области</p>
            </div>
            <div className={styles.footerLinks}>
              <div className={styles.footerCol}>
                <div className={styles.footerTitle}>Навигация</div>
                <Link to="/catalog">Каталог</Link>
                <Link to="/register">Добавить бизнес</Link>
              </div>
              <div className={styles.footerCol}>
                <div className={styles.footerTitle}>Районы</div>
                <span>Каракол · Ак-Суу · Тюп</span>
                <span>Жети-Огуз · Тон · Чолпон-Ата</span>
              </div>
              <div className={styles.footerCol}>
                <div className={styles.footerTitle}>Контакты</div>
                <a href="https://t.me/kabarmanbot">Telegram бот</a>
                <a href="https://t.me/kabarman_admin">Поддержка</a>
              </div>
            </div>
          </div>
          <div className={styles.footerBottom}>
            © 2025 Кабарман — Иссык-Кульская область, Кыргызстан
          </div>
        </div>
      </footer>
    </div>
  )
}
