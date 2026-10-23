# AI Protector — Accessibility Plan (WCAG 2.2 Level AA)

> **Standard:** WCAG 2.2 AA compliance across all components, journeys, and states.

---

## 1. Core Accessibility Pillars

1. **Semantic Landmarks & Hierarchy**:
   - Proper use of `<header>`, `<nav>`, `<main>`, `<aside>`, `<section>`, and `<footer>`.
   - Single logical `<h1>` with sequential heading hierarchy (`<h2>`, `<h3>`, `<h4>`).
2. **Keyboard Operability**:
   - Every interactive element (buttons, tabs, inputs, modal dismissers) is reachable via `Tab` / `Shift+Tab`.
   - Activation via `Enter` and `Space`.
   - `Escape` key immediately closes modals, drawers, and popovers.
   - Visible high-contrast focus rings (`outline: 2px solid #0ea5e9; outline-offset: 2px`).
3. **Screen Reader Support**:
   - Asynchronous scan operations announce progress and completion using `aria-live="polite"`.
   - Informative `aria-label` or `aria-describedby` on icon-only buttons (copy, clear, delete, menu toggle).
   - Dialogs implement `role="dialog"`, `aria-modal="true"`, and `aria-labelledby`.
4. **Color & Contrast**:
   - No information is conveyed via color alone. Every risk badge pairs color with an explicit text label and icon.
   - Text contrast exceeds 4.5:1 on dark surfaces; large headings exceed 7:1.
5. **Reduced Motion**:
   - Keyframe animations and transitions observe `@media (prefers-reduced-motion: reduce)` to prevent disorientation.
