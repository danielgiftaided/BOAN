# BOAN — Builders Of A Nation

A women-only community homepage covering Movement with SNB Hive, Nutrition, Workshops and Retreats.

## Development

Requires Node.js 22.12+ or Node.js 24 and npm.

```sh
npm ci --cache /tmp/boan-npm-cache
npm run dev -- --port 3000
```

## Build and preview

```sh
npm run build
npm run preview -- --port 3000
npm run preview:standalone
```

The production output is in `dist/`. The standalone command packages the actual production homepage, its fonts, original logo and JavaScript into `docs/boan-interactive-preview.html`. Download the raw HTML from GitHub and open it in a browser, or use the hosted design preview linked in the PR. The standalone version has a `noindex,nofollow` robots directive.

The `gh-pages` branch is a separate, static design-preview deployment. It does not merge website code into `main`. Refreshing it requires rebuilding and publishing the standalone HTML as `index.html`; source commits alone do not update that deployment.

## Brand and content

The photo-free homepage uses the supplied BOAN presentation as visual and mission reference. Its main palette is pink `#FF66C4`, green `#77D200` and navy `#010A4F`, with pale tints for reading areas. The original transparent BOAN logo was extracted directly from the presentation and is displayed in navy/pink through CSS masking. No logo redrawing or AI-generated artwork is used in the current homepage.

The opening focuses on women's confidence, belonging and opportunity. Movement, Nutrition, Workshops and Retreats have distinct navigation targets. Information about reducing financial and practical barriers, community-led programmes and partnerships reflects the supplied presentation. Retreat dates, prices and bookings have not been invented.

## Current limits

The enquiry form downloads a personal note of interest; it does not send or retain details online. Confirmed programmes, contact details, booking/enquiry integration and organisation/privacy information remain pre-launch work. Free or subsidised access is described as dependent on partnerships and funding.

## Validation

Production build and Chromium interaction checks passed: all four programme links with focus/current state, mobile menu including Escape, FAQs, retreat and partnership interest selection, and local downloads. Widths 320, 360, 390, 560, 768, 820, 900, 1024 and 1440px showed no horizontal overflow. The exact standalone document was also tested with networking disabled and required no external asset requests.
