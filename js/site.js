import { initPageLoad, initPageTransitions } from "./interactions.js?v=motion";
import { initThemeControls } from "../../shared/js/theme.js";
import {
  initAnchorActiveState,
  initIntroNavVisibility,
  initProfileImageBehavior
} from "../../shared/js/page-observers.js";

initThemeControls();
initPageLoad();
initPageTransitions();
initIntroNavVisibility();
initProfileImageBehavior();
initAnchorActiveState();
