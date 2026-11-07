# BOAN — Builders Of A Nation

A women-only community website using BOAN’s original logo and presentation palette: pink `#FF66C4`, green `#77D200` and navy `#010A4F`.

## Development

Requires Node.js 22.12+ or Node.js 24 and npm.

```sh
npm ci --cache /tmp/boan-npm-cache
npm run dev -- --port 3000
```

The shared navigation starts with Home on every page. The homepage headline reads “Feel supported. Grow stronger. Thrive together.” in three lines.

## Pages and editing

The website has six genuine HTML pages, not homepage tabs:

- `index.html` — hero, community testimonials, mission, programmes, community invitation and the impact of support.
- `about-us.html` — purpose, values and community-led approach.
- `our-programs.html` — Movement, Workshops, Creative and Retreats.
- `get-involved.html` — participation, volunteering, partnerships, ambassador opportunities and financial support.
- `contact-us.html` — enquiry preview with relevant topics and a local draft download.
- `support-our-work.html` — single/monthly donation choices and the £35 monthly fitness support message.

Edit BOAN’s supplied wording in `src/content/approved-copy.mjs`, shared layout and page content in `src/site-content.mjs`, the homepage hero in `src/pages/home-hero.html`, styling in `src/style.css`, and interactions in `src/main.js`. `npm run pages` generates the six root HTML files. Generation also runs automatically before development and production builds. Keep the generated HTML committed so the page structure and navigation can be reviewed without running JavaScript.

## Build and interactive previews

```sh
npm run build
npm run preview -- --port 3000
npm run preview:standalone
```

The production output is in `dist/`. Relative URLs support deployment at a subpath such as GitHub Pages.

The preview command produces:

- `docs/preview/`: six independently navigable HTML files with inline fonts, logo and JavaScript. Open `index.html` and keep the files together.
- `docs/boan-interactive-preview.html`: a single-file mockup containing the same six pages. Its embedded preview frame preserves page navigation, queries, programme anchors and browser-back navigation without an external server.

Both exports include `noindex,nofollow` directives. Their forms are demonstrations. In the single-file export, `BOAN_PREVIEW_SEARCH` and `BOAN_PREVIEW_HASH` supply the current simulated page location to the shared interaction code.

The `gh-pages` branch contains a separate static design-preview package. Downloading its GitHub source archive gives a ZIP with `index.html`, the other five pages and `BOAN-interactive-mockup.html`. Open either `index.html` or `BOAN-interactive-mockup.html` after extracting the ZIP. Source branch commits do not automatically update `gh-pages`; publish the refreshed standalone files separately. Hosting status is not established by publishing these files. To enable a hosted preview, a repository administrator can select **Settings → Pages → Deploy from a branch → gh-pages → / (root)** and save.

## Homepage testimonials

The two supplied testimonials are stored in `src/content/testimonials.js`. Short, verbatim excerpts appear in pink and green quote cards in place of the former three introductory cards. The original full text is retained in the content source; the carousel displays only the selected excerpts. The carousel uses previous/next buttons, direct selectors, keyboard arrows/Home/End and touch swipes, with a screen-reader status and no automatic rotation. One quote is shown at a time; Gemma Jermaine is first, followed by Mary J. No ratings or portraits have been invented.

The hero’s two former action buttons, reassurance badges, announcement strip and decorative micro-headings are removed. Decorative labels and image captions are omitted across all six pages, while functional navigation and form guidance remain. The header and footer use the original logo mask with green lettering and a pink wordmark, without the additional small brand label. Main navigation and links elsewhere on the homepage still lead to the dedicated pages. The “Bring your story. Find your people.” section now appears immediately before the support feature.

## Giving and contact previews

The donation page defaults to £35 monthly, explaining that this can support a woman to attend fitness classes for a month. It offers suggested amounts for single and monthly giving, custom amounts in pounds/pence, live summaries, validation, and an explicit review dialog. Different monthly/single choices are remembered while switching frequency on that page. Invalid custom amounts cannot reach review. Monthly presets are £10, £20, £35, £60 and £100; single presets remain £10, £25, £50 and £100. The left-hand impact panel updates for monthly gifts and is hidden for single gifts or invalid custom input. £10 supports one woman’s monthly pay-as-you-go session; £20 supports two sessions each month for one woman; £60 supports four reformer Pilates sessions for one woman each month; £100 supports one class of their choice each month for 10 women. The £35 fitness message is retained. Single-gift summaries and reviews show the amount without the word “once”. Other valid monthly amounts use a general access message rather than invented session counts. Shared presets and impact copy live in `src/content/donation-options.js` and are used by both the page generator and browser.

The user confirmed there is no donation platform yet. No payments, subscriptions, card collection or payment-success claims are implemented. A real giving provider and final payment terms remain pre-launch work. No Gift Aid or charitable tax status is assumed for the CIC. The review can pass the selected gift to the contact page as an enquiry draft.

The contact form validates name, email and message, then downloads a local text draft. Nothing is sent or stored online. Before launching enquiries, configure a verified destination and update the form notice and submission behaviour. Programme dates, prices, contact details and bookings have not been invented.

## Browser checks

```sh
npm run preview:standalone
npm run test:e2e
```

Playwright uses `/usr/bin/chromium` when available. Set `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` for another system browser, or install the matching Playwright Chromium browser in your development environment.

The suite checks distinct page navigation and reloads, programme anchors, enquiry topics and draft downloads, monthly/single/custom gift validation and review, mobile menus and giving shortcuts, responsive widths from 320 to 1440px, local link targets, and offline navigation through the single-file mockup without external asset requests.
