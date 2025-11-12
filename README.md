# Trey Harrison Portfolio

Single-page portfolio site for internship applications built with standard HTML, CSS, and vanilla JavaScript (no build tooling required). The layout takes inspiration from modern product landing pages with a focus on clean typography, high contrast, and habit-forming micro-interactions.

## Getting Started

1. Clone the repository and open the `index.html` file in your browser.
2. Update the structured data in `data/content.js` with your current resume content (summary, experience, projects, contact email).
3. Replace the placeholder resume file in `assets/Trey_Harrison_Resume.pdf` with your latest PDF.

HTML is organized into semantic sections (`about`, `skills`, `experience`, `projects`, `resume`, `contact`). JavaScript dynamically renders cards and lists using the data module, keeping content edits centralized.

## Customization

- **Branding:** Adjust colors, gradients, and typography tokens at the top of `css/styles.css`. All components reference these CSS variables for consistency.
- **Navigation:** Add or remove sections by editing the `<nav>` list in `index.html` and adding matching section markup.
- **Animations:** Intersection observers apply a subtle reveal effect. Opt out by removing `enableScrollHints()` from `js/main.js`.

## Deploying to GitHub Pages

1. Push the project to a GitHub repository named `portfolio`.
2. In repository settings, choose **Pages** → **Source: `main` branch** → **Root**.
3. (Optional) If you prefer a `/docs` deployment, move the site files into a `docs/` directory and select that folder under GitHub Pages settings.

Changes propagate after a short build delay (usually under a minute).

## Accessibility & Performance Notes

- Accessible color contrast and focus styles are included by default.
- Navigation menu collapses into a mobile-friendly drawer.
- Smooth scrolling respects `prefers-reduced-motion`.
- All external links open in new tabs and declare `rel="noreferrer"`.

## Roadmap Ideas

- Integrate analytics (e.g., GoatCounter) to track visits.
- Add an experience timeline visualization.
- Introduce a blog section backed by markdown content.
- Automate resume updates by linking to a shared cloud resource.


