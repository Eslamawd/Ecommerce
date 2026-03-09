# 🛍️ Ecommerce — Next.js Frontend

> **الـ Frontend الكامل** لمشروع المتجر الإلكتروني مبني على Next.js 16 + TypeScript، متصل بـ Laravel API عبر Next.js Route Handlers كـ Secure Proxy.

---

## 🧱 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 16 (App Router) |
| **Language** | TypeScript 5 |
| **Styling** | Tailwind CSS 3 |
| **Server State** | TanStack React Query 5 |
| **Client State** | Zustand 5 |
| **Animations** | Framer Motion 12 |
| **Icons** | Lucide React |
| **Themes** | next-themes (Dark/Light mode) |
| **Toasts** | react-hot-toast |
| **Date Utils** | Day.js |

---

## 🗂️ Project Structure

```
app/
├── api/                          # Next.js Route Handlers (Secure Proxy)
│   ├── _lib/
│   │   └── laravel.ts           # Helper لـ Laravel API calls
│   ├── auth/
│   │   ├── login/route.ts       # POST /api/auth/login
│   │   ├── register/route.ts    # POST /api/auth/register
│   │   ├── logout/route.ts      # POST /api/auth/logout
│   │   └── me/route.ts          # GET  /api/auth/me
│   └── proxy/[...path]/route.ts # Generic Proxy لكل الـ API calls الأخرى
│
├── (pages)/
│   ├── page.tsx                 # Home Page
│   ├── login/                   # صفحة تسجيل الدخول
│   ├── register/                # صفحة التسجيل
│   ├── products/                # قائمة ومنتج واحد
│   ├── categories/              # الأقسام
│   ├── cart/                    # السلة
│   ├── checkout/                # الـ Checkout
│   ├── orders/                  # طلباتي
│   ├── wishlist/                # المفضلة
│   ├── profile/                 # الملف الشخصي
│   ├── notifications/           # الإشعارات
│   ├── vendor/                  # لوحة الفيندور
│   ├── admin/                   # لوحة الأدمن
│   └── 403/                     # صفحة Unauthorized
│
├── layout.tsx                   # Root Layout
├── globals.css                  # Global Styles
└── providers.tsx                # React Query + Theme Providers

src/
├── components/
│   ├── site-nav.tsx             # Navigation Bar (responsive + role-aware)
│   ├── theme-toggle.tsx         # Dark/Light Mode Toggle
│   ├── theme-provider.tsx       # Theme Provider Wrapper
│   └── pagination-controls.tsx  # Pagination Component
├── hooks/
│   ├── use-auth.ts              # useLogin, useRegister, useMe, useLogout
│   └── use-products.ts          # Products data hooks
├── lib/
│   ├── api-client.ts            # Typed API wrapper + Error handling
│   ├── endpoints.ts             # Central endpoint registry
│   └── auth.ts                  # Token persistence helpers
└── types/
    └── *.ts                     # Core domain types (user, product, cart, order)
```

---

## 🔐 Authentication Architecture

الـ Authentication بيشتغل بطريقة **Secure Cookie-based** عبر Next.js Route Handlers:

```
Browser → Next.js Route Handler → Laravel API
```

### كيف بيشتغل:
1. **Login/Register:** الـ Frontend بيبعت للـ Next.js Route Handler
2. الـ Route Handler بيتصل بـ Laravel API
3. Laravel بيرجع `access_token`
4. Next.js بيحفظ الـ token في **HttpOnly Cookie** (مش accessible من JS)
5. أي request تاني بيمر عبر `/api/proxy/[...path]` اللي بيضيف الـ token تلقائياً

### الـ Cookies المستخدمة:
| Cookie | Value | HttpOnly |
|--------|-------|---------|
| `access_token` | Bearer token | ✅ Yes (secure) |
| `auth_state` | `1` أو فاضي | ❌ No (للـ middleware) |
| `role` | `admin\|vendor\|customer` | ❌ No (للـ route guards) |

---

## 🧭 Navigation & Route Guards

### الـ Navigation بيكون dynamic حسب الـ Role:
| User Type | Links المتاحة |
|-----------|--------------|
| Guest | Home, Shop |
| Customer | + Cart, Orders, Profile |
| Vendor | + Vendor Dashboard |
| Admin | + Admin Dashboard |

### Route Guards (Middleware):
- `/admin/*` → Admins فقط
- `/vendor/*` → Vendors + Admins فقط
- Redirect تلقائي لو مش authorized

---

## 📄 Pages Overview

| Page | Path | Description |
|------|------|-------------|
| Home | `/` | الصفحة الرئيسية |
| Login | `/login` | تسجيل الدخول |
| Register | `/register` | إنشاء حساب |
| Products | `/products` | كل المنتجات |
| Categories | `/categories` | الأقسام |
| Cart | `/cart` | سلة التسوق |
| Checkout | `/checkout` | إتمام الشراء |
| Orders | `/orders` | سجل الطلبات |
| Wishlist | `/wishlist` | المفضلة |
| Profile | `/profile` | الملف الشخصي |
| Notifications | `/notifications` | الإشعارات |
| Vendor | `/vendor` | لوحة تحكم البائع |
| Admin | `/admin` | لوحة تحكم الأدمن |
| 403 | `/403` | Unauthorized |

---

## 🚀 Setup & Installation

```bash
# 1. Install dependencies
npm install

# 2. Setup environment
cp .env.example .env.local

# 3. Edit .env.local
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api

# 4. Run development server
npm run dev
```

### متطلبات:
- Node.js 18+
- الـ Laravel Backend شغال على `localhost:8000`

---

## 📦 Available Scripts

```bash
npm run dev      # Development server
npm run build    # Production build
npm run start    # Production server
npm run lint     # ESLint
```

---

## 🎨 UI Features

- ✅ **Dark/Light Mode** — System preference + manual toggle
- ✅ **Responsive Design** — Mobile-first مع Hamburger menu
- ✅ **Animated Transitions** — Framer Motion للـ mobile menu
- ✅ **Loading States** — React Query built-in
- ✅ **Toast Notifications** — react-hot-toast
- ✅ **Pagination** — Reusable PaginationControls component

---

## 🗺️ Development Roadmap

| Day | Tasks |
|-----|-------|
| **Day 1** ✅ | Auth pages (login, register, profile) + Route Guards |
| **Day 2** | Products & Categories listing + Product details |
| **Day 3** | Cart, Wishlist, Checkout, Orders |
| **Day 4** | Payment, Notifications center |
| **Day 5** | Admin & Vendor dashboards + Deployment |

---

## 🔗 Related Project

- **Backend API:** [`Eslamawd/apiecomerce`](https://github.com/Eslamawd/apiecomerce) — Laravel 12 REST API
