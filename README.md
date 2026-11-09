# لوحة تحكم أكاديمية هالة

React + TypeScript + Tailwind + Framer Motion

## التشغيل
```
npm install
npm run dev        # http://localhost:5173
```
الـ Backend لازم يكون شغال على `http://localhost:3000` (الـ proxy في vite.config.ts بيحوّل `/api` له، فالكوكيز بتشتغل بدون إعداد CORS).
في الـ production: انسخ `.env.example` إلى `.env` وحط `VITE_API_URL` برابط السيرفر، وفعّل `cors({ origin, credentials: true })` في الـ Backend.

## الصفحات
- `/login` — دخول الأدمن
- `/` — نظرة عامة
- `/users` — المستخدمين (فلتر role + pagination + تفاصيل)
- `/applications` — الاستمارات
