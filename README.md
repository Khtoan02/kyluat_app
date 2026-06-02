# Kỷ Luật — Discipline Tracker App

## Tính năng
- ✅ Check-in từng khung giờ theo thời gian thực
- ⏱️ Đếm độ trễ khi tick (±5 phút buffer)
- ⚠️ Push notification khi bỏ lỡ slot
- 🔄 Xoay A/B tự động (Thứ 2/4/6 = A, Thứ 3/5/7 = B)
- 📊 % kỷ luật từng task và tổng ngày
- 🔥 Streak counter
- 📱 PWA — cài được lên điện thoại
- ☁️ Đồng bộ đa thiết bị qua Supabase

---

## Cài đặt — 3 bước

### Bước 1 — Tạo Supabase (miễn phí)

1. Vào https://supabase.com → Sign up → New Project
2. Vào **SQL Editor** → chạy lệnh sau:

```sql
create table checkins (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  date date not null,
  slot_id text not null,
  checked_at timestamptz,
  status text default 'pending',
  delay_minutes int default 0,
  created_at timestamptz default now(),
  unique(user_id, date, slot_id)
);

alter table checkins enable row level security;

create policy "Users can manage own checkins" on checkins
  for all using (auth.uid() = user_id);
```

3. Vào **Settings → API** → copy:
   - `Project URL`
   - `anon public` key

### Bước 2 — Setup local

```bash
# Clone/copy project về máy
cd discipline-app

# Tạo file .env
cp .env.example .env

# Điền vào .env:
# REACT_APP_SUPABASE_URL=https://xxxxx.supabase.co
# REACT_APP_SUPABASE_ANON_KEY=eyJ...

# Cài dependencies
npm install

# Chạy thử
npm start
```

### Bước 3 — Deploy lên Vercel (miễn phí)

1. Push code lên GitHub
2. Vào https://vercel.com → Import repo
3. Thêm Environment Variables:
   - `REACT_APP_SUPABASE_URL`
   - `REACT_APP_SUPABASE_ANON_KEY`
4. Deploy → có link truy cập ngay!

### Cài lên điện thoại (PWA)
- **iOS**: Mở link trong Safari → Share → "Add to Home Screen"
- **Android**: Chrome sẽ tự hỏi "Install app" → tap Install

---

## Khung giờ mặc định

| Slot | Giờ |
|------|-----|
| ☀️ Thức dậy | 6:00 |
| 🚗 Xuất phát | 7:00 |
| 💼 Văn phòng | 8:00 – 17:30 |
| 🏠 Gia đình | 18:00 – 20:00 |
| 💻 Remote A/B | 20:00 – 22:30 |
| 🎮 Giải trí | 22:30 – 23:30 |
| 🌙 Wind down | 23:30 – 00:00 |
| 😴 Ngủ | 00:00 |

Buffer: ±5 phút mỗi slot
# kyluat_app
