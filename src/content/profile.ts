// Single source of truth for everything the site says about Aditya.
// Every claim here is either from the CV or confirmed by Aditya in chat.
// No phone number or street address: the site is public.

export const profile = {
  name: "Aditya Rahman Alfaridzi",
  shortName: "Aditya",
  title: "Senior QA Engineer",
  focus: "R&D for QA tooling",
  location: "South Tangerang, Indonesia",
  email: "adityalfaridzi@gmail.com",
  linkedin: "https://www.linkedin.com/in/adityalfaridzi/",
  headline:
    "Four years testing products at Traveloka and Gokomodo. Now I build the systems that do the testing.",
  summary:
    "Senior QA Engineer working on a trading system, with a second mandate: research and build internal tooling for the QA team. I treat model output the way I treat any other output under test: verify it, don't trust it.",
};

export type CaseStudy = {
  id: string;
  name: string;
  kicker: string;
  problem: string;
  approach: string;
  result: string;
  stack: string[];
  insight?: { quote: string; note: string };
};

// Ordered by weight: the two R&D systems lead, the framework is supporting.
export const caseStudies: CaseStudy[] = [
  {
    id: "bugpilot",
    name: "BugPilot",
    kicker: "RAG over internal product docs",
    problem:
      "Answers about product behavior lived in scattered PRDs. The same questions came up again and again in team chat.",
    approach:
      "A retrieval-augmented assistant over the PRD corpus: Voyage embeddings, vector search in pgvector, answers synthesized by Claude and delivered straight into Lark, where the team already works.",
    result:
      "In use as an internal system at the company. Designed so that \"not found\" is a valid answer: it would rather say it doesn't know than produce something that merely sounds right.",
    stack: ["Supabase Edge Functions", "Deno / TypeScript", "pgvector", "Voyage AI", "Claude", "Lark"],
    insight: {
      quote: "Not found is the correct answer, not a failure.",
      note: "The design rule behind the system prompt. Most of it is anti-hallucination constraints, not instructions on what to say.",
    },
  },
  {
    id: "tcms",
    name: "TCMS",
    kicker: "Test case management with an agentic generator",
    problem:
      "Writing test cases by hand is slow, inconsistent between people, and falls behind the code it is meant to cover.",
    approach:
      "A test management platform with a five-step agentic pipeline that drafts cases from Jira requirements and merge-request diffs, calibrated by stored team context. Similarity-based duplicate detection keeps generated suites from flooding. Exposed as an MCP server so it runs inside the QA workflow instead of beside it.",
    result:
      "55 tools spanning case authoring, plans, executions, trend reports, automation triggers, and Jira, Git and Lark integrations.",
    // Only what the tool surface proves. Language & Git host: unconfirmed, ask Aditya.
    stack: ["MCP", "Jira", "Git MR diffs", "Lark Sheets", "Agentic LLM pipeline"],
  },
  {
    id: "bdd-framework",
    name: "BDD Web Framework",
    kicker: "Framework design, not just scripts",
    problem:
      "BDD syntax usually costs you the test runner's native parallelism, tracing and reporting.",
    approach:
      "Playwright with playwright-bdd, so Gherkin compiles to native Playwright specs. Page Object Model, data-driven scenario outlines, trace on retry, video on failure, CI on every push.",
    result:
      "Readable scenarios without giving up the runner. The README states what was left out and how to add it (CI sharding across matrix jobs) instead of hiding it.",
    stack: ["Playwright", "TypeScript", "playwright-bdd", "Page Object Model", "GitHub Actions"],
  },
];

// Traveloka numbers, verbatim from the CV.
export const metrics = [
  { label: "Mobile E2E coverage", value: 86.07, target: 85, unit: "%" },
  { label: "Mobile E2E pass rate", value: 91.78, target: 80, unit: "%" },
  { label: "Web coverage", value: 100, unit: "%" },
  { label: "Web pass rate", value: 91.55, unit: "%" },
  { label: "MWeb pass rate", value: 94.14, unit: "%" },
] as const;

export const experience = [
  {
    company: "PT Surya Anugrah Mulya",
    role: "Senior QA Engineer",
    period: "Jun 2026 — Present",
    points: [
      "QA for a trading system.",
      "R&D for QA tooling: built BugPilot and TCMS for internal use.",
    ],
  },
  {
    company: "Traveloka",
    role: "QA Engineer",
    period: "Feb 2024 — May 2026",
    points: [
      "Led cross-squad automation across the Merchandising and User Identity domains.",
      "Mobile E2E coverage 86.07% against an 85% target; pass rate 91.78% against 80%.",
      "Caught crash-level bugs during automation runs, before staging or production.",
      "Pushed shift-left: test docs and automation prepared early in the cycle.",
    ],
  },
  {
    company: "PT Gokomodo Indonesia",
    role: "QA Engineer",
    period: "Feb 2022 — Feb 2024",
    points: [
      "Web and mobile testing: E2E, regression and sanity.",
      "API testing with Postman; test plans and cases in TestRail.",
    ],
  },
] as const;

// Job start dates as fractional years, newest last. Drives the 3D timeline.
export const milestones = [2022 + 1 / 12, 2024 + 1 / 12, 2026 + 5 / 12] as const;
export const timelineRange = [2021.6, 2027] as const;

export const education = {
  school: "Telkom University",
  degree: "B.Eng, Electrical Engineering",
  period: "2015 — 2019",
};

// Grouped by what the tool is for. No self-rated skill bars: unverifiable.
export const toolbelt = [
  { group: "Automation", items: ["Playwright", "Maestro", "Appium", "Karate"] },
  { group: "API & performance", items: ["Postman", "JMeter", "Proxyman"] },
  { group: "Test management", items: ["TestRail", "Jira", "TCMS (built)"] },
  { group: "AI & platform", items: ["MCP", "Claude", "pgvector", "Supabase", "Voyage AI"] },
] as const;

export const certifications = [
  "JMeter: Performance and Load Testing",
  "Software Testing Foundations: Test Techniques",
  "API Testing and Validation",
  "SQL (Basic)",
];
