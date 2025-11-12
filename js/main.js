import { about, skills, experience, projects, contact } from '../data/content.js';

const yearEl = document.getElementById('year');
if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}

const navToggle = document.querySelector('.nav-toggle');
const navList = document.querySelector('.nav-list');

if (navToggle && navList) {
  navToggle.addEventListener('click', () => {
    const current = navToggle.getAttribute('aria-expanded') === 'true';
    navToggle.setAttribute('aria-expanded', String(!current));
    navList.dataset.open = String(!current);
  });

  navList.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      navToggle.setAttribute('aria-expanded', 'false');
      navList.dataset.open = 'false';
    });
  });
}

const createAboutSection = () => {
  const container = document.querySelector('[data-section="about"]');
  if (!container) return;

  const summary = document.createElement('div');
  summary.className = 'about__grid';

  about.summary.forEach((paragraph) => {
    const item = document.createElement('div');
    item.className = 'about__item';
    item.innerHTML = `<p>${paragraph}</p>`;
    summary.appendChild(item);
  });

  const highlightsGrid = document.createElement('div');
  highlightsGrid.className = 'about__grid';

  about.highlights.forEach((highlight) => {
    const item = document.createElement('div');
    item.className = 'about__item';
    item.innerHTML = `
      <h3>${highlight.title}</h3>
      <p>${highlight.description}</p>
    `;
    highlightsGrid.appendChild(item);
  });

  container.append(summary, highlightsGrid);
};

const createSkillsSection = () => {
  const container = document.querySelector('[data-section="skills"]');
  if (!container) return;

  skills.forEach((group) => {
    const wrapper = document.createElement('div');
    wrapper.className = 'skills__group';
    const heading = document.createElement('h3');
    heading.textContent = group.group;

    const pillRow = document.createElement('div');
    pillRow.className = 'pill-row';

    group.items.forEach((item) => {
      const pill = document.createElement('span');
      pill.className = 'pill';
      pill.textContent = item;
      pillRow.appendChild(pill);
    });

    wrapper.append(heading, pillRow);
    container.appendChild(wrapper);
  });
};

const createExperienceSection = () => {
  const container = document.querySelector('[data-section="experience"]');
  if (!container) return;

  container.classList.add('experience');

  experience.forEach((role) => {
    const card = document.createElement('article');
    card.className = 'experience__item';
    card.innerHTML = `
      <header>
        <h3>${role.role}</h3>
        <span>${role.organization}</span>
        <div class="experience__meta">
          <span>${role.timeframe}</span>
          <span>${role.location}</span>
        </div>
      </header>
    `;

    const list = document.createElement('ul');
    list.className = 'experience__list';
    role.achievements.forEach((achievement) => {
      const item = document.createElement('li');
      item.textContent = achievement;
      list.appendChild(item);
    });

    card.appendChild(list);
    container.appendChild(card);
  });
};

const createProjectsSection = () => {
  const container = document.querySelector('[data-section="projects"]');
  if (!container) return;

  container.classList.add('project-grid');

  projects.forEach((project) => {
    const card = document.createElement('article');
    card.className = 'project-card';
    card.innerHTML = `
      <h3>${project.name}</h3>
      <p>${project.description}</p>
    `;

    const meta = document.createElement('div');
    meta.className = 'project-card__meta';
    project.tech.forEach((tech) => {
      const pill = document.createElement('span');
      pill.className = 'pill';
      pill.textContent = tech;
      meta.appendChild(pill);
    });

    const highlightList = document.createElement('ul');
    highlightList.className = 'experience__list';
    project.highlights.forEach((highlight) => {
      const item = document.createElement('li');
      item.textContent = highlight;
      highlightList.appendChild(item);
    });

    const links = document.createElement('div');
    links.className = 'project-card__links';
    if (project.links.github) {
      const github = document.createElement('a');
      github.href = project.links.github;
      github.textContent = 'Code';
      github.setAttribute('target', '_blank');
      github.setAttribute('rel', 'noreferrer');
      links.appendChild(github);
    }
    if (project.links.demo) {
      const demo = document.createElement('a');
      demo.href = project.links.demo;
      demo.textContent = 'Demo';
      demo.setAttribute('target', '_blank');
      demo.setAttribute('rel', 'noreferrer');
      links.appendChild(demo);
    }

    card.append(meta, highlightList, links);
    container.appendChild(card);
  });
};

const setContactSection = () => {
  const emailLink = document.querySelector('#contact .button--primary');
  if (emailLink && contact.email) {
    emailLink.href = `mailto:${contact.email}`;
    emailLink.textContent = `Email ${contact.email}`;
  }
};

const enableScrollHints = () => {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    },
    { threshold: 0.15 }
  );

  document.querySelectorAll('.section').forEach((section) => {
    observer.observe(section);
  });
};

const setupSmoothButtonScroll = () => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (event) => {
      const targetId = link.getAttribute('href');
      if (!targetId || targetId.length === 0 || targetId === '#') return;

      const targetElement = document.querySelector(targetId);
      if (!targetElement) return;

      event.preventDefault();

      if (link.classList.contains('button')) {
        link.classList.add('is-pressed');
        window.setTimeout(() => link.classList.remove('is-pressed'), 650);
      }

      targetElement.scrollIntoView({
        behavior: prefersReducedMotion.matches ? 'auto' : 'smooth',
        block: 'start',
      });
    });
  });
};

createAboutSection();
createSkillsSection();
createExperienceSection();
createProjectsSection();
setContactSection();
enableScrollHints();
setupSmoothButtonScroll();

