# Next.js + Laravel API Integration Plan

This frontend is wired to the Laravel API (`apiecomerce`) with a scalable baseline.

## Auth Mode (Phase 1)

- Current mode: Bearer token auth for fast local development.
- Next phase: migrate to HttpOnly cookie flow through Next.js route handlers/proxy.

## Implemented Foundation

- `src/lib/api-client.ts`: typed API wrapper with unified error handling.
- `src/lib/endpoints.ts`: central endpoint registry.
- `src/lib/auth.ts`: token persistence helpers.
- `src/types/*`: core domain types (`user`, `product`, `cart`, `order`).
- `src/hooks/use-auth.ts`: login/register/me/logout hooks.
- `src/hooks/use-products.ts`: products data hooks.
- `middleware.ts`: role-aware route guard skeleton for `/admin/*` and `/vendor/*`.
- `.env.example`: API base URL and future redirect/webhook-related values.

## Day-by-Day Execution

### Day 1

- Auth flow pages: `/login`, `/register`, `/profile`.
- Connect forms with `useLogin`, `useRegister`, and `useMe`.
- Store role in cookie after login to activate route guard middleware.
- Add global error handling for `401/403/422` + toasts.

### Day 2

- Public products and categories listing pages.
- Product details page with reviews listing.

### Day 3

- Cart and wishlist full integration.
- Checkout + orders flow.

### Day 4

- Payment initiate and status tracking pages.
- Notifications center.

### Day 5

- Admin and vendor dashboards.
- Hardening, smoke tests, and deployment configs.

## First PR Structure (Suggested)

- `feat(integration): add api client and typed endpoint map`
- `feat(auth): add token-based auth helpers and react-query hooks`
- `feat(guards): add role-based middleware skeleton`
- `docs: add integration execution checklist`
