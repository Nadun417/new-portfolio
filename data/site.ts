/**
 * Identity and global copy. This is the single source of truth, so edit here rather than in components.
 */
export const site = {
  name: "Nadun Mathuja",
  first: "Nadun",
  last: "Mathuja",
  brand: "NADUN™",
  role: "Digital Engineer",
  roleLine: "Software engineer with a designer's eye, building useful systems that feel considered.",
  location: "Galle, Sri Lanka",
  timeZone: "Asia/Colombo",
  year: "2026",
  email: "nadunmathuja@gmail.com",
  phone: "+94 74 06 30 246",
  socials: {
    github: "https://github.com/Nadun417",
    linkedin: "https://www.linkedin.com/in/nadun-mathuja",
  },
  nav: [
    { label: "Work", href: "/#work", id: "work" },
    { label: "About", href: "/#about", id: "about" },
    { label: "Contact", href: "/#contact", id: "contact" },
  ],
  hero: {
    labels: ["Software Engineering", "UI / UX", "Creative Development"],
    scroll: "Scroll to explore",
  },
  loader: {
    mark: "N / 26",
    words: ["Engineering", "Design", "Systems", "Experimentation"],
    steps: [0, 12, 38, 64, 87, 100],
  },
  manifesto: {
    lines: ["Engineering", "doesn't have", "to look", "boring."],
    intro:
      "Most software is built by people who only care about whether it runs. I care about whether it runs, whether it reads, and whether the person on the other side of the screen actually wants to use it.",
    pillars: [
      { n: "01", title: "Software engineering", body: "Three-tier and MVC architecture, transactions, role-based access, tested paths." },
      { n: "02", title: "UI / UX", body: "Personas, wireframes, usability testing, Figma prototypes that survive contact with users." },
      { n: "03", title: "Creative front-end", body: "Motion with intent. Typography as structure. Interfaces that explain themselves." },
      { n: "04", title: "Product thinking", body: "Requirements, KPIs and dashboards: software that answers a business question." },
    ],
  },
  about: {
    title: ["About", "Nadun"],
    labels: [
      { n: "01", t: "Engineering" },
      { n: "02", t: "Design" },
      { n: "03", t: "Product thinking" },
      { n: "04", t: "Creative development" },
    ],
    bio: [
      "I'm a software engineering undergraduate from Galle, Sri Lanka, finishing a BEng (Hons) after a Distinction in my HND. I build software that has to work for real people: a live payroll platform for a paying client, fleet, pharmacy and finance systems, and a 28-screen mobile product designed end to end in Figma.",
      "What I care about sits between disciplines: the schema and the layout, the transaction and the transition. I like requirements analysis as much as I like a well-timed easing curve.",
      "Currently open to internship, trainee and junior software engineering roles in Colombo, Galle or remote.",
    ],
    facts: [
      { k: "Based", v: "Galle, LK" },
      { k: "Study", v: "BEng (Hons) Software Eng." },
      { k: "Focus", v: "Full-stack · UI/UX · Motion" },
      { k: "Status", v: "Open to roles" },
    ],
  },
  contact: {
    lines: ["Let's", "build", "something", "good."],
    sub: "Have an idea, a role, or a problem worth solving? I answer every message.",
  },
} as const;

export type Site = typeof site;
