export function initSlideShow(el) {
  const track = el.querySelector('.slide-show__track');
  const prev = el.querySelector('[data-prev]');
  const next = el.querySelector('[data-next]');
  const slides = Array.from(track?.children || []);

  let index = 0;

  function update() {
    if (!track || !slides.length) return;

    const slideWidth = slides[0].offsetWidth;
    track.style.transform = `translateX(-${index * slideWidth}px)`;

    slides.forEach((slide, slideIndex) => {
      const isActive = slideIndex === index;
      slide.classList.toggle('is-active', isActive);
      slide.setAttribute('aria-hidden', String(!isActive));
    });
  }

  next?.addEventListener('click', () => {
    index = Math.min(index + 1, slides.length - 1);
    update();
  });

  prev?.addEventListener('click', () => {
    index = Math.max(index - 1, 0);
    update();
  });

  window.addEventListener('resize', update, { passive: true });

  update();

  window.initSlideShow = initSlideShow;
}
