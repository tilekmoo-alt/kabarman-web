const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3')
const crypto = require('crypto')

const r2 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY
  }
})

async function uploadToR2(buffer, mimetype = 'image/jpeg') {
  const suffix = crypto.randomBytes(8).toString('hex')
  const key = `listings/${Date.now()}-${suffix}.jpg`

  await r2.send(new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: key,
    Body: buffer,
    ContentType: mimetype
  }))

  return `${process.env.R2_PUBLIC_URL}/${key}`
}

module.exports = { uploadToR2 }
