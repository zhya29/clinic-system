# 🏥 ڕێنمایی دامەزراندنی تەواو

---

## ١. سەرووی سێرڤەر (Ubuntu 22.04)

```bash
# Docker دامەزرێنە
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
sudo apt install docker-compose-plugin -y
```

---

## ٢. پرۆژە بخەرە سەر سێرڤەر

```bash
# فایلەکان بنێرە بۆ سێرڤەر
scp -r clinic/ user@YOUR_SERVER_IP:/home/clinic/
ssh user@YOUR_SERVER_IP
cd /home/clinic
```

---

## ٣. ژینگەی کارکردن ڕێکبخە

```bash
cp .env.example .env
nano .env
# پڕبکەرەوە:
# DB_PASSWORD=پاسوۆردی بەهێز
# SECRET_KEY=کلیلی نهێنی
# ALLOWED_HOSTS=ip_یا_دۆمەینەکەت
```

---

## ٤. دەستپێکردن

```bash
docker compose up -d --build

# کاربەری ئادمین دروستبکە
docker compose exec backend python manage.py createsuperuser

# لۆگەکان ببینە
docker compose logs -f backend
```

✅ ئەپەکە ئێستا لە: http://YOUR_SERVER_IP

---

## ٥. بەکاپی ئۆتۆماتیک

```bash
chmod +x scripts/backup.sh
crontab -e
# ئەمە زیاد بکە — هەموو ڕۆژ کاتژمێر ٢ی شەو
0 2 * * * DB_PASSWORD=پاسوۆردەکەت /home/clinic/scripts/backup.sh >> /home/clinic/backups/backup.log 2>&1
```

---

## ٦. PDF راپۆرت

```bash
docker compose exec backend pip install reportlab
```
دواتر لە URL: `http://YOUR_IP/api/reports/pdf/`

---

## ٧. ئاگادارکردنەوە (یادخستنەوەی کاتژمێر)

```bash
# بە کرۆن — هەموو ڕۆژ کاتژمێر ٨ی بەیانی
0 8 * * * curl -X POST http://localhost/api/notifications/send_reminders/ -H "Authorization: Bearer TOKEN"
```

---

## ٨. مۆبایل ئەپ (Expo)

```bash
cd mobile
npm install
# ئیپی سێرڤەرت لە src/api/index.js بنووسە
# BASE_URL = 'http://YOUR_SERVER_IP:8000/api'
npx expo start
# QR کۆد بخوێنەرەوە لە Expo Go ئەپ
```

---

## ٩. Admin Panel
```
http://YOUR_SERVER_IP/admin/
```
بەکاربەر و پاسوۆردی `createsuperuser` بەکاربهێنە.

---

## ١٠. نوێکردنەوەی ئەپ

```bash
cd /home/clinic
git pull  # یان فایلە نوێکراوەکان بنێرە
docker compose up -d --build
```

---

## ئامارەی API

| URL | کار |
|-----|-----|
| /api/auth/login/ | چوونەژوورەوە |
| /api/patients/ | نەخۆشەکان |
| /api/appointments/ | کاتژمێرەکان |
| /api/payments/ | پارەدانەکان |
| /api/doctors/ | دکتۆرەکان |
| /api/notifications/ | ئاگادارکردنەوەکان |
| /api/reports/pdf/ | راپۆرتی PDF |
| /admin/ | پانێلی بەڕێوەبەری |

---

## Stack تەواو

| بەش | تەکنەلۆژی |
|-----|-----------|
| Backend | Django 4.2 + DRF + JWT |
| Frontend | React 18 |
| Mobile | React Native + Expo |
| Database | PostgreSQL 15 |
| Server | Nginx + Gunicorn |
| Container | Docker + Docker Compose |
| Charts | Chart.js |
| PDF | ReportLab |
| Backup | pg_dump + cron |
