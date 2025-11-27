# Spartan Design - Laser Cutting Design Platform

A web-based platform for designing custom laser cut products with real-time 3D visualization, instant quoting, and automated job submission.

## Project Overview

Spartan Design provides an intuitive interface for customers to design laser cutting projects (gates, flat objects, custom designs) and automatically send job details to engineers for production.

## Workflow

### Customer Side

1. **Design** - Use the 3D designer interface to create custom designs
2. **Quote** - Get instant pricing based on material, dimensions, and complexity
3. **Submit** - Provide customer details and submit the design

### System Process

- Automatically emails engineer with:
  - Customer details
  - Design file (SVG format, Fusion 360 compatible)
  - Quote breakdown

### Engineer Side

- Receives email notification
- Opens design file in Fusion 360
- Reviews and edits as needed
- Exports DXF file
- Proceeds to laser cutting

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **3D Engine**: Three.js + React Three Fiber + Drei
- **Email**: Resend
- **File Export**: SVG (Fusion 360 compatible)

## Project Structure

```
SpartanDesign/
├── app/
│   ├── api/
│   │   ├── quote/          # Quote calculation endpoint
│   │   └── email/          # Email notification endpoint
│   ├── designer/           # 3D design interface
│   ├── layout.tsx
│   ├── page.tsx            # Landing page
│   └── globals.css
├── components/
│   └── DesignCanvas.tsx    # 3D canvas component
├── lib/                    # Utility functions
└── scripts/                # Helper scripts
```

## Features

- **3D Design Canvas**: Interactive design environment with orbit controls
- **Real-time Quote Calculation**: Instant pricing based on:
  - Material selection
  - Design dimensions
  - Cutting complexity
  - Quantity
- **Email Notifications**: Automated job submission to engineers
- **SVG Export**: Production-ready files compatible with Fusion 360

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Build for Production

```bash
npm run build
npm start
```

## Environment Variables

Create a `.env.local` file:

```env
# Resend API Key for email
RESEND_API_KEY=your_api_key_here

# Engineer email for notifications
ENGINEER_EMAIL=engineer@example.com
```

## License

ISC
