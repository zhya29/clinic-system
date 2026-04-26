# 🏥 سیستەمی کلینیک - راهنمای دامەزراندن

## پێداویستییەکان
- Python 3.10+
- Node.js 18+
- PostgreSQL 14+

---

## ١. Database دروست بکە

```sql
psql -U postgres
CREATE DATABASE clinic_db;
\q
```

---

## ٢. Backend دامەزراندن

```bash
cd backend

# پاکێجەکان دامەزرێنە
pip install -r requirements.txt

# settings.py کراندنەوە و پاسوۆردی database گۆڕین
# DATABASES > PASSWORD = 'پاسوۆردەکەت'

# مایگریشن
python manage.py makemigrations
python manage.py migrate

# ئادمین دروست بکە
python manage.py createsuperuser

# سێرڤەر دەستپێبکە
python manage.py runserver
```

Backend ئێستا لە: http://localhost:8000

---

## ٣. Frontend دامەزراندن

```bash
cd frontend

# پاکێجەکان دامەزرێنە
npm install

# دەستپێکردن
npm start
```

Frontend ئێستا لە: http://localhost:3000

---

## API Endpoints

| Method | URL | کار |
|--------|-----|-----|
| POST | /api/auth/login/ | چوونەژوورەوە |
| GET | /api/patients/ | هەموو نەخۆشەکان |
| POST | /api/patients/ | نەخۆشی نوێ |
| GET | /api/patients/{id}/ | نەخۆشێک |
| PUT | /api/patients/{id}/ | گۆڕانکاری |
| DELETE | /api/patients/{id}/ | سڕینەوە |
| GET | /api/patients/stats/ | ئامارەکان |
| GET | /api/appointments/ | هەموو کاتژمێرەکان |
| POST | /api/appointments/ | کاتژمێری نوێ |
| GET | /api/appointments/today/ | کاتژمێری ئەمڕۆ |
| GET | /api/appointments/stats/ | ئامارەکان |
| GET | /api/doctors/ | هەموو دکتۆرەکان |
| GET | /api/doctors/clinics/ | هەموو کلینیکەکان |

---

## Stack
- **Backend**: Django 4.2 + Django REST Framework
- **Frontend**: React.js
- **Database**: PostgreSQL
- **Auth**: JWT Token
