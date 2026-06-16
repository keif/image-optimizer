# Squish Design System

The visual and voice direction for sosquishy.io and any companion surfaces (CLI website, docs, marketing).

Canonical reference mockup: `~/.gstack/projects/keif-image-optimizer/designs/homepage-20260615/variant-B.html`

## Voice

Squish is a high-performance image optimizer that doesn't feel corporate. The brand name is a verb. Use it as one. Copy should be plainspoken, short, slightly playful, and confident — never salesy.

| Use | Avoid |
|---|---|
| "Squish your images." | "Optimize your visual assets." |
| "Drop image here." | "Please select a file to upload." |
| "Wickedly fast." | "Industry-leading performance." |
| "Privacy-first." | "Enterprise-grade data protection." |

No marketing jargon (`leverage`, `robust`, `comprehensive`, `solutions`). No happy talk. No interjections (`Hey there!`, `Welcome!`). If a sentence sounds like it could ship in any product's marketing page, rewrite it until it sounds like ours.

## Color Tokens

```
cream         #fffaf3   base background
cream-100     #fff4e6   secondary surface (nav-link hover, format chip bg)
mint          #88e6b8   primary brand color
mint-700      #4cc88a   primary shadow / pressed state
peach         #ffc4a3   accent color
peach-700     #e5a385   accent shadow
ink           #2a2f3a   primary text + dark CTAs
ink-soft      #6b7080   secondary text
```

Background uses **radial gradients** of mint at 15% 20% (0.18 opacity) and peach at 85% 75% (0.22 opacity) to create subtle warmth without flat-cream sterility.

## Typography

- **Family:** [DM Sans](https://fonts.google.com/specimen/DM+Sans) (Google Fonts)
- **Weights used:** 400 (body), 500 (nav), 700 (cards/buttons), 800 (headlines)
- **Tracking:** `-0.035em` on display headlines, `-0.02em` on display sub, `-0.01em` on logo
- **Line-height:** 1.02 for hero h1, 1.5 for body

Display scale (clamp for responsive):

```
hero h1     clamp(2.75rem, 6vw, 4.75rem)    weight 800
section h2  1.75rem                          weight 800 (rarely used)
card title  22px                             weight 700
body        19px subtitle / 16px default     weight 400-500
meta        13-15px                          weight 500-700
```

## Spacing & Radius

Spacing follows an 8px grid (`8, 16, 24, 32, 48, 64, 96`). Padding inside the hero container is `32px 32px 96px` (asymmetric top/bottom).

Border radius scale — Squish is intentionally round, almost over-round:

```
sm   10px   icon blocks inside trust cards
md   12px   logo mark
lg   16px   buttons, badges
xl   20px   trust cards
2xl  24px   inputs, inner upload elements
3xl  32px   upload card (the showpiece)
pill 999px  nav links, badges, format chips
```

## Shadows

The signature shadow combines a hard 2px offset (paper-like) with a soft colored glow (mint-tinted):

```css
box-shadow: 0 2px 0 rgba(42, 47, 58, 0.08),
            0 12px 32px -8px rgba(76, 200, 138, 0.25);
```

Use sparingly: on the upload card, primary buttons, and badges only. Trust cards get a simpler `0 2px 0 rgba(42, 47, 58, 0.06)` to stay quiet.

## Signature Moves

Three details make this design feel hand-placed instead of AI-generated. Lose them and the whole thing flattens.

1. **Subtle rotation on key elements.** Logo mark `-3deg`, headline highlight block `-1.5deg`, upload card `0.4deg`. Never more than 3 degrees; never on body text.
2. **Two-color highlight block** under one word of the headline ("squish your **images**" with mint top half + peach bottom half, rotated -1.5deg, 16px radius). This is the brand moment.
3. **Blob mascot with a face.** A 88×88px peach blob using asymmetric border-radius (`42% 58% 70% 30% / 40% 50% 50% 60%`) with two black `10×14px` rounded eyes. Used in the upload card hero. Optional elsewhere; never mandatory.

## Component Patterns

### Logo

32×32 mint square, `border-radius: 12px`, rotated `-3deg`, with a 4px hard-shadow in mint-700, and a single black dot eye in the top-right. Wordmark in DM Sans 800 next to it.

### Buttons

- **Primary:** ink background, cream text, 16px radius, full signature shadow, `padding: 16px 28px`. Hover: `translateY(-2px)`.
- **Secondary:** cream background, 2px ink border, same padding.
- Buttons are tactile. They should feel like you can press them.

### Nav links

Inline pills, `padding: 10px 16px`, `border-radius: 999px`. Hover: cream-100 background. CTA link (`nav-cta`) flips to ink-on-cream.

### Upload card

The hero element. White background, 3px **dashed** mint border, 32px radius, signature shadow, `0.4deg` rotation. Contains:

- Blob mascot (centered, with hard shadow)
- "Drop image here" title (22px, 700)
- "or click to browse · up to 50MB" sub (14px, ink-soft)
- Format pill chips below

### Format pill chips

`padding: 6px 12px`, `border-radius: 999px`, 12px font, 700 weight, ink text. Alternating backgrounds: most are `cream-100`, with one mint and one peach for visual rhythm. **Avoid the "all chips same color" trap** — alternation is what gives the row personality.

### Trust cards

3-up grid below the hero. White bg, 20px radius, soft shadow, 20px padding. Each has a 32×32 icon block (mint or peach, 10px radius), a 15px title (700), and a 13px ink-soft body.

## Layout

- **Container:** max-width `1080px`, centered, `padding: 32px 32px 96px`.
- **Hero grid:** Two columns at `1.1fr 0.9fr` (left-heavy on copy), collapsing to single-column at ≤820px.
- **Trust row:** Three equal columns, collapsing to single-column at ≤820px.
- **Breakpoint:** Mobile starts at ≤820px. Hide all nav links except the CTA at that breakpoint.

## Mode

Light by default. The design is light-first; a dark mode would need real work (the cream/mint/peach palette doesn't auto-invert well). When dark mode is needed, design it separately rather than auto-deriving.

## Tailwind Config Snippet

For porting into `web/tailwind.config.ts`:

```ts
import type { Config } from 'tailwindcss';

export default {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        cream: { DEFAULT: '#fffaf3', 100: '#fff4e6' },
        mint:  { DEFAULT: '#88e6b8', 700: '#4cc88a' },
        peach: { DEFAULT: '#ffc4a3', 700: '#e5a385' },
        ink:   { DEFAULT: '#2a2f3a', soft: '#6b7080' },
      },
      fontFamily: {
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'xl': '16px',
        '2xl': '20px',
        '3xl': '32px',
      },
      boxShadow: {
        'squish': '0 2px 0 rgba(42, 47, 58, 0.08), 0 12px 32px -8px rgba(76, 200, 138, 0.25)',
        'squish-quiet': '0 2px 0 rgba(42, 47, 58, 0.06)',
        'mint-press': '0 4px 0 #4cc88a',
        'peach-press': '0 6px 0 #e5a385',
      },
    },
  },
} satisfies Config;
```

Don't forget the DM Sans `<link>` in `app/layout.tsx`:

```tsx
<link
  href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,700;9..40,800&display=swap"
  rel="stylesheet"
/>
```

Or self-host with `@fontsource/dm-sans` for offline/SSG builds.

## What This Is Not

A few directions explicitly rejected during /design-shotgun on 2026-06-15:

- **Not a dev-tool aesthetic** (monospace, dark, terminal-green) — too cold for an indie/sponsor-funded project.
- **Not editorial brutalism** (massive condensed display + monochrome + yellow accent) — too aggressive; the brand is "squish," not "shout."

If a future iteration drifts toward either, that's a redesign, not a tweak.
