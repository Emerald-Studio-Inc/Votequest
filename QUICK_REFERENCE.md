# VoteQuest - Quick Developer Reference

## 🚀 Getting Started

```bash
npm install
npm run dev
```

## 🎨 Quick CSS Classes

### Buttons
```html
<button class="btn btn-primary">Primary</button>
<button class="btn btn-secondary">Secondary</button>
<button class="btn btn-ghost">Ghost</button>
<button class="btn btn-primary btn-sm">Small</button>
<button class="btn btn-primary btn-lg">Large</button>
<button class="btn btn-icon">🔍</button>
```

### Cards
```html
<div class="card-base">Base Card</div>
<div class="card-premium">Premium Card</div>
<div class="card-elevated">Elevated Card</div>
<div class="card-premium card-interactive">Clickable Card</div>
```

### Inputs
```html
<input type="text" class="input-base" placeholder="Text..." />
<textarea class="input-base textarea-base"></textarea>
```

### Badges
```html
<span class="badge-base">Default</span>
<span class="badge-accent">Accent</span>
<span class="badge-success">Success</span>
<span class="badge-warning">Warning</span>
<span class="badge-error">Error</span>
```

### Glassmorphism
```html
<div class="glass-card">Subtle Glass</div>
<div class="glass-premium">Premium Glass</div>
<div class="glass-strong">Strong Glass</div>
<div class="glass-ultra">Ultra Glass</div>
```

### Glows
```html
<div class="glow-accent-soft">Soft Glow</div>
<div class="glow-accent">Medium Glow</div>
<div class="glow-accent-strong">Strong Glow</div>
<div class="glow-ambient">Ambient Shadow</div>
```

### Animations
```html
<div class="animate-fade-in-up">Fade In Up</div>
<div class="animate-fade-in-scale">Scale In</div>
<div class="animate-slide-in-right">Slide In Right</div>
<div class="animate-pulse-glow">Pulse Glow</div>
<div class="animate-shimmer">Shimmer</div>

<!-- With delays -->
<div class="animate-fade-in-up animate-delay-100">Delay 100ms</div>
<div class="animate-fade-in-up animate-delay-200">Delay 200ms</div>
```

### Transitions
```html
<div class="transition-smooth">Smooth (300ms)</div>
<div class="transition-snappy">Snappy (200ms)</div>
<div class="transition-gentle">Gentle (500ms)</div>
<div class="transition-spring">Spring Effect</div>
```

### Progress Bars
```html
<div class="progress-container">
  <div class="progress-fill" style="width: 60%"></div>
</div>
```

### Dividers
```html
<div class="divider"></div>
<div class="divider-vertical"></div>
```

## 📐 Common Patterns

### Hero Section
```html
<div class="page-container">
  <div class="content-container pt-6 pb-12">
    <h1 class="text-4xl font-bold text-white mb-4">Hero Title</h1>
    <p class="text-lg text-zinc-400">Subtitle text</p>
  </div>
</div>
```

### Section with Icon Header
```html
<div class="card-premium p-8">
  <div class="flex items-center gap-2.5 mb-6">
    <div class="p-2 rounded-xl bg-sky-500/10 border border-sky-500/20">
      <Icon class="w-4 h-4 text-sky-400" stroke-width="2.5" />
    </div>
    <h2 class="text-xl font-bold text-white">Section Title</h2>
  </div>
  <!-- Content -->
</div>
```

### Stat Card
```html
<div class="space-y-4">
  <div class="flex items-center gap-2.5">
    <div class="p-2 rounded-xl bg-sky-500/10 border border-sky-500/20">
      <Icon class="w-4 h-4 text-sky-400" stroke-width="2.5" />
    </div>
    <span class="text-xs font-bold text-zinc-500 uppercase tracking-widest">
      Label
    </span>
  </div>
  <div class="space-y-2">
    <div class="flex items-baseline gap-3">
      <span class="text-5xl font-bold text-white tracking-tighter">
        1,234
      </span>
    </div>
    <p class="text-xs text-zinc-500 font-medium">Description</p>
  </div>
</div>
```

### Form Field
```html
<div class="space-y-2">
  <label class="block text-sm font-semibold text-white">
    Field Label <span class="text-red-400">*</span>
  </label>
  <input type="text" class="input-base" placeholder="Enter value..." />
  <p class="text-xs text-zinc-600">Helper text</p>
</div>
```

### Loading State
```html
<div class="skeleton h-32 w-full rounded-xl"></div>
```

### Empty State
```html
<div class="text-center py-12">
  <Icon class="w-12 h-12 text-zinc-700 mx-auto mb-4" stroke-width="2" />
  <p class="text-sm text-zinc-600 font-medium">No items found</p>
  <p class="text-xs text-zinc-700 mt-1">Try adjusting your filters</p>
</div>
```

## 🎯 Component Structure

### Page Layout
```tsx
<div className="page-container">
  {/* Ambient Background */}
  <div className="fixed inset-0 pointer-events-none overflow-hidden">
    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-gradient-to-b from-sky-500/10 via-sky-500/5 to-transparent rounded-full blur-3xl"></div>
  </div>

  {/* Content */}
  <div className="content-container pt-6 pb-12 relative z-10">
    {/* Your content here */}
  </div>
</div>
```

### Interactive Card
```tsx
<div
  onClick={handleClick}
  className="card-premium card-interactive p-6 cursor-pointer group"
>
  <div className="flex items-center justify-between mb-4">
    <h3 className="text-lg font-bold text-white group-hover:text-sky-400 transition-smooth">
      Card Title
    </h3>
    <ArrowRight className="w-4 h-4 text-zinc-600 transition-smooth group-hover:text-sky-400 group-hover:translate-x-1" />
  </div>
  <p className="text-sm text-zinc-500">Card description</p>
</div>
```

## 🔧 Utility Patterns

### Responsive Grid
```html
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  <!-- Grid items -->
</div>
```

### Flex Patterns
```html
<!-- Horizontal with gap -->
<div class="flex items-center gap-3">...</div>

<!-- Space between -->
<div class="flex items-center justify-between">...</div>

<!-- Vertical stack -->
<div class="flex flex-col gap-4">...</div>

<!-- Center everything -->
<div class="flex items-center justify-center">...</div>
```

### Spacing
```html
<!-- Padding -->
<div class="p-4">All sides</div>
<div class="px-6 py-4">Horizontal & Vertical</div>
<div class="pt-8 pb-12">Top & Bottom</div>

<!-- Margin -->
<div class="m-4">All sides</div>
<div class="mb-6">Bottom only</div>
<div class="mt-auto">Push to end</div>

<!-- Gap (for flex/grid) -->
<div class="flex gap-3">...</div>
<div class="space-y-4">...</div> <!-- Vertical -->
<div class="space-x-2">...</div> <!-- Horizontal -->
```

## 📱 Responsive Breakpoints

```css
/* Mobile First */
sm: 640px   /* @media (min-width: 640px) */
md: 768px   /* @media (min-width: 768px) */
lg: 1024px  /* @media (min-width: 1024px) */
xl: 1280px  /* @media (min-width: 1280px) */
2xl: 1536px /* @media (min-width: 1536px) */
```

### Example Usage
```html
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  <!-- Responsive grid: 1 col mobile, 2 tablet, 4 desktop -->
</div>

<div class="text-sm md:text-base lg:text-lg">
  <!-- Responsive text size -->
</div>

<div class="hidden md:block">
  <!-- Hidden on mobile, visible on tablet+ -->
</div>
```

## 🎨 Color Reference

### Text Colors
```html
<span class="text-white">Absolute White</span>
<span class="text-zinc-100">Primary Text</span>
<span class="text-zinc-400">Secondary Text</span>
<span class="text-zinc-500">Tertiary Text</span>
<span class="text-zinc-600">Muted Text</span>
<span class="text-sky-400">Accent Text</span>
<span class="text-emerald-400">Success Text</span>
<span class="text-amber-400">Warning Text</span>
<span class="text-red-400">Error Text</span>
```

### Background Colors
```html
<div class="bg-black">Void Background</div>
<div class="bg-zinc-950">Base Background</div>
<div class="bg-zinc-900">Surface Background</div>
<div class="bg-sky-500/10">Accent Background (10% opacity)</div>
```

## 💡 Pro Tips

### Hover Effects
```html
<!-- Button hover -->
<button class="btn group">
  <span>Text</span>
  <Icon class="transition-smooth group-hover:translate-x-1" />
</button>

<!-- Card hover -->
<div class="card-premium transition-smooth hover:border-sky-500/30">
  ...
</div>
```

### Loading Spinner
```html
<div class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
```

### Truncate Text
```html
<p class="truncate">Long text that will be cut off...</p>
<p class="line-clamp-2">Text that will show only 2 lines...</p>
```

### Shadow Utilities
```html
<div class="shadow-premium">Premium Shadow</div>
<div class="glow-accent">Accent Glow</div>
<div class="glow-ambient">Ambient Shadow</div>
```

## 🐛 Common Issues

### Backdrop Filter Not Working
```css
/* Make sure parent has a background */
background: rgba(17, 17, 17, 0.70);
backdrop-filter: blur(32px);
-webkit-backdrop-filter: blur(32px); /* Safari support */
```

### Z-Index Layering
```
Modal/Overlay: z-50
Dropdown/Tooltip: z-40
Sticky Header: z-30
Card Hover: z-10
Base Content: z-0
Background: -z-10
```

### Animation Not Working
```css
/* Make sure element is not display: none */
/* Use opacity: 0 instead and animate opacity */
```

## 📚 Quick Links

- [Full Design System](./DESIGN_SYSTEM.md)
- [UI/UX Summary](./UI_UX_OVERHAUL_SUMMARY.md)
- [Tailwind Docs](https://tailwindcss.com/docs)
- [Lucide Icons](https://lucide.dev)

---

**Happy Coding! 🚀**
