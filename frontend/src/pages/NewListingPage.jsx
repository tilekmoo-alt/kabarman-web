import { useState, useContext, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { listingsApi } from '../utils/api'
import { AppContext } from '../App'
import styles from './RegisterPage.module.css'
import listStyles from './NewListingPage.module.css'

const CATS = [
  { emoji: '🚗', name: 'Транспорт' },
  { emoji: '🐄', name: 'Скот и животные' },
  { emoji: '🐑', name: 'Арашан' },
  { emoji: '🏠', name: 'Недвижимость' },
  { emoji: '🍎', name: 'Еда и продукты' },
  { emoji: '📱', name: 'Электроника' },
  { emoji: '👗', name: 'Одежда и обувь' },
  { emoji: '🏗', name: 'Стройматериалы' },
  { emoji: '💼', name: 'Работа' },
  { emoji: '🏨', name: 'Отели и гостиницы' },
  { emoji: '🛍', name: 'Барахолка' },
  { emoji: '⚽', name: 'Спорт' },
  { emoji: '🐾', name: 'Домашние животные' },
  { emoji: '🎁', name: 'Отдам даром' },
  { emoji: '🧸', name: 'Для детей' },
  { emoji: '📦', name: 'Другое' },
]

const STEPS = ['Категория', 'Регион', 'Объявление', 'Фото и контакт']

export default function NewListingPage() {
  const { oblasts, districts } = useContext(AppContext)
  const navigate = useNavigate()
  const fileRef = useRef()

  const [step, setStep]       = useState(0)
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)

  const [form, setForm] = useState({
    category: '', oblast_id: '', district: '',
    title: '', description: '', price: '', is_negotiable: false,
    contact_name: '', contact_phone: '', tg_username: '',
    photos: []
  })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const filteredDistricts = form.oblast_id
    ? districts.filter(d => String(d.oblast_id) === form.oblast_id)
    : []

  const nextStep = () => {
    setError('')
    if (step === 0 && !form.category) { setError('Выберите категорию'); return }
    if (step === 1 && !form.oblast_id) { setError('Выберите область'); return }
    if (step === 2 && !form.title) { setError('Введите заголовок'); return }
    if (step === 2 && !form.price && !form.is_negotiable) { setError('Укажите цену или выберите "Договорная"'); return }
    setStep(s => s + 1)
  }

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

  const submit = async () => {
    if (!form.contact_phone) { setError('Введите номер телефона'); return }
    setLoading(true); setError('')
    try {
      const payload = {
        ...form,
        oblast_id:   form.oblast_id || null,
        district_id: districts.find(d => d.name === form.district)?.id || null,
        price:       form.is_negotiable ? null : (form.price ? parseInt(form.price) : null),
      }
      await listingsApi.create(payload)
      navigate('/listings')
    } catch (e) {
      setError(e.response?.data?.error || 'Ошибка отправки')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.page}>
      <div className="container">
        <div className={styles.formWrap}>
          <div className={styles.formHead}>
            <h1>Подать объявление</h1>
            <p>Бесплатно. Объявление активно 30 дней.</p>
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
              <div className={listStyles.catGrid}>
                {CATS.map(c => (
                  <button key={c.name} type="button"
                    onClick={() => set('category', c.name)}
                    className={`${listStyles.catTile} ${form.category === c.name ? listStyles.catTileActive : ''}`}>
                    <span className={listStyles.catEmoji}>{c.emoji}</span>
                    <span>{c.name}</span>
                  </button>
                ))}
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
                  <label className="form-label">Район</label>
                  <select value={form.district} onChange={e => set('district', e.target.value)}
                    className="form-select" disabled={!form.oblast_id}>
                    <option value="">{form.oblast_id ? 'Выберите район (необязательно)' : 'Сначала область'}</option>
                    {filteredDistricts.map(d => <option key={d.id} value={d.name}>📍 {d.name}</option>)}
                  </select>
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <div className="form-group">
                  <label className="form-label">Заголовок *</label>
                  <input className="form-input" value={form.title}
                    onChange={e => set('title', e.target.value)}
                    placeholder="Например: Продам Toyota Camry 2018" />
                </div>
                <div className="form-group">
                  <label className="form-label">Описание</label>
                  <textarea className="form-input" rows={4} value={form.description}
                    onChange={e => set('description', e.target.value)}
                    placeholder="Опишите подробнее: состояние, характеристики..." />
                </div>
                <div className="form-group">
                  <label className="form-label">Цена (сом) *</label>
                  <input className="form-input" type="number" value={form.price}
                    onChange={e => set('price', e.target.value)}
                    placeholder="50000" disabled={form.is_negotiable} />
                  <label className={listStyles.checkLabel}>
                    <input type="checkbox" checked={form.is_negotiable}
                      onChange={e => { set('is_negotiable', e.target.checked); if (e.target.checked) set('price', '') }} />
                    Договорная цена
                  </label>
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
                  <label className="form-label">Ваше имя</label>
                  <input className="form-input" value={form.contact_name}
                    onChange={e => set('contact_name', e.target.value)}
                    placeholder="Асель или Бакыт" />
                </div>
                <div className="form-group">
                  <label className="form-label">Телефон *</label>
                  <input className="form-input" type="tel" value={form.contact_phone}
                    onChange={e => set('contact_phone', e.target.value)}
                    placeholder="+996 700 123 456" />
                </div>
                <div className="form-group">
                  <label className="form-label">Telegram username</label>
                  <input className="form-input" value={form.tg_username}
                    onChange={e => set('tg_username', e.target.value.replace('@', ''))}
                    placeholder="username (без @)" />
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
              : <button onClick={submit} disabled={loading || uploading} className="btn btn-primary">
                  {loading ? 'Публикация...' : 'Опубликовать ✓'}
                </button>
            }
          </div>
        </div>
      </div>
    </div>
  )
}
