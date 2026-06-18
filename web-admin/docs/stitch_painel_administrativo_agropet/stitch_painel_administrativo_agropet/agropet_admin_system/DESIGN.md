---
name: AgroPet Admin System
colors:
  surface: '#fff8f5'
  surface-dim: '#ecd6ca'
  surface-bright: '#fff8f5'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#fff1ea'
  surface-container: '#ffeade'
  surface-container-high: '#fae4d8'
  surface-container-highest: '#f4ded2'
  on-surface: '#241912'
  on-surface-variant: '#574235'
  inverse-surface: '#3b2e26'
  inverse-on-surface: '#ffede4'
  outline: '#8b7263'
  outline-variant: '#dfc1af'
  surface-tint: '#964900'
  primary: '#964900'
  on-primary: '#ffffff'
  primary-container: '#f97d01'
  on-primary-container: '#5a2900'
  inverse-primary: '#ffb787'
  secondary: '#565e71'
  on-secondary: '#ffffff'
  secondary-container: '#d8dff5'
  on-secondary-container: '#5b6375'
  tertiary: '#006399'
  on-tertiary: '#ffffff'
  tertiary-container: '#00a7fd'
  on-tertiary-container: '#00395b'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdcc7'
  primary-fixed-dim: '#ffb787'
  on-primary-fixed: '#311300'
  on-primary-fixed-variant: '#723600'
  secondary-fixed: '#dbe2f8'
  secondary-fixed-dim: '#bec6dc'
  on-secondary-fixed: '#131c2b'
  on-secondary-fixed-variant: '#3f4758'
  tertiary-fixed: '#cde5ff'
  tertiary-fixed-dim: '#94ccff'
  on-tertiary-fixed: '#001d32'
  on-tertiary-fixed-variant: '#004b74'
  background: '#fff8f5'
  on-background: '#241912'
  surface-variant: '#f4ded2'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  title-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  2xl: 48px
  gutter: 24px
  margin: 32px
---

## Brand & Style
The design system for this administrative panel is built upon a foundation of **Corporate Modernism** with a high-fidelity, premium finish. It balances the energetic warmth of the pet industry with the rigorous precision required for business management. 

The aesthetic is characterized by expansive whitespace, a disciplined information hierarchy, and subtle tactile depth. It aims to evoke a sense of reliability and ease of use, ensuring that complex data management feels approachable rather than overwhelming. The interface uses high-contrast typography and intentional "breathing room" to reduce cognitive load for administrators.

## Colors
The palette is dominated by a professional "Midnight Navy" for structural elements and primary text, providing a stable anchor for the vibrant brand orange.

- **Primary Orange (#F97D01):** Reserved for primary actions, branding, and active states. It signifies energy and attention.
- **Dark Orange (#E96310):** Utilized exclusively for hover and pressed states of primary elements to provide visual feedback.
- **Dark Blue (#1C2434):** The core of the navigation and text system. It creates a high-contrast, premium environment.
- **Background (#F9FAFB):** A soft, neutral off-white that prevents screen glare during long administrative sessions.
- **Surface (#FFFFFF):** Pure white is used for cards and content containers to create a clear "layer" above the background.

## Typography
This design system utilizes **Inter** for its exceptional legibility in data-heavy environments. The typographic scale is optimized for information density without sacrificing clarity.

- **Headlines:** Use SemiBold (600) or Bold (700) with slight negative letter-spacing to maintain a modern, "tight" look.
- **Body Text:** Set in Regular (400) for maximum readability. Use `body-sm` (14px) as the standard for data tables and sidebar items.
- **Labels:** Use Medium (500) or SemiBold (600) to distinguish metadata and form headers from standard body text.
- **Color Application:** Use the Dark Blue for primary text and a 60% opacity variant for secondary or "de-emphasized" information.

## Layout & Spacing
The layout follows a **Fluid Grid** logic with a maximum container width of 1600px for ultra-wide monitors. 

- **Sidebar:** Fixed at 280px. This uses the Dark Blue background to separate navigation from the workspace.
- **Main Content:** Utilizes a 12-column grid system with 24px gutters.
- **Padding:** A standard 24px (lg) padding is applied to all main content cards and containers to maintain consistent internal margins.
- **Breakpoints:**
  - *Desktop:* 1280px+ (Full sidebar visible)
  - *Tablet:* 768px - 1279px (Sidebar collapses to icons or hidden behind hamburger)
  - *Mobile:* Under 768px (Single column layout, 16px margins)

## Elevation & Depth
Depth is created through a mix of **Tonal Layers** and **Ambient Shadows**.

1. **Level 0 (Background):** #F9FAFB. The lowest layer.
2. **Level 1 (Cards/Surfaces):** White background with a 1px border (#E2E8F0) and a soft, diffused shadow (0px 20px 25px -5px rgba(0, 0, 0, 0.04)).
3. **Level 2 (Modals/Dropdowns):** White background with a more pronounced shadow (0px 25px 50px -12px rgba(0, 0, 0, 0.15)) and a subtle backdrop blur (glassmorphism) of 8px on the overlay.

Borders are used sparingly to define structure, preferring light gray (#E2E8F0) to keep the UI clean.

## Shapes
The shape language is friendly yet professional, moving away from sharp corners to communicate the approachable nature of a pet-focused brand.

- **Standard Containers:** Use `rounded-lg` (0.5rem / 8px) for input fields, buttons, and small widgets.
- **Feature Cards:** Use `rounded-xl` (1rem / 16px) for main dashboard cards and product images.
- **Avatars/Badges:** Use full pill-shaped rounding for status indicators and user profiles.

## Components
- **Buttons:** 
  - *Primary:* Solid Brand Orange with white text. 8px corner radius.
  - *Secondary:* Transparent with Brand Orange border and text.
- **Stats Cards:** Featured at the top of dashboards. Includes an icon with a 15% opacity background of the primary color, a large `headline-md` value, and a small trend indicator (green/red).
- **Navigation Sidebar:** Dark Blue background. Active items use a left-hand orange border (4px) and a subtle white-to-transparent gradient background at 5% opacity.
- **Data Tables:** Clean rows with 1px bottom borders. Header row in a very light gray (#F1F5F9) with `label-sm` uppercase text.
- **Input Fields:** White background, 1px #E2E8F0 border. On focus, the border transitions to Brand Orange with a 3px soft orange outer glow.
- **POS Interface:** High-density layout. Items are represented by cards with clear price labels in the Dark Blue and a "Quick Add" button in Brand Orange.