(function () {
  console.log("Micro-interactions loaded");
})();

export function initPageTransitions() {
  const links = document.querySelectorAll('.js-page-transition');

  links.forEach(link => {
    link.addEventListener('click', handleTransitionClick);
  });
}

function handleTransitionClick(e) {
  const link = e.currentTarget;
  const href = link.getAttribute('href');

  if (
    link.target === '_blank' ||
    href.startsWith('#') ||
    link.hostname !== window.location.hostname
  ) return;

  if (document.body.classList.contains('fade-out')) return;

  e.preventDefault();

  document.body.classList.add('fade-out');

  setTimeout(() => {
    window.location.href = href;
  }, 220);
}

export function initPageLoad() {
  let loaded = false;

  const markLoaded = () => {
    if (loaded) return;
    loaded = true;

    requestAnimationFrame(() => {
      document.body.classList.add('is-loaded');
      document.body.classList.add('fade-in');
    });
  };

  if (document.readyState === 'complete') {
    markLoaded();
  } else {
    window.addEventListener('load', markLoaded, { once: true });
  }
}
