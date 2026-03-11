# Endpoint Coverage Matrix

This matrix maps Laravel API routes from `apiecomerce/routes/api.php` to frontend integration points in `Ecommerce`.

## Auth

- `POST /auth/register` -> `app/api/auth/register/route.ts`
- `POST /auth/login` -> `app/api/auth/login/route.ts`
- `POST /auth/logout` -> `app/api/auth/logout/route.ts`
- `GET /auth/me` -> `app/api/auth/me/route.ts`, `src/hooks/use-auth.ts`

## Public Catalog

- `GET /categories` -> `src/hooks/use-categories.ts`, `app/categories/page.tsx`
- `GET /categories/{slug}` -> `src/hooks/use-categories.ts`
- `GET /products` -> `src/hooks/use-products.ts`, `app/page.tsx`
- `GET /products/{slug}` -> `src/hooks/use-products.ts`, `app/products/[slug]/page.tsx`
- `GET /products/{productId}/reviews` -> `src/hooks/use-reviews.ts`

## Customer (Auth)

- `GET /cart` -> `src/hooks/use-cart.ts`, `app/cart/page.tsx`
- `POST /cart/items` -> `src/hooks/use-cart.ts`
- `PUT /cart/items/{productId}` -> `src/hooks/use-cart.ts`
- `DELETE /cart/items/{productId}` -> `src/hooks/use-cart.ts`
- `DELETE /cart` -> `src/hooks/use-cart.ts`
- `GET /wishlist` -> `src/hooks/use-cart.ts`, `app/wishlist/page.tsx`
- `POST /wishlist` -> `src/hooks/use-cart.ts`
- `DELETE /wishlist/{productId}` -> `src/hooks/use-cart.ts`
- `POST /products/{productId}/reviews` -> `src/hooks/use-reviews.ts`
- `PUT /reviews/{id}` -> `src/hooks/use-reviews.ts`
- `DELETE /reviews/{id}` -> `src/hooks/use-reviews.ts`
- `POST /coupons/validate` -> `src/hooks/use-orders.ts (useValidateCoupon)`, `app/checkout/page.tsx`
- `POST /orders` -> `src/hooks/use-orders.ts`, `app/checkout/page.tsx`
- `GET /orders` -> `src/hooks/use-orders.ts`, `app/orders/page.tsx`
- `GET /orders/{orderNumber}` -> `src/hooks/use-orders.ts`
- `PATCH /orders/{orderNumber}/cancel` -> `src/hooks/use-orders.ts`, `app/orders/page.tsx`
- `POST /payments/initiate` -> `src/hooks/use-orders.ts`, `app/orders/page.tsx`
- `GET /payments/{orderNumber}/status` -> `src/hooks/use-orders.ts`, `app/orders/page.tsx`
- `POST /payments/{orderNumber}/refund` -> `src/hooks/use-orders.ts (useRefundPayment)`, `app/orders/page.tsx`
- `GET /notifications` -> `src/hooks/use-notifications.ts`, `app/notifications/page.tsx`
- `GET /notifications/unread` -> `src/hooks/use-notifications.ts`
- `PATCH /notifications/{id}/read` -> `src/hooks/use-notifications.ts`
- `POST /notifications/read-all` -> `src/hooks/use-notifications.ts`
- `DELETE /notifications/{id}` -> `src/hooks/use-notifications.ts`

## Vendor

- `GET /vendor/products` -> `src/hooks/use-vendor.ts`, `app/vendor/products/page.tsx`
- `POST /vendor/products` -> `src/hooks/use-vendor.ts`, `app/vendor/products/page.tsx`
- `PUT /vendor/products/{id}` -> `src/hooks/use-vendor.ts`, `app/vendor/products/page.tsx`
- `DELETE /vendor/products/{id}` -> `src/hooks/use-vendor.ts`, `app/vendor/products/page.tsx`
- `POST /vendor/products/{id}/images` -> `src/hooks/use-vendor.ts`
- `DELETE /vendor/products/{id}/images/{imageId}` -> `src/hooks/use-vendor.ts`
- `POST /vendor/products/{id}/videos` -> `src/hooks/use-vendor.ts`
- `DELETE /vendor/products/{id}/videos/{videoId}` -> `src/hooks/use-vendor.ts`
- `PATCH /vendor/products/{id}/images/{imageId}/primary` -> `src/hooks/use-vendor.ts`
- `GET /vendor/orders` -> `src/hooks/use-vendor.ts`, `app/vendor/orders/page.tsx`

## Admin

- Dashboard
  - `GET /admin/dashboard/overview` -> `src/hooks/use-admin.ts`, `app/admin/page.tsx`
  - `GET /admin/dashboard/revenue-chart` -> `src/hooks/use-admin.ts`, `app/admin/page.tsx`
  - `GET /admin/dashboard/orders-chart` -> `src/hooks/use-admin.ts`, `app/admin/page.tsx`
  - `GET /admin/dashboard/top-products` -> `src/hooks/use-admin.ts`, `app/admin/page.tsx`
  - `GET /admin/dashboard/top-vendors` -> `src/hooks/use-admin.ts`, `app/admin/page.tsx`
  - `GET /admin/dashboard/top-customers` -> `src/hooks/use-admin.ts`, `app/admin/page.tsx`
  - `GET /admin/dashboard/recent-orders` -> `src/hooks/use-admin.ts`, `app/admin/page.tsx`
  - `GET /admin/dashboard/recent-reviews` -> `src/hooks/use-admin.ts`, `app/admin/page.tsx`
  - `GET /admin/dashboard/low-stock` -> `src/hooks/use-admin.ts`, `app/admin/page.tsx`
- Users
  - `GET /admin/users` -> `src/hooks/use-admin.ts`, `app/admin/users/page.tsx`
  - `GET /admin/users/{id}` -> `src/hooks/use-admin.ts`, `app/admin/users/page.tsx`
  - `PUT /admin/users/{id}` -> `src/hooks/use-admin.ts`, `app/admin/users/page.tsx`
  - `PATCH /admin/users/{id}/toggle-active` -> `src/hooks/use-admin.ts`, `app/admin/users/page.tsx`
  - `PATCH /admin/users/{id}/role` -> `src/hooks/use-admin.ts`, `app/admin/users/page.tsx`
  - `DELETE /admin/users/{id}` -> `src/hooks/use-admin.ts`, `app/admin/users/page.tsx`
- Products
  - `GET /admin/products` -> `src/hooks/use-admin.ts`, `app/admin/products/page.tsx`
  - `GET /admin/products/{id}` -> `src/hooks/use-admin.ts`, `app/admin/products/page.tsx`
  - `PATCH /admin/products/{id}/toggle-active` -> `src/hooks/use-admin.ts`, `app/admin/products/page.tsx`
  - `PATCH /admin/products/{id}/toggle-featured` -> `src/hooks/use-admin.ts`, `app/admin/products/page.tsx`
  - `DELETE /admin/products/{id}` -> `src/hooks/use-admin.ts`, `app/admin/products/page.tsx`
- Categories
  - `GET /admin/categories` -> `src/hooks/use-admin.ts`, `app/admin/categories/page.tsx`
  - `POST /admin/categories` -> `src/hooks/use-admin.ts`, `app/admin/categories/page.tsx`
  - `PUT /admin/categories/{id}` -> `src/hooks/use-admin.ts`, `app/admin/categories/page.tsx`
  - `DELETE /admin/categories/{id}` -> `src/hooks/use-admin.ts`, `app/admin/categories/page.tsx`
- Orders
  - `GET /admin/orders` -> `src/hooks/use-admin.ts`, `app/admin/orders/page.tsx`
  - `GET /admin/orders/statistics` -> `src/hooks/use-admin.ts`, `app/admin/orders/page.tsx`
  - `GET /admin/orders/export` -> `src/hooks/use-admin.ts`, `app/admin/orders/page.tsx`
  - `GET /admin/orders/{orderNumber}` -> `src/hooks/use-admin.ts`
  - `PATCH /admin/orders/{orderNumber}/status` -> `src/hooks/use-admin.ts`, `app/admin/orders/page.tsx`
- Coupons
  - `GET /admin/coupons` -> `src/hooks/use-admin.ts`, `app/admin/coupons/page.tsx`
  - `POST /admin/coupons` -> `src/hooks/use-admin.ts`, `app/admin/coupons/page.tsx`
  - `PUT /admin/coupons/{id}` -> `src/hooks/use-admin.ts`, `app/admin/coupons/page.tsx`
  - `DELETE /admin/coupons/{id}` -> `src/hooks/use-admin.ts`, `app/admin/coupons/page.tsx`
- Reviews
  - `GET /admin/reviews` -> `src/hooks/use-admin.ts`, `app/admin/reviews/page.tsx`
  - `PATCH /admin/reviews/{id}/approve` -> `src/hooks/use-admin.ts`, `app/admin/reviews/page.tsx`
- Settings
  - `GET /admin/settings` -> `src/hooks/use-admin.ts`, `app/admin/settings/page.tsx`
  - `PUT /admin/settings` -> `src/hooks/use-admin.ts`, `app/admin/settings/page.tsx`
