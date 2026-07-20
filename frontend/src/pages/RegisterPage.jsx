import { useState, useContext, useRef } from 'react'
import { catalogApi, listingsApi } from '../utils/api'
import { AppContext } from '../App'
import styles from './RegisterPage.module.css'
import listStyles from './NewListingPage.module.css'

const STEPS = ['Категория', 'Регион', 'Контакты', 'Описание']

export default function RegisterPage() {
  const { categories, oblasts, districts } = useContext(AppContext)
  const [step, setStep]   = useState(0)
  const [done, setDone]   = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef()

  const [form, setForm] = useState({
    name: '', phone: '', category: '', oblast_id: '', district: '',
    description: '', address: '', social_link: '', tg_username: '', photos: []
  })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleFiles = async (files) => {
    if (!files.length) return
    const remaining = 5 - form.photos.length
    const toUpload = Array.from(files).slice(0, remaining)
    setUploading(true)
    try {
      const fd = new FormData()
      toUpload.forEach(f => fd.append('photos', f))
      const r = await listingsApi.uploadPhotos(fd)
      set('photos', [...form.photos, ...r.data.urls])
    } catch {
      setError('Ошибка загрузки фото. Попробуйте ещё раз.')
    } finally {
      setUploading(false)
    }
  }

  const filteredDistricts = form.oblast_id
    ? districts.filter(d => String(d.oblast_id) === form.oblast_id)
    : []

  const nextStep = () => {
    setError('')
    if (step === 0 && !form.category) {
      setError('Выберите категорию'); return
    }
    if (step === 1 && (!form.oblast_id || !form.district)) {
      setError('Выберите область и район'); return
    }
    if (step === 2 && (!form.name || !form.phone)) {
      setError('Введите имя и телефон'); return
    }
    setStep(s => s + 1)
  }

  const submit = async () => {
    if (!form.description) { setError('Добавьте описание'); return }
    setLoading(true); setError('')
    try {
      await catalogApi.register(form)
      setDone(true)
    } catch (e) {
      setError(e.response?.data?.error || 'Ошибка отправки')
    } finally {
      setLoading(false)
    }
  }

  if (done) return (
    <div className={styles.done}>
      <div className={styles.doneIcon}>✅</div>
      <h2>Заявка принята!</h2>
      <p>Мы проверим данные и активируем ваш профиль в течение 24 часов.</p>
      <a href="/catalog" className="btn btn-primary" style={{marginTop: 24}}>Перейти в каталог</a>
    </div>
  )

  return (
    <div className={styles.page}>
      <div className="container">
        <div className={styles.formWrap}>
          <div className={styles.formHead}>
            <h1>Добавить бизнес</h1>
            <p>Бесплатно. После проверки вы появитесь в каталоге.</p>
          </div>

          <div className={styles.steps}>
            {STEPS.map((s, i) => (
              <div key={i} className={`${styles.step} ${i === step ? styles.stepActive : ''} ${i < step ? styles.stepDone : ''}`}>
                <div className={styles.stepNum}>{i < step ? '✓' : i + 1}</div>
                <span>{s}</span>
              </div>
            ))}
          </div>

          {error && <div className={styles.error}>{error}</div>}

          <div className={styles.formBody}>
            {step === 0 && (
              <div className="form-group">
                <label className="form-label">Категория *</label>
                <select value={form.category} onChange={e => set('category', e.target.value)} className="form-select">
                  <option value="">Выберите категорию</option>
                  {categories.map(c => <option key={c.id} value={c.name}>{c.emoji} {c.name}</option>)}
                </select>
              </div>
            )}

            {step === 1 && (
              <>
                <div className="form-group">
                  <label className="form-label">Область *</label>
                  <select value={form.oblast_id}
                    onChange={e => { set('oblast_id', e.target.value); set('district', '') }}
                    className="form-select">
                    <option value="">Выберите область</option>
                    {oblasts.map(o => <option key={o.id} value={String(o.id)}>🗺 {o.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Район *</label>
                  <select value={form.district} onChange={e => set('district', e.target.value)}
                    className="form-select" disabled={!form.oblast_id}>
                    <option value="">{form.oblast_id ? 'Выберите район' : 'Сначала выберите область'}</option>
                    {filteredDistricts.map(d => <option key={d.id} value={d.name}>📍 {d.name}</option>)}
                  </select>
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <div className="form-group">
                  <label className="form-label">Название / Имя *</label>
                  <input className="form-input" value={form.name}
                    onChange={e => set('name', e.target.value)}
                    placeholder="Кафе Жаннат или Мастер Бакыт" />
                </div>
                <div className="form-group">
                  <label className="form-label">Телефон *</label>
                  <input className="form-input" type="tel" value={form.phone}
                    onChange={e => set('phone', e.target.value)}
                    placeholder="+996 700 123 456" />
                </div>
                <div className="form-group">
                  <label className="form-label">Instagram / соцсеть</label>
                  <input className="form-input" value={form.social_link}
                    onChange={e => set('social_link', e.target.value)}
                    placeholder="@mykafe или ссылка" />
                </div>
                <div className="form-group">
                  <label className="form-label">Telegram username</label>
                  <input className="form-input" value={form.tg_username}
                    onChange={e => set('tg_username', e.target.value.replace('@', ''))}
                    placeholder="username (без @)" />
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <div className="form-group">
                  <label className="form-label">Фото (до 5 штук)</label>
                  <div className={listStyles.photoGrid}>
                    {form.photos.map((url, i) => (
                      <div key={i} className={listStyles.photoThumb}>
                        <img src={url} alt="" />
                        <button type="button" onClick={() => set('photos', form.photos.filter((_, j) => j !== i))}>✕</button>
                      </div>
                    ))}
                    {form.photos.length < 5 && (
                      <button type="button" className={listStyles.photoAdd}
                        onClick={() => fileRef.current?.click()}
                        disabled={uploading}>
                        {uploading ? '⏳' : '+ Фото'}
                      </button>
                    )}
                  </div>
                  <input ref={fileRef} type="file" accept="image/*" multiple hidden
                    onChange={e => handleFiles(e.target.files)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Описание *</label>
                  <textarea className="form-input" rows={4} value={form.description}
                    onChange={e => set('description', e.target.value)}
                    placeholder="Расскажите о своём бизнесе или услугах..." />
                </div>
                <div className="form-group">
                  <label className="form-label">Адрес</label>
                  <input className="form-input" value={form.address}
                    onChange={e => set('address', e.target.value)}
                    placeholder="ул. Токтогула 12, центр Каракола" />
                </div>
              </>
            )}
          </div>

          <div className={styles.formFooter}>
            {step > 0 && (
              <button onClick={() => setStep(s => s - 1)} className="btn btn-outline">← Назад</button>
            )}
            {step < 3
              ? <button onClick={nextStep} className="btn btn-primary">Далее →</button>
              : <button onClick={submit} disabled={loading} className="btn btn-primary">
                  {loading ? 'Отправка...' : 'Отправить заявку ✓'}
                </button>
            }
          </div>
        </div>
      </div>
    </div>
  )
}
