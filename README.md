# BOAN — Builders Of A Nation

A responsive homepage for a women-only community interest company, covering Movement with SNB Hive, Nutrition, Workshops and Retreats.

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

The production output is in `dist/`. Fonts and the hero image are served locally. The hero is AI-generated concept imagery, not a photograph of BOAN members. The stacked BOAN mark is a vector recreation of the design supplied in chat, with cream/pink and lime/pink variants. It is an approximation of the source image rather than a pixel-exact recolour; replace the SVG with the original vector artwork if supplied.

## Current scope

Homepage navigation, responsive menu, FAQs, and an accessible native enquiry dialog are implemented. The form downloads a personal note of interest and does not submit or retain information online. Before public launch, add confirmed programme details and contact information, integrate a real enquiry or booking destination, and review organisation/privacy information. No session dates, prices, testimonials or contact addresses have been invented.

The supplied SKY TING screenshot informs the full-bleed hero, overlay navigation, and service-panel layout. Direct access to both skyting.com and www.skyting.com was blocked by the environment network policy.

## Interactive mockup — no server needed

Download [the interactive preview](docs/boan-interactive-preview.html) using GitHub's **Download raw file** button, then open the saved `.html` file in a desktop browser. GitHub's file viewer shows source code; it does not run the preview. The HTML contains the actual built homepage, including its fonts, images, logo and JavaScript. Its navigation, menus, FAQs, and interest-note download work without an internet connection. There is no backend submission or confirmed booking.

Regenerate the file after homepage changes:

```sh
npm run preview:standalone
```

The cloud browser's policy blocks `file://` navigation, so validation loaded the exact standalone HTML through an intercepted document request with networking disabled. All assets were inline; all four programme links, focus management, the mobile menu, FAQs and the interest-note download passed. Widths 320, 390, 768, 1024 and 1440px showed no horizontal overflow.

Retreats are presented as a programme being explored; dates, locations and bookings are not yet available. The preview must be connected to an approved hosting service for a publicly navigable URL. No public deployment has been made.
