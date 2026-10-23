# AI Protector — Design System & Visual Specification

> **Aesthetic Vision:** Deep cybersecurity slate, crisp technical typography, restrained glass surfaces, and honest semantic risk indicators. Designed to evoke calm, clinical trust rather than alarmist fear.

---

## 1. Color Palette & Semantic Tokens

### Core Palette
```css
:root {
  /* Surfaces & Backgrounds */
  --bg-primary: #070a13;         /* Deepest midnight space */
  --bg-secondary: #0c1222;       /* Elevated dark slate */
  --bg-card: rgba(15, 23, 42, 0.75); /* Frosted glass card */
  --bg-card-hover: rgba(30, 41, 59, 0.85);

  /* Borders & Dividers */
  --border-subtle: rgba(56, 189, 248, 0.14);
  --border-strong: rgba(56, 189, 248, 0.32);
  --border-focus: #0ea5e9;

  /* Typography */
  --text-primary: #f8fafc;       /* High-contrast crisp white (WCAG AAA) */
  --text-secondary: #94a3b8;     /* Neutral readable gray */
  --text-muted: #64748b;         /* Low-emphasis metadata */

  /* Accents & Brand */
  --accent-cyan: #06b6d4;        /* Primary cybersecurity cyan */
  --accent-indigo: #6366f1;      /* Secondary trust indigo */

  /* Semantic Risk Tokens */
  --risk-low-bg: rgba(16, 185, 129, 0.15);
  --risk-low-text: #34d399;
  --risk-low-border: rgba(16, 185, 129, 0.35);

  --risk-suspicious-bg: rgba(245, 158, 11, 0.15);
  --risk-suspicious-text: #fbbf24;
  --risk-suspicious-border: rgba(245, 158, 11, 0.35);

  --risk-high-bg: rgba(244, 63, 94, 0.15);
  --risk-high-text: #fb7185;
  --risk-high-border: rgba(244, 63, 94, 0.35);

  --risk-info-bg: rgba(6, 182, 212, 0.15);
  --risk-info-text: #38bdf8;
  --risk-info-border: rgba(6, 182, 212, 0.35);
}
```

---

## 2. Typography Hierarchy

| Style | Element | Size / Weight | Line Height | Usage |
|---|---|---|---|---|
| **Display Heading** | `<h1>` | `28px - 36px` / 800 | `1.2` | Hero & platform tagline |
| **Section Title** | `<h2>` | `20px - 22px` / 700 | `1.3` | Module & tab headers |
| **Card Title** | `<h3>` | `15px - 16px` / 600 | `1.4` | Component titles |
| **Body Text** | `<p>` | `13px - 14px` / 400 | `1.6` | Explanations & descriptions |
| **Monospace / Technical** | `<code>` | `12px - 13px` / 500 | `1.4` | Hashes, URLs, matched tokens |
| **Micro Caption** | `<span>` | `10px - 11px` / 600 | `1.4` | Badges, status labels, timestamps |

---

## 3. Reusable UI Components Specifications

1. **Button**:
   - `primary`: Gradient cyan-to-indigo with subtle glow shadow.
   - `secondary`: Slate-800 with border-slate-700, hover to slate-700.
   - `danger`: Dark rose surface (`rgba(244,63,94,0.2)`) with rose border.
   - `ghost`: Transparent with hover background.
   - *State variants*: Default, Hover, Active, Disabled, Loading (with spinning indicator).
2. **Card**:
   - Glassmorphism backdrop blur `16px`.
   - 1px border with hover transition to cyan highlight.
3. **Badge / Tag**:
   - Compact pill shape with semantic risk coloring and embedded SVG icon.
   - Color is never the sole indicator—always accompanies text labels.
4. **Input & Textarea**:
   - Dark recessed surface `rgba(12, 18, 34, 0.8)`.
   - Focus ring: 3px glow with cyan border.
5. **Toast**:
   - Non-blocking slide-in alert from bottom-right.
   - Auto-dismisses after 3 seconds or on click.

---

## 4. Motion & Reduced-Motion
- Standard transitions: `150ms - 250ms cubic-bezier(0.16, 1, 0.3, 1)`.
- Respects `@media (prefers-reduced-motion: reduce)`: disables glow pulsing and translates, retaining instant opacity fades.
