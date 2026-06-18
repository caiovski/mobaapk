# Tasks: Web Platforms Architecture

## Phase 1: Environment & Setup
- [ ] Initialize `web-admin` project using React/Next.js/Vite.
- [ ] Initialize `web-cliente` project using React/Next.js/Vite.
- [ ] Configure Supabase client in both projects to point to the shared project environment.
- [ ] Setup UI libraries (e.g., Tailwind CSS, Material UI) consistent with the native apps' design system.

## Phase 2: Supabase Integration & Authentication
- [ ] Implement Auth flow for `web-admin` (Restricted access).
- [ ] Implement Auth flow for `web-cliente` (Sign up, Login, Guest mode).

## Phase 3: The Omnichannel Cart Sync
- [ ] In `agropet-cliente`, implement the sync routine: send SQLite cart to Supabase upon connection.
- [ ] In `web-cliente`, implement logic to fetch the cart from Supabase `carts` table upon login.
- [ ] In `web-cliente`, implement fallback to `localStorage` for unauthenticated sessions.

## Phase 4: `web-admin` Core Features
- [ ] Build the Desktop PDV (Ponto de Venda) interface.
- [ ] Build the Dashboard with complex reports/metrics.
- [ ] Implement Inventory & Product Management screens.

## Phase 5: `web-cliente` Core Features
- [ ] Build the Landing Page & Product Catalog.
- [ ] Build the Checkout Flow.
- [ ] Build the Order Status screen (Text only, intentionally omitting map).
- [ ] Add UX/UI banners prompting users to download the Native App.
