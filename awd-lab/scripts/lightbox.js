// lightbox.js

(function () {
  const overlay = document.getElementById('layer-3-overlay');
  const closeBtn = document.getElementById('layer-3-close');

  if (!overlay) {
    console.warn('Lightbox: #layer-3-overlay not found');
    return;
  }

  const lightboxImg = overlay.querySelector('.layer-3-lightbox img');

  if (!lightboxImg) {
    console.warn('Lightbox: .layer-3-lightbox img not found');
    return;
  }

  function closeLightbox() {
    if (overlay.dataset.mode !== 'lightbox') return;

    overlay.classList.remove('is-open');
    overlay.removeAttribute('data-mode');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('is-layer-3-open');

    lightboxImg.src = '';
    lightboxImg.alt = '';

    document.removeEventListener('keydown', onEscape);
  }

  function onEscape(e) {
    if (e.key === 'Escape') {
      closeLightbox();
    }
  }

  // Open logic ---------------------------------------- /
  document.addEventListener('click', function (e) {
  const trigger = e.target.closest('.lightbox-trigger');
  if (!trigger) return;

  e.preventDefault();

  const src = trigger.getAttribute('href');
  if (!src) return;

  const overlay = document.getElementById('layer-3-overlay');
  const img = overlay.querySelector('.lightbox-image');
  const pdf = overlay.querySelector('.lightbox-pdf');

  //const isPDF = trigger.dataset.type === 'pdf';
  const type = trigger.dataset.type || 'image';
  const isPDF = type === 'pdf';

  // reset both
  img.src = '';
  pdf.src = '';

  if (isPDF) {
    overlay.dataset.type = 'pdf';
    pdf.src = src + '#toolbar=0';
  } else {
    overlay.dataset.type = 'image';
    img.src = src;
  }

  overlay.dataset.mode = 'lightbox';
  overlay.classList.add('is-open');
  overlay.setAttribute('aria-hidden', 'false');
  document.body.classList.add('is-layer-3-open');
});

  if (closeBtn) {
    closeBtn.addEventListener('click', closeLightbox);
  }

  overlay.addEventListener('click', function (e) {
    if (overlay.dataset.mode !== 'lightbox') return;

    const clickedInsideStage = e.target.closest('.layer-3-stage');
    const clickedImage = e.target.closest('.layer-3-lightbox img');
    const clickedClose = e.target.closest('#layer-3-close');

    if (!clickedInsideStage && !clickedImage && !clickedClose) {
      closeLightbox();
    }
  });
})();