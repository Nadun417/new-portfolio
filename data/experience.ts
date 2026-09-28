export type TimelineItem = {
  period: string;
  title: string;
  sub: string;
  org: string;
  note?: string;
  kind: "education" | "work";
};

export const timeline: TimelineItem[] = [
  {
    period: "2026 to 2027",
    title: "BEng (Hons)",
    sub: "Software Engineering (Top-Up)",
    org: "London Metropolitan University",
    note: "Final year. Dissertation: BodyTalk.",
    kind: "education",
  },
  {
    period: "2025 to 2026",
    title: "People & Papers",
    sub: "Cloud payroll platform, live client project",
    org: "React · TypeScript · Supabase · Vercel",
    note: "Multi-tenant payroll for a paying client, delivered with handover docs.",
    kind: "work",
  },
  {
    period: "2024 to 2026",
    title: "BTEC HND",
    sub: "Computing / Software Engineering",
    org: "ESOFT Metro Campus",
    note: "Grade: Distinction.",
    kind: "education",
  },
  {
    period: "2023 to 2024",
    title: "Diploma",
    sub: "Information Technology",
    org: "ESOFT Metro Campus",
    note: "Grade: Distinction.",
    kind: "education",
  },
  {
    period: "2021 / 2022",
    title: "G.C.E. A/L",
    sub: "Physical Science stream",
    org: "Mahinda College Galle",
    kind: "education",
  },
];
