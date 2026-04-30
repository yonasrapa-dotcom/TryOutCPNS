# TryOutCPNS

## 1. Tujuan
Aplikasi Try Out CPNS ini dirancang sebagai platform belajar online profesional dengan:
- Autentikasi JWT
- Role admin/user
- Pembatasan device per akun
- Paket subscription dan payment QRIS
- Upload soal otomatis
- Sistem pengerjaan TO dan penilaian
- Ranking per TO dan global

## 2. Rekomendasi Stack
Saat ini saya sarankan:
- Backend: `Node.js + Express`
- Database: `PostgreSQL`
- Frontend web: `React`
- Mobile nanti: `React Native` atau `Flutter`

> Jika Anda ingin `Laravel` atau `PHP`, arsitektur sama dan logika dapat dipindahkan ke controller service Laravel.

## 3. Struktur Database (ERD)

Entitas utama:
- `users`
- `packages`
- `user_subscriptions`
- `payments`
- `tryouts`
- `categories`
- `questions`
- `user_answers`
- `results`
- `rankings`

Relasi utama:
- `users` 1 - N `user_subscriptions`
- `users` 1 - N `payments`
- `tryouts` 1 - N `questions`
- `categories` 1 - N `questions`
- `users` 1 - N `user_answers`
- `questions` 1 - N `user_answers`
- `users` 1 - N `results`
- `tryouts` 1 - N `results`
- `users` 1 - N `rankings`
- `tryouts` 1 - N `rankings`

### Tabel utama

#### users
- id (uuid)
- name
- email (unique)
- password (hash)
- role (`user`/`admin`)
- device_id
- subscription_status (`none`,`pending`,`active`)
- created_at
- updated_at

#### packages
- id
- name
- type (`limited`,`unlimited`)
- quota
- duration_days
- price
- label
- created_at

#### user_subscriptions
- id
- user_id
- package_id
- remaining_quota
- expired_at
- status (`pending`,`active`,`expired`)
- created_at
- updated_at

#### payments
- id
- user_id
- package_id
- amount
- qr_code_url
- status (`pending`,`paid`,`expired`)
- created_at
- updated_at

#### tryouts
- id
- title
- created_at

#### categories
- id
- name (`TIU`,`TWK`,`TKP`)
- created_at

#### questions
- id
- tryout_id
- category_id
- question_text
- option_a
- option_b
- option_c
- option_d
- option_e
- correct_answer
- explanation
- created_at

#### user_answers
- id
- user_id
- question_id
- selected_answer
- created_at

#### results
- id
- user_id
- tryout_id
- score_tiu
- score_twk
- score_tkp
- total_score
- time_used_seconds
- created_at

#### rankings
- id
- user_id
- tryout_id
- total_score
- rank
- time_used_seconds
- created_at

## 4. API Endpoint Desain

### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`

### User
- `GET /api/user/me`
- `GET /api/user/subscription`
- `GET /api/user/ranking`

### Package & Subscription
- `GET /api/packages`
- `POST /api/subscriptions/select`
- `GET /api/subscriptions/status`

### Payment
- `POST /api/payments/create`
- `POST /api/payments/webhook`

### Tryout
- `GET /api/tryouts`
- `GET /api/tryouts/:tryoutId/questions`
- `POST /api/tryouts/:tryoutId/submit`
- `GET /api/tryouts/:tryoutId/results`
- `GET /api/tryouts/:tryoutId/ranking`

### Admin
- `POST /api/admin/upload-questions`
- `GET /api/admin/upload-template`
- `POST /api/admin/users/:userId/reset-device`
- `POST /api/admin/tryouts`
- `POST /api/admin/categories`

## 5. Flow Utama

1. User register/login
2. Pilih paket
3. Generate QRIS
4. Bayar
5. Webhook gateway update status `paid`
6. Subscription aktif
7. Pilih TO
8. Kerjakan soal
9. Submit hasil
10. Lihat nilai & ranking

## 6. Contoh Implementasi Backend

Saya menyiapkan starter backend di `backend/`:
- `backend/src/app.js` → Express app
- `backend/src/routes/auth.js` → register/login
- `backend/src/middleware/auth.js` → JWT
- `backend/src/middleware/deviceCheck.js` → validasi device
- `backend/src/utils/csvImporter.js` → parsing CSV/XLSX
- `backend/src/services/subscriptionService.js` → update kuota & status

### Contoh JWT auth (Node.js)

```js
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

function signToken(user) {
  return jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '30d' });
}

async function login(req, res) {
  const { email, password, device_id } = req.body;
  const user = await db('users').where({ email }).first();
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).json({ message: 'Invalid credentials' });

  if (user.device_id && user.device_id !== device_id) {
    return res.status(403).json({ message: 'Login dari device lain ditolak' });
  }

  await db('users').where({ id: user.id }).update({ device_id, subscription_status: user.subscription_status || 'none' });
  return res.json({ token: signToken(user), user: { id: user.id, name: user.name, role: user.role } });
}
```

## 7. Logic Scoring & Ranking

### Skor
- TIU & TWK: benar = 5, salah = 0
- TKP: gunakan skala 1–5 berdasarkan bobot jawaban

### Contoh perhitungan

```js
function scoreAnswer(question, selectedAnswer) {
  if (question.category_name === 'TKP') {
    return scoreTkp(selectedAnswer);
  }
  return selectedAnswer === question.correct_answer ? 5 : 0;
}

function calculateResult(answers, questions) {
  let score_tiu = 0;
  let score_twk = 0;
  let score_tkp = 0;

  answers.forEach((item) => {
    const question = questions.find((q) => q.id === item.question_id);
    const score = scoreAnswer(question, item.selected_answer);
    if (question.category_name === 'TIU') score_tiu += score;
    if (question.category_name === 'TWK') score_twk += score;
    if (question.category_name === 'TKP') score_tkp += score;
  });

  return { score_tiu, score_twk, score_tkp, total_score: score_tiu + score_twk + score_tkp };
}
```

### Ranking
- Hitung `total_score`
- Jika skor sama, gunakan `time_used_seconds` lebih kecil jadi rank lebih baik
- Top 10 per `tryout`
- Global ranking berdasarkan total akumulasi score atau skor teratas di setiap TO

## 8. Parsing CSV / XLSX

Gunakan `csv-parse` untuk CSV dan `xlsx` untuk XLSX.
Format header wajib:
- `tryout`, `category`, `question`, `A`, `B`, `C`, `D`, `E`, `answer`, `explanation`

Contoh parsing CSV:

```js
const { parse } = require('csv-parse');
const fs = require('fs');

function parseCsv(filePath) {
  return new Promise((resolve, reject) => {
    const rows = [];
    fs.createReadStream(filePath)
      .pipe(parse({ columns: true, skip_empty_lines: true, trim: true }))
      .on('data', (row) => rows.push(row))
      .on('end', () => resolve(rows))
      .on('error', reject);
  });
}
```

## 9. Best Practice Keamanan

- Simpan `JWT_SECRET` di environment variables
- Hash password dengan `bcrypt`
- Gunakan HTTPS di production
- Batasi upload file dengan `multer`
- Validasi ukuran dan tipe file
- Gunakan prepared statement / query parameterization
- Cegah SQL injection
- Batasi rate limit endpoint login dan payment

## 10. Saran Scaling

- Gunakan cache Redis untuk session, rate limit, dan ranking sementara
- Pisahkan worker untuk webhook dan import file
- Gunakan indexing di `user_id`, `tryout_id`, `created_at`
- Gunakan database read replica untuk laporan/ranking
- Buat auto-scaling API di container / Kubernetes jika traffic naik

## 11. Struktur Proyek yang Disarankan

```
/backend
  /src
    /controllers
    /middleware
    /routes
    /services
    /utils
    app.js
    db.js
    config.js
  package.json
  knexfile.js
  .env.example
/frontend
  /src
    App.js
    api.js
    pages
    components
  package.json
```

## 12. Langkah Berikutnya

1. Pilih stack final: `Node.js + React` atau `Laravel + React`
2. Siapkan database PostgreSQL / MySQL
3. Jalankan `npm install` di `backend/`
4. Kembangkan frontend React dengan halaman login, paket, payment, tryout, dan hasil

---

### Catatan
Saya sudah menyiapkan starter backend di folder `backend/`. Jika Anda ingin, saya bisa lanjut membangun service lengkap dengan autentikasi, subscription, upload soal, dan endpoint payment gateway.
