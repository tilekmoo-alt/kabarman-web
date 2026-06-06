import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { listingsApi } from '../utils/api'
import styles from './ListingDetailPage.module.css'

export default function ListingDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [listing, setListing] = useState(null)
  const [loading, setLoading] = useState(true)
  const [photo, setPhoto]     = useState(0)

  useEffect(() => {
    listingsApi.getOne(id)
      .then(r => setListing(r.data))
      .catch(() => navigate('/listings'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className={styles.loading}>Загрузка...</div>
  if (!listing) return null

  const price = listing.is_negotiable
    ? 'Договорная'
    : listing.price
    ? `${Number(listing.price).toLocaleString('ru')} сом`
    : 'Бесплатно'

  const wa = `https://wa.me/${listing.contact_phone.replace(/\D/g,'')}?text=${encodeURIComponent('Здравствуйте! Вижу ваше объявление на Кабарман.')}`
  const tg = listing.tg_username ? `https://t.me/${listing.tg_username}` : null

  return (
    <div className={styles.page}>
      <div className="container">

        <div className={styles.back}>
          <Link to="/listings">← Все объявления</Link>
        </div>

        <div className={styles.layout}>

          {/* Фото */}
          <div className={styles.gallery}>
            {listing.photos?.length > 0 ? (
              <>
                <img
                  src={listing.photos[photo]}
                  alt={listing.title}
                  className={styles.mainPhoto}
                />
                {listing.photos.length > 1 && (
                  <div className={styles.thumbs}>
                    {listing.photos.map((url, i) => (
                      <img key={i} src={url} alt=""
                        className={`${styles.thumb} ${i === photo ? styles.thumbActive : ''}`}
                        onClick={() => setPhoto(i)}
                      />
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className={styles.noPhoto}>📷</div>
            )}
          </div>

          {/* Инфо */}
          <div className={styles.info}>
            <div className={styles.meta}>
              <span className="badge badge-green">{listing.category}</span>
              {listing.district_name && <span className="badge badge-gray">📍 {listing.district_name}</span>}
              {listing.oblast_name   && <span className="badge badge-gray">🗺 {listing.oblast_name}</span>}
            </div>

            <h1 className={styles.title}>{listing.title}</h1>
            <div className={styles.price}>{price}</div>

            {listing.description && (
              <div className={styles.desc}>
                <div className={styles.descLabel}>Описание</div>
                <p>{listing.description}</p>
              </div>
            )}

            <div className={styles.contact}>
              <div className={styles.contactLabel}>Контакт</div>
              {listing.contact_name && (
                <div className={styles.contactName}>👤 {listing.contact_name}</div>
              )}
              <div className={styles.contactPhone}>📞 {listing.contact_phone}</div>
            </div>

            <div className={styles.actions}>
              <a href={wa} target="_blank" className="btn btn-primary">
                💬 Написать в WhatsApp
              </a>
              {tg && (
                <a href={tg} target="_blank" className="btn btn-outline">
                  ✈️ Telegram
                </a>
              )}
              <a href={`tel:${listing.contact_phone}`} className="btn btn-outline">
                📞 Позвонить
              </a>
            </div>

            <div className={styles.date}>
              Опубликовано: {new Date(listing.created_at).toLocaleDateString('ru', { day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
