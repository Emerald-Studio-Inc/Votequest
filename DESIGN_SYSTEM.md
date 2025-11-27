# VoteQuest Design System & Style Guide

## 🎨 Introduction

This guide documents the complete design system for VoteQuest, ensuring consistency across all current and future components.

## Color System

### Primary Palette

#### Accent Color
```css
--accent-primary: #0EA5E9 (Sky Blue)
--accent-glow: rgba(14, 165, 233, 0.5)
--accent-subtle: rgba(14, 165, 233, 0.15)
```

**Usage**: 
- Primary CTAs
- Interactive highlights
- Progress indicators
- Links and active states
- Focus indicators

**Don't Use For**:
- Large background areas
- Body text
- Neutral elements

#### Depth System
```css
--depth-void: #000000      (Root background)
--depth-base: #0A0A0A      (Main surface)
--depth-surface: #111111   (Card backgrounds)
--depth-raised: #161616    (Elevated cards)
--depth-elevated: #1C1C1C  (Floating elements)
--depth-floating: #222222  (Highest elevation)
```

**Usage Hierarchy**:
1. `depth-void` - App background
2. `depth-base` - Page containers
3. `depth-surface` - Standard cards
4. `depth-raised` - Interactive cards
5. `depth-elevated` - Modals, dropdowns
6. `depth-floating` - Tooltips, popovers

#### Text Hierarchy
```css
--text-absolute: #FFFFFF   (Headings, emphasis)
--text-primary: #F5F5F5    (Body text, labels)
--text-secondary: #A1A1A1  (Supporting text)
--text-tertiary: #6B6B6B   (Metadata, hints)
--text-muted: #4A4A4A      (Disabled states)
--text-ghost: #2A2A2A      (Subtle elements)
```

**Usage Guide**:
- Use `absolute` for h1-h2 headings
- Use `primary` for h3-h6 and body text
- Use `secondary` for labels and secondary info
- Use `tertiary` for timestamps, counts
- Use `muted` for disabled elements
- Use `ghost` for very subtle UI elements

### Functional Colors

```css
--state-success: #10B981  (Green)
--state-warning: #F59E0B  (Amber)
--state-error: #EF4444    (Red)
--state-info: #0EA5E9     (Sky Blue)
```

**Usage**:
- Success: Completed actions, confirmations
- Warning: Cautions, important notices
- Error: Errors, destructive actions
- Info: Information, tips

### Border System

```css
--border-ghost: rgba(255, 255, 255, 0.03)
--border-subtle: rgba(255, 255, 255, 0.06)
--border-soft: rgba(255, 255, 255, 0.09)
--border-medium: rgba(255, 255, 255, 0.12)
--border-strong: rgba(255, 255, 255, 0.18)
--border-accent: rgba(14, 165, 233, 0.3)
```

**Usage**:
- `ghost`: Very subtle dividers
- `subtle`: Default card borders
- `soft`: Hover states
- `medium`: Active/focused states
- `strong`: Emphasis borders
- `accent`: Selected/active elements

## Typography

### Font Family
```css
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
```

### Font Weights
- **300**: Light (rarely used)
- **400**: Regular (body text)
- **500**: Medium (labels, buttons)
- **600**: Semibold (subheadings)
- **700**: Bold (headings)
- **800**: Extra Bold (major headings)
- **900**: Black (hero text, rarely used)

### Type Scale

```
Hero: 48px (3rem) / Bold / -0.02em / 1.1
H1: 32px (2rem) / Bold / -0.015em / 1.2
H2: 24px (1.5rem) / Bold / -0.012em / 1.3
H3: 20px (1.25rem) / Bold / -0.011em / 1.4
H4: 18px (1.125rem) / Semibold / -0.011em / 1.4
H5: 16px (1rem) / Semibold / -0.011em / 1.5
Body Large: 16px (1rem) / Regular / -0.011em / 1.6
Body: 15px (0.9375rem) / Regular / -0.011em / 1.6
Body Small: 14px (0.875rem) / Regular / -0.011em / 1.5
Caption: 13px (0.8125rem) / Medium / -0.011em / 1.4
Label: 12px (0.75rem) / Medium / -0.005em / 1.3
```

### Font Features
```css
font-feature-settings: 'cv11', 'ss01', 'ss02';
```

## Spacing System

### Base Unit: 4px (0.25rem)

```
2: 8px (0.5rem)
3: 12px (0.75rem)
4: 16px (1rem)
5: 20px (1.25rem)
6: 24px (1.5rem)
8: 32px (2rem)
10: 40px (2.5rem)
12: 48px (3rem)
16: 64px (4rem)
20: 80px (5rem)
24: 96px (6rem)
```

### Common Patterns

**Component Padding**:
- Buttons: 14px 28px (0.875rem 1.75rem)
- Small buttons: 10px 18px (0.625rem 1.125rem)
- Cards: 32px (2rem)
- Compact cards: 24px (1.5rem)
- Inputs: 14px 16px (0.875rem 1rem)

**Component Gaps**:
- Tight: 8px (0.5rem)
- Default: 12px (0.75rem)
- Comfortable: 16px (1rem)
- Spacious: 24px (1.5rem)

**Section Spacing**:
- Between elements: 16px (1rem)
- Between sections: 32px (2rem)
- Between major sections: 48px (3rem)

## Border Radius

```css
sm: 0.5rem (8px)      /* Badges, small pills */
md: 0.625rem (10px)   /* Tooltips, small cards */
base: 0.75rem (12px)  /* Buttons, inputs */
lg: 0.875rem (14px)   /* Medium cards */
xl: 1rem (16px)       /* Large cards */
2xl: 1.25rem (20px)   /* Hero cards */
3xl: 1.5rem (24px)    /* Modal containers */
full: 9999px          /* Pills, circular */
```

## Component Styles

### Buttons

#### Primary Button
```css
.btn-primary {
  padding: 0.875rem 1.75rem;
  background: linear-gradient(135deg, #0EA5E9 0%, #0284C7 100%);
  color: white;
  border-radius: 0.875rem;
  font-weight: 600;
  box-shadow: 0 0 24px rgba(14, 165, 233, 0.25), 
              0 4px 16px rgba(0, 0, 0, 0.3);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 0 32px rgba(14, 165, 233, 0.35), 
              0 8px 24px rgba(0, 0, 0, 0.4);
}
```

#### Secondary Button
```css
.btn-secondary {
  padding: 0.875rem 1.75rem;
  background: rgba(255, 255, 255, 0.04);
  color: var(--text-primary);
  border: 1px solid var(--border-soft);
  border-radius: 0.875rem;
  font-weight: 600;
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.07);
  border-color: var(--border-medium);
  transform: translateY(-1px);
}
```

#### Ghost Button
```css
.btn-ghost {
  padding: 0.75rem 1.5rem;
  background: transparent;
  color: var(--text-secondary);
  border-radius: 0.875rem;
  font-weight: 500;
}

.btn-ghost:hover {
  background: rgba(255, 255, 255, 0.04);
  color: var(--text-primary);
}
```

### Cards

#### Standard Card
```css
.card-premium {
  background: rgba(17, 17, 17, 0.70);
  backdrop-filter: blur(32px) saturate(160%);
  border: 1px solid var(--border-subtle);
  border-radius: 1.25rem;
  padding: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4),
              0 0 0 1px var(--border-ghost);
}
```

#### Interactive Card
```css
.card-interactive {
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.card-interactive:hover {
  border-color: var(--border-soft);
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.5),
              0 0 0 1px var(--border-medium);
  transform: translateY(-4px);
}
```

### Inputs

```css
.input-base {
  width: 100%;
  padding: 0.875rem 1rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--border-subtle);
  border-radius: 0.875rem;
  color: var(--text-primary);
  font-size: 0.9375rem;
}

.input-base:focus {
  background: rgba(255, 255, 255, 0.05);
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 4px rgba(14, 165, 233, 0.12);
  outline: none;
}
```

### Badges

```css
.badge-base {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 0.75rem;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid var(--border-ghost);
  border-radius: 0.625rem;
  font-size: 0.8125rem;
  font-weight: 600;
}

.badge-accent {
  background: rgba(14, 165, 233, 0.12);
  border-color: rgba(14, 165, 233, 0.25);
  color: var(--accent-primary);
}
```

## Animation Guidelines

### Timing Functions

```css
/* Standard easing for most transitions */
cubic-bezier(0.4, 0, 0.2, 1)

/* Spring effect for playful interactions */
cubic-bezier(0.34, 1.56, 0.64, 1)

/* Elastic for dramatic effects */
cubic-bezier(0.68, -0.55, 0.265, 1.55)
```

### Duration Standards

```css
Fast: 150ms    /* Hover, small changes */
Snappy: 200ms  /* Button states */
Smooth: 300ms  /* Standard transitions */
Gentle: 500ms  /* Large movements */
Spring: 600ms  /* Spring animations */
Slow: 800ms    /* Page transitions */
```

### Animation Patterns

#### Fade In
```css
@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(32px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

#### Scale In
```css
@keyframes fade-in-scale {
  from {
    opacity: 0;
    transform: scale(0.90);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
```

### Staggered Animations

For lists and grids, use staggered delays:

```css
.item:nth-child(1) { animation-delay: 0ms; }
.item:nth-child(2) { animation-delay: 50ms; }
.item:nth-child(3) { animation-delay: 100ms; }
.item:nth-child(4) { animation-delay: 150ms; }
```

## Glassmorphism

### Standard Glass
```css
background: rgba(17, 17, 17, 0.70);
backdrop-filter: blur(32px) saturate(160%);
border: 1px solid var(--border-subtle);
```

### Strong Glass
```css
background: rgba(22, 22, 22, 0.80);
backdrop-filter: blur(40px) saturate(180%);
border: 1px solid var(--border-subtle);
```

### Ultra Glass
```css
background: rgba(17, 17, 17, 0.65);
backdrop-filter: blur(48px) saturate(180%);
border: 1px solid var(--border-ghost);
```

## Glow Effects

### Soft Glow
```css
box-shadow: 0 0 20px rgba(14, 165, 233, 0.15),
            0 0 40px rgba(14, 165, 233, 0.08);
```

### Medium Glow
```css
box-shadow: 0 0 28px rgba(14, 165, 233, 0.25),
            0 0 56px rgba(14, 165, 233, 0.12);
```

### Strong Glow
```css
box-shadow: 0 0 36px rgba(14, 165, 233, 0.35),
            0 0 72px rgba(14, 165, 233, 0.18),
            0 0 108px rgba(14, 165, 233, 0.08);
```

## Accessibility

### Focus States
```css
*:focus-visible {
  outline: 2px solid var(--accent-primary);
  outline-offset: 3px;
  border-radius: 0.375rem;
}
```

### Minimum Target Size
- Clickable elements: 44x44px minimum
- Icon buttons: 40x40px minimum
- Small buttons: 36x36px minimum

### Color Contrast
- Text on background: 4.5:1 minimum
- Large text: 3:1 minimum
- UI components: 3:1 minimum

### Motion
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

## Best Practices

### Do's ✅
- Use the accent color sparingly for maximum impact
- Maintain consistent spacing throughout
- Apply hover states to all interactive elements
- Use animations to guide user attention
- Ensure sufficient color contrast
- Test on multiple screen sizes
- Implement loading states
- Provide clear error messages

### Don'ts ❌
- Don't use multiple accent colors
- Don't animate everything
- Don't ignore accessibility
- Don't use overly bright colors
- Don't mix different design patterns
- Don't forget mobile users
- Don't skip loading states
- Don't hide important actions

## Component Checklist

When creating new components:

- [ ] Uses design system colors
- [ ] Follows spacing guidelines
- [ ] Has hover states
- [ ] Has focus states
- [ ] Has loading states
- [ ] Has error states
- [ ] Is responsive
- [ ] Is accessible
- [ ] Has smooth transitions
- [ ] Uses consistent typography
- [ ] Follows border radius system
- [ ] Has proper shadows/glows
- [ ] Works with dark theme
- [ ] Handles edge cases

## Examples

### Creating a New Card Component

```tsx
<div className="card-premium p-8 hover:shadow-premium transition-smooth">
  <div className="flex items-center gap-3 mb-4">
    <div className="p-2 rounded-xl bg-sky-500/10 border border-sky-500/20">
      <Icon className="w-4 h-4 text-sky-400" strokeWidth={2.5} />
    </div>
    <h3 className="text-lg font-bold text-white">Card Title</h3>
  </div>
  <p className="text-sm text-zinc-400 leading-relaxed">
    Card content goes here...
  </p>
</div>
```

### Creating a New Button

```tsx
<button className="btn btn-primary glow-accent hover:glow-accent-strong group">
  <Icon className="w-5 h-5" strokeWidth={2.5} />
  <span>Button Text</span>
  <ArrowRight className="w-5 h-5 transition-smooth group-hover:translate-x-1" strokeWidth={2.5} />
</button>
```

### Creating a New Input

```tsx
<div className="space-y-2">
  <label className="block text-sm font-semibold text-white">
    Label <span className="text-red-400">*</span>
  </label>
  <input
    type="text"
    className="input-base"
    placeholder="Enter text..."
  />
  <p className="text-xs text-zinc-600">Helper text</p>
</div>
```

---

**Last Updated**: November 2024  
**Version**: 1.0.0  
**Maintained By**: VoteQuest Design Team
