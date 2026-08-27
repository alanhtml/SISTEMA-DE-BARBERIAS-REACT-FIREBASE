---
name: Razor & Graphite
colors:
  surface: '#131313'
  surface-dim: '#131313'
  surface-bright: '#393939'
  surface-container-lowest: '#0e0e0e'
  surface-container-low: '#1b1b1b'
  surface-container: '#1f1f1f'
  surface-container-high: '#2a2a2a'
  surface-container-highest: '#353535'
  on-surface: '#e2e2e2'
  on-surface-variant: '#ebbbb4'
  inverse-surface: '#e2e2e2'
  inverse-on-surface: '#303030'
  outline: '#b18780'
  outline-variant: '#603e39'
  surface-tint: '#ffb4a8'
  primary: '#ffb4a8'
  on-primary: '#690100'
  primary-container: '#ff5540'
  on-primary-container: '#5c0000'
  inverse-primary: '#c00100'
  secondary: '#c6c6c7'
  on-secondary: '#2f3131'
  secondary-container: '#454747'
  on-secondary-container: '#b4b5b5'
  tertiary: '#c8c6c5'
  on-tertiary: '#313030'
  tertiary-container: '#929090'
  on-tertiary-container: '#2a2a2a'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffdad4'
  primary-fixed-dim: '#ffb4a8'
  on-primary-fixed: '#410000'
  on-primary-fixed-variant: '#930100'
  secondary-fixed: '#e2e2e2'
  secondary-fixed-dim: '#c6c6c7'
  on-secondary-fixed: '#1a1c1c'
  on-secondary-fixed-variant: '#454747'
  tertiary-fixed: '#e5e2e1'
  tertiary-fixed-dim: '#c8c6c5'
  on-tertiary-fixed: '#1c1b1b'
  on-tertiary-fixed-variant: '#474746'
  background: '#131313'
  on-background: '#e2e2e2'
  surface-variant: '#353535'
typography:
  headline-xl:
    fontFamily: Anton
    fontSize: 64px
    fontWeight: '400'
    lineHeight: 72px
    letterSpacing: 0.02em
  headline-lg:
    fontFamily: Anton
    fontSize: 40px
    fontWeight: '400'
    lineHeight: 48px
    letterSpacing: 0.02em
  headline-lg-mobile:
    fontFamily: Anton
    fontSize: 32px
    fontWeight: '400'
    lineHeight: 36px
  title-md:
    fontFamily: Hanken Grotesk
    fontSize: 20px
    fontWeight: '700'
    lineHeight: 28px
  body-lg:
    fontFamily: Hanken Grotesk
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Hanken Grotesk
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-sm:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.1em
spacing:
  unit: 4px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 64px
  container-max: 1280px
---

## Brand & Style

The design system is built for a premium urban barbering experience. It targets a modern, style-conscious masculine audience that values precision and professional edge. The aesthetic is a fusion of **High-Contrast Bold** and **Industrial Minimalism**, evoking the atmosphere of a high-end city studio.

The interface must feel sharp and authoritative. By utilizing deep blacks and aggressive reds, the UI mimics the high-stakes precision of a straight-razor shave. Textures of brushed metal and polished concrete should be used sparingly in backgrounds to add tactile depth without sacrificing digital clarity.

## Colors

The palette is strictly limited to ensure maximum impact and brand recognition.

- **Primary (Vibrant Red):** Used exclusively for high-priority actions, notifications, and critical brand accents. It represents energy and the "barber pole" tradition.
- **Secondary (Pure White):** Reserved for primary typography and essential iconography to ensure AAA accessibility against the dark background.
- **Neutral (Deep Black):** The foundation of the UI. Use `#000000` for the base canvas to create an infinite depth effect.
- **Tertiary (Graphite Grey):** `#1A1A1A` is used for surface containers, input fields, and dividers to provide subtle structural definition without breaking the dark aesthetic.

## Typography

This design system uses a triple-threat typographic scale:

1.  **Headlines (Anton):** A bold, condensed sans-serif that commands attention. Used in all-caps for a cinematic, impactful look.
2.  **Body (Hanken Grotesk):** A clean, contemporary sans-serif that ensures high legibility for services, descriptions, and booking flows.
3.  **Labels (JetBrains Mono):** A monospaced font used for technical details like pricing, timestamps, and metadata, reinforcing the "industrial precision" theme.

All headlines should be treated with tight tracking, while labels should be widely tracked for a technical, modern feel.

## Layout & Spacing

The layout follows a **Rigid Grid** philosophy. Content is organized into a 12-column system on desktop and a 4-column system on mobile. 

- **Rhythm:** A 4px baseline grid governs all vertical spacing.
- **Padding:** Internal card padding should be generous (24px or 32px) to allow the bold typography "room to breathe" against the black background.
- **Contrast Layout:** Use full-bleed imagery of textures or photography to break the grid occasionally, creating a high-fashion editorial feel.

## Elevation & Depth

This system avoids traditional shadows in favor of **Tonal Layering** and **High-Contrast Outlines**.

- **Surfaces:** The base layer is `#000000`. Elevated components (cards, modals) use `#1A1A1A`.
- **Borders:** Instead of shadows, use 1px solid borders in `#333333` to define edges. 
- **Active State:** When an element is focused or active, the border transitions to Primary Red (`#FF0000`) or Pure White (`#FFFFFF`).
- **Overlays:** Modals use a high-opacity (90%) black backdrop to completely isolate the user's focus on the task.

## Shapes

The shape language is **Sharp and Aggressive**. 

- **Corners:** All UI elements—including buttons, input fields, and cards—must have **0px border radius**. This reinforces the "edge" of the barbering profession (blades, razors).
- **Icons:** Use linear icons with sharp terminals and consistent 2px stroke weights. Avoid rounded icon sets.

## Components

### Buttons
- **Primary:** Solid Red (`#FF0000`) with White text. All-caps Anton typography. No border.
- **Secondary:** Transparent background with a 2px White border. White text.
- **Ghost:** Transparent background, Red text, for low-priority navigation.

### Inputs
- **Field:** Dark grey (`#1A1A1A`) background with a 1px bottom-border only (White).
- **Focus State:** The bottom border transforms to Red.
- **Labels:** Use JetBrains Mono for small, all-caps labels positioned above the field.

### Cards
- **Structure:** Solid `#1A1A1A` background with 0px corners. 
- **Images:** Use black and white photography with high contrast. On hover, the image can transition to color or reveal a Red overlay.

### Lists & Bookings
- **Time Slots:** Sharp rectangular blocks. Available slots are White outlines; selected slots are Solid Red.
- **Dividers:** Thin 1px lines in `#333333`.

### Specialist Components
- **Service Tags:** Use small, monospaced "labels" with a Red dot prefix to indicate premium services.
- **The "Blade" Divider:** A diagonal CSS-clipped section break to move between high-contrast sections.