## 2026-05-17

### Portfolio Codex Refactor Outcome Notes

Implemented the AWD portfolio refactor with the root /shared folder actively wired in.
Key outcomes:
	•	Root shared architecture added/used:
	◦	global-tokens.css
	◦	global-components.css
	◦	utilities.css
	◦	motion.css
	◦	theme.js
	◦	pattern-slides.js
	•	Replaced CDN shared token/component usage with root /shared references.
	•	Modularized page wiring into:
	◦	site.js
	◦	method-page.js
	◦	case-study.js
	•	Added AWD/default, dark, and night theme controls.
	•	Refactored .pattern-slides into a progressive carousel with controls, dots, keyboard support, focus handling, and subtle motion.
	•	Kept the existing lightbox and added backdrop/content blur polish.
	•	Consolidated duplicate nav CSS and fixed the broken AI icon background asset path.
	•	Added refactor documentation here: architecture-refactor-notes.md

Verification:
	•	JS syntax checks passed for all changed modules.
	•	Browser verified home page, Method page, theme switching, case-study .pattern-slides, slideshow controls, and lightbox blur.
	•	Browser console showed no warnings/errors on checked pages.
