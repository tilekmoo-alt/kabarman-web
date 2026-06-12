require('dotenv').config()
const pool = require('./pool')

async function migrate() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id         SERIAL PRIMARY KEY,
      google_id  VARCHAR(255) UNIQUE,
      email      VARCHAR(255) UNIQUE,
      name       VARCHAR(255),
      avatar_url TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    );

    ALTER TABLE listings
      ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id);
  `)
  console.log('✅ Таблица users создана, user_id добавлен в listings')
  process.exit(0)
}

migrate().catch(e => { console.error(e); process.exit(1) })
