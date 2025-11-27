# Claude Development Notes

## Project Context

Building a laser cutting design platform for a laser cutting business. The goal is to create a simple, user-friendly interface where customers can design flat objects and gates for laser cutting.

## System Workflow

**Customer Journey:**

1. User designs what they want in the web interface
2. System generates instant quote
3. User submits design with contact details

**Backend Process:**

- Email sent to engineer with:
  - Customer details
  - Design file (SVG)
  - Quote breakdown

**Engineer Workflow:**

- Receives email notification
- Opens file in Fusion 360 for review/editing
- Fusion 360 exports DXF for laser cutter
- Proceeds with laser cutting

## Key Technical Decisions

### File Format

- **Export Format**: SVG (compatible with Fusion 360)
- **Why**: Fusion 360 handles SVG imports well, can be sketched/modified/extruded
- **Note**: DXF export happens in Fusion 360, not in the web app

### No Python Backend

- Initially considered Python scripts for SVG generation and quote calculations
- **Decision**: React Three Fiber can handle all exports directly in browser
- Quote calculations done in TypeScript via Next.js API routes
- Simpler architecture, fewer dependencies

### Tech Stack

- **Next.js 14**: App router, TypeScript
- **React Three Fiber**: 3D design canvas
- **Drei**: Three.js helpers (OrbitControls, Grid, etc.)
- **Tailwind CSS**: Styling
- **Resend**: Email delivery

## Design Principles

1. **Simplicity First**: Any user should be able to build their design
2. **Real-time Feedback**: Instant quotes, 3D visualization
3. **Engineer-Friendly**: Files work seamlessly in Fusion 360
4. **Production Ready**: Focus on laser cutting workflow

## Todo List Status

- [x] Initialize Next.js with TypeScript and Tailwind
- [x] Set up project structure
- [x] Install React Three Fiber
- [x] Create basic 3D design canvas
- [ ] Add SVG export functionality
- [ ] Create quote calculation API route
- [ ] Create email notification API route
- [ ] Build customer details form

## Future Considerations

- Material thickness handling in UI
- Unit conversion (mm, inches)
- Design templates/presets for common shapes
- Design library/save functionality
- Customer account system
- Order tracking
