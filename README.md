# BOAN — Builders Of A Nation

A women-only community website using BOAN’s original logo and presentation palette: pink `#FF66C4`, green `#77D200` and navy `#010A4F`. The public domain is **www.boan.uk**.

## Development

Requires Node.js 22.12+ or Node.js 24 and npm.

```sh
npm ci --cache /tmp/boan-npm-cache
npm run dev -- --port 3000
```

## Pages and editing

The public website has five dedicated HTML pages:

- `index.html` — empowerment hero, testimonials, mission, programmes, community invitation and FAQ.
- `about-us.html` — organisation story, vision and mission.
- `our-programs.html` — Movement, Workshops, Creative and Retreats.
- `get-involved.html` — volunteering, partnerships and ambassador opportunities.
- `contact-us.html` — enquiry form and a direct link to `hello@boan.uk`.

Edit BOAN’s approved wording in `src/content/approved-copy.mjs`, shared layout and page content in `src/site-content.mjs`, the homepage hero in `src/pages/home-hero.html`, styling in `src/style.css`, and interactions in `src/main.js` and `src/contact-form.js`. `npm run pages` generates the five root HTML files, including before development and production builds. Keep these generated HTML files committed.

`public/favicon.svg` embeds the original logo silhouette and renders it in the same green and pink as the header, with a light background so it stays legible on dark browser tabs. The icon is linked on every page and included inline in the offline previews.

## Netlify deployment

`netlify.toml` configures Node.js 24, `npm run build` and the `dist` publish directory. The production branch is `main`. Merge the approved PR and let the connected Netlify project build it. If the project uses manual uploads, build locally and upload the **contents of `dist`**, including `_redirects` and `assets`.

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

## Online giving is paused

No donation page is emitted in the production build or offline mockup. Header/footer donation links, the homepage and Get Involved donation features, the contact-page giving prompt, and the monthly-gift FAQ wording are removed. The five main navigation tabs remain.

`public/_redirects` temporarily redirects `/support-our-work.html`, `/support-our-work` and `/support-our-work/` to the contact page with the supporting-BOAN topic selected. Because this file is copied into `dist`, the redirects work for both Git builds and manual Netlify uploads. Local Vite preview does not emulate Netlify redirect rules.

The previous donation template and behaviour are retained in `src/archive/donation-page.mjs` and `src/archive/donation-interactions.js`, with presets and approved impact wording in `src/content/donation-options.js`. They are not imported by the live site. To resume giving, connect and verify the payment processor, restore the page to the page list and its interactions, restore the intended links, and remove the temporary redirects. No payments, subscriptions or Gift Aid claims are implemented.

## Build and interactive previews

```sh
npm run build
npm run preview -- --port 3000
npm run preview:standalone
```

Production output is in `dist/`. Relative asset URLs also support deployments at a subpath.

The standalone command produces five individually navigable files in `docs/preview/` and a single-file mockup in `docs/boan-interactive-preview.html`. Fonts, logos, favicon and JavaScript are embedded. Both formats use `noindex,nofollow`, omit giving, and display an honest non-sending contact-form notice when submitted. The single-file iframe preserves navigation, query parameters, programme anchors and browser Back. `BOAN_PREVIEW_SEARCH`, `BOAN_PREVIEW_HASH` and `BOAN_OFFLINE_PREVIEW` supply the simulated location and prevent live submissions.

The separate `gh-pages` branch contains a design-preview package with `BOAN-interactive-mockup.html`. Source PRs do not automatically update that branch. Production Netlify deployments should use `dist`, not the offline mockup.

## Testimonials and branding

Original supplied stories and short, verbatim excerpts are stored in `src/content/testimonials.js`. Gemma Jermaine and Mary J appear in pink and green cards, with previous/next buttons, direct selectors, keyboard arrows/Home/End, touch swipes and screen-reader status. There is no automatic rotation. Header/footer branding and the favicon preserve the original logo geometry. The homepage retains the three-line headline “Feel supported. Grow stronger. Thrive together.” and the description “For the woman you are and the woman you’re becoming.”

## Browser checks

```sh
npm run preview:standalone
npm run test:e2e
```

Playwright uses `/usr/bin/chromium` when present. Set `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` for another browser, or install the matching Playwright Chromium browser in your development environment.

The suite checks five-page navigation, programme/enquiry pathways, mobile menus, testimonial controls, responsive layouts from 320 to 1440px, local links, offline preview navigation and non-sending forms, original-logo favicon rendering, absence of donation UI/output, redirect-file packaging, static Netlify form detection markup, native no-JavaScript POSTs, and mocked contact submission success/failure/retry/duplicate prevention. Live Netlify form detection, notification settings and mailbox delivery require the deployment checks above.
