// --- GLOBAL SETUP (runs on ALL pages) --- //

const PAGE = document.body.dataset.page;
const IS_INTRO = PAGE === "intro";
const frameEl = document.getElementById("frame");

// Shared frame colors (Intro + main sections)
const FRAME_COLORS = [
  { r: 217, g: 217, b: 217 }, // Intro
  { r: 217, g: 217, b: 217 }, // Work
  { r: 20,  g: 20,  b: 20 },  // Services
  { r: 250, g: 77,  b: 126 }  // About
];

// --- Color helpers --- //
function lerp(a, b, t) {
  return a + (b - a) * t;
}

function lerpColor(colorA, colorB, t) {
  return {
    r: Math.round(lerp(colorA.r, colorB.r, t)),
    g: Math.round(lerp(colorA.g, colorB.g, t)),
    b: Math.round(lerp(colorA.b, colorB.b, t))
  };
}

function rgbToString({ r, g, b }) {
  return `rgb(${r}, ${g}, ${b})`;
}

// --- Frame animation (reusable) --- //
function animateFrameColor(fromColor, toColor, duration = 750) {
  if (!frameEl) return;
  
  const startTime = performance.now();
  
  function animate(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    const currentColor = lerpColor(fromColor, toColor, progress);
    frameEl.style.borderColor = rgbToString(currentColor);
    
    if (progress < 1) {
      requestAnimationFrame(animate);
    }
  }
  
  requestAnimationFrame(animate);
}

// --- INTRO MODE --- //

if (IS_INTRO) {
  console.log("intro fix running");
  
  const frame = document.getElementById("frame");
  
  // set initial visible color
  if (frame) {
    frame.style.setProperty("--color-secondary", "rgb(230,230,230)");
  }
  
  // listen on ALL nav links
  document.querySelectorAll("[data-nav]").forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      
      console.log("nav click detected:", link.dataset.nav);
      
      if (!frame) return;
      
      // animate via CSS variable
      frame.style.transition = "border-color 400ms ease";
      
      let color = "rgb(217,217,217)"; // work
      
      if (link.dataset.nav === "services") {
        color = "rgb(20,20,20)";
      }
      
      if (link.dataset.nav === "about") {
        color = "rgb(250,77,126)";
      }
      
      frame.style.setProperty("--color-secondary", color);
      
      // do nothing — let the rail/nav system handle it
    });
  });
  
} else {
  
  // --- SET ACTIVE BASED ON URL --- //
  const currentPath = window.location.pathname;
  
  document.querySelectorAll("[data-nav]").forEach(link => {
    if (!link.href) return; // ← prevent crash
    
    const linkPath = new URL(link.href, window.location.origin).pathname;
    
    if (linkPath === currentPath) {
      link.classList.add("is-active");
    }
  });
  
  // --- FULL NAVIGATION SYSTEM (UNCHANGED BELOW) --- //
  
  // --- MOBILE GUARD: disable desktop scroll logic ---
  const IS_TOUCH =
  "ontouchstart" in window ||
  navigator.maxTouchPoints > 0;
  // --- END MOBILE GUARD ---
  
  
  const railEl = document.getElementById("content-rail");
  
  const SECTIONS = [
    "work",
    "services",
    "about"
  ];
  
  const contentEls = Array.from(
    railEl.querySelectorAll(".container")
  );
  
  const TRANSITION_DURATION = 750;      // ms
  const FINAL_TRANSITION_DURATION = 950; // ms
  const INPUT_COOLDOWN = 400; // ms — absorbs trackpad inertia
  
  
  
  
  // --- GET SECTION HEIGHTS --- //
  function getSectionHeight() {
    return sections[0].getBoundingClientRect().height;
  }
  
  const sections = Array.from(
    railEl.querySelectorAll(".section")
  );
  
  function setInitialPosition() {
    const sectionHeight = sections[0].getBoundingClientRect().height;
    railEl.style.transform = `translateY(0px)`;
  }
  
  
  const SETTLE_DELAY = 120; // ms — subtle but meaningful
  
  let isSettled = true;
  let currentIndex = 0;
  let isTransitioning = false;
  let inputLocked = false;
  
  
  // --- EASING UTILITIES --- //
  function easeOutQuint(t) {
    return 1 - Math.pow(1 - t, 5);
  }
  
  // --- Frame color helper --- //
  function lerp(a, b, t) {
    return a + (b - a) * t;
  }
  
  function lerpColor(colorA, colorB, t) {
    return {
      r: Math.round(lerp(colorA.r, colorB.r, t)),
      g: Math.round(lerp(colorA.g, colorB.g, t)),
      b: Math.round(lerp(colorA.b, colorB.b, t))
    };
  }
  
  function rgbToString({ r, g, b }) {
    return `rgb(${r}, ${g}, ${b})`;
  }
  
  
  
  // --- STEP 1: BASIC BOUNDARIES & LOGGING --- //
  function goToIndex(nextIndex) {
    if (isTransitioning) return;
    if (nextIndex < 0 || nextIndex >= SECTIONS.length) return;
    
    if (IS_TOUCH) {
      
      const targetSection = sections[nextIndex];
      
      if (targetSection) {
        targetSection.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });
      }
      
      currentIndex = nextIndex;
      updateNavState(currentIndex);
      
      const color = FRAME_COLORS[nextIndex];
      if (frameEl) {
        frameEl.style.borderColor = rgbToString(color);
      }
      
      return;
    }
    
    isSettled = false;
    
    const fromIndex = currentIndex;
    const toIndex = nextIndex;
    
    const duration = getTransitionDuration(toIndex);
    const startTime = performance.now();
    
    isTransitioning = true;
    currentIndex = toIndex;
    updateNavState(currentIndex);
    
    console.log(
      `[NAV] ${SECTIONS[fromIndex]} → ${SECTIONS[toIndex]} (${duration}ms)`
    );
    
    function animate(now) {
      const elapsed = now - startTime;
      const rawProgress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutQuint(rawProgress);
      
      // Create a shallow dip in opacity during motion
      const MIN_OPACITY = 0.92;
      const opacity =
      MIN_OPACITY +
      (1 - MIN_OPACITY) * easedProgress;
      
      contentEls.forEach((el) => {
        el.style.opacity = opacity;
      });
      
      
      // Move rail inside the animation loop
      const sectionHeight = getSectionHeight();
      
      const fromY = -fromIndex * sectionHeight;
      const toY = -toIndex * sectionHeight;
      
      const currentY = lerp(fromY, toY, easedProgress);
      
      if (railEl) {
        railEl.style.transform = `translateY(${currentY}px)`;
      }
      
      
      const fromColor = FRAME_COLORS[fromIndex];
      const toColor = FRAME_COLORS[toIndex];
      
      const currentColor = lerpColor(fromColor, toColor, easedProgress);
      
      if (frameEl) {
        frameEl.style.borderColor = rgbToString(currentColor);
      }
      
      
      // DEBUG ONLY — we will replace this with visuals next step
      console.log(
        `[NAV] progress: ${easedProgress.toFixed(3)}`
      );
      
      if (rawProgress < 1) {
        requestAnimationFrame(animate);
      } else {
        console.log(`[NAV] transition complete`);
        
        // Hold the final state briefly
        setTimeout(() => {
          isTransitioning = false;
          isSettled = true;
          inputLocked = false; // ← re-arm input here
          
          contentEls.forEach((el) => {
            el.style.opacity = "1";
          });
          
          console.log("[NAV] state settled");
        }, SETTLE_DELAY);
      }
      
    }
    
    requestAnimationFrame(animate);
  }
  
  let lastInputTime = 0;
  
  const NAV_MODE = !document.body.classList.contains("intro-page");
  
  // --- STEP 2: "WHEEL" SMOOTH SCROLLING --- //
  window.addEventListener(
    "wheel",
    (e) => {
      
      if (NAV_MODE) return; // ← HARD STOP
      
      if (IS_TOUCH) return;
      
      const rail = document.getElementById("content-rail");
      if (rail?.dataset.locked === "true") return;
      
      e.preventDefault();
      
      const now = performance.now();
      
      if (now - lastInputTime < INPUT_COOLDOWN) return;
      if (inputLocked) return;
      
      const direction = Math.sign(e.deltaY);
      if (direction === 0) return;
      
      const nextIndex =
      direction > 0
      ? currentIndex + 1
      : currentIndex - 1;
      
      if (nextIndex < 0 || nextIndex >= SECTIONS.length) return;
      
      lastInputTime = now;
      inputLocked = true;
      goToIndex(nextIndex);
    },
    { passive: false }
  );
  
  
  
  
  // --- ** EXTRA ** --- Keyboard navigation --- //
  window.addEventListener("keydown", (e) => {
    if (inputLocked) return;
    
    if (e.key === "ArrowDown") {
      inputLocked = true;
      goToIndex(currentIndex + 1);
    }
    
    if (e.key === "ArrowUp") {
      inputLocked = true;
      goToIndex(currentIndex - 1);
    }
  });
  
  
  // --- HELPER: Section state lock logic --- //
  
  function getTransitionDuration(toIndex) {
    // Last section gets the longer settle
    return toIndex === SECTIONS.length - 1
    ? FINAL_TRANSITION_DURATION
    : TRANSITION_DURATION;
  }
  
  
  const navMap = {
    work: 0,
    services: 1,
    about: 2
  };
  
  document.querySelectorAll("[data-nav]").forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      
      const key = link.dataset.nav;
      const index = navMap[key];
      
      if (index === undefined) return;
      
      const isMobileViewport = window.matchMedia("(max-width: 768px)").matches;
      
      if (isMobileViewport) {
        const target = sections[index];
        
        isTransitioning = false;
        inputLocked = false;
        
        if (railEl) {
          railEl.style.transform = "none";
        }
        
        if (target) {
          target.scrollIntoView({
            behavior: "smooth",
            block: "start"
          });
        }
        
        currentIndex = index;
        updateNavState(currentIndex);
        
        const color = FRAME_COLORS[index];
        if (frameEl) {
          frameEl.style.borderColor = rgbToString(color);
        }
        
        return;
      }
      
      if (index === currentIndex) return;
      
      inputLocked = true;
      goToIndex(index);
    });
  });
  
  function updateNavState(index) {
    const navMap = {
      0: "work",
      1: "services",
      2: "about"
    };
    
    const activeKey = navMap[index];
    
    document.querySelectorAll("[data-nav]").forEach(link => {
      if (link.dataset.nav === activeKey) {
        link.classList.add("is-active");
      } else {
        link.classList.remove("is-active");
      }
    });
  }
  
}

