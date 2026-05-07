console.log('NEW VERSION LOADED');

//Remove stacked panel content from openModal() to reuse it to list the work as a horizontal view component.
export function renderOverlayPanel(data) {
  return `
    <div class="overlay__panel">
      <div class="overlay__grid">
        <div class="overlay__col overlay__col--left">
          <div class="media-slot" aria-label="Overlay media">
            <img
              src="${data.meta.imageUrl}"
              alt="${data.title} cover image"
              loading="lazy"
            />
          </div>
        </div>

        <article class="overlay__col">
          <header>
            <h2 class="section-heading">
              <span class="heading-main">${data.heading.main}</span>
              <span class="heading-accent">${data.heading.accent}</span>
            </h2>
          </header>

          <dl>
            <!--<dt>ROLE</dt>
              <dd>${data.meta.problem}</dd>-->

            <dt>ROLE</dt>
            <dd>${data.meta.role}</dd>

            <dt>DESCRIPTION</dt>
            <dd class="scroll-notes">${data.meta.notes}</dd>
          </dl>

          ${
            data.hasCaseStudy
              ? `
                <div>
                  <a 
                    data-open-case-study="true"
                    data-project-id="${data.id}"
                    class="primary-btn-small"
                  >
                    View Case Study
                  </a>
                </div>
              `
              : ``
          }
        </article>
      </div>
    </div>
  `;
}


export function renderProjectCard(data) {
  return `
  <article class="project-card">
    <a 
      href="#" 
      class="project-card-thumb"
      data-lightbox-src="${data.meta.imageUrl}"
    >
      <img 
        src="${data.meta.imageUrl}" 
        alt="${data.title}" 
        class="project-card-image"
      />
    </a>

    <div class="project-card-body">

      <h2 class="section-heading">
        <span class="heading-main">${data.heading.main}</span>
        <span class="heading-accent">${data.heading.accent}</span>
      </h2>

      <dl class="project-meta">
        <dt>Impact</dt>
        <dd>${data.meta.impact}</dd>
      </dl>

    </div>

    ${
      data.hasCaseStudy
        ? `
        <div class="project-card-actions">
          <a href="${data.htmlInclude}" class="primary-btn-small">
            View Case Study
          </a>
        </div>
        `
        : ""
    }

  </article>
  `;
}


export function renderWorkFeature(data, index) {
  const isRight =
    data.layout === "right" ||
    (data.layout !== "left" && index % 2 !== 0);

  let featureClass = "";

  if (data.id === "florida-blue-payments-experience") {
    featureClass = "feature--payments";
  }

  if (data.id === "florida-blue-data-sharing") {
    featureClass = "feature--privacy";
  }

  return `
    <article class="work-feature ${isRight ? 'right-mode' : ''} ${featureClass}">

      <div class="work-feature__copy">
        <h2 class="section-heading">
          <span class="heading-main">${data.heading.main}</span>
          <span class="heading-accent">${data.heading.accent}</span>
        </h2>

        <p class="work-feature__impact">
          ${data.meta.impact}
        </p>

        ${
        data.hasCaseStudy
          ? `
          <div class="work-feature__actions">
            <a href="${data.htmlInclude}" class="primary-btn-small"
            >
              View Case Study
            </a>
          </div>
          `
          : ""
        }

      </div>

      <div class="work-feature__media">
        <img 
          src="${data.meta.featuredUrl}" 
          alt="${data.title}"
        />
      </div>

    </article>
  `;
}