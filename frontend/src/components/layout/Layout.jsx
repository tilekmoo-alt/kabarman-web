import { useState } from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import styles from './Layout.module.css'
import InstallBanner from '../InstallBanner'

function InstallModal({ onClose }) {
  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <button className={styles.modalClose} onClick={onClose}>✕</button>
        <div className={styles.modalIcon}>📲</div>
        <h2 className={styles.modalTitle}>Установить Кабарман</h2>
        <p className={styles.modalSub}>Добавьте приложение на главный экран — работает без интернета и открывается мгновенно</p>

        <div className={styles.modalSteps}>
          <div className={styles.modalStep}>
            <div className={styles.stepNum}>1</div>
            <div>Откройте сайт <b>kabarman.kg</b> в браузере <b>Chrome</b></div>
          </div>
          <div className={styles.modalStep}>
            <div className={styles.stepNum}>2</div>
            <div>Нажмите <b>⋮</b> (три точки) в правом верхнем углу</div>
          </div>
          <div className={styles.modalStep}>
            <div className={styles.stepNum}>3</div>
            <div>Выберите <b>«Добавить на главный экран»</b></div>
          </div>
          <div className={styles.modalStep}>
            <div className={styles.stepNum}>4</div>
            <div>Нажмите <b>«Добавить»</b> — иконка появится на рабочем столе</div>
          </div>
        </div>

        <div className={styles.modalNote}>
          🤖 Работает на Android. На iPhone: Safari → кнопка «Поделиться» → «На экран Домой»
        </div>

        <button className={styles.modalBtn} onClick={onClose}>Понятно</button>
      </div>
    </div>
  )
}

export default function Layout() {
  const loc = useLocation()
  const [showInstall, setShowInstall] = useState(false)

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

      {showInstall && <InstallModal onClose={() => setShowInstall(false)} />}

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
