# BOAN — Builders Of A Nation

A responsive homepage for a women-only community interest company, covering movement with SNB Hive, nutrition, and wellbeing circles.

## Development

Requires Node.js 22.12+ or Node.js 24 and npm.

```sh
npm ci --cache /tmp/boan-npm-cache
npm run dev -- --port 3000
```

## Production

```sh
npm run build
npm run preview -- --port 3000
```

The production output is in `dist/`. Fonts and the hero image are served locally. The hero is AI-generated concept imagery, not a photograph of BOAN members. The header uses a typographic wordmark inspired by the supplied brand palette; it is not the original supplied logo.

## Current scope

Homepage navigation, responsive menu, FAQs, and an accessible native enquiry dialog are implemented. The form downloads a personal note of interest and does not submit or retain information online. Before public launch, add confirmed programme details and contact information, integrate a real enquiry or booking destination, and review organisation/privacy information. No session dates, prices, testimonials or contact addresses have been invented.

The supplied SKY TING screenshot informs the full-bleed hero, overlay navigation, and service-panel layout. Direct access to both skyting.com and www.skyting.com was blocked by the environment network policy.
