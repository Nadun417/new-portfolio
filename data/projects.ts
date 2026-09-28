/**
 * Portfolio projects: the single data source for the showcase and every
 * case-study page. Every claim here should be traceable to the project's
 * repository, README or CV; keep it that way when editing.
 * Numbers ("01", "02", …) follow array order.
 */

import { pad2 } from "@/lib/utils";

export type Project = {
  number: string;
  slug: string;
  title: string;
  tagline: [string, string];
  category: string;
  categoryList: string[];
  year: string;
  role: string;
  stack: string[];
  description: string;
  /** card: portrait 4:5 (showcase) · hero: landscape 16:9 (case-study header + banner) */
  media: { card: string; hero: string; alt: string };
  /** repo is omitted only for private client work */
  links: { live?: string; repo?: string };
  caseStudy: {
    overview: string;
    /** why the project exists, in one or two short paragraphs */
    context: string[];
    /** what it does, one line each */
    features: string[];
    /** hard numbers only */
    facts?: { stat: string; label: string }[];
  };
};

const media = (slug: string, alt: string) => ({
  card: `/media/projects/${slug}-card.jpg`,
  hero: `/media/projects/${slug}-hero.jpg`,
  alt,
});

const list: Omit<Project, "number">[] = [
  {
    slug: "bodytalk",
    title: "BodyTalk",
    tagline: ["Interview body-language", "feedback, fully offline"],
    category: "AI / Computer Vision / Desktop",
    categoryList: ["Computer Vision", "MediaPipe", "Electron", "Final-year project"],
    year: "2026",
    role: "Design and development",
    stack: ["Electron", "React", "TypeScript", "Python", "MediaPipe", "SQLite", "Vitest", "pytest"],
    description:
      "A privacy-first Windows desktop app that analyses interview practice videos on the device and returns timestamped feedback on body language.",
    media: media("bodytalk", "BodyTalk: a wooden mannequin seated as if in an interview, its joints marked with orange pose landmarks"),
    links: { repo: "https://github.com/Nadun417/BodyTalk-system" },
    caseStudy: {
      overview:
        "My BEng (Hons) final-year project. Upload a practice interview clip and BodyTalk returns timestamped feedback on what was visible (posture, gaze, gestures) without the video ever leaving your machine.",
      context: [
        "Candidates rehearse their answers but rarely get specific feedback on nonverbal behaviour, and uploading a personal interview recording to a cloud service is a privacy risk.",
        "BodyTalk runs the whole analysis locally and never touches the network while it runs. Its feedback describes only what was visible, never how someone felt or how they would fare in a real interview.",
      ],
      features: [
        "On-device pipeline: frame extraction, then MediaPipe Holistic for face, pose and hand landmarks",
        "Three parallel channel analysers combined by confidence-weighted adaptive fusion, the project's research contribution",
        "A fixed-weight fusion baseline behind the same interface, so both methods can be compared on one video",
        "Interactive dashboard with timestamped insights and a weight-over-time chart",
        "PDF session report and session history stored in SQLite",
        "Sandboxed renderer that reaches the backend only through a preload bridge",
        "Windows installer, with 12 automated test suites across Vitest and pytest",
      ],
      facts: [
        { stat: "100%", label: "on-device processing" },
        { stat: "3", label: "channels fused" },
        { stat: "12", label: "automated test suites" },
      ],
    },
  },
  {
    slug: "fintrack",
    title: "FinTrack",
    tagline: ["Personal finance", "dashboard"],
    category: "Full-stack / Supabase / Data viz",
    categoryList: ["Full-stack", "Supabase", "Row-level security", "Chart.js"],
    year: "2026",
    role: "Full-stack development",
    stack: ["JavaScript", "Vite", "Supabase", "PostgreSQL", "Chart.js 4", "Vercel"],
    description:
      "A deployed personal finance app for expenses, budgets and income across multiple profiles, with every row locked to its owner by row-level security.",
    media: media("fintrack", "FinTrack: stacked ceramic coins forming a bar chart beside a segmented ring, traced by an orange line"),
    links: { live: "https://fin-track-vert-omega.vercel.app", repo: "https://github.com/Nadun417/FinTrack" },
    caseStudy: {
      overview:
        "FinTrack lets you log expenses, set a monthly budget and income, and see where the money went, across as many separate profiles as you need.",
      context: [
        "Budget tracking for more than one context (personal, family, a side project) without spreadsheets, and with a database-level guarantee that no user can read another user's data.",
      ],
      features: [
        "Expense tracking with eight default categories plus unlimited custom, colour-coded ones",
        "Monthly budget and income targets with a live progress bar and automatic net savings",
        "Multiple profiles per account, each with its own expenses, categories and currency (11 supported)",
        "Doughnut, bar and line charts with Chart.js 4 that update as the data changes",
        "CSV export with injection protection, plus full JSON backup and restore",
        "Email and password sign-up, confirmation and reset through Supabase Auth",
        "Row-level security on every table; CSP and HSTS headers configured on Vercel",
      ],
      facts: [
        { stat: "6", label: "SQL migrations" },
        { stat: "3", label: "chart types" },
        { stat: "Live", label: "on Vercel" },
      ],
    },
  },
  {
    slug: "srmss",
    title: "SRMSS",
    tagline: ["Smart route management", "& scheduling system"],
    category: "Full-stack / Multi-tenant / Maps",
    categoryList: ["Node.js", "Multi-tenant", "RBAC", "Google Maps"],
    year: "2026",
    role: "Full-stack development",
    stack: ["Node.js", "Express", "EJS", "MySQL", "Bootstrap 5", "Google Maps API", "Chart.js", "Puppeteer"],
    description:
      "Multi-tenant bus fleet management for transport depots: drivers, vehicles, routes and schedules, with double-booking caught inside database transactions.",
    media: media("srmss", "SRMSS: three model buses in a depot, surrounded by orange route threads strung between brass pins"),
    links: { repo: "https://github.com/Nadun417/Smart-Route-Management-and-Scheduling-System" },
    caseStudy: {
      overview:
        "A bus fleet management system for SLTB depots, built as Advanced Software Engineering coursework: roughly 10,200 lines split across controllers, services and data access objects.",
      context: [
        "Each depot manages its own drivers, vehicles, routes and schedules and must never see another depot's data. Scheduling also has to catch a driver or vehicle being booked twice before it happens.",
      ],
      features: [
        "Session authentication with role-based access control and depot-level data scoping in middleware",
        "Depot, driver and vehicle management, including licence-expiry alerts",
        "Route builder on Google Maps: places search, real-road directions and map-marked stops, with a Haversine fallback",
        "Schedule conflict detection inside database transactions, separating blocking conflicts from advisory warnings",
        "Fuel and maintenance logs",
        "Depot dashboard with Chart.js and PDF reports generated with Puppeteer",
        "bcrypt, helmet, CSRF protection, express-validator and parameterised SQL throughout",
      ],
      facts: [
        { stat: "10.2k", label: "lines of code" },
        { stat: "10", label: "modules delivered" },
        { stat: "3", label: "tiers" },
      ],
    },
  },
  {
    slug: "wildlife-chatbot",
    title: "Wildlife Chatbot",
    tagline: ["Sri Lanka wildlife guide", "that learns from feedback"],
    category: "Machine Learning / NLP / Flask",
    categoryList: ["Machine Learning", "NLP", "Flask", "TensorFlow"],
    year: "2026",
    role: "Model, training data and web app",
    stack: ["Python", "Flask", "TensorFlow / Keras", "NLTK", "NumPy"],
    description:
      "A neural-network chatbot for Sri Lanka's national parks (animals, entry fees, directions, seasons and safaris) that retrains itself from user corrections.",
    media: media("wildlife-chatbot", "Wildlife Chatbot: carved elephant and leopard figures on a contour map beside a paper speech bubble"),
    links: { repo: "https://github.com/Nadun417/Wildlife-Chatbot" },
    caseStudy: {
      overview:
        "Ask about Yala's leopards or when the elephants gather at Minneriya: the chatbot classifies the intent of each question and answers, and user corrections feed back into the model.",
      context: [
        "One conversational guide to seven major parks: Yala, Udawalawe, Wilpattu, Minneriya, Horton Plains, Bundala and Sinharaja.",
      ],
      features: [
        "Intent classification with a bag-of-words neural network in TensorFlow/Keras",
        "Flask web chat interface, plus a command-line version for quick testing",
        "Thumbs-up feedback reinforces the matched pattern in the training data",
        "Thumbs-down lets the user supply the correct intent; after five corrections the model retrains automatically",
        "JSON endpoints for chat, feedback, corrections, intent tags and training status",
      ],
      facts: [
        { stat: "7", label: "national parks" },
        { stat: "5", label: "corrections per retrain" },
        { stat: "300", label: "training epochs" },
      ],
    },
  },
  {
    slug: "smartmed",
    title: "SmartMed",
    tagline: ["Pharmacy & medicine", "management system"],
    category: "Desktop / C# / SQL Server",
    categoryList: ["C#", "Windows Forms", "SQL Server", "OOP"],
    year: "2026",
    role: "Analysis, database design, development and testing",
    stack: ["C#", ".NET 10", "Windows Forms", "SQL Server", "ADO.NET"],
    description:
      "A Windows desktop pharmacy system with separate administrator and customer roles: medicines, orders, cart, order tracking and reports.",
    media: media("smartmed", "SmartMed: white capsules in a grid before a row of black medicine bottles, one capsule orange"),
    links: { repo: "https://github.com/Nadun417/SmartMed-System" },
    caseStudy: {
      overview:
        "SmartMed brings a pharmacy's medicines, customers and orders into one desktop application, with separate experiences for administrators and customers.",
      context: [
        "Built as an object-oriented programming project: a working pharmacy system that also demonstrates classes, inheritance, polymorphism, collections, validation and database access in C#.",
      ],
      features: [
        "Admin dashboard with total sales, medicine count and active orders",
        "Medicine records with dosage, price, stock, expiry date, category, supplier and a prescription-required flag",
        "Customer and order management, including order-status updates",
        "Customers register, search by name and price range, fill a cart, place orders and track them",
        "Stock reduced automatically when an order is placed",
        "Sales, low-stock and order-history reports with CSV export",
        "Parameterised SQL queries, input validation and handled database errors",
        "ERD, class, use-case and architecture diagrams, a user manual and 16 recorded test cases",
      ],
      facts: [
        { stat: "12", label: "forms" },
        { stat: "7", label: "database tables" },
        { stat: "16", label: "recorded test cases" },
      ],
    },
  },
  {
    slug: "velora",
    title: "Velora",
    tagline: ["Beauty atelier website,", "a front-end showcase"],
    category: "Front-end / Next.js / Motion",
    categoryList: ["Next.js", "TypeScript", "Framer Motion", "Accessibility"],
    year: "2026",
    role: "Design and front-end development",
    stack: ["Next.js", "React", "TypeScript", "Tailwind CSS", "Framer Motion", "Lenis"],
    description:
      "A five-page website for a fictional Colombo beauty salon, built as a front-end assessment, with an editorial layout, considered motion and a five-step booking flow.",
    media: media("velora", "Velora: an arched brass mirror with a makeup brush, ceramic dish and an orange lipstick"),
    links: { live: "https://velora-beauty-atelier.netlify.app/", repo: "https://github.com/Nadun417/Velora-Beauty-Atelier" },
    caseStudy: {
      overview:
        "Velora is a fictional beauty salon in Colombo. The aim was to make a salon site feel closer to a fashion or design studio than the usual template of three service cards and a contact form.",
      context: [
        "Built as a front-end assessment and deliberately front-end only: no backend, database or payments. The booking wizard says so on its final screen.",
      ],
      features: [
        "Five pages: home, a filterable services menu, artist profiles, a journal and booking",
        "Home page with a video hero, a word-by-word manifesto and a lookbook that moves sideways as you scroll",
        "Five-step booking flow (service, artist, date and time, details, confirmation) with an add-to-calendar file",
        "Form errors are announced and focus moves to the first field that needs attention",
        "Each breakpoint laid out on its own terms: swipe gallery, tap accordion and a full-screen menu on phones",
        "Skip link, focus-trapped menu, correct ARIA state and full keyboard support; reduced motion respected throughout",
        "Typed content in data files, next/image and next/font, and a hero video compressed to about 1 MB",
      ],
      facts: [
        { stat: "5", label: "pages" },
        { stat: "5", label: "booking steps" },
      ],
    },
  },
  {
    slug: "fee-management-system",
    title: "Fee Management System",
    tagline: ["Monthly fee calculation", "for KickBlast Judo"],
    category: "Desktop / C# / SQL Server",
    categoryList: ["C#", ".NET Framework", "Windows Forms", "SQL Server"],
    year: "2025",
    role: "Analysis and development",
    stack: ["C#", ".NET Framework 4.7.2", "Windows Forms", "SQL Server"],
    description:
      "A Windows desktop application that automates monthly training-fee calculation for a judo academy: athletes, competitions, fees and bills.",
    media: media("fee-management-system", "Fee Management System: a folded judo uniform with a black belt beside a calendar of wooden tiles and a clipped receipt"),
    links: { repo: "https://github.com/Nadun417/Fee-Management-System" },
    caseStudy: {
      overview:
        "KickBlast Judo worked out each athlete's monthly fee by hand. This desktop app registers athletes, records competition entries and calculates the month's bill automatically.",
      context: [
        "An athlete's fee depends on their training plan, any private coaching hours and how many competitions they entered that month. Calculated by hand, that invites errors, so the rules live in code instead.",
      ],
      features: [
        "Admin and staff logins, with user and employee registration",
        "Athlete registration with training plan (Beginner, Intermediate or Elite) and current weight",
        "Competition entries checked against six judo weight categories; beginners cannot enter",
        "Monthly fee: weekly plan fee × 4, private coaching at Rs 90.50 an hour, Rs 220 per competition",
        "Fees saved per athlete and month, with a bill view",
      ],
      facts: [
        { stat: "8", label: "forms" },
        { stat: "5", label: "database tables" },
        { stat: "6", label: "weight categories" },
      ],
    },
  },
  {
    slug: "velvet-vogue",
    title: "Velvet Vogue",
    tagline: ["Fashion e-commerce store", "with an admin panel"],
    category: "Full-stack / PHP / MySQL",
    categoryList: ["PHP", "MySQL", "E-commerce", "Admin panel"],
    year: "2025",
    role: "Full-stack development",
    stack: ["PHP", "MySQL", "HTML", "CSS", "JavaScript"],
    description:
      "A full-stack fashion retail website with customer accounts, a shopping cart and an admin panel for products and orders.",
    media: media("velvet-vogue", "Velvet Vogue: a velvet dress, wool coat and white shirt on a clothing rail, with an orange price tag"),
    links: { repo: "https://github.com/Nadun417/E-Commerce-Website" },
    caseStudy: {
      overview:
        "Velvet Vogue is an online clothing store. Shoppers browse men's, women's and kids' collections and build a cart; administrators manage the catalogue and orders behind a separate login.",
      context: [
        "The full loop of a small online shop in plain PHP and MySQL: storefront, customer accounts, cart and the back office that keeps it running.",
      ],
      features: [
        "Storefront with new arrivals and men's, women's and kids' collections",
        "Product pages with size options and multiple images",
        "Customer registration, login and account page",
        "Shopping cart persisted in MySQL",
        "Admin dashboard showing total products, cart items, low-stock products and today's activity",
        "Admin tools to add, edit and list products and to manage orders and carts",
      ],
      facts: [
        { stat: "16", label: "PHP pages" },
        { stat: "2", label: "roles: shopper · admin" },
      ],
    },
  },
];

export const projects: Project[] = list.map((p, i) => ({ ...p, number: pad2(i + 1) }));

export const getProject = (slug: string) => projects.find((p) => p.slug === slug);
export const nextProject = (slug: string) => {
  const i = projects.findIndex((p) => p.slug === slug);
  return projects[(i + 1) % projects.length];
};
