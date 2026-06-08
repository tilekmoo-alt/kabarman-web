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
              <Link to="/listings" className={loc.pathname.startsWith('/listings') ? styles.active : ''}>Объявления</Link>
              <Link to="/search"   className={loc.pathname === '/search'           ? styles.active : ''}>Поиск</Link>
            </nav>
            <div className={styles.headerBtns}>
              <Link to="/post" className="btn btn-post btn-sm">
                📢 Подать объявление
              </Link>
              <a href="https://t.me/kabarmanbot" target="_blank" className="btn btn-outline btn-sm">
                ✈️ Бот
              </a>
            </div>
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
              <p>Объявления и услуги<br/>Кыргызстана</p>
            </div>
            <div className={styles.footerLinks}>
              <div className={styles.footerCol}>
                <div className={styles.footerTitle}>Навигация</div>
                <Link to="/listings">Объявления</Link>
                <Link to="/search">Поиск</Link>
                <Link to="/post">Подать объявление</Link>
              </div>
              <div className={styles.footerCol}>
                <div className={styles.footerTitle}>Области</div>
                <span>Бишкек · Ош · Чуй</span>
                <span>Иссык-Куль · Жалал-Абад</span>
                <span>Нарын · Талас · Баткен</span>
              </div>
              <div className={styles.footerCol}>
                <div className={styles.footerTitle}>Контакты</div>
                <a href="https://t.me/kabarmanbot">Telegram бот</a>
                <a href="https://t.me/kabarman_admin">Поддержка</a>
              </div>
            </div>
          </div>
          <div className={styles.footerBottom}>
            © 2025 Кабарман — Кыргызстан
          </div>
        </div>
      </footer>
    </div>
  )
}
