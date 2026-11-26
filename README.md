# BOAN — Builders Of A Nation

A women-only community website using BOAN’s original logo and presentation palette: pink `#FF66C4`, green `#77D200` and navy `#010A4F`. The public domain is **www.boan.uk**.

## Development

Requires Node.js 22.12+ or Node.js 24 and npm.

```sh
npm ci --cache /tmp/boan-npm-cache
npm run dev -- --port 3000
```

## Pages and editing

The public website has nine dedicated HTML pages:

- `index.html` — empowerment hero, testimonials, mission, programmes, community invitation, support feature and FAQ.
- `about-us.html` — organisation story, vision and mission.
- `our-programs.html` — Movement, Workshops, Creative and Retreats.
- `join-community.html` — the supplied community introduction, programme options, access/funding information, three joining steps, FAQs and Contact Us link.
- `get-involved.html` — volunteering, partnerships, ambassador opportunities and support.
- `contact-us.html` — enquiry form, giving link and a direct link to `hello@boan.uk`.
- `support-our-work.html` — single/monthly giving preview and donation impact summaries.
- `privacy-policy.html` — the supplied privacy policy, reached through the bottom footer link on every page.
- `health-questionnaire.html` — branded registration and PAR-Q+ branching preview linked from the first Register Your Interest button.

Edit BOAN’s approved wording in `src/content/approved-copy.mjs`, shared layout and page content in `src/site-content.mjs`, the homepage hero in `src/pages/home-hero.html`, community copy in `src/pages/join-community.html`, privacy policy in `src/pages/privacy-policy.html`, styling in `src/style.css`, and interactions in `src/main.js` and `src/contact-form.js`. `npm run pages` generates the nine root HTML files, including before development and production builds. Keep these generated HTML files committed.

`public/favicon.svg` embeds the original logo silhouette and renders it in the same green and pink as the header, with a light background so it stays legible on dark browser tabs. The icon is linked on every page and included inline in the offline previews.

## Community page and programme image links

“Join our community” appears in the shared header and footer navigation. The page contains BOAN’s supplied copy, a first **Register Your Interest** link to the health questionnaire preview and a second disabled **Register Your Interest** button, six expandable FAQs, and **Talk to Us** linking to `contact-us.html`. The questionnaire is an interactive preview; response collection remains off until website storage is selected. The Privacy Policy is available through the shared footer.

The policy retains all 15 sections of BOAN’s supplied wording, with semantic headings, lists and email/website links. As requested, square-bracketed editorial notes and placeholders have been removed. The unfinished correspondence-address line is omitted and **Last updated** is **21 November 2026**. The policy appears in the footer only, with no additional header tab.

The homepage programme artwork is the link to the corresponding `our-programs.html#movement`, `#workshops`, `#creative` or `#retreats` section. Each image link has a descriptive accessible name, with no separate “Explore…” text link under the card. The general **See Our Programmes** link remains. The main navigation switches to the menu at 1200px so the extra tab fits without crowding.

The six BOAN PNGs are stored in `public/images/`. The four programme images retain their supplied artwork. Together, we rise and You belong here use transparent PNG backgrounds so the homepage section colours show through around the artwork; foreground lettering and white artwork details remain intact. The four programme images appear on both the homepage and their matching programme sections. Square layouts and `object-fit: contain` preserve the complete artwork and its wording. Intrinsic dimensions reserve space; the hero image has high fetch priority, and lower-page images load lazily. All six images are embedded in the standalone exports.

## Page header photos

The About Us, Get Involved, Our Programmes and Join our community introductions use the four requested photos from BOAN’s uploaded ZIP. Their original JPEGs are stored in `public/images/page-headers/` under their supplied filenames. CSS opacity and blush gradients create the fade without modifying the source photos; mobile crops and a lighter mobile fade keep the wording readable. These decorative images are hidden from assistive technology and included in the offline exports.

| Page | Supplied photo |
| --- | --- |
| About Us | Dead Good Legacies |
| Get Involved | LinkedIn Sales Solutions |
| Our Programmes | Jessica Streser |
| Join our community | Land O’Lakes |

## Netlify deployment

`netlify.toml` configures Node.js 24, `npm run build` and the `dist` publish directory. The production branch is `main`. Merge the approved PR and let the connected Netlify project build it. If the project uses manual uploads, build locally and upload the **contents of `dist`**, including the `assets` folder.

The domain registered at GoDaddy is **boan.uk**, with `www.boan.uk` as primary. Its DNS is managed in Netlify. Use the nameservers assigned to the **boan.uk** zone, and preserve the Microsoft 365 email records supplied by GoDaddy for the actual mailbox domain. DNS, mailbox setup, HTTPS and project visitor access are account settings; committing source does not configure them.

## Contact form: activate delivery to hello@boan.uk

The generated static contact form is named **`boan-contact`**, uses `method="POST"`, `data-netlify="true"`, a matching hidden `form-name`, and a `bot-field` honeypot. It can submit without JavaScript using Netlify’s standard confirmation page. With JavaScript, it POSTs URL-encoded fields to Netlify, disables duplicate submissions while sending, confirms only after an accepted response, and retains the entered fields on errors/timeouts. The visitor’s `email` field enables replies to that visitor from Netlify’s notification. No credentials or email service keys are embedded in the website.

**Required Netlify account configuration:**

1. Open the BOAN project’s **Forms** area. Enable **form detection** if it is disabled.
2. Deploy this change **after** form detection is enabled. Confirm **boan-contact** appears among the detected forms.
3. In the project’s **Notifications** settings, find **Form submission notifications** and add an **Email notification**. Choose **boan-contact** (or all forms) and recipient **hello@boan.uk**. In dashboards that expose notifications from the form itself, use that form’s notification settings. Save the notification.
4. From the deployed production contact page, submit a real test enquiry. Confirm the entry appears in Netlify Forms and the email arrives at **hello@boan.uk**, including checking junk/spam and Reply-To. Successful browser submission alone does not verify notification delivery.

The email recipient is a **Netlify dashboard setting**, not an HTML attribute. This repository prepares form collection; it cannot enable form detection or create the email notification in an unauthenticated Netlify account. Mailbox delivery also requires the correct Microsoft 365 DNS records in the **boan.uk** zone if that is the email domain.

Local Vite servers do not run Netlify Forms. Automated tests use intercepted endpoints and do not send real messages. Development and downloadable offline previews explicitly refuse to send; visitors can use the direct email link. Review current Netlify Forms usage/plan limits in the project dashboard.

## Registration and health questionnaire preview

Only the first **Register Your Interest** control on Join our community opens `health-questionnaire.html`; the second remains disabled. This custom BOAN website form uses pink, green and navy styling with Back/Next navigation, validation, progress and an answer review. It is not a Microsoft-hosted form.

The seven general health answers are completed before routing. All NO skips the medical follow-ups. Any YES opens ten condition screens; each condition's YES reveals its lettered questions, and NO skips them. Changing an answer removes inapplicable child answers; changing the general route removes all medical follow-up answers. The relevant original recommendations and declaration are shown, and a parent/guardian/care-provider typed acknowledgement is conditional.

Clinical wording is in `src/content/health-questionnaire.js`, transcribed from the supplied PAR-Q+ (© 2025 PAR-Q+ Collaboration, source date 01-11-2024): seven general questions, ten condition screens and 31 lettered follow-ups. Registration contact/interests fields and the typed preview acknowledgements are additional administrative fields. State and validation are in `src/health-questionnaire-state.js`; `src/health-questionnaire.js` renders the flow. The original blank PDF remains available under `public/downloads/`.

**Preview only:** use sample details. There is no submission endpoint, Netlify health form, email notification, local/session storage, analytics payload or server persistence. Finishing clears the sample answers and explicitly confirms that nothing was sent. Website storage is to be chosen before enabling real collection, and signing arrangements must be confirmed before launch. The page has `noindex,nofollow` and the offline mockup also supports its branching.

## Giving preview

The donation page and all existing links remain available, including the header button, footer link, homepage and Get Involved support features, contact-page giving link and homepage FAQ. The page is included in production and offline exports; there are no donation-page redirects.

The page retains single and monthly presets, custom GBP amounts, live summaries, validation and the review dialog. Monthly presets are £10, £20, £35, £60 and £100. Their left-hand descriptions explain the approved session/fitness benefits, update with the selection, and are hidden for single gifts. The review passes the selected gift to Contact Us as an enquiry. Shared presets and impact wording are in `src/content/donation-options.js`.

Online payments are not open yet. The page and review clearly explain that they are previews: no card details are collected, no money is taken, and no recurring donation is created. A payment processor still needs connecting before accepting real donations. No Gift Aid claims are implemented.

## Build and interactive previews

```sh
npm run build
npm run preview -- --port 3000
npm run preview:standalone
```

Production output is in `dist/`. Relative asset URLs also support deployments at a subpath.

The standalone command produces nine individually navigable files in `docs/preview/` and a single-file mockup in `docs/boan-interactive-preview.html`. Fonts, logos, favicon and JavaScript are embedded. Both formats use `noindex,nofollow`, retain the giving preview, and display an honest non-sending contact-form notice when submitted. The single-file iframe preserves navigation, query parameters, programme anchors and browser Back. `BOAN_PREVIEW_SEARCH`, `BOAN_PREVIEW_HASH` and `BOAN_OFFLINE_PREVIEW` supply the simulated location and prevent live submissions.

The separate `gh-pages` branch contains a design-preview package with `BOAN-interactive-mockup.html`. Source PRs do not automatically update that branch. Production Netlify deployments should use `dist`, not the offline mockup.

## Testimonials and branding

Original supplied stories and short, verbatim excerpts are stored in `src/content/testimonials.js`. Gemma Jermaine, Mary J, Amina Potts and Nicola O’Connor appear in alternating pink and green cards, with previous/next buttons, four direct selectors, keyboard arrows/Home/End, touch swipes and screen-reader status. Nicola’s attribution includes **(Instructor)**. The carousel automatically advances every five seconds, with no Play/Pause controls. Arrows, dots, keyboard navigation and swipes restart the five-second interval and keep rotation running. Hovering and keyboard focus do not stop rotation. Playback pauses while the browser tab is hidden or reduced-motion preferences are enabled, then resumes automatically when those conditions clear. Manual selections are announced through the screen-reader status; automatic changes are not repeatedly announced. The card area reserves the tallest story’s height to keep the page steady. Header/footer branding and the favicon preserve the original logo geometry. The homepage retains the three-line headline “Feel supported. Grow stronger. Thrive together.” and the description “For the woman you are and the woman you’re becoming.”

## Browser checks

```sh
npm run preview:standalone
npm run test:e2e
```

Playwright uses `/usr/bin/chromium` when present. Set `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` for another browser, or install the matching Playwright Chromium browser in your development environment.

The suite checks nine-page navigation, programme/enquiry pathways, mobile menus, testimonial controls, responsive layouts from 320 to 1440px, local links, offline preview navigation and non-sending forms, original-logo favicon rendering, monthly/single/custom donation choices, impact wording and review, static Netlify form detection markup, native no-JavaScript POSTs, and mocked contact submission success/failure/retry/duplicate prevention. Live Netlify form detection, notification settings and mailbox delivery require the deployment checks above.
