import { initPageLoad, initPageTransitions } from "./interactions.js?v=motion";
import { initSlideShow } from "./slideshow.js?v=motion";
import { initThemeControls } from "../../shared/js/theme.js";
import { initAnchorActiveState } from "../../shared/js/page-observers.js";

initThemeControls();
initPageLoad();
initPageTransitions();
initAnchorActiveState();

document.querySelectorAll(".slide-show").forEach(initSlideShow);
