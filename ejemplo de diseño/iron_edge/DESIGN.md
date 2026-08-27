---
name: Iron & Edge
colors:
  surface: '#101416'
  surface-dim: '#101416'
  surface-bright: '#363a3c'
  surface-container-lowest: '#0b0f10'
  surface-container-low: '#181c1e'
  surface-container: '#1c2022'
  surface-container-high: '#262b2c'
  surface-container-highest: '#313537'
  on-surface: '#e0e3e5'
  on-surface-variant: '#e4beba'
  inverse-surface: '#e0e3e5'
  inverse-on-surface: '#2d3133'
  outline: '#aa8986'
  outline-variant: '#5b403e'
  surface-tint: '#ffb3ad'
  primary: '#ffb3ad'
  on-primary: '#68000a'
  primary-container: '#ff5450'
  on-primary-container: '#5c0008'
  inverse-primary: '#b91c24'
  secondary: '#c1c6d7'
  on-secondary: '#2a303d'
  secondary-container: '#434957'
  on-secondary-container: '#b3b8c8'
  tertiary: '#c6c6c6'
  on-tertiary: '#303030'
  tertiary-container: '#919191'
  on-tertiary-container: '#2a2a2a'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffdad7'
  primary-fixed-dim: '#ffb3ad'
  on-primary-fixed: '#410004'
  on-primary-fixed-variant: '#930013'
  secondary-fixed: '#dde2f3'
  secondary-fixed-dim: '#c1c6d7'
  on-secondary-fixed: '#161c27'
  on-secondary-fixed-variant: '#414754'
  tertiary-fixed: '#e2e2e2'
  tertiary-fixed-dim: '#c6c6c6'
  on-tertiary-fixed: '#1b1b1b'
  on-tertiary-fixed-variant: '#474747'
  background: '#101416'
  on-background: '#e0e3e5'
  surface-variant: '#313537'
typography:
  headline-xl:
    fontFamily: Montserrat
    fontSize: 48px
    fontWeight: '800'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Montserrat
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Montserrat
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  headline-md:
    fontFamily: Montserrat
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
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
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 8px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 48px
  container-max: 1440px
---

## Brand & Style
The design system is engineered for a high-end, industrial barber shop management environment. The brand personality is authoritative, precise, and masculine, evoking the raw atmosphere of steel, leather, and neon. It targets barbershop owners and stylists who require a tool that feels as sharp and professional as their craft. 

The aesthetic is a fusion of **Modern Minimalism** and **Industrial Brutalism**. It prioritizes high-contrast layouts and raw structural elements. The UI should feel immediate and powerful, utilizing heavy weight typography and a stark dark-mode environment to minimize glare in bright shop settings while maintaining a "night-mode" premium vibe.

## Colors
The palette is built on a foundation of absolute blacks and deep grays to create a sense of depth and focus. 

- **Primary (Vibrant Red):** Used exclusively for high-priority actions, critical status updates (e.g., "In Progress"), and brand accents. It represents energy and the "open" sign of the shop.
- **Background (Deep Black):** The primary canvas. Reduces visual noise and makes the red accents pop.
- **Surface (Dark Gray):** Used for cards, modals, and input fields to differentiate them from the base background.
- **Text (White/Light Gray):** High-contrast white for headers to ensure readability, and mid-tone grays for secondary metadata.
- **Accents:** Subtle red glows (0.15 opacity) are used behind primary buttons to simulate a neon effect.

## Typography
The typography system uses a dual-font strategy. **Montserrat** is used for headings to provide a bold, geometric, and aggressive brand presence. **Inter** is utilized for all functional text, data tables, and body copy to ensure maximum legibility at smaller sizes.

Headlines should use tight letter spacing to feel "locked in" and sturdy. Labels and navigation items should use uppercase styling with increased letter spacing to provide a modern, technical look.

## Layout & Spacing
This design system employs a **Fixed Grid** model for desktop to maintain a structured, architectural feel. 

- **Desktop:** 12-column grid with 24px gutters. Elements should align strictly to the grid to maintain the industrial aesthetic.
- **Mobile:** 4-column fluid grid with 16px margins.
- **Spacing Rhythm:** Based on an 8px baseline. Use 16px for internal component padding and 32px-48px for section vertical spacing. 

Avoid excessive whitespace; the goal is a compact, high-density dashboard that feels efficient and "full of life," reflecting the busy nature of a barbershop.

## Elevation & Depth
In this dark-mode environment, depth is conveyed through **Tonal Layers** rather than soft shadows.

- **Level 0 (Background):** #000000.
- **Level 1 (Cards/Surfaces):** #1A202C.
- **Level 2 (Modals/Pop-overs):** #2D3748.
- **Outlines:** Instead of ambient shadows, use 1px solid borders for all containers. Use #2D3748 for subtle separation and #E53E3E (Primary) for active or focused states.
- **Neon Glow:** Only primary buttons and active status indicators may use a soft `0px 0px 12px rgba(229, 62, 62, 0.4)` outer glow to create the neon effect.

## Shapes
The shape language is "Soft-Sharp." While an industrial look often uses 90-degree angles, this design system uses a subtle 4px radius (`0.25rem`) to ensure the interface feels modern and digital rather than dated.

- **Components:** 4px radius for buttons, cards, and inputs.
- **Checkboxes:** Sharp 2px radius for a more technical look.
- **Selection Indicators:** Vertical bars (2px wide) on the left side of active list items or menu links are preferred over rounded backgrounds.

## Components
- **Buttons:** Primary buttons are solid Vibrant Red with white bold text. Secondary buttons are ghost-style with a white or light gray border. No gradients except for a very subtle top-to-bottom shift on hover.
- **Cards:** Background #1A202C with a 1px border. Card headers should use the `label-md` uppercase style.
- **Inputs:** Darker than the surface (#000000), 1px border #2D3748. On focus, the border changes to Primary Red.
- **Chips/Status:** For "In Chair," use a solid red chip. For "Completed," use a dark gray chip with a white border.
- **Lists:** Data-heavy lists (cuts and income) should use alternating row tints (zebra striping) with #1A202C and #141A24 to keep the rows distinct without adding heavy borders.
- **The "Queue Bar":** A specialized component at the top of the dashboard showing a horizontal list of upcoming appointments, using high-contrast typography to emphasize time slots.