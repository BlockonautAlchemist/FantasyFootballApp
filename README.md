# Fantasy Football Assistant - Portfolio Style

A minimalist, high-impact fantasy football assistant with smooth animations and modern design.

## Features

- **Modern Portfolio Design** - Typography-first with generous white space and smooth animations
- **Framer Motion Animations** - Reveal on scroll, magnetic buttons, and page transitions
- **Lenis Smooth Scrolling** - Inertial scrolling with custom easing
- **Dark Theme** - Near-black (#0b0b0b) background with light text (#f6f6f6)
- **Fantasy Tools** - Start/Sit, Waivers, Trade Analyzer, Lineup Optimizer, and more
- **AI Chat Interface** - Minimalist chatbot with animated messages

## Design System

### Typography
- **Display Font**: Space Grotesk (headings, oversized scales)
- **Body Font**: Inter (body text, UI elements)
- **H1**: clamp(3rem, 8vw, 8rem) - Oversized hero headings
- **H2**: clamp(2rem, 5vw, 4rem) - Section headings

### Colors
- **Background**: #0b0b0b (near-black)
- **Text**: #f6f6f6 (light gray)
- **Text Muted**: #a1a1a1 (medium gray)
- **Accent**: #ffffff (white)
- **Borders**: #2a2a2a (dark gray)

### Layout
- **Container**: max-w-6xl with responsive padding
- **Grid**: Wide layouts with generous spacing
- **Navigation**: Fixed top bar with backdrop blur

## Animation Components

### Reveal.tsx
Animate elements on scroll with customizable directions and delays:
```tsx
<Reveal delay={0.2} direction="up">
  <h1>Animated Heading</h1>
</Reveal>
```

### MagneticButton.tsx
Buttons with magnetic hover effect and scale animation:
```tsx
<MagneticButton scale={1.02}>
  <button>Interactive Button</button>
</MagneticButton>
```

### Parallax.tsx
Scroll-based transform animations:
```tsx
<Parallax offset={50}>
  <div>Parallax Element</div>
</Parallax>
```

### Marquee.tsx
Continuous scrolling text animation:
```tsx
<Marquee speed={30}>
  DOMINATE YOUR LEAGUE • WIN CHAMPIONSHIPS •
</Marquee>
```

## Data Integration

When ready to connect real data:

1. **Replace Mock Services**: Update `services/api.ts` with real HTTP calls
2. **Yahoo OAuth**: Replace `services/auth.ts` with actual Yahoo Fantasy API
3. **Keep Signatures**: All function signatures remain identical for seamless migration
4. **Use Context Data**: LeagueContext provides user and league info for authenticated requests

## Installation & Development

```bash
npm install
npm run dev
```

The app uses Lenis for smooth scrolling and Framer Motion for animations. All existing functionality remains intact while adding the new portfolio-style design system.

## Architecture Notes

- **Frontend-only**: No backend required for development
- **localStorage**: User connection state persists locally
- **Component-based**: Reusable animation components for consistency
- **Type-safe**: Full TypeScript coverage with proper interfaces
- **Responsive**: Mobile-first design with breakpoint utilities

Perfect for showcasing fantasy football tools with a modern, animated interface that feels premium and engaging.