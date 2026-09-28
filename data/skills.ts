export type Skill = { name: string; facets: [string, string, string] };

/** Row one, moves left. */
export const skillsRowA: Skill[] = [
  { name: "React", facets: ["Component architecture", "State management", "Front-end systems"] },
  { name: "Next.js", facets: ["App router", "Server components", "Image + font pipeline"] },
  { name: "TypeScript", facets: ["Strict types", "Domain modelling", "Safer refactors"] },
  { name: "C#", facets: [".NET 10", "Windows Forms", "SQL Server clients"] },
  { name: "Electron", facets: ["Desktop apps", "Preload IPC bridge", "Windows installers"] },
  { name: "SQL", facets: ["Schema design", "Normalisation", "Row-level security"] },
  { name: "Figma", facets: ["UI design", "Prototyping", "Design systems"] },
];

/** Row two, moves right. */
export const skillsRowB: Skill[] = [
  { name: "Python", facets: ["Flask", "TensorFlow / Keras", "MediaPipe pipelines"] },
  { name: "Node.js", facets: ["Express", "Service layers", "Puppeteer reporting"] },
  { name: "REST API", facets: ["Resource design", "Validation", "Auth middleware"] },
  { name: "UI / UX", facets: ["Personas", "Usability testing", "Information architecture"] },
  { name: "System Design", facets: ["Multi-tenant isolation", "Transactions", "Three-tier / MVC"] },
  { name: "GSAP", facets: ["ScrollTrigger", "Timelines", "Pinned storytelling"] },
  { name: "Supabase", facets: ["Postgres + RLS", "Auth", "Edge functions"] },
];
