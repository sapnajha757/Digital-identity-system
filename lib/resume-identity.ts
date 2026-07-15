export interface ResumeIdentity {
  resumeFileName: string;
  analyzedAt: string;
  contact: {
    name: string;
    email: string;
    phone: string;
  };
  links: {
    linkedin: string;
    github: string;
  };
  skills: string[];
  sectionsFound: string[];
  missingSections: string[];
  relationshipMap: string[];
  timeline: string[];
  recommendations: string[];
  score: number;
  textPreview: string;
}

const KNOWN_SKILLS = [
  "Python",
  "JavaScript",
  "TypeScript",
  "React",
  "Next.js",
  "Node.js",
  "Express",
  "FastAPI",
  "Django",
  "Flask",
  "Java",
  "C++",
  "C",
  "SQL",
  "PostgreSQL",
  "MongoDB",
  "Supabase",
  "Firebase",
  "Docker",
  "Kubernetes",
  "AWS",
  "Azure",
  "GCP",
  "Git",
  "GitHub",
  "Machine Learning",
  "Deep Learning",
  "NLP",
  "Data Science",
  "Pandas",
  "NumPy",
  "TensorFlow",
  "PyTorch",
  "HTML",
  "CSS",
  "Tailwind",
  "Figma",
];

const SECTION_CHECKS = [
  { label: "Education", pattern: /\b(education|degree|university|college|school|b\.?tech|bachelor|master)\b/i },
  { label: "Experience", pattern: /\b(experience|work history|employment|internship|intern)\b/i },
  { label: "Projects", pattern: /\b(projects?|portfolio)\b/i },
  { label: "Skills", pattern: /\b(skills?|technical skills|technologies)\b/i },
  { label: "Certifications", pattern: /\b(certifications?|certificate|certified)\b/i },
  { label: "Achievements", pattern: /\b(achievements?|awards?|honors?|winner|ranked)\b/i },
  { label: "Links", pattern: /\b(linkedin|github|portfolio|https?:\/\/)\b/i },
];

function cleanText(text: string) {
  return text
    .replace(/\\n/g, " ")
    .replace(/\\r/g, " ")
    .replace(/\\t/g, " ")
    .replace(/[^\x09\x0A\x0D\x20-\x7E]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function decodePdfLiteral(value: string) {
  return value
    .slice(1, -1)
    .replace(/\\\(/g, "(")
    .replace(/\\\)/g, ")")
    .replace(/\\\\/g, "\\")
    .replace(/\\n/g, " ")
    .replace(/\\r/g, " ")
    .replace(/\\t/g, " ");
}

export async function extractReadablePdfText(file: File) {
  const buffer = await file.arrayBuffer();
  const raw = new TextDecoder("latin1").decode(buffer);
  const literalMatches = raw.match(/\((?:\\.|[^\\)]){2,}\)/g) ?? [];
  const literalText = literalMatches.map(decodePdfLiteral).join(" ");
  const fallbackText = raw.replace(/[^\x09\x0A\x0D\x20-\x7E]/g, " ");
  const bestText = literalText.length > 120 ? literalText : fallbackText;

  return cleanText(bestText);
}

function findName(text: string, email: string) {
  const lines = text
    .split(/\s{2,}|[|•]/)
    .map((line) => line.trim())
    .filter(Boolean);

  const candidate = lines.find((line) => {
    const words = line.split(/\s+/);
    return (
      words.length >= 2 &&
      words.length <= 4 &&
      line.length <= 48 &&
      !line.includes("@") &&
      !line.toLowerCase().includes("resume") &&
      !line.toLowerCase().includes("curriculum") &&
      line !== email
    );
  });

  return candidate ?? "";
}

function getNearbyYearEvents(text: string) {
  const matches = [...text.matchAll(/\b(20\d{2}|19\d{2})\b/g)].slice(0, 5);
  return matches.map((match) => {
    const index = match.index ?? 0;
    const snippet = cleanText(text.slice(Math.max(0, index - 60), index + 100));
    return `${match[0]} - ${snippet.slice(0, 130)}`;
  });
}

export function analyzeResumeIdentity(
  text: string,
  resumeFileName: string,
  links: { linkedin: string; github: string }
): ResumeIdentity {
  const email = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0] ?? "";
  const phone =
    text.match(/(?:\+?\d[\d\s().-]{8,}\d)/)?.[0]?.replace(/\s+/g, " ").trim() ?? "";
  const name = findName(text, email);

  const skills = KNOWN_SKILLS.filter((skill) =>
    new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i").test(text)
  );

  const sectionsFound = SECTION_CHECKS.filter((section) => section.pattern.test(text)).map(
    (section) => section.label
  );
  const missingSections = SECTION_CHECKS.filter((section) => !section.pattern.test(text)).map(
    (section) => section.label
  );

  const relationshipMap = [
    skills.length ? `Skills detected -> ${skills.slice(0, 5).join(", ")}` : "",
    sectionsFound.includes("Projects") ? "Projects section -> portfolio evidence" : "",
    sectionsFound.includes("Experience") ? "Experience or internship section -> work history" : "",
    sectionsFound.includes("Certifications") ? "Certifications section -> skill evidence" : "",
    links.linkedin ? "LinkedIn link -> external professional profile" : "",
    links.github ? "GitHub link -> external project evidence" : "",
  ].filter(Boolean);

  const measurableImpact = /\b\d+%|\b\d+\+|\b\d{2,}\b/.test(text);
  const scoreParts = [
    email || phone ? 15 : 0,
    skills.length >= 5 ? 20 : skills.length >= 2 ? 12 : skills.length ? 6 : 0,
    sectionsFound.includes("Projects") ? 15 : 0,
    sectionsFound.includes("Experience") ? 15 : 0,
    sectionsFound.includes("Education") ? 10 : 0,
    sectionsFound.includes("Certifications") ? 8 : 0,
    links.linkedin ? 7 : 0,
    links.github ? 7 : 0,
    measurableImpact ? 3 : 0,
  ];
  const score = Math.min(100, scoreParts.reduce((sum, item) => sum + item, 0));

  const recommendations = [
    !email && !phone ? "Add contact information to the resume so the identity profile has a reliable contact anchor." : "",
    skills.length < 5 ? "Add a clear skills section with tools, languages, frameworks, and platforms actually used." : "",
    !sectionsFound.includes("Projects") ? "Add projects with problem, tech stack, role, and outcome." : "",
    !sectionsFound.includes("Experience") ? "Add internship, work, volunteer, or leadership experience if applicable." : "",
    !sectionsFound.includes("Certifications") ? "Add certificates or course credentials if available." : "",
    !links.linkedin ? "Add LinkedIn ID or URL to connect the resume with a public professional profile." : "",
    !links.github ? "Add GitHub ID or URL to connect projects with source-code evidence." : "",
    !measurableImpact ? "Add measurable outcomes where true, such as users, accuracy, speed, ranking, or scale." : "",
  ].filter(Boolean);

  return {
    resumeFileName,
    analyzedAt: new Date().toISOString(),
    contact: { name, email, phone },
    links,
    skills,
    sectionsFound,
    missingSections,
    relationshipMap,
    timeline: getNearbyYearEvents(text),
    recommendations,
    score,
    textPreview: text.slice(0, 900),
  };
}
