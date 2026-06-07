# 🌸 Flora Egypt — Bilingual shoes and bags  E-Commerce Store

A full-stack, production-ready bilingual (Arabic/English) fashion e-commerce platform built with Next.js, TypeScript, PostgreSQL, and Prisma ORM. Customers can browse products, manage their cart and wishlist, and checkout securely — while admins control everything through a powerful CMS dashboard.

🌐 **Live Site:** [floraegypt.com](https://floraegypt.com)

---

## ✨ Features

### Customer Side
- 🌍 **Bilingual support** — full Arabic & English with RTL/LTR switching (next-intl)
- 🛍️ Browse products by category with filters and search
- ❤️ Wishlist — save favourite products
- 🛒 Cart — add, update, and remove items
- 💳 Secure checkout .
- 📦 Order tracking and order history dashboard
- 📱 Fully responsive — mobile-first design

### Admin Dashboard
- Manage products (add, edit, delete, images upload)
- Manage categories and collections
- View and manage all customer orders
- Update order statuses in real-time
- Manage promotions and featured products
- Full CMS — non-technical admins can update content independently

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, TypeScript, Tailwind CSS, shadcn/ui |
| Backend | Next.js API Routes, Node.js |
| Database | PostgreSQL + PLpgSQL (custom DB functions) |
| ORM | Prisma |
| i18n | next-intl (Arabic + English) |
| State | Zustand |
| Deployment | Vercel |

---

## 📁 Project Structure

```
├── app/
│   ├── [locale]/          # Localized routes (ar/en)
│   │   ├── (store)/       # Customer-facing pages
│   │   └── (admin)/       # Admin dashboard pages
│   └── api/               # API routes
├── messages/
│   ├── ar.json            # Arabic translations
│   └── en.json            # English translations
├── prisma/
│   └── schema.prisma      # Database schema
├── lib/                   # Utility functions & helpers
├── store/                 # Zustand state management
├── constants/             # App-wide constants
├── types/                 # TypeScript types
└── middleware.ts          # i18n + auth middleware
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database
- Stripe account (for payments)
- npm or yarn



Open [http://localhost:3000](http://localhost:3000) in your browser.

The app supports two locales:
- Arabic: [http://localhost:3000/ar](http://localhost:3000/ar)
- English: [http://localhost:3000/en](http://localhost:3000/en)


---

## 👨‍💻 Developer

**Ahmed Shams** — Full Stack Developer

- 🌐 Portfolio: [ahmedshamsportfolioooo.netlify.app](https://ahmedshamsportfolioooo.netlify.app)
- 💼 LinkedIn: [linkedin.com/in/ahmed-shams-42aa62216](https://www.linkedin.com/in/ahmed-shams-42aa62216)
- 🐙 GitHub: [@AhmedSamirshams98](https://github.com/AhmedSamirshams98)

