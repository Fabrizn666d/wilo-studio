# WILO STUDIO — MASTER BUILD SPECIFICATION FOR CODEX ULTRA
## Production-ready redesign, ecosystem, motion system, 3D portfolio, subpages, forms, SEO, performance and launch QA

> **MODE:** Execute, do not merely propose.
>
> **ROLE:** Act as a **Principal Frontend Architect + Senior Creative Developer + Senior Product Designer + Senior UX Engineer + Senior Full-Stack Engineer + Technical SEO Engineer + Performance Engineer + QA Lead**.
>
> You are working on the **real Wilo Studio codebase**. This is not a concept exercise, not a Dribbble mockup, and not a request for a static landing page. The final result must be a coherent, production-ready website that can be launched after this implementation pass.
>
> **IMPORTANT:** I have already given you, in this Codex session, the **local route/path to the Wilo Express project**. Do **not** ask me for that path again. Inspect it. Study the existing Wilo Express 3D carousel implementation and reuse/adapt its actual interaction model for Wilo Studio rather than rebuilding an inferior approximation from zero.

---

# 0. NON-NEGOTIABLE EXECUTION RULES

1. **Audit before coding.**
2. Do not redesign blindly.
3. Do not delete working features without a reason.
4. The current Wilo Studio hero is already approved and is a visual reference/source of truth. **Preserve it.**
5. The current hero concept includes:
   - Wilo Studio branding.
   - Misti / Arequipa visual identity.
   - large `WILO STUDIO` title.
   - Wilo chameleon mascot on the computer.
   - subtle floating motion.
   - pointer-reveal grid that is invisible at rest and appears only around mouse movement.
6. Do not replace that hero with a generic hero.
7. The rest of the homepage must be rebuilt around the hero so the site feels like **one continuous experience**, not independent sections stacked vertically.
8. Every button must either work or be removed.
9. Every form must submit through a real server-side flow.
10. Every carousel must actually navigate.
11. Every project CTA must point to a real route or a defined project detail.
12. Every image/video surface should have deliberate motion/transition behavior, without making the site noisy.
13. Respect `prefers-reduced-motion`.
14. Do not publish fake statistics, fake testimonials, fake partners, fake awards, fake project results, fake prices, fake addresses, fake phone numbers or fake emails.
15. The visual mockups supplied by the user are **directional references**, not factual sources. Numbers such as `+120`, `+80`, `5+`, `100%`, `150+ events`, etc. are placeholders unless verified in the repository or user-provided business data.
16. Do not copy South Projects, MasDigital, Monkey or any other site pixel-for-pixel. We can learn from their information hierarchy and interaction quality, but Wilo must remain visually original.
17. No “AI template” look.
18. No purple startup gradients for Wilo Studio.
19. No random blobs, meaningless 3D spheres, excessive glassmorphism, fake dashboards with impossible metrics, or decorative Lucide icons on every line.
20. Keep the code maintainable.

---

# 1. FIRST TASK — FULL REPOSITORY AUDIT

Before editing files, inspect and document internally:

- package manager:
  - `package-lock.json`
  - `pnpm-lock.yaml`
  - `yarn.lock`
- `package.json`
- Next.js version
- React version
- Tailwind version
- existing motion libraries
- GSAP / ScrollTrigger / Lenis availability
- Framer Motion / Motion availability
- icon library
- TypeScript config
- lint config
- route structure
- `/app`
- `/pages` if present
- `/components`
- `/public`
- `/styles`
- `globals.css`
- CSS modules
- current navbar
- current hero
- current footer
- forms
- API routes / server actions
- email implementation
- database / persistence layer
- analytics
- SEO metadata
- sitemap
- robots
- structured data
- current deployment assumptions
- environment variables
- existing contact information
- real client/project data
- logo files
- Flexo font files
- mascot assets
- Arequipa/Misti assets
- current Wilo ecosystem assets
- videos
- project screenshots
- existing content models/data files

Then inspect the **Wilo Express project path already provided in this Codex session**.

### Wilo Express audit targets

The prior Wilo Express work is important because its 3D interaction is intended to become the basis of the Wilo Studio “Trabajos en movimiento” portfolio.

Search the Express project for:

- the 3D business/design carousel;
- carousel data model;
- drag/swipe implementation;
- pointer events;
- wheel behavior if any;
- transform math;
- `translateX`;
- `translateZ`;
- `rotateY`;
- `scale`;
- `opacity`;
- active index logic;
- circular/loop index normalization;
- snap;
- inertia;
- keyboard navigation;
- previous/next controls;
- reduced-motion fallback;
- mobile behavior;
- category routes;
- demo routes;
- reusable design preview components.

If that project/history contains the known Wilo Express implementation associated with commit:

`468d422` — `feat: catalogo 3D de negocios y demos Wilo Express`

inspect that implementation carefully.

That prior system included concepts/routes such as:

- `/disenos`
- `/disenos/:categoria`
- `/demo/:slug`
- `POST /api/design-leads`

and a reusable 3D carousel using combinations of:

- `translateX`
- `translateZ`
- `rotateY`
- `scale`
- `opacity`
- drag/swipe
- inertia
- snap
- arrows
- keyboard
- loop
- reduced-motion handling

**Do not blindly copy unrelated Express business logic.**
Reuse the **motion engine and interaction architecture**, then adapt the visual layer and data model to the Wilo Studio portfolio.

---

# 2. SOURCE OF TRUTH / DESIGN LANGUAGE

## Brand

Primary identity:

**Wilo Studio**

Primary palette:

```css
--wilo-yellow: #F1B824;
--wilo-yellow-hover: #FFC83D;
--wilo-yellow-active: #D99E08;

--wilo-black: #050505;
--wilo-black-soft: #090A0B;
--wilo-surface: #0D0D0E;
--wilo-surface-2: #121214;

--wilo-white: #F7F7F4;
--wilo-ivory: #F2F1EC;
--wilo-muted: #A6A6A2;
--wilo-muted-dark: #737373;

--wilo-border: rgba(255,255,255,.11);
--wilo-border-strong: rgba(255,255,255,.20);
--wilo-yellow-border: rgba(241,184,36,.40);
```

Do not introduce a competing primary color into Wilo Studio.

### Important rhythm rule

The website must **not** be entirely dark.

Use visual rhythm:

- hero: cinematic dark;
- portfolio: dark;
- project deep-dive: dark;
- selected process / trust sections: light ivory;
- selected ecosystem/education/product sections: their own controlled sub-brand accents;
- CTA: Wilo yellow;
- footer: dark.

Dark/light switching should feel intentional and animated.

---

# 3. TYPOGRAPHY — FLEXO

Use **Flexo** as the Wilo corporate display typography **if the font already exists legally in the project**.

Rules:

- Do not download Flexo from random websites.
- Do not bundle an unlicensed font.
- If local font files already exist in the repository and are the approved brand files, use `next/font/local`.
- Configure explicit weights and fallbacks.
- Avoid fake browser synthesis where possible.

Recommended hierarchy:

### Display
Flexo / approved local corporate display font.

Use for:

- large hero titles;
- section titles;
- project names;
- major numerical statements;
- ecosystem names.

### Body
Use an existing high-quality sans already in the project, or a system/Next font that does not conflict with Flexo.

Body copy must remain highly readable.

---

# 4. MOTION DESIGN SYSTEM

Motion is not decoration. It is part of Wilo's interaction identity.

Create centralized motion tokens.

Example:

```ts
export const motion = {
  easeOut: [0.22, 1, 0.36, 1],
  easeInOut: [0.45, 0, 0.55, 1],
  fast: 0.22,
  medium: 0.55,
  slow: 0.9,
}
```

CSS equivalents are acceptable.

## Global motion rules

Every major media surface should have at least one meaningful state:

- entrance reveal;
- scroll parallax;
- subtle scale;
- active-state animation;
- mask reveal;
- directional wipe;
- hover depth;
- video activation;
- perspective transition.

But avoid applying all effects simultaneously.

### Rule: one protagonist effect per section

Examples:

- 3D carousel = perspective/drag.
- project deep dive = video + controlled content transitions.
- services = hover expansion / media swap.
- process = line drawing.
- brands = logo-to-project preview.
- ecosystem = orbit / node activation.
- CTA = magnetic micro-interaction.

## Avoid

- bounce;
- elastic overshoot everywhere;
- random rotation;
- excessive blur;
- fake “glitch”;
- huge mouse-following blobs;
- custom cursor unless already approved;
- infinite movement on every section.

---

# 5. SMOOTH SCROLL AND SCROLLTRIGGER

If Lenis + GSAP already exist, configure them correctly.

If only one motion library is needed, do not install multiple libraries unnecessarily.

If GSAP ScrollTrigger is used:

- register client-side;
- scope contexts;
- clean up triggers;
- refresh after critical media loads;
- avoid duplicate triggers during route transitions;
- use matchMedia for breakpoints.

If Lenis is used:

- sync with ScrollTrigger;
- disable/adjust for reduced motion;
- do not break browser anchor navigation;
- do not hijack accessibility behavior.

---

# 6. GLOBAL PAGE FLOW

The intended Wilo Studio homepage should follow this narrative:

1. **Loader / brand entrance**
2. **Hero — Wilo Studio / Misti / Arequipa**
3. **Transition line / capability marquee**
4. **Trabajos en movimiento — Wilo Express-derived 3D portfolio**
5. **Proyectos reales — one real business at a time**
6. **Todo lo que podemos construir — full capability catalog**
7. **Wilo Lab — dashboards / systems / CRM / cotizadores / integrations**
8. **Producción audiovisual**
9. **Cómo construimos — process**
10. **Resultados / trust signals**
11. **Marcas que confían**
12. **Testimonials / client voice**
13. **Ecosistema Wilo**
14. **Wilo Education teaser**
15. **Wilo Express teaser**
16. **Wilo Events / Corporate experiences teaser**
17. **Sobre Wilo / Arequipa / mission / vision / values**
18. **Final yellow CTA**
19. **Editorial footer**

Do not create visually repetitive sections.

---

# 7. LOADER

Only implement/rework if a loader is not already approved.

Desired behavior:

- `#050505` background;
- centered Wilo mark;
- thin Wilo-yellow progress line;
- optional numeric progression;
- finish quickly;
- no fake 7-second loading sequence.

Target:

`1.4–2.4s` maximum on normal load if loader is purely branded.

Preferred exit:

- logo scales/repositions toward navbar logo location;
- black curtain moves upward;
- hero is already ready underneath.

Respect cached visits:

- shorten or skip on repeat session if practical.

Do not block LCP unnecessarily.

---

# 8. CURRENT HERO — PRESERVE AND INTEGRATE

The current hero is approved.

Do **not** redesign it.

Maintain:

- Misti background;
- Arequipa / cathedral identity;
- Wilo Studio logo/navigation;
- availability badge if currently approved;
- giant `WILO STUDIO`;
- Spanish copy;
- project CTAs;
- chameleon on computer;
- chameleon floating motion;
- pointer-reveal grid.

## Pointer grid behavior

Grid must:

- be invisible initially;
- reveal only around pointer movement;
- follow cursor using CSS custom properties;
- use `requestAnimationFrame`;
- avoid React rerenders on every pointer move;
- fade after pointer inactivity;
- hide on pointer leave;
- disable for coarse pointers.

## Hero integration into next section

When scrolling away:

- title can translate/fade subtly;
- mascot can exit vertically;
- background may scale slightly;
- a Wilo-yellow horizontal line can emerge;
- next section should visually inherit the motion.

No hard white gap after hero.

---

# 9. TRANSITION — “TRABAJOS EN MOVIMIENTO”

Create a bridging sequence between hero and portfolio.

Possible content:

`DISEÑO · DESARROLLO · SOFTWARE · SISTEMAS · E-COMMERCE · AUDIOVISUAL · AUTOMATIZACIÓN ·`

Use a thin Wilo-yellow line.

The line can grow from center/left based on scroll.

The typography moves subtly, not like an aggressive ticker.

The transition should prepare the spatial language of the upcoming 3D carousel.

---

# 10. SECTION — TRABAJOS EN MOVIMIENTO
## MOST IMPORTANT INTERACTION AFTER HERO

This is the place to reuse the **real Wilo Express 3D carousel engine**.

Do not implement a flat Swiper carousel as a shortcut.

## Goal

Show multiple real Wilo clients/sites as a three-dimensional gallery.

The user should immediately understand:

> Wilo has already built real digital products for real businesses.

## Active project

The center project is the protagonist.

Possible client data, only when real assets exist:

- Tecnova Perú
- IBEX Constructora
- Biciem Ultra Trail
- Industrial Remotos Perú
- Global Norte
- Boxy Drip
- Reuse
- Dayun
- Geoingenieros
- Hingenia

Use a centralized data model and only include projects that have enough assets/data.

## Visual composition

Desktop:

- center laptop/browser mockup mostly front-facing;
- previous/next projects recede left/right in 3D;
- second previous/next recede further;
- outer items have lower scale/opacity.

Conceptual active transforms:

```txt
active:
rotateY(0deg)
translateZ(0px)
scale(1)
opacity(1)

adjacent-left:
rotateY(38deg–46deg)
translateX(-52% to -60%)
translateZ(-160px to -220px)
scale(.80–.86)

adjacent-right:
rotateY(-38deg–-46deg)
translateX(52% to 60%)
translateZ(-160px to -220px)
scale(.80–.86)

far:
rotateY(52deg–62deg)
translateZ(-300px to -380px)
scale(.62–.72)
opacity(.30–.50)
```

Adapt values to the actual Express engine rather than forcing these exact numbers.

## Input methods

Must support:

- pointer drag;
- touch swipe;
- arrow buttons;
- keyboard arrows when section focused;
- clicking adjacent project;
- inertia;
- snap;
- true circular loop.

Avoid fake loop where the track visibly jumps.

## Video behavior

The **active project** should be able to show a real silent website walkthrough video.

Rules:

- active slide video:
  - muted;
  - loop;
  - playsInline;
  - autoplay when active AND visible;
- inactive slides:
  - static optimized poster;
- previous active video:
  - pause immediately during index change;
- only active slide should consume video decoding.

Use `IntersectionObserver`:

- pause active video when carousel leaves viewport;
- resume only when visible.

Do not load ten full-resolution videos immediately.

## Project metadata under carousel

Keep minimal:

- `01 / 08`;
- project/business name;
- one short descriptor;
- `Explorar proyecto ↗`.

No huge info panel here.

This section represents **breadth**.

---

# 11. SECTION — PROYECTOS REALES
## South-inspired information architecture, Wilo-original design

This section represents **depth**.

Do not duplicate the 3D carousel.

Show one business/case at a time.

### Desktop composition

Left:
- section title;
- vertical client selector.

Center:
- large premium laptop/browser frame;
- active project website video.

Right:
- project index;
- business name;
- short description;
- year if verified;
- type;
- capabilities/tags;
- CTA.

### Client selector

Use **business names**, not sectors:

Good:

- Tecnova Perú
- IBEX Constructora
- Biciem Ultra Trail
- Industrial Remotos Perú
- Global Norte
- Boxy Drip

Do not headline generic categories such as:

- automotive;
- construction;
- technology.

The project/business is the hero.

### Active transition

When changing project:

1. old title shifts/fades;
2. active media dims or masks;
3. new poster appears;
4. data transitions;
5. new video begins after transition settles.

Use consistent state synchronization.

Do not let project name show client A while video still shows client B.

### Route

`Ver proyecto` should open:

- a real existing project detail route;
- or a new `/proyectos/[slug]` case study route.

Build case-study route infrastructure if not present.

---

# 12. CASE STUDY ROUTES — `/proyectos/[slug]`

Create a maintainable project detail template.

Recommended content:

1. case hero;
2. brand/business;
3. summary;
4. challenge;
5. solution;
6. visual walkthrough;
7. features delivered;
8. responsive views;
9. technology only where useful;
10. gallery/video;
11. next project;
12. project CTA.

Do not fabricate business outcomes.

If no measurable result exists, use factual delivery descriptions.

Example:

Bad:
`Conversion increased 217%`.

Good:
`We built a responsive corporate platform with dynamic catalog, service areas and quotation flow.`

---

# 13. SECTION — TODO LO QUE PODEMOS CONSTRUIR

This section answers:

> “What can I actually hire Wilo to build?”

It is inspired by the commercial clarity of service catalogs like MasDigital, but **not by copying their visual design**.

The section should clearly cover Wilo's real capability breadth.

## Capability architecture

Use/edit based on real offering:

1. Webs corporativas
2. Tiendas y catálogos
3. Plataformas y sistemas
4. Cotizadores y configuradores
5. Aplicaciones
6. Automatización & APIs
7. Identidad & diseño
8. Producción audiovisual
9. Infraestructura digital
10. Soporte & evolución

### Additional details can include

**Webs corporativas**
- institutional;
- corporate;
- landing pages;
- admin-manageable sites.

**Tiendas & catálogos**
- e-commerce;
- product catalogs;
- variants;
- orders;
- payment integrations if applicable.

**Plataformas & sistemas**
- dashboards;
- CRM;
- internal portals;
- customer portals;
- admin systems.

**Cotizadores & configuradores**
- intelligent quotation;
- product/service configuration;
- proformas;
- lead workflows.

**Apps**
- Android;
- iOS;
- hybrid/mobile web where applicable.

**Automation & APIs**
- business workflows;
- external integrations;
- SUNAT/API integrations where actually offered;
- notifications;
- data synchronization.

**Identity**
- digital identity;
- UI systems;
- brand applications;
- interface design.

**Audiovisual**
- corporate video;
- photography;
- product;
- social content;
- event coverage;
- editing/post-production.

**Infrastructure**
- VPS;
- hosting;
- SSL;
- domains;
- corporate email;
- deployments;
- monitoring.

**Support**
- maintenance;
- updates;
- improvements;
- monitoring;
- long-term evolution.

## Interaction

Do not render ten dead cards.

Desktop suggestion:

- several capability tiles;
- one active/expanded tile;
- active tile gets larger visual;
- animated product/device mockup;
- hover/focus changes active capability.

Alternatively use pinned scroll, but only if it improves the flow.

Media changes should transition via:

- opacity;
- clipping;
- position;
- scale.

No page reload.

---

# 14. SECTION — WILO LAB

Purpose:

Show that Wilo builds **the technology behind the visible website**.

Use the supplied Wilo Lab references as art direction.

Possible modules:

- Dashboard
- Admin
- CRM
- Cotizador
- Tracking
- API
- Automatización
- Configuradores

## UI behavior

Desktop:

- left vertical module selector;
- right interactive stage;
- layered interfaces;
- selected tool comes to front.

Examples:

### Dashboard
analytics/admin UI.

### CRM
client records, status, activity.

### Cotizador
multi-step configuration and quote summary.

### Tracking
status timeline/map if actual project supports it.

### API
node/data flow diagram.

Do not hardcode fake financial totals as business claims.

Use demo/sample data labeled as demo if necessary.

## Motion

When changing Lab module:

- selected UI panel moves to front;
- old panels recede;
- small depth/perspective;
- microglow around selected Wilo-yellow boundary.

No Three.js required.

---

# 15. SECTION — PRODUCCIÓN AUDIOVISUAL

Wilo is not only software/web.

Create a media-driven section that communicates:

- corporate video;
- commercial photography;
- product photography/video;
- social media content;
- event coverage;
- editing/post;
- branded audiovisual storytelling.

## Visual direction

Use a photographic/cinematic background or media grid.

Do not use the Misti as the background again here.

Use:
- camera;
- production set;
- editing timeline;
- product shoot;
- event scene;
- drone if real service/assets support it.

## Interaction

On desktop:

- main media preview;
- side labels or tabs;
- hover/focus changes the active media;
- reveal transitions;
- video can autoplay muted when visible.

On mobile:
- swipeable media cards.

---

# 16. SECTION — CÓMO CONSTRUIMOS

Communicate process visually.

Steps:

1. Idea / Descubrimiento
2. Estrategia
3. Diseño
4. Desarrollo
5. Pruebas
6. Lanzamiento
7. Evolución

Use real process naming appropriate to Wilo.

## Visual

Prefer a horizontal timeline on desktop.

A Wilo-yellow line progressively draws based on scroll.

Each milestone can have:

- small visual;
- interface;
- notebook/sketch;
- wireframe;
- code;
- QA checklist;
- launch;
- analytics/evolution.

The process should feel technical and creative.

## Mobile

Vertical timeline.

Do not squeeze seven horizontal columns into 360px.

---

# 17. SECTION — RESULTS / TRUST

Use only verified data.

Build the component to receive data from a central configuration.

Possible legitimate metrics if verified:

- projects completed;
- clients/businesses;
- active solutions;
- years operating.

Do not show a number simply because it exists in the mockup.

If verified numbers are not yet present:

- either omit statistic;
- or use non-numeric trust statements.

Possible non-numeric replacements:

- `Soluciones a medida`
- `Infraestructura propia`
- `Soporte continuo`
- `Desarrollo administrable`
- `Clientes en diferentes industrias`

## Visual rhythm

This is a good location for:

- full Wilo yellow background with black numbers;
or
- high-contrast dark statistical band.

Do not overuse cards.

---

# 18. SECTION — MARCAS QUE CONFÍAN

Use real client logos from `/public`.

Potential real brands from prior Wilo materials:

- Tecnova Perú
- IBEX Constructora
- Biciem Ultra Trail
- Global Norte
- Reuse
- Dayun
- Geoingenieros
- Hingenia

Only use logos actually available/approved.

## Interaction

Default:
- monochrome/low-contrast.

Hover/focus:
- logo activates;
- subtle color;
- small project preview background can appear;
- optional `Ver trabajo`.

On mobile:
- horizontal drag carousel or clean grid.

Avoid infinite logo marquees that move too fast.

---

# 19. TESTIMONIALS

Only real testimonials.

No AI-generated quotes.

Data model:

```ts
type Testimonial = {
  quote: string
  person?: string
  role?: string
  company: string
  projectSlug?: string
  media?: string
}
```

If no verified testimonial content exists, do not invent it.

Instead render a smaller “client voice” section only when content exists.

---

# 20. ECOSISTEMA WILO

Critical conceptual section.

The Wilo website must explain that Wilo is broader than one type of digital agency.

Current ecosystem direction:

- **Wilo Studio**
- **Wilo Express**
- **Wilo Education**
- **Wilo Events** / corporate events line

If the actual project uses a refined name such as `Wilo Line Events`, `Wilo Events Corporations`, or another approved naming, preserve the real current brand naming rather than inventing a new one.

## Main message

Possible direction:

`UNA MARCA. CUATRO LÍNEAS. UN MISMO PROPÓSITO.`

or

`MÁS QUE UN ESTUDIO. UN ECOSISTEMA.`

## Interaction

Create a central `WILO` node.

Connected sub-brand nodes.

On hover/focus:

- line illuminates;
- node expands slightly;
- description appears;
- `Conocer →`.

On mobile:
- stack as accordion/cards;
- no unusable orbit UI.

Each node must navigate to a real internal ecosystem page or the existing standalone product route.

---

# 21. ECOSYSTEM ROUTING

The Wilo main website must include real mini-pages for the ecosystem.

Recommended structure, adapt to existing routes:

```txt
/
  Wilo Studio main homepage

/education
  Wilo Education

/events
  Wilo Events / Corporations

/express
  Wilo Express teaser/bridge page OR direct integration/link to the existing Express product

/proyectos/[slug]
  Project case study

/servicios/[slug]
  Optional service pages where useful

/contacto
  Main project/contact flow
```

### Wilo Express rule

Wilo Express is already being developed separately.

Do not duplicate the entire Wilo Express application inside Wilo Studio.

Instead:

- create a high-quality ecosystem landing/teaser;
- explain what Express is;
- show device mockup;
- benefits;
- CTA;
- link to its real existing application/domain/route.

If the deployment architecture uses one monorepo and Express lives as a route, adapt accordingly.

---

# 22. WILO EDUCATION MINI-PAGE

Wilo Education is not a random blog page.

It should communicate educational technology/robotics.

Use real user-provided assets and product information.

Do not fabricate kit specifications.

Suggested page structure:

1. hero;
2. what Wilo Education is;
3. robotics/STEM kits;
4. learning methodology / hands-on learning;
5. audiences:
   - schools;
   - institutions;
   - students;
   - workshops;
6. products/kits where verified;
7. workshops/programs if real;
8. gallery/media;
9. inquiry CTA;
10. education contact form.

## Visual identity

It can have a **sub-brand accent** while still clearly belonging to Wilo.

If approved Wilo Education visuals use purple, it may be used **inside the Education page only**, not as a Wilo Studio global primary.

Maintain Wilo typographic structure and spacing.

---

# 23. WILO EXPRESS MINI-PAGE / BRIDGE

Purpose:

Present Express as:

- fast;
- simple;
- professional;
- business-first;
- administrable;
- responsive;
- hosted/secured according to current Express offering.

Prior Wilo Express product direction includes:

- `S/30 mensual`
- birthday month `S/20`
- hosting VPS + SSL
- ADMIN access
- WhatsApp integration
- responsive
- no ads
- no URL shorteners
- `.wilo.site` subdomain

Only publish pricing/benefits if those values still exist in the Express source of truth.

The Wilo Studio bridge should not become the Express configurator itself.

CTA:

`Crear mi web con Wilo Express ↗`

Link to the real Wilo Express application.

---

# 24. WILO EVENTS / CORPORATE EXPERIENCES MINI-PAGE

This line should explain the corporate/events capability.

Potential service architecture, use only what is actually offered:

- corporate events;
- brand activations;
- launches;
- audiovisual production;
- event technology;
- screens/visual content;
- stage/experience production;
- event coverage;
- corporate experiences.

Do not claim 150+ events, 50+ brands or other metrics unless verified.

## Page flow

1. cinematic event hero;
2. what Wilo Events does;
3. service areas;
4. visual gallery;
5. selected work if available;
6. how an event is produced;
7. request a quote form.

## Motion

Use light beams/media only as controlled visual assets.

Do not implement GPU-heavy particle simulations.

---

# 25. ABOUT WILO / AREQUIPA

Create a section and/or page explaining Wilo.

The geographic identity matters.

Use:

- Arequipa;
- Misti;
- local origin;
- wider ambitions.

Possible copy direction:

`SOMOS DE AREQUIPA. TRABAJAMOS PARA TODO EL MUNDO.`

Do not overstate international presence unless verified.

## Include

- short story;
- mission;
- vision;
- values.

Keep these concise and credible.

Do not write generic agency filler such as:

`Somos un equipo apasionado por crear experiencias extraordinarias.`

Use concrete language.

---

# 26. MISSION / VISION / VALUES

Build content placeholders in structured data so final copy is easy to edit.

Suggested tone, not mandatory factual text:

### Mission
Build digital and creative solutions that generate real value for businesses and organizations.

### Vision
Become a recognized Wilo ecosystem for technology, creativity, education and experiences originating in Peru.

### Values
- commitment;
- creativity;
- transparency;
- continuous improvement;
- practical innovation.

Before publishing, prefer existing approved company copy if found in the repository.

---

# 27. FINAL CTA

Break the dark rhythm.

Use full Wilo yellow:

`#F1B824`

Large black headline.

Direction:

`¿QUÉ CONSTRUIMOS AHORA?`

or

`¿TIENES UN PROYECTO EN MENTE?`

Support copy:

Short.

Actions:

- `Iniciar un proyecto`
- `Hablar por WhatsApp`

Background:
- giant low-opacity W mark;
- optional chameleon illustration;
- no busy photography needed.

Add subtle magnetic button effect on fine pointer devices.

Do not move button more than a few pixels.

---

# 28. FOOTER

Create an editorial footer.

Dark.

Large Wilo wordmark.

Columns:

- navigation;
- services;
- ecosystem;
- resources;
- legal;
- contact.

Include only real:

- email;
- WhatsApp;
- location;
- social links;
- legal links;
- Libro de Reclamaciones;
- privacy;
- terms.

Do not use email/phone numbers generated in visual mockups.

Read them from the real project/config.

Bottom:

`© 2026 Wilo Studio` or dynamic year if desired.

---

# 29. NAVIGATION

Navbar should reflect actual information architecture.

Potential desktop structure:

- Trabajos
- Proyectos
- Servicios
- Nosotros
- Ecosistema
- Contacto

Ecosystem can expose a dropdown:

- Wilo Express
- Wilo Education
- Wilo Events

Avoid making navbar excessively long.

The current header had too many direct labels in some mockups.

Do not put every division in the top-level nav if it destroys balance.

Use a polished desktop dropdown/megamenu if useful.

Mobile:
- accessible drawer;
- body scroll lock;
- escape closes;
- focus handling;
- links close menu after navigation.

---

# 30. CONTACT / START A PROJECT

`Iniciar un proyecto` must lead to a real conversion flow.

Recommended route:

`/contacto`

or approved existing route.

## Form fields

At minimum:

- name;
- company/business;
- email;
- phone/WhatsApp;
- service interest;
- project description;
- consent checkbox.

Optional:

- budget range;
- expected launch timeframe;
- preferred contact method.

Do not make the form 20 fields long.

## Service options

Can map to:

- Web corporativa
- E-commerce / catálogo
- Plataforma / sistema
- App
- Automatización / API
- Cotizador
- Branding / UI
- Audiovisual
- Evento corporativo
- Wilo Education
- Wilo Express
- Otro

## Validation

Use schema validation such as Zod if already installed/appropriate.

Client:
- inline errors.

Server:
- validate again.

Never trust browser payload.

## Anti-spam

Implement:

- honeypot;
- minimum fill timing;
- IP/request throttling where practical;
- server-side validation.

Avoid forcing captcha unless required.

---

# 31. FORM BACKEND

Audit existing email/persistence infrastructure first.

Reuse real project architecture.

If an email transport already exists:
- use it.

If no transport exists:
- create a clean mail abstraction using SMTP environment variables;
- do not hardcode credentials.

Example required env documentation:

```env
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
SMTP_FROM=
LEADS_TO_EMAIL=
```

Or use the project’s existing provider if present.

### Server behavior

On successful lead:

1. validate;
2. sanitize;
3. send/store;
4. return structured JSON/server action result;
5. show confirmation UI.

On failure:

- show human-readable error;
- never silently discard the lead.

Create/update `.env.example`.

Do not commit secrets.

---

# 32. EVENT FORM

For Wilo Events page:

Fields can include:

- contact;
- company;
- event type;
- estimated date;
- city;
- approximate attendance;
- requested services;
- description.

Only include fields that genuinely help.

Use the same backend lead infrastructure with a lead category.

---

# 33. EDUCATION FORM

For Wilo Education:

- name;
- institution;
- email;
- phone;
- interest:
  - kit;
  - workshop;
  - school program;
  - partnership;
- message.

Use shared lead API/server action.

---

# 34. WILO EXPRESS CTA

Do not submit the Studio generic lead form if Express already has its own onboarding flow.

Deep-link users to the Express application.

Use UTM/source query if useful:

`?source=wilo-studio`

but only if Express supports it or implement support safely.

---

# 35. CONTENT DATA ARCHITECTURE

Do not hardcode project information in five separate components.

Create typed data.

Example:

```ts
export type WiloProject = {
  slug: string
  name: string
  shortDescription: string
  year?: number
  type?: string
  services: string[]
  poster: string
  video?: string
  logo?: string
  href: string
  featured?: boolean
}
```

Similar:

- `services.ts`
- `ecosystem.ts`
- `testimonials.ts`
- `metrics.ts`

This allows easy editing before launch.

---

# 36. ASSET STRATEGY

Audit assets.

Organize if necessary:

```txt
/public/
  brand/
  hero/
  projects/
    tecnova/
    ibex/
    biciem/
    industrial-remotos/
    global-norte/
    boxy-drip/
  ecosystem/
    studio/
    express/
    education/
    events/
  audiovisual/
  about/
```

Do not rename existing assets unnecessarily if references would break.

For new organization, preserve compatibility or update all imports.

---

# 37. IMAGES

Use `next/image` where appropriate.

Above-fold:
- priority only for critical assets.

Below-fold:
- lazy loading.

Define dimensions/aspect ratios.

Avoid CLS.

Use responsive `sizes`.

Do not send a 4K project screenshot as a 350px preview.

Prefer:

- AVIF/WebP where possible;
- source PNG where alpha is required.

---

# 38. VIDEO ENGINE

Build a reusable project preview video component.

Requirements:

- `muted`;
- `playsInline`;
- `loop`;
- poster;
- intersection visibility;
- active state;
- reduced motion handling.

On mobile:
- consider poster-first;
- autoplay only if appropriate;
- avoid huge data load.

Use compressed MP4/WebM if available.

No YouTube iframe for portfolio previews unless unavoidable.

---

# 39. MEDIA HOVER / REVEAL RULE

The user specifically wants exposed imagery/text surfaces to feel alive.

Implement nuanced behavior:

### Images
- entrance clip/mask;
- `scale(1.03) -> 1`;
- hover `1 -> 1.025` only;
- parallax 2–5%, not 25%.

### Text
- group reveal;
- line/stagger;
- no per-character circus.

### Buttons
- background/border transitions;
- icon translation 2–4px;
- optional magnetic effect in final CTA only.

### Cards/panels
- subtle active border;
- no bouncing.

---

# 40. SECTION TRANSITIONS

The site should not feel like:

`section -> blank gap -> section`.

Create transition continuity.

Examples:

Hero → 3D work:
- line emerges.

3D work → projects:
- active laptop grows/settles into next composition OR use a consistent screen motif.

Projects → capabilities:
- media fades into a clean/ivory structural section.

Capabilities → Lab:
- UI mockup expands into system dashboard.

Lab → audiovisual:
- dark UI fades to camera/media black.

Process → results:
- timeline line becomes metric divider.

Brands → ecosystem:
- logos fade to Wilo center node.

Ecosystem → sub-brand teasers:
- active ecosystem nodes inform section colors.

About → CTA:
- dark Arequipa scene wipes into Wilo yellow.

---

# 41. COLOR RHYTHM

Suggested sequence:

Hero:
- black / yellow / photographic.

Work:
- black.

Projects:
- black.

Capabilities:
- dark OR ivory depending balance.

Lab:
- black.

Audiovisual:
- cinematic black.

Process:
- warm ivory/light section is strongly recommended.

Results:
- Wilo yellow or dark.

Brands:
- light ivory or white.

Ecosystem:
- dark.

Education teaser:
- light/purple-accented sub-brand.

Express teaser:
- light/blue or neutral accent only if the Express brand already uses it.

Events teaser:
- photographic dark.

About:
- light or monochrome Arequipa.

CTA:
- Wilo yellow.

Footer:
- black.

This prevents visual fatigue.

---

# 42. WILO EDUCATION SUB-BRAND

If current approved Education identity uses purple, scope it:

```css
.education-theme {
  --accent: ...;
}
```

Do not change global Wilo Studio yellow.

Same approach for Express/Events.

---

# 43. RESPONSIVE SYSTEM

Do not design desktop then shrink.

Test target widths:

Desktop:
- 1920×1080
- 1600×900
- 1440×900
- 1366×768
- 1280×800

Tablet:
- 1024×1366
- 834×1194
- 768×1024

Mobile:
- 430×932
- 412×915
- 390×844
- 375×812
- 360×800

## Mobile principles

- remove nonessential perspective complexity;
- keep content order clear;
- 3D carousel can use shallower depth;
- one main card visible;
- adjacent peeking allowed;
- no text below 14px for body;
- touch target ≥ 44px;
- no horizontal page overflow;
- videos do not destroy data usage.

---

# 44. 3D CAROUSEL RESPONSIVE

Desktop:
- full 3D depth.

Tablet:
- reduce `translateZ`;
- reduce angle.

Mobile:
- shallow perspective;
- center item;
- adjacent edges visible;
- swipe primary input;
- autoplay video may be disabled/poster-only where appropriate.

Do not use a flat completely unrelated mobile carousel unless required for stability.

Preserve the interaction identity.

---

# 45. ACCESSIBILITY

Target WCAG AA where practical.

Must include:

- semantic headings;
- correct heading order;
- landmark elements;
- descriptive alt text;
- decorative media with empty alt/aria-hidden;
- keyboard controls for carousels;
- visible focus;
- menu accessibility;
- form labels;
- form errors tied with `aria-describedby`;
- reduced-motion support;
- sufficient contrast.

Do not rely only on yellow color to communicate active state.

---

# 46. PREFERS-REDUCED-MOTION

If enabled:

- disable floating mascot;
- disable large parallax;
- simplify 3D transitions;
- no auto-scrolling marquees;
- project video can remain paused with poster;
- reveal content instantly or with simple opacity.

The site must remain beautiful.

---

# 47. PERFORMANCE BUDGET

Do not sacrifice performance for effects.

Targets where practical:

- good Core Web Vitals;
- no massive JS bundle from unnecessary libraries;
- no Three.js unless there is a real need (there is currently no need);
- limit client boundaries;
- lazy-load below-fold interactive sections where appropriate;
- video loaded only when near viewport;
- images responsive;
- font preloading controlled.

## LCP

Hero background/title is likely LCP territory.

Do not let loader or JavaScript delay it excessively.

## CLS

Reserve:
- logo;
- hero media;
- laptop mockups;
- videos;
- project posters.

## INP

Pointer grid and carousel must not cause React rerenders every frame.

---

# 48. REACT ARCHITECTURE

Do not turn the whole homepage into `"use client"`.

Use:

- Server Components for static/content structure;
- small Client Components for:
  - pointer grid;
  - 3D carousel;
  - project selector/video;
  - interactive capabilities;
  - Lab;
  - ecosystem interactions.

Avoid global state unless truly needed.

---

# 49. CSS

Avoid global style pollution.

Prefer:

- Tailwind utilities consistent with project;
- CSS Modules for complex visual effects;
- CSS variables for tokens.

Do not create:

```css
h1 { ... }
button { ... }
```

that accidentally changes the whole application.

---

# 50. SEO

Implement full technical SEO.

## Root metadata

Use real Wilo business content.

Include:

- title template;
- description;
- canonical;
- Open Graph;
- Twitter cards;
- icons;
- metadataBase.

## Page metadata

Unique metadata for:

- home;
- project case studies;
- Education;
- Events;
- Express bridge;
- contact.

## Sitemap

Generate real sitemap.

## robots

Configure.

## Structured data

Use JSON-LD where valid:

- Organization / ProfessionalService;
- WebSite;
- BreadcrumbList;
- Service pages if applicable.

Do not fabricate review ratings.

Do not add fake aggregateRating.

---

# 51. LOCAL SEO

Wilo has a strong Arequipa identity.

Use accurate local business data if the repository contains it.

Potential signals:

- Arequipa, Peru;
- service coverage broader than location.

Do not publish exact street address unless real and approved.

Do not invent coordinates.

---

# 52. COPY QUALITY

All user-facing copy must be Spanish.

No accidental English leftovers:

Bad:
- `Work`
- `Start a project`
- `Testimonials`
- `Learn more`

unless deliberate brand wording.

Tone:

- confident;
- concise;
- business-focused;
- human;
- not cliché AI agency language.

Avoid:

- “Llevamos tus sueños al siguiente nivel”
- “Creamos experiencias extraordinarias que transforman el futuro”
unless supported by a real message.

Prefer specific value.

---

# 53. MICROCOPY

Buttons:

- `Ver proyectos`
- `Explorar proyecto`
- `Ver todos los proyectos`
- `Conocer el servicio`
- `Iniciar un proyecto`
- `Hablar por WhatsApp`
- `Conocer Wilo Education`
- `Crear mi web con Express`
- `Cotizar un evento`

Use consistent arrow:

`↗`

Do not mix ten icon styles.

---

# 54. PROJECT DATA — INITIAL REAL CANDIDATES

Populate only if assets/data are confirmed:

- Tecnova Perú
- IBEX Constructora
- Biciem Ultra Trail
- Industrial Remotos Perú
- Global Norte
- Boxy Drip
- Reuse
- Dayun
- Geoingenieros
- Hingenia

The 3D carousel can have more projects than the deep-dive section.

Example:

- 8–10 in carousel;
- 4–6 in deep-dive;
- 3–5 detailed case pages initially.

Do not block launch because every old client lacks a perfect case study.

---

# 55. PROJECT VIDEO WORKFLOW

If real walkthrough videos are already in assets:
- use them.

If only screenshots are available:
- use static poster elegantly;
- do not create fake video playback.

Structure should support adding video later.

Do not programmatically record external websites without explicit instruction.

---

# 56. WILO EXPRESS CAROUSEL REUSE — ENGINEERING REQUIREMENT

This deserves a second explicit instruction:

**Do not implement the Wilo Studio 3D portfolio without first inspecting Wilo Express.**

I already supplied the Express local route/path.

You must:

1. open Express;
2. find the 3D carousel;
3. identify reusable pieces;
4. extract/adapt the behavior;
5. remove Express-specific assumptions;
6. create a Studio portfolio data adapter;
7. maintain the same quality of drag/inertia/snap/loop;
8. improve accessibility/performance where necessary.

If copying code across projects:
- preserve attribution/comments internally if appropriate;
- refactor into Studio conventions;
- do not leave imports pointing at Express;
- do not hardcode Express categories.

---

# 57. CAROUSEL PHYSICS

Use a deterministic model.

Do not create index jitter.

Recommended state:

- continuous virtual position;
- nearest integer active slide;
- render offset normalized around carousel length.

During drag:
- update transform position.

On release:
- calculate velocity;
- projected target;
- snap to nearest index.

Loop:
- normalize logical index separately from visual offset.

Avoid resetting DOM position visibly.

---

# 58. POINTER / TOUCH

Use Pointer Events if possible.

Set appropriate:

`touch-action`

so vertical page scroll and horizontal carousel drag coexist.

Use drag threshold.

Click should not trigger if pointer moved beyond drag threshold.

Avoid text selection during drag.

---

# 59. CAROUSEL ACCESSIBILITY

Container:
- region label.

Controls:
- buttons with accessible labels.

Slides:
- logical position info if practical.

Keyboard:
- Left/Right.

Focus:
- active project CTA should remain reachable.

Do not trap keyboard focus inside carousel.

---

# 60. SERVICES PAGES

If current scope/time allows and architecture benefits:

Create `/servicios/[slug]`.

At minimum service pages can exist for:

- desarrollo web;
- plataformas/sistemas;
- apps;
- automatización;
- audiovisual;
- infraestructura/soporte.

But prioritize a complete homepage + ecosystem + forms over creating thin SEO pages.

No empty pages.

---

# 61. DESIGN QUALITY GUARDRAILS

Never ship:

- giant empty sections with one sentence;
- 12 cards with identical layouts;
- random `rounded-3xl` everywhere;
- nav inside glass pill;
- generic SaaS pricing table;
- unreadable 10px grey copy;
- black text over dark photography;
- yellow glow around every element;
- five simultaneous animated backgrounds.

Use whitespace deliberately.

---

# 62. VISUAL DEPTH WITHOUT GENERIC GLASSMORPHISM

Depth methods:

- layered photography;
- perspective;
- borders;
- shadows;
- controlled highlight;
- texture;
- clipping;
- real device mockups.

Not:
- giant blurred translucent cards everywhere.

---

# 63. ICONS

Use icons sparingly.

If Lucide exists:

- use a consistent stroke;
- no random icons for decorative filler.

Custom Wilo line icons can be CSS/SVG if needed.

---

# 64. DEVICE MOCKUPS

Laptop/phone visual frames must:

- keep correct perspective;
- not cover important UI;
- support real screenshot/video;
- reserve aspect ratio;
- remain responsive.

Avoid trademark logos unless asset usage is intentional/allowed.

A neutral premium laptop frame is acceptable.

---

# 65. BACKGROUND IMAGERY

The Misti is the hero signature.

Do not repeat the exact same Misti image behind every dark section.

Other sections should use:

- neutral black;
- UI compositions;
- event photography;
- camera footage;
- clean ivory;
- subtle texture.

Arequipa returns deliberately in:
- About;
- possibly final geographic cue.

---

# 66. STICKY / PINNED SECTIONS

Use pinned scroll only where valuable.

Good candidates:
- capability active panel;
- project deep-dive;
- process line.

Do not pin half the website.

Pinned mobile sections often feel bad; disable or simplify on small screens.

---

# 67. PROJECT TRANSITIONS

Potential advanced effect:

When leaving 3D carousel:
- active laptop scales slightly;
- next Projects section uses a related laptop frame.

This can feel continuous.

But do not create fragile FLIP animation across unrelated DOM if it compromises stability.

Visual continuity is more important than technical showmanship.

---

# 68. PAGE TRANSITIONS

If route transitions already exist:
- improve them.

If not:
- do not install a huge router animation system before launch.

Simple:
- fade/mask;
- top loading indicator;
can be enough.

---

# 69. SCROLL RESTORATION

Ensure navigation to project detail and back does not produce broken scroll behavior.

Do not fight Next.js defaults unnecessarily.

---

# 70. ANALYTICS

If analytics already configured:
- preserve.

Track meaningful events if architecture supports it:

- start_project_click;
- whatsapp_click;
- project_open;
- express_click;
- education_lead;
- event_lead;
- contact_submit.

Do not add analytics provider without credentials/consent considerations.

---

# 71. SECURITY

Forms:

- server validation;
- no exposed secrets;
- sanitize user-provided HTML;
- no raw SQL interpolation;
- rate limit where practical.

Headers:
- preserve existing secure headers.

External links:
- `rel` where needed.

---

# 72. LEGAL

Preserve/add links for:

- privacy;
- terms;
- Libro de Reclamaciones.

Do not fabricate legal text.

If pages exist:
- link them.

If not:
- create route shells only if approved content exists.
- do not generate legally authoritative text from scratch and silently publish it.

---

# 73. ERROR STATES

Forms need:

- loading;
- success;
- error.

Media:
- graceful poster fallback.

Image:
- avoid broken layout.

API:
- meaningful server errors.

---

# 74. EMPTY STATES

If a section lacks enough verified data:

Examples:
- testimonials unavailable;
- metrics unavailable.

Do not fill with fake content.

Either:
- omit;
- use a factual alternative;
- create data structure for future population.

---

# 75. NAV ANCHORS

All homepage nav links must resolve correctly.

Use IDs:

- `#trabajos`
- `#proyectos`
- `#servicios`
- `#nosotros`

or current conventions.

Account for sticky header using scroll margin.

---

# 76. WHATSAPP

Use the real WhatsApp number from existing Wilo config/content.

Do not use numbers visible in AI-generated mockups.

Create helper:

```ts
createWhatsAppUrl(message)
```

Prefill messages depending source:

Homepage CTA:
`Hola Wilo Studio, quiero conversar sobre un proyecto.`

Events:
`Hola Wilo, quiero cotizar un evento corporativo.`

Education:
`Hola Wilo Education, quiero información...`

Only if real WhatsApp is configured.

---

# 77. CONTACT DATA CENTRALIZATION

Create one real source:

```ts
export const company = {
  email: ...,
  whatsapp: ...,
  location: ...,
  socials: ...
}
```

Navbar/footer/forms should import it.

Do not duplicate contact text throughout JSX.

---

# 78. CONTENT EDITABILITY

Keep content easily editable.

Do not bury marketing copy in animation logic.

Text and data must live in:

- data files;
- route content;
- component props.

---

# 79. SEO COPY / HOME

Home must clearly communicate in text, not just visuals:

- Wilo builds digital solutions;
- real projects;
- systems/platforms;
- audiovisual;
- ecosystem lines;
- Peru/Arequipa identity.

Search engines should understand the company even if JS effects fail.

---

# 80. SERVER RENDERING

Critical content:
- headings;
- project names;
- services;
- company description;

should exist in rendered HTML.

Do not render all copy only after client-side hydration.

---

# 81. ANIMATION PERFORMANCE

Animate:
- `transform`;
- `opacity`;
- clip/mask where appropriate.

Avoid:
- layout-triggering left/top in continuous animation;
- box-shadow animation across huge elements every frame;
- filter blur on full-screen 4K layers.

Use `will-change` only temporarily/where useful.

---

# 82. GPU / MEMORY

3D carousel:
- no 20 videos;
- no 20 huge shadows;
- no 20 full-resolution images.

Unmount/far-simplify distant slides if helpful.

---

# 83. MOBILE DATA

Video:
- preload metadata/none;
- poster;
- only active.

Respect data-saving tendencies when possible.

---

# 84. BUILD PHASES

Execute in this order.

## Phase 1 — audit & architecture
- repo;
- Express;
- assets;
- data;
- current hero;
- forms.

## Phase 2 — design tokens & global shell
- colors;
- typography;
- container;
- motion tokens;
- navigation.

## Phase 3 — homepage core
- hero integration;
- transition;
- 3D work carousel;
- real projects.

## Phase 4 — capability sections
- services;
- Lab;
- audiovisual;
- process.

## Phase 5 — credibility
- metrics;
- brands;
- testimonials.

## Phase 6 — ecosystem
- ecosystem section;
- Education teaser/page;
- Express teaser/bridge;
- Events teaser/page.

## Phase 7 — about/contact/footer
- About;
- CTA;
- forms;
- footer.

## Phase 8 — project routes
- case study template;
- real project pages available.

## Phase 9 — SEO/performance/accessibility

## Phase 10 — QA/build.

Do not stop after Phase 3 and call it complete.

---

# 85. QA — FUNCTIONAL

Manually verify:

Navbar:
- all links.

Hero:
- CTA.
- pointer grid.
- mascot.

3D carousel:
- drag;
- swipe;
- arrow;
- keyboard;
- loop;
- snap;
- project CTA;
- video.

Projects:
- list;
- next/previous;
- media;
- detail route.

Capabilities:
- hover/click;
- mobile.

Lab:
- module selection.

Forms:
- validation;
- submit;
- success;
- error.

Ecosystem:
- all routes.

Footer:
- links.

No dead controls.

---

# 86. QA — VISUAL

Check:

- no overflow;
- no text clipping;
- no title behind nav;
- no mascot collision;
- no 3D card extending outside viewport badly;
- no 10px unreadable copy;
- light/dark transitions;
- no unexpected white flash;
- correct Flexo loading.

---

# 87. QA — RESPONSIVE

Use browser/device testing.

Do not rely only on CSS inspection.

At minimum verify:

- 1440×900
- 1366×768
- 1024×768
- 768×1024
- 430×932
- 390×844
- 360×800

---

# 88. QA — PERFORMANCE

Run production build.

Inspect:

- build warnings;
- route bundle size if available;
- image warnings;
- Next Image usage;
- font warnings;
- hydration warnings;
- console errors.

Use Lighthouse if available.

Fix major issues.

---

# 89. QA — LINT / TYPECHECK

Run the project's actual commands.

Examples only:

```bash
npm run lint
npm run typecheck
npm run build
```

or package-manager equivalents.

Do not switch package manager.

Fix errors caused by your implementation.

Do not suppress TypeScript with `any` everywhere.

---

# 90. QA — REDUCED MOTION

Simulate reduced motion.

The website must still:

- function;
- navigate;
- show all information.

---

# 91. QA — KEYBOARD

Tab through:

- nav;
- carousel;
- project selector;
- buttons;
- forms;
- ecosystem.

No invisible focus.

No traps.

---

# 92. QA — FORMS

Test:

- empty;
- invalid email;
- invalid required fields;
- successful submit;
- server unavailable;
- spam honeypot.

Do not log sensitive form payloads unnecessarily.

---

# 93. COPY / MOCKUP WARNING

The supplied images contain beautiful design ideas, but some generated text/metrics are not authoritative.

Treat as visual guidance only.

Specifically verify before publishing:

- `+120`;
- `+80`;
- `5+`;
- `100%`;
- `150+`;
- `50+`;
- sample dashboard sales;
- sample client names inside fictional CRM tables;
- sample prices;
- sample phone/email.

Replace with real Wilo content.

---

# 94. CURRENT BUSINESS SCOPE TO COMMUNICATE

Wilo should not read as “only a web agency”.

The site must communicate a broader ecosystem:

### Wilo Studio
Custom digital solutions.

### Wilo Express
Fast web product for businesses.

### Wilo Education
Robotics/STEM/technology learning.

### Wilo Events / corporate line
Corporate events and brand experiences.

Within Studio:
- web;
- e-commerce;
- systems;
- apps;
- automation;
- APIs;
- quotation/configuration;
- audiovisual;
- identity/UI;
- infrastructure;
- support.

This breadth should be clear but organized.

---

# 95. WHAT NOT TO DO

Do NOT:

- remove the approved hero;
- replace carousel with basic cards;
- ignore the Express implementation;
- turn everything into a black card grid;
- use one background for every section;
- use the Misti everywhere;
- copy South directly;
- copy MasDigital directly;
- invent metrics;
- invent testimonials;
- invent contact details;
- publish placeholder form actions;
- create dead buttons;
- hide form submission behind `console.log`;
- use mailto as the primary form backend;
- add fake client logos;
- create 20 client components unnecessarily;
- import huge libraries for minor effects;
- break Wilo Express;
- duplicate Wilo Express as a second full application in Studio.

---

# 96. DESIGN ACCEPTANCE CRITERIA

The redesigned site must feel:

- premium;
- intentional;
- Wilo-specific;
- cinematic;
- modern;
- technical;
- credible;
- interactive;
- fast.

It must **not** feel:

- like a ThemeForest template;
- like an AI-generated SaaS;
- like a clone of South;
- like a simple web freelancer portfolio.

---

# 97. PRODUCT ACCEPTANCE CRITERIA

A visitor should understand:

Within 5 seconds:
- this is Wilo Studio.

Within 15 seconds:
- Wilo builds serious digital work.

Within 30 seconds:
- Wilo has real projects and broader capabilities.

Within 60 seconds:
- Wilo also has Express, Education and Events/corporate lines.

At any point:
- they can start a project or contact Wilo.

---

# 98. ENGINEERING ACCEPTANCE CRITERIA

Done means:

- production build succeeds;
- lint/type checks are acceptable;
- no major console errors;
- current hero preserved;
- 3D portfolio derived from Express works;
- projects deep-dive works;
- capabilities work;
- Lab works;
- audiovisual exists;
- process exists;
- trust sections use real data;
- ecosystem routes work;
- Education page works;
- Express bridge works;
- Events page works;
- contact form works server-side;
- responsive;
- accessible;
- SEO configured;
- assets optimized.

---

# 99. FINAL REPORT FORMAT

After finishing, return a concise technical report.

Do not spend the beginning explaining what you intend to do.

Execute first.

At completion provide:

## Files changed
- list.

## Components created
- list.

## Routes created
- list.

## Wilo Express reuse
- source component/files studied;
- what was extracted;
- what was changed.

## Forms
- endpoint/server action;
- validation;
- email/persistence behavior;
- environment variables.

## Assets
- used;
- missing.

## SEO
- metadata/sitemap/JSON-LD.

## QA
- lint;
- typecheck;
- build;
- responsive checks.

## Known launch blockers
Only real blockers.

---

# 100. FINAL EXECUTION DIRECTIVE

You have permission to make substantial frontend changes required to complete this redesign.

Do not wait for me to approve each section.

Use the current approved Wilo hero as the starting point.

Use the supplied visual references as art direction.

Use the Wilo Express path I already gave you as the technical reference for the 3D carousel.

Build the rest of the Wilo Studio experience around it.

The primary objective is:

> **A complete, coherent, production-ready Wilo Studio website that presents Wilo as a serious ecosystem of digital solutions, education, fast web products and corporate experiences — with real projects, real conversion flows, premium motion, responsive behavior and no dead sections.**

Before you finish:

- revisit every page;
- test every CTA;
- test every form;
- test every carousel;
- test every breakpoint;
- remove dead code;
- fix build errors;
- verify real data;
- ensure the website is genuinely launchable.

**DO THE WORK. DO NOT RETURN A DESIGN ESSAY.**
