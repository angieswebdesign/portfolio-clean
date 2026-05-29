# AWD Portfolio Architecture Refactor Notes

## Refactor Intent

This pass preserves the authored AWD presentation system while separating shared primitives, page wiring, interaction behavior, and component presentation. The portfolio remains a static site and does not introduce a new framework.

## Shared Root Ownership

- `shared/css/global-tokens.css` owns global brand colors, surface/text aliases, and the default/dark/night theme token overrides.
- `shared/css/global-components.css` owns portable icon and control primitives.
- `shared/css/utilities.css` owns small reusable layout utilities only.
- `shared/css/motion.css` owns reusable timing, easing, reveal, hover, and reduced-motion primitives.
- `shared/js/theme.js` owns theme state, persistence, and theme control activation.
- `shared/js/page-observers.js` owns reusable page observers for intro nav visibility, profile visibility, and anchor active state.
- `shared/js/pattern-slides.js` owns the reusable `.pattern-slides` carousel enhancement.
- `shared/js/icons.js` is the local icon source for the canonical shared icon injector in `shared/js/createIcon.js`.

## Modularized Page Wiring

- `portfolio-clean/js/site.js` replaces inline home-page observer and transition wiring.
- `portfolio-clean/js/method-page.js` replaces duplicated Method page slideshow, anchor, and transition wiring.
- `portfolio-clean/js/case-study.js` initializes theme controls, page transitions, and `.pattern-slides` for case-study pages.

## Wrapper And Slot Ownership

- `content-rail`, `page-flow`, and `section-flow` own page-level stacking and rail orchestration.
- `section-shell` owns section container orchestration while preserving the existing `.container` presentation.
- `section-slot`, `section-slot--header`, and `section-slot--content` mark interchangeable section content slots without taking over component styling.
- Components such as `.work-feature`, `.cards`, `.section-heading`, `.pattern-slides`, and `.cta__button` retain presentation ownership.

## Consolidated Utilities

- Duplicated global navigation list selectors were consolidated in `portfolio-clean/css/components.css`.
- Shared icon/control primitives now load from the root `shared` folder instead of the CDN.
- Reusable theme, observer, and slideshow behavior is centralized in root `shared/js` modules.
- Motion timings now reference shared motion primitives while preserving existing local timing tokens.

## Removed Or Retired Drift

- Removed inline page observer scripts from `index.html`, `method.html`, and `methodology.html`.
- Removed stale "ghost layer" comments after converting those wrappers into named page/section flow structures.
- Replaced CDN shared token/component references with root `/shared` folder references.
- Fixed the profile trigger selector drift by supporting both `.profile-trigger` and `.profile-image-trigger`.

## Pattern Slides Component

`.pattern-slides` remains authored with the existing figures, images, and captions. JavaScript progressively enhances it into a carousel by adding:

- viewport and track wrappers
- previous/next controls
- pagination dots
- active/inactive slide state
- keyboard arrow navigation
- focus management for inactive slides
- subtle opacity and scale transitions

If JavaScript is unavailable, the original slide content remains in the document.

## Motion Ownership

- `shared/css/motion.css` owns reusable primitives and reduced-motion protection.
- Component files keep component-specific hover and transition styling.
- `shared/js/pattern-slides.js` owns slideshow state transitions.
- `portfolio-clean/js/interactions.js` continues to own page fade transitions.

## Theme Ownership

The authored AWD palette is the default theme. Dark and night themes override token values only. This protects the existing visual hierarchy while enabling future theme-aware components through shared aliases such as `--theme-bg`, `--theme-surface`, `--theme-text`, `--theme-divider`, and `--theme-accent`.

## Intentionally Preserved Legacy Structures

- `awd-lab` remains untouched as an archive/lab area.
- Existing case-study layout selectors remain in place to avoid destabilizing standalone case-study pages.
- Existing project data rendering remains intact.
- The current static HTML structure is preserved rather than migrated into a new framework or build step.

## Known Technical Debt

- Some case-study files are full standalone HTML documents but are also referenced as include targets by older overlay code.
- Several older backup files remain in `awd-lab` and root JS folders; they should be removed only after confirming deployment references.
- `chart.js` still imports Observable Plot from a CDN.
- A few legacy CSS custom properties are still undefined or product-local, including older case-study text aliases.
- Some hard-coded colors remain in deeply authored component styles where changing them could affect visual parity.

## Future Extensibility Guidance

- Add new shared behavior under `shared/js` only when it is reusable across pages or products.
- Add new component presentation in `portfolio-clean/css/components.css` unless it is genuinely global.
- Add section/page orchestration through wrapper and slot classes rather than component-specific parent selectors.
- Keep dark/night support token-driven; avoid per-component theme overrides unless the component has a real contrast issue.
- Convert future case-study patterns into progressive enhancements that preserve semantic HTML first.
