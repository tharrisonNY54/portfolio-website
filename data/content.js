export const about = {
  summary: [
    "Sophomore computer science student at the University of [Your School], focused on building human-centered products that blend software engineering with design thinking.",
    "Actively seeking Summer 2026 internships to contribute to high-impact development teams while deepening experience in full-stack development and applied AI.",
  ],
  highlights: [
    {
      title: "Leadership",
      description:
        "Lead campus hackathon teams and mentor peers through CS study groups, emphasizing collaborative problem solving.",
    },
    {
      title: "Product Mindset",
      description:
        "Pair strong engineering fundamentals with UX sensitivity to ship polished solutions that delight users.",
    },
    {
      title: "Community Impact",
      description: "Volunteer instructor teaching Python basics to high-school students in underrepresented communities.",
    },
  ],
};

export const skills = [
  {
    group: "Languages",
    items: ["TypeScript", "JavaScript", "Python", "C++", "Java"],
  },
  {
    group: "Frameworks & Tools",
    items: ["React", "Tailwind CSS", "Node.js", "Express", "PostgreSQL", "Firebase", "AWS (Basics)"],
  },
  {
    group: "Focus Areas",
    items: ["Front-end Engineering", "UX Prototyping", "APIs & Microservices", "Data Visualization"],
  },
];

export const experience = [
  {
    role: "Software Engineering Intern",
    organization: "TechLaunch Labs",
    timeframe: "Summer 2024",
    location: "Remote",
    achievements: [
      "Built an internal dashboard with React + Flask that visualized KPI trends, cutting reporting time by 40%.",
      "Implemented reusable UI components and accessibility upgrades, ensuring WCAG AA compliance.",
      "Collaborated with product and design to ship feature updates used daily by 120+ stakeholders.",
    ],
  },
  {
    role: "Undergraduate Research Assistant",
    organization: "Human-Centered Computing Lab",
    timeframe: "Fall 2024 – Present",
    location: "New York, NY",
    achievements: [
      "Designed experiments to evaluate AR/VR interfaces supporting collaborative learning scenarios.",
      "Developed data pipelines in Python to analyze interaction telemetry and surface retention insights.",
      "Co-authored a poster accepted to the CHI 2025 student research competition.",
    ],
  },
];

export const projects = [
  {
    name: "Campus Navigator",
    description:
      "Interactive campus map that surfaces accessible routes and real-time shuttle data, helping students optimize travel time between classes.",
    tech: ["React", "Leaflet", "Node.js", "Tailwind"],
    links: {
      github: "https://github.com/tharrisonNY54/campus-navigator",
      demo: "https://campus-navigator.example.com",
    },
    highlights: [
      "Implemented performant geospatial rendering for 500+ campus locations with lazy-loaded tiles.",
      "Partnered with student services to integrate accessibility metadata sourced from maintenance teams.",
    ],
  },
  {
    name: "MealMatch AI",
    description:
      "Recommendation engine connecting campus dining menus with dietary preferences using NLP-driven tagging.",
    tech: ["Python", "FastAPI", "React", "PostgreSQL"],
    links: {
      github: "https://github.com/tharrisonNY54/mealmatch-ai",
      demo: null,
    },
    highlights: [
      "Processed 10K+ menu items to generate embeddings and flavor profiles, improving recommendation accuracy by 32%.",
      "Deployed REST API with role-based auth and observability via Prometheus + Grafana.",
    ],
  },
  {
    name: "Pulse Planner",
    description:
      "Cross-platform mobile app helping student organizations coordinate events, track RSVPs, and automate follow-ups.",
    tech: ["React Native", "Expo", "Firebase", "Figma"],
    links: {
      github: "https://github.com/tharrisonNY54/pulse-planner",
      demo: null,
    },
    highlights: [
      "Shipped MVP in 48 hours during HackNY hackathon and secured 2nd place out of 60 teams.",
      "Implemented push notification workflows that boosted RSVP confirmations by 25%.",
    ],
  },
];

export const contact = {
  email: "trey.harrison@example.com",
};


