export const about = {
  summary: [
    "Computer science major at the University of Arizona’s W.A. Franke Honors College (Class of 2028) with minors in Mathematics and Artificial Intelligence.",
    "Designing AI and XR experiences that capture human stories through volumetric media, robotics, and research-backed product development.",
  ],
  highlights: [
    {
      title: "Honors & Awards",
      description:
        "Honors Research and Creative Inquiry Award, Innovation Award, and Wildcat Distinction Scholarship recognizing academic excellence and impact.",
    },
    {
      title: "Immersive Storytelling",
      description:
        "Develop volumetric capture pipelines and immersive museum exhibits showcased in Curaçao and Tucson.",
    },
    {
      title: "Collaborative Builder",
      description:
        "Bridge interdisciplinary teams across museums, research labs, and campus partners to deliver human-centered technology.",
    },
  ],
};

export const skills = [
  {
    group: "Programming",
    items: ["Java", "JavaScript", "Python"],
  },
  {
    group: "Frameworks & Platforms",
    items: ["React", "Node.js", "AWS SES", "Firebase", "Blender", "8th Wall"],
  },
  {
    group: "AI & XR",
    items: ["Gaussian Splatting", "Photogrammetry", "RAG Pipelines", "Volumetric Capture", "llama.cpp", "ChromaDB"],
  },
  {
    group: "Data & Tools",
    items: ["PostgreSQL", "Git", "Q#", "ChromaDB"],
  },
];

export const experience = [
  {
    role: "Student Developer",
    organization: "Center for Digital Humanities, University of Arizona",
    timeframe: "May 2025 – Present",
    location: "Tucson, AZ",
    achievements: [
      "Developed a messaging system for a TEMI robot that allows visitors and staff to record and deliver messages to faculty.",
      "Selected by the Government of Curaçao to implement volumetric capture and VR infrastructure for national museum exhibits.",
      "Captured and processed volumetric recordings of Holocaust survivors and keynote speakers, deploying immersive 3D exhibits with Niantic 8th Wall.",
    ],
  },
  {
    role: "Research Developer",
    organization: "AI & XR Studio, University of Arizona",
    timeframe: "January 2025 – May 2025",
    location: "Tucson, AZ",
    achievements: [
      "Built a Quantum Computing AI chatbot with a custom RAG pipeline leveraging Q# documentation and a Hugging Face Mistral model.",
      "Captured 360° video of Tucson landmarks for Pima County Visitor Center experiences.",
      "Integrated the chatbot into a multimodal web platform alongside graduate researchers.",
    ],
  },
];

export const projects = [
  {
    name: "TEMI Robot Messaging Service",
    description:
      "End-to-end voice message delivery system that connects visitors and faculty through the TEMI robot, including offline resilience and local storage.",
    tech: ["Android Studio", "Java", "AWS SES"],
    links: {
      github: null,
      demo: null,
    },
    highlights: [
      "Mapped building layouts to enable autonomous navigation and targeted message delivery.",
      "Engineered fallback workflows to ensure messages send even without network connectivity.",
    ],
  },
  {
    name: "Quantum Computing AI Chatbot",
    description:
      "Full-stack RAG chatbot that surfaces Q# documentation snippets to support quantum programming education and research demos.",
    tech: ["React", "Node.js", "Hugging Face", "PostgreSQL"],
    links: {
      github: null,
      demo: null,
    },
    highlights: [
      "Pipelines relevant context into a Mistral-7B model using llama.cpp for low-latency inference.",
      "Showcased live at a University of Arizona technology event, earning the Innovation Award.",
    ],
  },
  {
    name: "Volumetric Capture & 3D Mapping",
    description:
      "Niantic 8th Wall installation showcasing volumetric interviews from community members across Tucson and Curaçao.",
    tech: ["Niantic 8th Wall", "Gaussian Splatting", "Insta360"],
    links: {
      github: null,
      demo: null,
    },
    highlights: [
      "Processed volumetric recordings and Gaussian splats to create immersive museum exhibits.",
      "Collaborated with international partners to deploy XR experiences for cultural storytelling.",
    ],
  },
];

export const contact = {
  email: "treyh413@outlook.com",
};
