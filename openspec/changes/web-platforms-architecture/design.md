# Design: Web Platforms Architecture

## 1. Directory Structure
The monorepo (or main workspace) will adopt the following structure to distinguish the platforms:
```text
mobaapk/
  ├─ agropet-admin/   (Existing Native App - Admin)
  ├─ agropet-cliente/ (Existing Native App - Client)
  ├─ web-admin/       (New React/Next.js App - Admin)
  └─ web-cliente/     (New React/Next.js App - Client)
```

## 2. Centralized Database (Supabase)
Supabase (PostgreSQL + Real-time subscriptions) acts as the single source of truth for all four platforms.
- `web-admin` and `agropet-admin` both read/write to the same Admin-level tables (e.g., changing product stock).
- `web-cliente` and `agropet-cliente` both read/write to the same Client-level tables (e.g., placing an order).

## 3. Cart & Offline-First Synchronization Architecture

### The Mobile Experience (`agropet-cliente`)
- **Offline Capabilities**: Uses local `SQLite` to store the cart state.
- **Background Sync**: When an internet connection is detected, the local SQLite cart is synced upward to the Supabase `carts` table.

### The Web Experience (`web-cliente`)
- **Online-Only**: Requires internet access to load.
- **Cart Retrieval**: Upon authentication, the web client directly queries the Supabase `carts` table. If the user previously added items via the mobile app (and synced them), those items will be present on the Web.
- **Guest Mode**: If the user is not logged in, the web client uses `localStorage` to hold the cart temporarily until checkout/login.

## 4. Feature Parity & Restrictions

### `web-admin`
- **100% Parity** with `agropet-admin`, plus extended capabilities.
- **Exclusive focus**: A robust PDV (Ponto de Venda) for physical store cashiers.

### `web-cliente`
- **Restricted Parity**: Basic product catalog, cart, and checkout flow.
- **Restrictions**: 
  - No real-time map tracking for deliveries (only text-based status).
  - No push notifications.
  - Aggressive UI prompts ("Download the App to track your order live!").
