export function initSlideShow(el) {
  const track = el.querySelector('.slide-show__track');
  const prev = el.querySelector('[data-prev]');
  const next = el.querySelector('[data-next]');

  let index = 0;

  function update() {
    const slideWidth = track.children[0].offsetWidth;
    track.style.transform = `translateX(-${index * slideWidth}px)`;
  }

  next?.addEventListener('click', () => {
    index = Math.min(index + 1, track.children.length - 1);
    update();
  });

  prev?.addEventListener('click', () => {
    index = Math.max(index - 1, 0);
    update();
  });

  window.initSlideShow = initSlideShow;
}
