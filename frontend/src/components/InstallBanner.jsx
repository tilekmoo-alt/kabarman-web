import { useState, useEffect } from 'react'
import styles from './InstallBanner.module.css'

const isIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent) && !window.MSStream
const isStandalone = () =>
  window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone

export default function InstallBanner() {
  const [prompt, setPrompt] = useState(null)
  const [ios, setIos] = useState(false)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (isStandalone() || localStorage.getItem('pwa-dismissed')) return

    const handler = e => {
      e.preventDefault()
      setPrompt(e)
      setVisible(true)
    }
    window.addEventListener('beforeinstallprompt', handler)

    if (isIOS()) {
      setIos(true)
      setVisible(true)
    }

    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const install = async () => {
    if (!prompt) return
    prompt.prompt()
    const { outcome } = await prompt.userChoice
    if (outcome === 'accepted') dismiss()
    setPrompt(null)
  }

  const dismiss = () => {
    setVisible(false)
    localStorage.setItem('pwa-dismissed', '1')
  }

  if (!visible) return null

  return (
    <div className={styles.banner}>
      <div className={styles.content}>
        <img src="/logo-icon.png" alt="" className={styles.icon} />
        <div className={styles.text}>
          <strong>Кабарман</strong>
          {ios
            ? <span>Нажмите <b>Поделиться</b> → <b>На экран домой</b></span>
            : <span>Установите приложение на телефон</span>
          }
        </div>
      </div>
      <div className={styles.actions}>
        {!ios && (
          <button className={styles.installBtn} onClick={install}>Установить</button>
        )}
        <button className={styles.closeBtn} onClick={dismiss} aria-label="Закрыть">✕</button>
      </div>
    </div>
  )
}
