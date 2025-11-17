# SpartanDesign

> **Bold. Disciplined. Timeless.**

A design system and website template inspired by the legendary Spartans of ancient Greece. Built with Next.js 14, TypeScript, and Tailwind CSS, SpartanDesign embodies the core Spartan values of discipline, strength, simplicity, and excellence.

## 🛡️ Philosophy

The Spartans were known for their unwavering discipline, exceptional strength, and commitment to excellence. This design system channels those principles into a modern web framework:

- **Simplicity**: Remove everything unnecessary. Every element serves a clear purpose.
- **Strength**: Robust, purposeful components that stand the test of time.
- **Discipline**: Consistent patterns and strict adherence to design standards.
- **Honor**: Respect for the user through fast performance, accessibility, and honest design.

## ⚔️ Features

- **Custom Tailwind Theme** with Spartan-inspired color palettes
- **Typography System** using Cinzel (display) and Inter (body) fonts
- **Pre-built Components** for buttons, cards, and layouts
- **Responsive Design** that works on all devices
- **Performance Optimized** with Next.js 14 App Router
- **TypeScript** for type safety and better DX
- **Dark Mode Ready** color system

## 🎨 Color Palette

The SpartanDesign theme includes four carefully crafted color families:

### Bronze
Inspired by ancient Spartan armor and weaponry. Used for accents, borders, and secondary elements.
- `spartan-bronze-50` through `spartan-bronze-900`

### Crimson
The iconic color of Spartan cloaks. Used for primary actions and important elements.
- `spartan-crimson-50` through `spartan-crimson-900`

### Gold
Represents victory, achievement, and premium quality.
- `spartan-gold-50` through `spartan-gold-900`

### Stone
Neutral tones inspired by ancient Greek architecture. Used for backgrounds and text.
- `spartan-stone-50` through `spartan-stone-900`

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm, yarn, or pnpm

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd SpartanDesign
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Run the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🏗️ Project Structure

```
SpartanDesign/
├── app/
│   ├── layout.tsx          # Root layout with fonts
│   ├── page.tsx            # Homepage
│   └── globals.css         # Global styles & Tailwind
├── components/
│   ├── Button.tsx          # Reusable button component
│   └── Card.tsx            # Reusable card component
├── public/                 # Static assets
├── tailwind.config.ts      # Tailwind configuration with Spartan theme
├── tsconfig.json           # TypeScript configuration
└── package.json
```

## 🎯 Using the Theme

### Custom Tailwind Classes

The theme includes custom utility classes:

```tsx
// Buttons
<button className="spartan-button">Primary Action</button>
<button className="spartan-button-outline">Secondary Action</button>

// Cards
<div className="spartan-card">
  <h3 className="spartan-heading">Title</h3>
  <p>Content</p>
</div>

// Headings
<h1 className="spartan-heading text-4xl">Bold Title</h1>
```

### Color Usage

```tsx
// Background colors
<div className="bg-spartan-bronze-500">Bronze background</div>
<div className="bg-spartan-crimson-600">Crimson background</div>

// Text colors
<p className="text-spartan-stone-700">Stone text</p>
<span className="text-spartan-gold-500">Gold accent</span>

// Border colors
<div className="border-l-4 border-spartan-bronze-600">Left border</div>
```

### Typography

```tsx
// Display font (Cinzel)
<h1 className="font-display font-bold">Spartan Title</h1>

// Body font (Inter)
<p className="font-sans">Body text content</p>
```

## 🧩 Components

### Button Component

```tsx
import Button from '@/components/Button'

<Button variant="primary">Get Started</Button>
<Button variant="outline">Learn More</Button>
<Button variant="gold">Premium</Button>
```

### Card Component

```tsx
import Card from '@/components/Card'

<Card borderColor="bronze">
  <h3>Card Title</h3>
  <p>Card content</p>
</Card>
```

## 🎨 Customization

### Modifying Colors

Edit `tailwind.config.ts` to customize the color palette:

```typescript
colors: {
  spartan: {
    bronze: {
      // Your custom shades
    },
    // ... other colors
  }
}
```

### Adding New Components

1. Create a new file in `/components`
2. Use TypeScript for props typing
3. Apply Spartan theme colors and utilities
4. Export for use throughout the app

## 📦 Build for Production

```bash
npm run build
npm run start
```

## 🔧 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS 3.4
- **Language**: TypeScript 5
- **Fonts**: Google Fonts (Cinzel, Inter)
- **Package Manager**: npm/yarn/pnpm

## 📖 Design Principles in Action

1. **Minimalism**: No unnecessary decorations or bloat
2. **Consistency**: Unified spacing, typography, and color usage
3. **Performance**: Optimized images, fonts, and code splitting
4. **Accessibility**: Semantic HTML, ARIA labels, keyboard navigation
5. **Responsive**: Mobile-first approach with breakpoints

## 🤝 Contributing

Contributions are welcome! Please follow these principles:

- Maintain the Spartan philosophy of simplicity and purpose
- Write clean, typed TypeScript code
- Follow the existing color palette and design patterns
- Test responsiveness across devices
- Keep components focused and reusable

## 📄 License

See the [LICENSE](LICENSE) file for details.

## 💪 Molon Labe

"Come and take them" - The legendary Spartan response to demands for surrender. This project embodies that same spirit of defiance against complexity, bloat, and poor design.

---

Built with discipline. Crafted with purpose. **SpartanDesign**.
