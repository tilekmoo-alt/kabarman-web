import { useState, useEffect } from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import styles from './Layout.module.css'
import InstallBanner from '../InstallBanner'

function InstallModal({ onClose, deferredPrompt, onInstalled }) {
  const [androidDone, setAndroidDone] = useState(false)

  const handleAndroidInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      if (outcome === 'accepted') { onInstalled(); onClose() }
    } else {
      setAndroidDone(true)
    }
  }

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <button className={styles.modalClose} onClick={onClose}>✕</button>
        <div className={styles.modalIcon}>📲</div>
        <h2 className={styles.modalTitle}>Установить Кабарман</h2>

        <div className={styles.modalPlatform}>
          <div className={styles.platformLabel}>🤖 Для Android</div>
          {!androidDone ? (
            <button className={styles.modalBtn} onClick={handleAndroidInstall}>
              Установить приложение
            </button>
          ) : (
            <div className={styles.iosSteps}>
              <div className={styles.iosStep}><span className={styles.stepNum}>1</span><span>Откройте сайт в браузере <b>Chrome</b></span></div>
              <div className={styles.iosStep}><span className={styles.stepNum}>2</span><span>Нажмите <b>⋮</b> (три точки) справа вверху</span></div>
              <div className={styles.iosStep}><span className={styles.stepNum}>3</span><span>Выберите <b>«Добавить на главный экран»</b></span></div>
            </div>
          )}
        </div>

        <div className={styles.modalDivider} />

        <div className={styles.modalPlatform}>
          <div className={styles.platformLabel}>🍎 Для iPhone</div>
          <div className={styles.iosSteps}>
            <div className={styles.iosStep}><span className={styles.stepNum}>1</span><span>Откройте сайт в браузере <b>Safari</b></span></div>
            <div className={styles.iosStep}><span className={styles.stepNum}>2</span><span>Нажмите кнопку <b>↑</b> («Поделиться») внизу экрана</span></div>
            <div className={styles.iosStep}><span className={styles.stepNum}>3</span><span>Выберите <b>«На экран "Домой"»</b> и нажмите <b>«Добавить»</b></span></div>
          </div>
        </div>

        <button className={styles.modalBtnOutline} onClick={onClose}>Закрыть</button>
      </div>
    </div>
  )
}

export default function Layout() {
  const loc = useLocation()
  const [showInstall, setShowInstall] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState(null)

  useEffect(() => {
    const handler = (e) => { e.preventDefault(); setDeferredPrompt(e) }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

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
              <button
                className="btn btn-primary btn-sm"
                onClick={() => setShowInstall(true)}
              >
                📲 Установить
              </button>
            </div>
          </div>
        </div>
      </header>

      {showInstall && (
        <InstallModal
          onClose={() => setShowInstall(false)}
          deferredPrompt={deferredPrompt}
          onInstalled={() => setDeferredPrompt(null)}
        />
      )}

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
