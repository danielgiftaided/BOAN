import { readFileSync } from 'node:fs';
import { testimonials } from './content/testimonials.js';
import { aboutCopy, missionCopy, programmeIntro, programmeCopy, programmeClosing, involvementIntro, involvementCopy } from './content/approved-copy.mjs';

export const arrow = '<svg class="arrow-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M5 19 19 5M5 5h14v14"/></svg>';
export const flower = '<svg class="flower" viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="17" stroke-linecap="round" aria-hidden="true"><path d="M50 12v76M12 50h76M23 23l54 54M23 77l54-54"/></svg>';
const brand = '<span class="brand-mark" aria-hidden="true"></span>';
export const navigation = [
  ['index.html', 'Home'],
  ['about-us.html', 'About Us'],
  ['our-programs.html', 'Our Programs'],
  ['get-involved.html', 'Get Involved'],
  ['contact-us.html', 'Contact Us'],
];
const link = (url, text, classes = 'button lime') => `<a class="${classes}" href="${url}">${text} ${arrow}</a>`;
const contactLink = (topic, label, classes) => link(`contact-us.html?topic=${topic}`, label, classes);
const breadcrumb = title => `<nav class="breadcrumb" aria-label="Breadcrumb"><a href="index.html">Home</a><span aria-hidden="true">/</span><span aria-current="page">${title}</span></nav>`;
const paragraphs = (copy, classes = '') => copy.map(text => `<p${classes ? ` class="${classes}"` : ''}>${text}</p>`).join('');
const intro = (label, title, description, name) => `<section class="page-intro section">${breadcrumb(name)}<h1>${title}</h1>${paragraphs(Array.isArray(description) ? description : [description], 'page-description')}</section>`;
const programmes = [
  {id:'movement', title:'Movement', caption:'Find your feel-good.', description:'Pilates, yoga, Zumba, strength training, dance and fitness to build confidence and support physical and mental wellbeing.', detail:programmeCopy.movement, topic:'movement', art:flower},
  {id:'workshops', title:'Workshops', caption:'Your voice belongs here.', description:"Women's health, financial education, personal development and life skills. Practical knowledge to make informed decisions.", detail:programmeCopy.workshops, topic:'workshops', art:'<div class="circle-art"><i></i><i></i><i></i></div>'},
  {id:'creative', title:'Creative', caption:'Make something. Find connection.', description:'Painting, flower arranging, crocheting, knitting and hands-on experiences to explore new interests and build friendships.', detail:programmeCopy.creative, topic:'creative', art:'<div class="orange-art"><i></i><i></i><i></i><i></i></div>'},
  {id:'retreats', title:'Retreats', caption:'Make space for yourself.', description:'Thoughtfully curated wellbeing experiences to recharge, reflect and restore balance through movement, nature and connection.', detail:programmeCopy.retreats, topic:'retreats', art:'<div class="sun-art"><i></i><b></b></div>'},
];
const programmeCards = programmes.map((p,i) => `<article class="programme-card ${p.id}"><div class="card-art" aria-hidden="true">${p.art}</div><div class="card-body"><h3>${p.title}</h3><p>${p.description}</p>${link(`our-programs.html#${p.id}`, `Explore ${p.title.toLowerCase()}`, 'text-link')}</div></article>`).join('');

const escapeText = text => text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const carouselArrow = '<svg class="arrow-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M4 12h16M13 5l7 7-7 7"/></svg>';
const testimonialCarousel = `<section class="testimonials section" data-testimonial-carousel role="region" aria-roledescription="carousel" aria-labelledby="testimonials-title"><div class="testimonial-layout"><div class="testimonial-intro"><h2 id="testimonials-title">Real women.<br><em>Real stories.</em></h2><div class="testimonial-controls"><div class="testimonial-arrows"><button class="testimonial-arrow previous" type="button" data-testimonial-step="-1" aria-label="Previous testimonial">${carouselArrow}</button><button class="testimonial-arrow" type="button" data-testimonial-step="1" aria-label="Next testimonial">${carouselArrow}</button></div><div class="testimonial-dots" aria-label="Choose a testimonial">${testimonials.map((quote, i)=>`<button class="testimonial-dot" type="button" data-testimonial-index="${i}" aria-label="Read testimonial from ${escapeText(quote.name)}" aria-controls="testimonial-slide-${i+1}"${i===0?' aria-current="true"':''}><span aria-hidden="true"></span></button>`).join('')}</div><p class="testimonial-status sr-only" role="status" aria-live="polite" aria-atomic="true">1 of ${testimonials.length} — ${escapeText(testimonials[0].name)}</p></div></div><div class="testimonial-slides">${testimonials.map((quote, i)=>`<figure class="testimonial-slide" id="testimonial-slide-${i+1}" data-testimonial-slide data-author="${escapeText(quote.name)}" data-colour="${quote.colour}" role="group" aria-roledescription="slide" aria-label="${i+1} of ${testimonials.length}"${i===0?'':' hidden'}><span class="testimonial-quote-mark" aria-hidden="true">“</span><blockquote>${paragraphs([escapeText(quote.excerpt)])}</blockquote><figcaption><span class="testimonial-author-line" aria-hidden="true"></span><strong>${escapeText(quote.name)}</strong></figcaption></figure>`).join('')}</div></div></section>`;

const home = readFileSync(new URL('./pages/home-hero.html', import.meta.url),'utf8') + `
${testimonialCarousel}
<section class="about section"><div class="section-label"><span class="small-word">Big dreams.<br><em>Shared beginnings.</em></span></div><div><h2>When women have space,<br><em>possibility grows.</em></h2><div class="about-copy"><p>BOAN is a community-led organisation empowering women through wellbeing, education, creative experiences and meaningful connection. We’re here to build confidence, open doors and make wellbeing feel within reach.</p><p>Cost, confidence, culture or caring responsibilities shouldn’t decide who gets to thrive. We’re working to remove those barriers, with welcoming opportunities shaped by women.</p></div>${link('about-us.html','Meet BOAN','inline-link')}</div></section>
<section class="programmes section"><div class="section-heading"><div><h2>Feel good.<br><em>Grow together.</em></h2></div>${link('our-programs.html','See Our Programs','inline-link')}</div><div class="programme-grid">${programmeCards}</div></section>
<section class="belonging section"><div class="belonging-art" aria-hidden="true">${flower}<span>YOU<br>BELONG<br>HERE.</span></div><div class="belonging-copy"><h2>Bring your story.<br><em>Find your people.</em></h2><p>You don’t need to have it all figured out. Come with your questions, your hopes, your fresh start. There’s more than one way to be part of BOAN.</p>${link('get-involved.html','Find your way in')}<span class="handwritten">There’s room for you. Always.</span></div></section>
<section class="faq section"><div><h2>A few questions.<br><em>A warm welcome.</em></h2></div><div class="questions"><details><summary>Who is BOAN for?<span>+</span></summary><p>BOAN is a female-only community interest company for women from different backgrounds, ages and stages of life. We particularly want to reach women who face barriers to mainstream wellbeing and community spaces.</p></details><details><summary>Do I need any experience?<span>+</span></summary><p>No perfect starting point is needed. Explore <a href="our-programs.html">Our Programs</a> to see what interests you, or visit <a href="contact-us.html">Contact Us</a> to tell us what would help you feel welcome.</p></details><details><summary>How can I help another woman take part?<span>+</span></summary><p>You can volunteer, share your skills or explore a partnership. Visit <a href="get-involved.html">Get Involved</a> to find a way to help, or <a href="contact-us.html?topic=partnerships">contact us</a> with your ideas.</p></details></div></section>`;

const about = intro('ABOUT US','Women supporting women.<br><em>Stronger together.</em>',aboutCopy[0],'About Us') + `
<section class="story-section section"><div><h2>A place to belong.<br><em>A future to build.</em></h2></div><div class="prose">${paragraphs(aboutCopy.slice(1, 4))}</div></section>
<section class="community-statement section" aria-label="Our vision"><div class="prose">${paragraphs([aboutCopy[4]])}</div></section>
<section class="mission-section story-section section"><div><h2>Our Mission</h2></div><div class="prose">${paragraphs(missionCopy)}</div></section>
<section class="page-cta section"><h2>Let’s build<br><em>what comes next.</em></h2><div class="cta-actions">${link('our-programs.html','Explore Our Programmes')}${link('get-involved.html','Get Involved','button outline')}</div></section>`;

const programs = intro('EXPERIENCES THAT HELP WOMEN THRIVE.','Our Programmes',programmeIntro,'Our Programmes') + `
<nav class="program-jumps" aria-label="Explore programmes">${programmes.map(p=>`<a href="#${p.id}">${p.title}${arrow}</a>`).join('')}</nav>
${programmes.map((p,i)=>`<section class="program-detail section ${p.id}" id="${p.id}" tabindex="-1"><div class="card-art" aria-hidden="true">${p.art}</div><div><h2>${p.title}</h2>${paragraphs(p.detail, 'detail-description')}${contactLink(p.topic, `Ask about ${p.title.toLowerCase()}`)}</div></section>`).join('')}
<section class="programme-purpose section"><div class="prose">${paragraphs([programmeClosing])}</div></section>
<section class="page-cta section"><h2>What would help<br><em>you take part?</em></h2><p>Programme details, dates and availability will be shared as activities are confirmed. Let us know what interests you and what would make it easier to join in.</p>${link('contact-us.html','Start a conversation')}</section>`;

const involved = intro('YOUR TIME. YOUR IDEAS. YOUR IMPACT.','Get Involved',involvementIntro,'Get Involved') + `
<section class="involvement-grid section">${involvementCopy.map((role, i) => `<article><h2>${role.title}</h2><p>${role.text}</p>${contactLink(role.topic,role.action,'text-link')}</article>`).join('')}</section>
<section class="page-cta section"><h2>Your next step<br><em>can be a conversation.</em></h2><p>Tell us how you’d like to get involved and what matters to you. We’re building this community together.</p><div class="cta-actions">${link('contact-us.html','Contact Us')}${link('our-programs.html','Explore Our Programmes','button outline')}</div></section>`;

const contact = intro('WE’D LOVE TO HEAR FROM YOU.','Let’s start<br><em>a conversation.</em>','Ask about a programme, explore a partnership or tell us how you’d like to take part.','Contact Us') + `
<section class="contact-layout section"><div><h2>A little hello.<br><em>A new beginning.</em></h2><p>Whether you’re taking your first step or bringing an idea to the community, there’s room for your questions.</p><div class="contact-help"><h3>Email us</h3><a class="contact-email" href="mailto:hello@boan.uk">hello@boan.uk</a></div><div class="contact-help"><h3>Tell us what would help.</h3><p>You can let us know about practical support or adjustments that would make taking part easier for you.</p></div></div>
<form id="contact-form" class="contact-form" name="boan-contact" method="POST" data-netlify="true" netlify-honeypot="bot-field" aria-describedby="contact-guidance">
<input type="hidden" name="form-name" value="boan-contact"/>
<p hidden><label>Leave this field empty<input name="bot-field" tabindex="-1" autocomplete="off"/></label></p>
<p id="contact-guidance" class="contact-guidance">Send us a message. We’d love to hear from you.</p>
<label>Your name<input name="name" autocomplete="name" required maxlength="100"/></label>
<label>Email address<input type="email" name="email" autocomplete="email" required maxlength="254"/></label>
<label>What would you like to talk about?<select name="topic" id="contact-topic"><option value="general">General enquiry</option><option value="movement">Movement with SNB Hive</option><option value="creative">Creative activities</option><option value="workshops">Workshops &amp; circles</option><option value="retreats">Retreats</option><option value="volunteering">Volunteering</option><option value="partnerships">Partnerships</option><option value="ambassador">Ambassador opportunities</option><option value="support">Supporting BOAN</option></select></label>
<label>Your message<textarea name="message" rows="6" required maxlength="5000"></textarea></label>
<button class="button lime" type="submit">Send message ${arrow}</button><p id="contact-result" role="status" aria-live="polite" aria-atomic="true"></p>
</form></section>`;


export const pages = [
  {file:'index.html', title:'Feel supported. Grow stronger. Thrive together.', description:'A women-only community for movement, wellbeing and meaningful connection. Explore BOAN’s programmes and find your way to get involved.', content:home},
  {file:'about-us.html', title:'About Us', description:'Meet Builders Of A Nation, a female-only CIC working to widen access to wellbeing, movement and community.', content:about},
  {file:'our-programs.html', title:'Our Programmes', description:'Explore movement, workshops, creative activities and retreats with BOAN.', content:programs},
  {file:'get-involved.html', title:'Get Involved', description:'Volunteer, partner with BOAN or become an ambassador to help women and communities thrive.', content:involved},
  {file:'contact-us.html', title:'Contact Us', description:'Start a conversation with BOAN about programmes, participation, volunteering, partnerships or supporting our work.', content:contact},
];

export function renderPage(page) {
  const nav = navigation.map(([url,text])=>`<a href="${url}"${page.file===url?' aria-current="page"':''}>${text}</a>`).join('');
  return `<!doctype html>
<html lang="en"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><meta name="theme-color" content="#ff66c4"/><meta name="description" content="${page.description}"/><title>BOAN — ${page.title}</title><link rel="icon" type="image/svg+xml" href="/favicon.svg"/><link rel="stylesheet" href="/src/style.css"/></head><body data-page="${page.file}">
<a class="skip-link" href="#main">Skip to content</a><header class="site-header"><a class="brand" href="index.html" aria-label="BOAN home">${brand}</a><nav id="main-nav" aria-label="Main navigation">${nav}</nav><button class="menu-toggle" aria-label="Open menu" aria-controls="main-nav" aria-expanded="false"><span></span><span></span><span></span></button></header>
<main id="main" tabindex="-1">${page.content}</main><footer><div class="footer-top"><a class="brand" href="index.html" aria-label="Back to BOAN home">${brand}</a><p>Stronger women.<br>Stronger communities.<br><em>A future we build together.</em></p><div class="footer-links">${navigation.map(([url,text])=>`<a href="${url}">${text}</a>`).join('')}</div></div><div class="footer-bottom"><span>© <span id="year"></span> Builders Of A Nation</span><span>A women-only community interest company.</span></div></footer><script type="module" src="/src/main.js"></script></body></html>`;
}
