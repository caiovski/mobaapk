---
name: AgroPet Noir
colors:
  surface: '#131313'
  surface-dim: '#131313'
  surface-bright: '#393939'
  surface-container-lowest: '#0e0e0e'
  surface-container-low: '#1c1b1b'
  surface-container: '#201f1f'
  surface-container-high: '#2a2a2a'
  surface-container-highest: '#353534'
  on-surface: '#e5e2e1'
  on-surface-variant: '#dfc1af'
  inverse-surface: '#e5e2e1'
  inverse-on-surface: '#313030'
  outline: '#a68b7b'
  outline-variant: '#574235'
  surface-tint: '#ffb787'
  primary: '#ffb787'
  on-primary: '#502400'
  primary-container: '#f97d01'
  on-primary-container: '#5a2900'
  inverse-primary: '#964900'
  secondary: '#4ae183'
  on-secondary: '#003919'
  secondary-container: '#06bb63'
  on-secondary-container: '#00431f'
  tertiary: '#92ccff'
  on-tertiary: '#003351'
  tertiary-container: '#48a7eb'
  on-tertiary-container: '#003a5b'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffdcc7'
  primary-fixed-dim: '#ffb787'
  on-primary-fixed: '#311300'
  on-primary-fixed-variant: '#723600'
  secondary-fixed: '#6bfe9c'
  secondary-fixed-dim: '#4ae183'
  on-secondary-fixed: '#00210c'
  on-secondary-fixed-variant: '#005228'
  tertiary-fixed: '#cce5ff'
  tertiary-fixed-dim: '#92ccff'
  on-tertiary-fixed: '#001d31'
  on-tertiary-fixed-variant: '#004b73'
  background: '#131313'
  on-background: '#e5e2e1'
  surface-variant: '#353534'
typography:
  headline-xl:
    fontFamily: Work Sans
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Work Sans
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Work Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-md:
    fontFamily: Work Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
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
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.05em
  label-sm:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 14px
    letterSpacing: 0.05em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 8px
  container-max: 1440px
  gutter: 24px
  margin-desktop: 40px
  margin-tablet: 24px
  margin-mobile: 16px
---

## Brand & Style
The brand personality for this design system is professional, authoritative, and high-performance, tailored for agricultural and veterinary administration. The shift to a dark theme transitions the experience from a utility tool to a premium, focused command center.

The style is **Modern Corporate with Tonal Depth**, emphasizing high-contrast readability and functional clarity. It leverages a "Dark Mode First" philosophy where deep surfaces reduce eye strain during long-shift administrative tasks, while the vibrant primary orange serves as a beacon for action and status. The aesthetic is clean, structured, and dependable, evoking a sense of technological sophistication in the pet and agriculture industry.

## Colors
This design system utilizes a tiered dark palette to establish hierarchy without relying solely on shadows. 

- **Primary Orange (#F97D01):** Reserved for high-priority actions, active states, and critical branding. On dark backgrounds, it maintains a slight glow effect to ensure visibility.
- **Surfaces:** The background starts at `#121212`. As elements move closer to the user in the Z-axis (e.g., cards, modals), the surface color lightens to `#1E1E1E` or `#2C2C2C`.
- **Text:** Pure white is used for headlines to maximize contrast. Secondary text uses a medium gray (`#A0A0A0`) to provide visual rest and hierarchy for metadata.
- **Accents:** Green and Blue are used sparingly for "Success" (Growth/Health) and "Info" (Data/Logistics) states respectively.

## Typography
The typography system balances the professional weight of **Work Sans** for headings with the systematic efficiency of **Inter** for data-heavy body content. 

**JetBrains Mono** is introduced for labels, ID tags, and numerical data (SKUs, animal IDs, quantities) to reinforce the "Admin/System" feel and ensure tabular numbers align perfectly. 

For mobile readability, headlines scale down significantly to prevent awkward word breaks in narrow containers. Line heights are generous to prevent the "halp effect" where light text on dark backgrounds can appear to bleed into adjacent lines.

## Layout & Spacing
The layout follows a **Fixed-Fluid Hybrid Grid**. On desktop, the main navigation is a fixed 280px sidebar, while the content area sits in a 12-column fluid grid with a maximum cap of 1440px.

A strict 8px spacing power-of-two scale is used for all margins and paddings. 
- **Desktop:** Large margins (40px) provide breathing room for complex data tables.
- **Tablet:** Margins contract to 24px, and the sidebar collapses into a hamburger menu.
- **Mobile:** Margins are 16px. Cards become full-width to maximize the horizontal real estate for touch targets.

## Elevation & Depth
In this dark theme, depth is communicated through **Tonal Elevation** rather than traditional drop shadows. 

1. **Level 0 (Background):** `#121212` - The canvas.
2. **Level 1 (Cards/Sidebar):** `#1E1E1E` - Uses a 1px subtle border (`#2C2C2C`) to define edges.
3. **Level 2 (Modals/Popovers):** `#2C2C2C` - Uses a soft, large-radius black shadow (`0 12px 32px rgba(0,0,0,0.5)`) to create a floating effect.

For interactive elements, "Inner Glows" (subtle 1px top borders) are used to simulate light hitting the top edge of a physical button or card, enhancing the tactile feel.

## Shapes
This design system uses **Soft (0.25rem)** roundedness to maintain a professional, slightly technical appearance. 

- **Standard Elements (Buttons, Inputs):** 4px (`0.25rem`) corner radius.
- **Containers (Cards, Modals):** 8px (`0.5rem`) corner radius.
- **Feedback Elements (Toast alerts):** 12px (`0.75rem`) to stand out from the rigid structural grid.

Avoid pill-shapes for primary buttons to keep the "Admin" aesthetic grounded; reserve fully rounded shapes exclusively for status badges and notification pips.

## Components
- **Buttons:** Primary buttons use the Orange `#F97D01` with white text. Hover states should darken the background slightly. Secondary buttons use a "Ghost" style with a `#383838` border and white text.
- **Input Fields:** Backgrounds should be `#1E1E1E`. When focused, the border should change to the Primary Orange with a subtle 2px outer glow.
- **Chips/Badges:** Use a "Tinted" approach—a low-opacity version of the status color (e.g., 15% Green) for the background, with the full-saturation color for the text and a 1px border.
- **Data Tables:** Use `#1E1E1E` for header rows. Rows should have a 1px bottom border of `#2C2C2C`. Hovering over a row should change the background to `#252525`.
- **Cards:** No shadows. Use `#1E1E1E` background with a `#2C2C2C` border. Title text must be Bold Work Sans.
- **Checkboxes:** When checked, the fill is Primary Orange with a white checkmark. The unchecked state is a `#383838` border.