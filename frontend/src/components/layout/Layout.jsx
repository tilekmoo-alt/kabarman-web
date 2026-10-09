import { useState, useEffect } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import styles from './Layout.module.css'

function InstallModal({ onClose }) {
  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <button className={styles.modalClose} onClick={onClose}>✕</button>
        <div className={styles.modalIcon}>📱</div>
        <h2 className={styles.modalTitle}>Скачать Кабарман</h2>
        <p className={styles.modalSub}>Бесплатное приложение для объявлений и услуг Кыргызстана</p>

        <div className={styles.storeBadges}>
          <a
            href="https://play.google.com/store/apps/details?id=kg.kabarman.app"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img src="/google-play-badge.webp" alt="Get it on Google Play" className={styles.storeBadgeImg} />
          </a>

          <div className={styles.storeBadgeSoon}>
            <div className={styles.storeBadgeIcon}>🍎</div>
            <div className={styles.storeBadgeText}>
              <div className={styles.storeBadgeLabel}>Скоро в</div>
              <div className={styles.storeBadgeName}>App Store</div>
            </div>
          </div>
        </div>

        <button className={styles.modalBtnOutline} onClick={onClose}>Закрыть</button>
      </div>
    </div>
  )
}

export default function Layout() {
  const loc = useLocation()
  const navigate = useNavigate()
  const [showInstall, setShowInstall] = useState(false)
  const isHome = loc.pathname === '/'

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <div className="container">
          <div className={styles.headerInner}>
            {!isHome && (
              <button className={styles.backBtn} onClick={() => navigate(-1)}>
                ❮
              </button>
            )}
            <Link to="/" className={styles.logo}>
              <img src="/logo-icon.png" alt="Kabarman" className={styles.logoImg} />
              <span>KABARMAN</span>
            </Link>
            <nav className={styles.nav}>
              <Link to="/listings" className={loc.pathname.startsWith('/listings') ? styles.active : ''}>Объявления</Link>
              <Link to="/search"   className={loc.pathname === '/search'           ? styles.active : ''}>Поиск</Link>
            </nav>
            <div className={styles.headerBtns}>
              <Link to="/listings/new" className={`btn btn-primary btn-sm ${styles.postBtn}`}>
                +<span className={styles.postBtnText}> Подать</span>
              </Link>
              <button className={`btn btn-outline btn-sm ${styles.dlBtn}`} onClick={() => setShowInstall(true)}>
                📱<span className={styles.dlBtnText}> Скачать</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {showInstall && (
        <InstallModal onClose={() => setShowInstall(false)} />
      )}

      <main className={styles.main}>
        <Outlet />
      </main>

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
