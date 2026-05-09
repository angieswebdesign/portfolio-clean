console.log("data.js loaded");

import { openCaseStudy } from "./modal.js";
import { renderWorkFeature } from "./components.js";

let projectsCache = [];

document.addEventListener("click", (e) => {
  const trigger = e.target.closest("[data-open-case-study]");
  if (!trigger) return;

  e.preventDefault();

  const id = trigger.dataset.projectId;
  const project = projectsCache.find((p) => p.id === id);

  if (!project) {
    console.warn("Project not found for id:", id);
    return;
  }

  openCaseStudy(project);
});

fetch("./js/data.json")
  .then((res) => res.json())
  .then((projects) => {
    projectsCache = projects;


    const listRoot = document.getElementById("project-list");
    const featuredProjects = projects.filter((p) => p.featured);

    listRoot.innerHTML = featuredProjects
      .map((data, index) => {
        let html = renderWorkFeature(data, index);

        if (data.id === "florida-blue-payments-experience") {
          html = html.replace('work-feature"', 'work-feature feature--payments"');
        }

        if (data.id === "florida-blue-data-sharing") {
          html = html.replace('work-feature"', 'work-feature feature--privacy"');
        }

        return html;
      })
      .join("");

    initWorkReveal();
  });

  function initWorkReveal() {
  const items = document.querySelectorAll(".work-feature");

  if (!items.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
      } else {
        entry.target.classList.remove("is-visible");
      }
    });
  }, {
    threshold: 0.2,
    rootMargin: "0px 0px -100px 0px"
  });

  items.forEach((item) => observer.observe(item));
}
