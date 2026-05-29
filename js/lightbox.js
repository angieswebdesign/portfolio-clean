const lightbox = document.getElementById('lightbox');
const img = lightbox?.querySelector('img');
const caption = lightbox?.querySelector('figcaption');

let isOpen = false;
let isZoomed = false;

document.addEventListener('click', (e) => {
  if (!lightbox || !img || !caption) return;

  const trigger = e.target.closest('[data-lightbox]');

  // OPEN
  if (trigger && !isOpen) {
    e.preventDefault();

    img.src = trigger.href;

    const figure = trigger.closest('figure');
    const figcaption = figure?.querySelector('figcaption');
    caption.innerHTML = figcaption ? figcaption.innerHTML : '';

    lightbox.classList.add('is-open');
    document.body.classList.add('is-lightbox-open');
    isOpen = true;
    return;
  }

  // CLICK IMAGE → zoom or close
  if (isOpen && e.target === img) {
    if (!isZoomed) {
      lightbox.classList.add('is-zoomed');
      isZoomed = true;
    } else {
      closeLightbox();
    }
    return;
  }

  // CLICK OUTSIDE → close
  if (isOpen && !e.target.closest('.lightbox__content')) {
  closeLightbox();
}
});

document.addEventListener('keydown', (e) => {
  if (!isOpen || e.key !== 'Escape') return;
  closeLightbox();
});

function closeLightbox() {
  if (!lightbox) return;

  lightbox.classList.remove('is-open', 'is-zoomed');
  document.body.classList.remove('is-lightbox-open');
  isOpen = false;
  isZoomed = false;
}
