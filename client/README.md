# PriceScraper Client — Next.js 16

A modern frontend for PriceScraper, rebuilt with **Next.js 16**, **React 19**, **Tailwind CSS v4**, and **TypeScript**. Designed for deployment on the **Vercel Hobby plan**.

## Stack

- **Next.js 16.1** — App Router, Turbopack
- **React 19** — Latest React with hooks
- **Tailwind CSS v4** — Utility-first styling via `@tailwindcss/postcss`
- **Chart.js + react-chartjs-2** — Price history charts
- **Lucide React** — Icon library
- **js-cookie + jwt-decode** — Auth token management

## Getting Started

```bash
# Install dependencies
npm install

# Run in development (Turbopack)
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Environment Variables

Create a `.env.local` file (or set in Vercel dashboard):

```
NEXT_PUBLIC_API_URL=https://your-backend-server.com
```

The app proxies `/api/*` and `/uploads/*` to this backend URL via Next.js rewrites configured in `next.config.js`.

## Deploying to Vercel (Hobby Plan)

1. Push this `client/` folder to a Git repository (or set the root directory to `client/` in Vercel).
2. In the Vercel dashboard, add the environment variable `NEXT_PUBLIC_API_URL` pointing to your backend server.
3. Vercel will auto-detect Next.js and deploy.

### Important Notes for Vercel Hobby Plan

- All pages are **client-side rendered** (`"use client"`) — no serverless function compute needed.
- API calls are proxied via Next.js `rewrites` to the external backend.
- No server-side data fetching or ISR is used, keeping within hobby plan limits.
- The `uploads/` static files are served from the backend server through rewrites.

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx          # Root layout (providers, nav, admin FAB)
│   ├── page.tsx            # Home — product grid
│   ├── globals.css         # Global styles + Tailwind
│   ├── login/page.tsx      # Login / Signup
│   ├── settings/page.tsx   # User settings, notifications, Discord
│   ├── product/
│   │   └── [productId]/page.tsx  # Product detail + price chart
│   └── admin/
│       ├── products/new/page.tsx        # Create product
│       ├── products/import/page.tsx     # Import product
│       ├── products/[productId]/page.tsx # Edit product
│       ├── scraper-log/page.tsx         # Scraper logs
│       ├── images/new/page.tsx          # Upload image
│       └── images/manage/page.tsx       # Manage images
├── components/
│   ├── nav/nav-bar.tsx     # Top navigation bar
│   ├── admin/admin-popup.tsx # Admin floating action menu
│   ├── product/
│   │   ├── product-grid.tsx
│   │   ├── product-card.tsx
│   │   └── price-chart.tsx
│   └── ui/
│       ├── btn.tsx         # Reusable button
│       ├── input.tsx       # Reusable input + textarea
│       └── page-shell.tsx  # Page wrapper with title
└── lib/
    ├── api.ts              # All API helper functions
    ├── auth.tsx            # Auth context provider
    └── types.ts            # Shared TypeScript types
```
