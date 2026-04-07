# 📻 Podator - Podcast Verification Dashboard

Professional podcast RSS feed verification tool with sophisticated calendar UI and real-time status monitoring.

## Features

✅ **Beautiful Dashboard** - Modern React/Vite interface with Framer Motion animations
✅ **Calendar View** - Monthly calendar with day-by-day verification status
✅ **Real-time Insights** - Active flows, success rate, alert counter
✅ **Error Detection**:
  - Files < 100KB (suspect MP3s of 1-2KB)
  - Invalid RSS feeds
  - Missing episodes or enclosures
  - Network timeouts
✅ **History Tracking** - localStorage persistence of all verifications
✅ **Detail Modal** - Click any day to see detailed error breakdown
✅ **Mobile Responsive** - Optimized for phone/tablet/desktop
✅ **Professional Design** - Manrope typography, custom colors, premium animations

## Tech Stack

- **Frontend**: React 19 + TypeScript
- **Build**: Vite 6
- **Styling**: Tailwind CSS 4
- **Animations**: Framer Motion
- **Icons**: Lucide React

## Quick Start

```bash
# Install dependencies
npm install

# Development server (localhost:5173)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
podator/
├── src/
│   ├── App.tsx          # Main dashboard component
│   ├── main.tsx         # React entry point
│   └── index.css        # Tailwind + theme variables
├── index.html           # HTML template
├── vite.config.ts       # Vite configuration
├── tsconfig.json        # TypeScript configuration
├── package.json         # Dependencies
└── podcasts.json        # 113 podcast RSS feeds
```

## How It Works

### Verification Flow
1. Click "Verify All" button to scan all 113 podcast feeds
2. Each feed is checked for:
   - RSS validity (valid XML structure)
   - Latest episode availability
   - MP3 file size (must be > 100KB)
3. Results saved to localStorage with timestamp
4. Calendar updates with error count badges

### Data Structure
```json
{
  "2025-04-07": {
    "ok": 110,
    "errors": [
      {
        "name": "Flux 82",
        "error": "File too small: 1.2 MB"
      }
    ]
  }
}
```

## Color System

- **Primary**: #2563eb (Blue) - Main actions
- **Secondary**: #16a34a (Green) - Success states
- **Error**: #dc2626 (Red) - Alert states
- **Background**: #ffffff - Clean surface

## Performance

- **Fast verification**: ~1 min for 113 feeds
- **No backend**: Fully client-side operation
- **CORS proxy**: Uses allorigins.win for RSS fetching
- **Instant updates**: Real-time UI feedback

## Deployment

Ready for GitHub Pages or Vercel:

```bash
npm run build
# dist/ folder contains optimized production build
```

## Next Steps

- [ ] Add email notifications for critical errors
- [ ] Export verification reports as PDF
- [ ] Webhook notifications to Slack
- [ ] Database backend for long-term analytics
- [ ] Admin panel for feed management

---

**Live**: https://jamega-76.github.io/podator/
**GitHub**: https://github.com/Jamega-76/podator
**Template**: Based on Google AI Studio design system
