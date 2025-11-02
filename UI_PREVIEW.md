# 🎨 Visual Preview: Unlock & Claim UI

## 📱 Toast Notifications

### Success Toast (Free Claim)
```
┌─────────────────────────────────────────┐
│  ✅  🎉 FREE CLAIM SUCCESS!         ×  │
│      Ð has been added to your          │
│      collection for free!              │
└─────────────────────────────────────────┘
  Green background, auto-dismiss 5s
```

### Info Toast (Already Claimed)
```
┌─────────────────────────────────────────┐
│  🔓  🔓 Unlocked (Already Claimed)  ×  │
│      Ð was already claimed by someone  │
│      else, but you've unlocked it for  │
│      viewing. You can mark interest!   │
└─────────────────────────────────────────┘
  Blue background, auto-dismiss 5s
```

### Info Toast (Secret Found)
```
┌─────────────────────────────────────────┐
│  🔍  🔍 Secret Found!               ×  │
│      ◆ discovered and unlocked!        │
└─────────────────────────────────────────┘
  Blue background, auto-dismiss 5s
```

---

## 🏷️ Status Badges (on Number Cards)

### Before Unlock (Locked Easter Egg)
```
┌──────────────────────────────────────┐
│  [Exotic]  [0 ETH]  [🔒 Locked]     │
│   Gray badge with lock icon          │
└──────────────────────────────────────┘
```

### After Unlock, No Owner (Free to Claim)
```
┌──────────────────────────────────────┐
│  [Exotic]  [0 ETH]  [🎁 🔓 Unlocked (Free!)]  │
│   Green badge with gift icon         │
└──────────────────────────────────────┘
```

### After Successful Claim (You Own It)
```
┌──────────────────────────────────────┐
│  [Exotic]  [0 ETH]  [🎉 🎉 You Own] │
│   Gold badge with party icon         │
└──────────────────────────────────────┘
```

### Owned by Someone Else
```
┌──────────────────────────────────────┐
│  [Exotic]  [0 ETH]  [👤 Owned by 0x123...]  │
│   Purple badge with person icon      │
└──────────────────────────────────────┘
```

### Regular Number (Available)
```
┌──────────────────────────────────────┐
│  [Rare]  [0.003 ETH]  [✨ Available] │
│   Green badge with sparkle icon      │
└──────────────────────────────────────┘
```

### Regular Number (You Own)
```
┌──────────────────────────────────────┐
│  [Rare]  [0.003 ETH]  [👑 You Own]   │
│   Gold badge with crown icon         │
└──────────────────────────────────────┘
```

---

## 🎬 User Flow Examples

### Flow 1: First User Claims Free Easter Egg
```
1. User searches "darius"
   → Toast appears: "🎉 FREE CLAIM SUCCESS!"
   → Badge updates: [🎉 You Own]
   → Achievement unlocked: "🐣 Egg Hunter"

2. Ð appears in "My Numbers" section
   → Can list for sale later
   → Certificate issued
```

### Flow 2: Second User Tries to Claim
```
1. User searches "darius"
   → Toast appears: "🔓 Unlocked (Already Claimed)"
   → Badge shows: [👤 Owned by 0xABC...]

2. Options available:
   → Click "Interested" button
   → Enter offer price
   → Wait for owner to list for sale
```

### Flow 3: Secret Discovery (Logo Clicks)
```
1. User clicks logo 7 times
   → Counter increments silently
   
2. On 7th click:
   → Toast: "🎉 SECRET CLAIMED!" (if free and unclaimed)
   → OR "🔍 Secret Found!" (if already claimed)
   → ◆ Chroma Coin unlocked
   → Badge updates accordingly
```

---

## 📊 Toast Stacking Behavior

Multiple toasts stack vertically:
```
┌─────────────────────────────┐  ← Newest
│  🎉 FREE CLAIM SUCCESS!     │
└─────────────────────────────┘

┌─────────────────────────────┐
│  🔓 Unlocked!               │
└─────────────────────────────┘

┌─────────────────────────────┐  ← Oldest
│  ✅ Achievement Unlocked!   │
└─────────────────────────────┘
```

Each toast:
- Slides in from right
- Auto-dismisses after 5s
- Can be closed manually with ×
- Max height: 90vh (scrollable if many)

---

## 🎨 Color Palette

| Type | Background | Border | Icon |
|------|-----------|--------|------|
| Success | `rgba(16, 185, 129, 0.15)` | `#10b981` | ✅ |
| Info | `rgba(59, 130, 246, 0.15)` | `#3b82f6` | 🔓 |
| Warning | `rgba(251, 191, 36, 0.15)` | `#fbbf24` | ⚠️ |
| Error | `rgba(239, 68, 68, 0.15)` | `#ef4444` | ❌ |

Badge states:
- Locked: Gray `#6b7280`
- Unlocked/Available: Green `#10b981`
- You Own: Gold `#fbbf24`
- Owned by Other: Purple `#8b5cf6`

---

## 🔧 Responsive Design

### Desktop (>768px)
- Toasts: Fixed top-right, 420px max-width
- Badges: Full text with icons
- Cards: Horizontal layout

### Mobile (<768px)
- Toasts: Full-width minus 1rem padding
- Badges: Abbreviated text, icons remain
- Cards: Vertical stack

---

## ⚡ Animation Details

### Toast Slide-In
```css
@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(100px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
```
Duration: 300ms ease-out

### Badge Transitions
- Hover: Scale(1.05) in 200ms
- Color change: 200ms ease

### Card Glow
- Hover: Box-shadow fades in 300ms
- Glow color: Matches rarity

---

## 🎯 Accessibility

- Toast close button: 24×24px minimum
- Color contrast: WCAG AA compliant
- Icon + text: Redundant information
- Auto-dismiss: User can disable in settings (future)
- Keyboard navigation: Tab to close button

---

## 📱 Mobile Optimizations

1. **Toast Size**: Responsive width
2. **Touch Targets**: 44×44px minimum
3. **Stack Order**: Most recent on top
4. **Swipe to Dismiss**: (Future enhancement)
5. **Haptic Feedback**: On claim success (Future)

---

Generated: November 2, 2025
