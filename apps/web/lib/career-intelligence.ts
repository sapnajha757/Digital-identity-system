// =========================================================
// CAREER INTELLIGENCE ENGINE — IdentityOS Phase 8
// Smart recommendations, career planning, simulation,
// resume optimization, and portfolio intelligence
// =========================================================

import { getMemory, IdentityHealthSnapshot } from "./ai-memory";

// =========================================================
// TYPES
// =========================================================

export interface SmartRecommendation {
  id: string;
  type: "skill" | "project" | "course" | "certification" | "hackathon" | "internship" | "resume" | "portfolio";
  title: string;
  description: string;
  why: string;
  confidence: number; // 0-1
  evidence: string[];
  estimatedImpact: string;
  timeToComplete: string;
  priority: "critical" | "high" | "medium" | "low";
  tags: string[];
  link?: string;
}

export interface RoadmapMilestone {
  week: number;
  title: string;
  description: string;
  type: "skill" | "project" | "certification" | "application" | "goal";
  status: "pending" | "in-progress" | "completed";
  skills: string[];
  evidence?: string;
}

export interface CareerRoadmap {
  type: "30-day" | "90-day" | "6-month" | "interview" | "placement" | "startup" | "higher-studies";
  goal: string;
  milestones: RoadmapMilestone[];
  userDataUsed: string[];
  successProbability: number;
  generatedAt: string;
}

export interface ATSAnalysis {
  score: number;
  grammarScore: number;
  keywordScore: number;
  actionVerbScore: number;
  technicalScore: number;
  impactScore: number;
  leadershipScore: number;
  suggestions: ATSSuggestion[];
  missingKeywords: string[];
  strongPoints: string[];
  overallGrade: "A+" | "A" | "B+" | "B" | "C" | "D";
}

export interface ATSSuggestion {
  id: string;
  category: "grammar" | "keyword" | "format" | "impact" | "skill" | "leadership";
  issue: string;
  fix: string;
  priority: "high" | "medium" | "low";
  example?: string;
}

export interface PortfolioEvaluation {
  overallScore: number;
  githubScore: number;
  documentationScore: number;
  deploymentScore: number;
  complexityScore: number;
  diversityScore: number;
  readmeScore: number;
  suggestions: PortfolioSuggestion[];
  strengths: string[];
  gaps: string[];
}

export interface PortfolioSuggestion {
  id: string;
  area: "github" | "documentation" | "deployment" | "readme" | "screenshot" | "diversity";
  issue: string;
  fix: string;
  impact: "high" | "medium" | "low";
}

export interface CareerSimulation {
  target: string;
  currentFitScore: number;
  predictedFitScore: number;
  timelineMonths: number;
  salaryRange: { min: number; max: number; currency: string };
  successProbability: number;
  missingSkills: { skill: string; importance: "critical" | "important" | "nice-to-have"; timeWeeks: number }[];
  existingStrengths: string[];
  recommendedSequence: string[];
  reasoning: string;
  confidence: number;
  marketDemand: "very-high" | "high" | "medium" | "low";
}

export interface ProactiveNotification {
  id: string;
  type: "warning" | "suggestion" | "achievement" | "gap" | "opportunity";
  title: string;
  message: string;
  context: string;
  actionLabel?: string;
  actionHref?: string;
  priority: "critical" | "high" | "medium" | "low";
  icon: string;
  dismissible: boolean;
  createdAt: string;
  evidence: string[];
}

// =========================================================
// DEMO DATA
// =========================================================

const DEMO_RECOMMENDATIONS: SmartRecommendation[] = [
  {
    id: "sr1",
    type: "skill",
    title: "Learn Kubernetes (K8s)",
    description: "Kubernetes is the industry standard for container orchestration, critical for deploying production ML models at scale.",
    why: "You have Docker expertise + AWS certification. Kubernetes is the natural progression and required by 92% of Senior AI/Cloud Engineering roles you'd qualify for.",
    confidence: 0.93,
    evidence: ["Docker skills found in Resume.pdf", "AWS certification validates cloud readiness", "3/3 recent job posts in your field mention K8s"],
    estimatedImpact: "+12 pts Identity Score · Unlocks 4 new role categories",
    timeToComplete: "4-6 weeks",
    priority: "critical",
    tags: ["DevOps", "Cloud", "Production", "Career"],
    link: "https://kubernetes.io/docs/tutorials/"
  },
  {
    id: "sr2",
    type: "certification",
    title: "Kubernetes CKA Certification",
    description: "Certified Kubernetes Administrator validates your production-grade orchestration skills with an industry-recognized credential.",
    why: "Your AWS cert + Docker shows cloud trajectory. CKA pairs perfectly and positions you for Staff Engineer tracks.",
    confidence: 0.88,
    evidence: ["AWS cert shows certification commitment", "Docker + K8s skill gap identified", "CKA appears in 68% of ML Infrastructure job descriptions"],
    estimatedImpact: "+8 pts Verification Score · Opens Staff Engineer path",
    timeToComplete: "8-10 weeks",
    priority: "high",
    tags: ["Certification", "Cloud", "DevOps"],
  },
  {
    id: "sr3",
    type: "project",
    title: "Build an LLM Agent with Tool Calling",
    description: "Create a multi-tool LLM agent using LangGraph or CrewAI that autonomously executes real tasks — the bleeding edge of AI engineering.",
    why: "You've mastered RAG (IdentityOS). The next leap is autonomous agents. This project would be the crown jewel of your portfolio.",
    confidence: 0.91,
    evidence: ["RAG implementation found in Portfolio.pdf", "Python + FastAPI foundation verified", "LLM Agent projects trending 340% in hiring"],
    estimatedImpact: "+15 pts Career Readiness · Top 5% AI portfolio signal",
    timeToComplete: "3-4 weeks",
    priority: "critical",
    tags: ["AI", "LLM", "Agents", "Portfolio"],
  },
  {
    id: "sr4",
    type: "course",
    title: "MLOps with MLflow & DVC",
    description: "Production ML pipelines with experiment tracking, model versioning, and automated deployment — the gap between research and production.",
    why: "You train models but graph analysis shows no evidence of MLflow/DVC usage. This is the missing piece for senior ML Engineer positions.",
    confidence: 0.87,
    evidence: ["PyTorch skills from Internship_Letter.pdf", "No MLflow found in any uploaded document", "MLOps proficiency required by 78% of Senior ML roles"],
    estimatedImpact: "+9 pts Skill Diversity · Senior ML Engineer readiness",
    timeToComplete: "3 weeks",
    priority: "high",
    tags: ["MLOps", "Production", "DevOps", "ML"],
  },
  {
    id: "sr5",
    type: "project",
    title: "Open Source Contribution — Hugging Face",
    description: "Contribute to a Hugging Face library (transformers, datasets, or diffusers). Even one merged PR is a powerful signal.",
    why: "Your AI profile is strong but has zero open-source presence. A HuggingFace contribution would be the highest-signal career move for your trajectory.",
    confidence: 0.82,
    evidence: ["ML specialization confirmed via 3 documents", "No GitHub link found in any document", "Open source contributions in top 5 filters for AI roles at Google/Meta"],
    estimatedImpact: "+11 pts Portfolio Score · Elite company signal",
    timeToComplete: "2-4 weeks",
    priority: "high",
    tags: ["Open Source", "AI", "Community", "Portfolio"],
  },
  {
    id: "sr6",
    type: "resume",
    title: "Quantify Project Impact with Metrics",
    description: "Replace vague project descriptions with specific numbers: users, performance gains, latency improvements, dataset sizes.",
    why: "Resume.pdf currently says 'built ML models' without impact metrics. ATS and recruiters rank quantified achievements 3x higher.",
    confidence: 0.95,
    evidence: ["Resume.pdf analyzed: 0 numerical impact metrics found", "ATS keyword analysis shows 34% keyword match vs 72% target", "Recruiters spend avg 6.2 seconds on resumes — numbers drive attention"],
    estimatedImpact: "+18 pts ATS Score · 2.4x interview conversion rate",
    timeToComplete: "2-3 hours",
    priority: "critical",
    tags: ["Resume", "ATS", "Career"],
  },
  {
    id: "sr7",
    type: "internship",
    title: "Apply to Google AI Residency 2026",
    description: "Google's AI Residency program selects 20 engineers globally. Your ML + systems background is a strong fit.",
    why: "ML internship + AWS + Python + research paper = strong profile for elite programs. Window opens Q4 2026.",
    confidence: 0.76,
    evidence: ["ML internship verified in documents", "Research paper achievement in profile", "Google AI Residency accepts candidates with 2+ ML projects"],
    estimatedImpact: "Transformative career opportunity",
    timeToComplete: "Apply in Oct 2026",
    priority: "medium",
    tags: ["Internship", "Google", "AI", "Elite"],
  },
  {
    id: "sr8",
    type: "portfolio",
    title: "Add Live Deployment Screenshots",
    description: "Screenshot every deployed project with a URL — IdentityOS, the React Dashboard, and the ML Pipeline.",
    why: "Portfolio.pdf describes live projects but zero screenshots exist. Recruiters want to see running products, not just descriptions.",
    confidence: 0.91,
    evidence: ["Portfolio.pdf contains 3 project descriptions with no images", "React_Project_Report.pdf mentions 'deployed to Vercel' without URL", "Portfolio completeness: 71% — screenshots alone add 12 pts"],
    estimatedImpact: "+12 pts Portfolio Intelligence · 60% more recruiter engagement",
    timeToComplete: "30 minutes",
    priority: "high",
    tags: ["Portfolio", "Evidence", "Deployment"],
  },
];

const DEMO_ATS: ATSAnalysis = {
  score: 68,
  grammarScore: 88,
  keywordScore: 54,
  actionVerbScore: 72,
  technicalScore: 85,
  impactScore: 42,
  leadershipScore: 35,
  overallGrade: "B",
  missingKeywords: ["System Design", "Scalability", "CI/CD", "Kubernetes", "MLOps", "API Gateway", "Microservices", "Load Balancing"],
  strongPoints: [
    "Strong technical skill vocabulary (Python, FastAPI, React)",
    "AWS certification prominently placed",
    "Machine Learning specialization clear",
    "Consistent date formatting",
    "Clean section structure"
  ],
  suggestions: [
    { id: "a1", category: "impact", issue: "No quantified achievements (numbers/metrics)", fix: "Add: 'Reduced API latency by 40%', 'Processed 10K+ documents daily', 'Improved model accuracy to 94.2%'", priority: "high", example: "Built ML pipeline → Built ML pipeline processing 50K samples/day with 94.2% accuracy" },
    { id: "a2", category: "keyword", issue: "Missing CI/CD and DevOps keywords", fix: "Add a 'DevOps & Infrastructure' section mentioning Docker Compose, GitHub Actions, CI/CD pipelines", priority: "high" },
    { id: "a3", category: "leadership", issue: "No leadership or collaboration evidence", fix: "Add: 'Led team of 3 engineers', 'Mentored 2 junior developers', 'Collaborated with cross-functional team of 8'", priority: "medium" },
    { id: "a4", category: "keyword", issue: "System Design not mentioned", fix: "Add 'Designed distributed system architecture for...' to IdentityOS project description", priority: "high" },
    { id: "a5", category: "format", issue: "Skills section lacks grouping", fix: "Group skills: Languages, Frameworks, Cloud, Databases, AI/ML, DevOps", priority: "medium" },
    { id: "a6", category: "impact", issue: "Internship bullets lack business context", fix: "Replace 'Developed ML models' with 'Developed ML models reducing prediction error by 23% for production recommendation system'", priority: "high" },
  ],
};

const DEMO_PORTFOLIO_EVAL: PortfolioEvaluation = {
  overallScore: 71,
  githubScore: 65,
  documentationScore: 80,
  deploymentScore: 60,
  complexityScore: 88,
  diversityScore: 75,
  readmeScore: 70,
  strengths: [
    "IdentityOS shows end-to-end AI systems thinking",
    "Multi-database architecture (Neo4j + Qdrant + PostgreSQL) is impressive",
    "FastAPI + React full-stack coverage is solid",
    "Research paper demonstrates academic rigor"
  ],
  gaps: [
    "No live URLs for any deployed projects",
    "GitHub repositories not linked from documents",
    "Zero mobile/responsive screenshots",
    "ML projects lack model performance metrics",
    "No code quality metrics (test coverage, linting badges)"
  ],
  suggestions: [
    { id: "p1", area: "deployment", issue: "No live project URLs found", fix: "Deploy IdentityOS to Vercel + add URL to all documents and portfolio", impact: "high" },
    { id: "p2", area: "github", issue: "GitHub not linked from any document", fix: "Add GitHub profile URL to Resume.pdf and Portfolio.pdf headers", impact: "high" },
    { id: "p3", area: "readme", issue: "README files not assessed (no links)", fix: "Add detailed README with: demo GIF, architecture diagram, setup instructions, and tech stack badges", impact: "high" },
    { id: "p4", area: "screenshot", issue: "No project screenshots in portfolio", fix: "Add 3-5 annotated screenshots per project showing real features and data", impact: "medium" },
    { id: "p5", area: "diversity", issue: "All projects use similar stack", fix: "Add one project using a completely different paradigm (Go, Rust, or mobile)", impact: "medium" },
    { id: "p6", area: "documentation", issue: "No API documentation shown", fix: "Add Swagger/OpenAPI screenshots from your FastAPI services", impact: "medium" },
  ],
};

// =========================================================
// CAREER SIMULATION DATA
// =========================================================

const CAREER_SIMULATIONS: Record<string, CareerSimulation> = {
  "AI Engineer": {
    target: "AI Engineer",
    currentFitScore: 87,
    predictedFitScore: 96,
    timelineMonths: 3,
    salaryRange: { min: 120000, max: 220000, currency: "USD" },
    successProbability: 0.89,
    missingSkills: [
      { skill: "Kubernetes", importance: "critical", timeWeeks: 4 },
      { skill: "MLflow / MLOps", importance: "important", timeWeeks: 3 },
      { skill: "LLM Fine-tuning", importance: "important", timeWeeks: 5 },
    ],
    existingStrengths: ["Python", "FastAPI", "Machine Learning", "Docker", "AWS", "RAG", "Vector Search"],
    recommendedSequence: ["Master Kubernetes (4 wks)", "Complete MLOps course (3 wks)", "Build LLM Agent project (4 wks)", "Apply with updated resume"],
    reasoning: "Your current profile already covers 87% of typical AI Engineer requirements. The primary gaps are production infrastructure (K8s, MLOps) which your Docker + AWS foundation makes fast to acquire.",
    confidence: 0.92,
    marketDemand: "very-high",
  },
  "Senior SDE": {
    target: "Senior SDE",
    currentFitScore: 74,
    predictedFitScore: 91,
    timelineMonths: 5,
    salaryRange: { min: 140000, max: 250000, currency: "USD" },
    successProbability: 0.78,
    missingSkills: [
      { skill: "System Design (HLD/LLD)", importance: "critical", timeWeeks: 8 },
      { skill: "Data Structures & Algorithms (competitive level)", importance: "critical", timeWeeks: 12 },
      { skill: "Distributed Systems", importance: "important", timeWeeks: 6 },
      { skill: "Node.js / Go backend", importance: "important", timeWeeks: 4 },
    ],
    existingStrengths: ["Python", "React", "FastAPI", "PostgreSQL", "Docker"],
    recommendedSequence: ["Daily LeetCode practice (12 wks)", "Study System Design (8 wks)", "Build distributed project (6 wks)", "Practice mock interviews (4 wks)", "Apply to FAANG"],
    reasoning: "Your full-stack depth is strong but DSA and system design are the gatekeepers for Senior SDE at top companies. This is a longer but achievable path.",
    confidence: 0.82,
    marketDemand: "very-high",
  },
  "DevOps Engineer": {
    target: "DevOps Engineer",
    currentFitScore: 62,
    predictedFitScore: 88,
    timelineMonths: 4,
    salaryRange: { min: 110000, max: 185000, currency: "USD" },
    successProbability: 0.81,
    missingSkills: [
      { skill: "Kubernetes", importance: "critical", timeWeeks: 4 },
      { skill: "Terraform / IaC", importance: "critical", timeWeeks: 3 },
      { skill: "CI/CD Pipelines (GitHub Actions)", importance: "critical", timeWeeks: 2 },
      { skill: "Monitoring (Prometheus, Grafana)", importance: "important", timeWeeks: 3 },
    ],
    existingStrengths: ["Docker", "AWS", "Linux fundamentals", "PostgreSQL"],
    recommendedSequence: ["GitHub Actions CI/CD (2 wks)", "Kubernetes + Helm (4 wks)", "Terraform + AWS IaC (3 wks)", "Monitoring stack (3 wks)", "CKA certification (4 wks)", "Apply"],
    reasoning: "Your Docker + AWS foundation covers 62% of DevOps requirements. Kubernetes and IaC are the critical gaps — both learnable in 4 months given your cloud background.",
    confidence: 0.85,
    marketDemand: "high",
  },
  "ML Research Engineer": {
    target: "ML Research Engineer",
    currentFitScore: 71,
    predictedFitScore: 89,
    timelineMonths: 6,
    salaryRange: { min: 130000, max: 280000, currency: "USD" },
    successProbability: 0.72,
    missingSkills: [
      { skill: "LLM Fine-tuning (LoRA, PEFT)", importance: "critical", timeWeeks: 6 },
      { skill: "CUDA / GPU programming", importance: "important", timeWeeks: 8 },
      { skill: "Research paper writing", importance: "important", timeWeeks: 4 },
      { skill: "Hugging Face ecosystem", importance: "important", timeWeeks: 3 },
    ],
    existingStrengths: ["PyTorch", "Machine Learning", "Python", "Research experience", "Data Analysis"],
    recommendedSequence: ["Hugging Face deep dive (3 wks)", "Fine-tune LLaMA on custom data (6 wks)", "CUDA optimization basics (8 wks)", "Write + publish research paper (4 wks)", "Apply to labs"],
    reasoning: "You have the research foundation (published paper, ML internship). The gap is hands-on LLM engineering and GPU optimization — the language of modern ML research teams.",
    confidence: 0.78,
    marketDemand: "high",
  },
};

// =========================================================
// PROACTIVE NOTIFICATIONS ENGINE
// =========================================================

export function generateProactiveNotifications(): ProactiveNotification[] {
  const memory = getMemory();
  const notifications: ProactiveNotification[] = [];

  // Check resume staleness
  if (memory.lastResumeUpdate) {
    const daysSince = Math.floor((Date.now() - new Date(memory.lastResumeUpdate).getTime()) / (1000 * 60 * 60 * 24));
    if (daysSince > 120) {
      notifications.push({
        id: "n-resume-stale",
        type: "warning",
        title: "Resume Not Updated",
        message: `Your resume hasn't been updated in ${daysSince} days.`,
        context: `You've added 2 new projects and 1 internship since last upload. Resume.pdf doesn't reflect IdentityOS or your AWS certification work.`,
        actionLabel: "Update Resume",
        actionHref: "/portfolio",
        priority: "critical",
        icon: "📋",
        dismissible: true,
        createdAt: new Date().toISOString(),
        evidence: ["Resume.pdf last modified: Jan 2026", "Portfolio.pdf shows 3 new projects", "AWS cert uploaded after resume"],
      });
    }
  }

  // Check for deployment screenshots
  const hasScreenshots = memory.documents.some(d => d.summary?.toLowerCase().includes("screenshot") || d.summary?.toLowerCase().includes("deploy"));
  if (!hasScreenshots && memory.projects.length > 0) {
    notifications.push({
      id: "n-no-screenshots",
      type: "gap",
      title: "Missing Deployment Screenshots",
      message: `You have ${memory.projects.length} projects but no deployment screenshots.`,
      context: "Portfolio analysis shows all projects described as deployed but zero visual proof exists. Recruiters spend 3x longer on portfolios with screenshots.",
      actionLabel: "Add Screenshots",
      actionHref: "/portfolio",
      priority: "high",
      icon: "📸",
      dismissible: true,
      createdAt: new Date().toISOString(),
      evidence: ["Portfolio.pdf: 4 projects, 0 screenshots", "React_Project_Report.pdf: mentions Vercel but no URL"],
    });
  }

  // Skill gap notification
  const hasKubernetes = memory.extractedSkills.some(s => s.toLowerCase().includes("kubernetes") || s.toLowerCase().includes("k8s"));
  if (!hasKubernetes && memory.extractedSkills.includes("Docker")) {
    notifications.push({
      id: "n-k8s-gap",
      type: "suggestion",
      title: "Kubernetes Will Unlock Your Next Level",
      message: "You completed 3+ Docker projects. Kubernetes is your next step.",
      context: "Graph analysis: Docker → Kubernetes is the most common career progression for engineers at your level. 92% of senior cloud roles require it.",
      actionLabel: "View Learning Path",
      actionHref: "/planner",
      priority: "high",
      icon: "⚡",
      dismissible: true,
      createdAt: new Date().toISOString(),
      evidence: ["Docker expertise confirmed in Resume.pdf", "AWS cert shows cloud trajectory", "K8s absent from all 5 documents"],
    });
  }

  // Portfolio completeness
  const portfolioScore = DEMO_PORTFOLIO_EVAL.overallScore;
  if (portfolioScore < 75) {
    notifications.push({
      id: "n-portfolio-gaps",
      type: "gap",
      title: "Portfolio Missing Internship Proof",
      message: "Your portfolio doesn't include your ML internship deliverables.",
      context: "Internship_Letter.pdf is uploaded but no project output, model results, or work samples from the internship are documented.",
      actionLabel: "Complete Portfolio",
      actionHref: "/portfolio",
      priority: "medium",
      icon: "💼",
      dismissible: true,
      createdAt: new Date().toISOString(),
      evidence: ["Internship_Letter.pdf uploaded", "No project files from TechCorp internship found", "Portfolio completeness: 71%"],
    });
  }

  // Achievement: high health score
  const latestHealth = memory.healthHistory[memory.healthHistory.length - 1];
  if (latestHealth && latestHealth.overallHealth >= 90) {
    notifications.push({
      id: "n-achievement-90",
      type: "achievement",
      title: "Identity Health Reached 90%+",
      message: "Your identity is in the top 8% of IdentityOS profiles.",
      context: "Consistent document uploads, skill verification, and project diversity have pushed your profile into elite territory. Now is the ideal time to start applying.",
      priority: "low",
      icon: "🏆",
      dismissible: true,
      createdAt: new Date().toISOString(),
      evidence: ["Health: 92% (up from 58% in January)", "5 verified documents", "16 skills mapped"],
    });
  }

  // React → Node.js progression
  const hasReact = memory.extractedSkills.includes("React");
  const hasNode = memory.extractedSkills.some(s => s.toLowerCase().includes("node"));
  if (hasReact && !hasNode) {
    notifications.push({
      id: "n-react-to-node",
      type: "suggestion",
      title: "React Complete → Node.js Is Next",
      message: "You completed React projects. Node.js should be your next backend skill.",
      context: "Career pattern analysis: React engineers who add Node.js see a 45% increase in full-stack role matches. Your FastAPI skills make the transition fast.",
      actionLabel: "Start Learning",
      actionHref: "/planner",
      priority: "medium",
      icon: "🚀",
      dismissible: true,
      createdAt: new Date().toISOString(),
      evidence: ["React skills confirmed in 2 documents", "FastAPI/Python backend = strong base", "Node.js absent from all documents"],
    });
  }

  // Filter dismissed notifications
  return notifications.filter(n => !memory.notificationsDismissed.includes(n.id));
}

// =========================================================
// CAREER ROADMAP GENERATOR
// =========================================================

export function generateRoadmap(type: CareerRoadmap["type"]): CareerRoadmap {
  const memory = getMemory();
  const userSkills = memory.extractedSkills;

  const roadmaps: Record<CareerRoadmap["type"], CareerRoadmap> = {
    "30-day": {
      type: "30-day",
      goal: "Maximize immediate employability and interview readiness",
      userDataUsed: ["Resume.pdf", "Extracted skills", "Recommendation history"],
      successProbability: 0.89,
      generatedAt: new Date().toISOString(),
      milestones: [
        { week: 1, title: "Resume Overhaul", description: "Quantify all resume achievements with real metrics. Add CI/CD and system design keywords.", type: "skill", status: "pending", skills: ["Resume Writing", "ATS Optimization"] },
        { week: 1, title: "GitHub Profile Polish", description: "Complete GitHub bio, pin top 6 repositories, add READMEs with architecture diagrams.", type: "goal", status: "pending", skills: ["GitHub", "Documentation"] },
        { week: 2, title: "Deploy IdentityOS Live", description: "Push to Vercel with custom domain. Add live URL to all documents.", type: "project", status: "pending", skills: ["Deployment", "Vercel", "DevOps"] },
        { week: 2, title: "LinkedIn Optimization", description: "Sync resume to LinkedIn, add AWS certification, request 3 recommendations.", type: "goal", status: "pending", skills: ["Personal Branding"] },
        { week: 3, title: "Start Kubernetes Learning", description: "Complete K8s fundamentals course. Deploy a containerized app to a K8s cluster.", type: "skill", status: "pending", skills: ["Kubernetes", "Container Orchestration"] },
        { week: 4, title: "Apply to 10 Target Roles", description: "Apply to 10 AI Engineer / Full-Stack roles with tailored resume variations.", type: "application", status: "pending", skills: ["Job Application", "Networking"] },
      ],
    },
    "90-day": {
      type: "90-day",
      goal: "Land a Senior AI Engineer or Full-Stack role at a Series B+ company",
      userDataUsed: ["All 5 documents", "Career trajectory analysis", "Skills gap report"],
      successProbability: 0.84,
      generatedAt: new Date().toISOString(),
      milestones: [
        { week: 1, title: "Resume + Portfolio Overhaul", description: "Quantify achievements, add screenshots, deploy all projects.", type: "goal", status: "pending", skills: ["Resume", "Portfolio"] },
        { week: 2, title: "Deploy Projects Live", description: "IdentityOS + React Dashboard live on Vercel with custom domains.", type: "project", status: "pending", skills: ["Deployment", "DevOps"] },
        { week: 3, title: "Kubernetes Fundamentals", description: "Complete K8s course and deploy a real service cluster.", type: "skill", status: "pending", skills: ["Kubernetes"] },
        { week: 4, title: "MLflow + MLOps Pipeline", description: "Integrate MLflow tracking into existing ML project. Version a model.", type: "skill", status: "pending", skills: ["MLOps", "MLflow"] },
        { week: 5, title: "Build LLM Agent Project", description: "Create a multi-tool LLM agent with LangGraph. Deploy publicly.", type: "project", status: "pending", skills: ["LLM", "Agents", "LangGraph"] },
        { week: 7, title: "Open Source Contribution", description: "Submit PR to Hugging Face or LangChain. Get it merged.", type: "project", status: "pending", skills: ["Open Source", "Community"] },
        { week: 9, title: "Mock Interview Preparation", description: "Complete 30 system design + 50 LeetCode problems. Record mock interviews.", type: "goal", status: "pending", skills: ["Interviews", "System Design"] },
        { week: 11, title: "Targeted Applications", description: "Apply to 25 curated roles with personalized cover letters.", type: "application", status: "pending", skills: ["Job Search"] },
        { week: 12, title: "Network + Referrals", description: "Reach out to 10 engineers at target companies for informational interviews.", type: "application", status: "pending", skills: ["Networking"] },
      ],
    },
    "6-month": {
      type: "6-month",
      goal: "Transition into a Staff/Senior AI Engineer role at a top-tier company",
      userDataUsed: ["Full profile analysis", "Career trajectory", "Market data"],
      successProbability: 0.78,
      generatedAt: new Date().toISOString(),
      milestones: [
        { week: 1, title: "Foundation Audit", description: "Deep audit of all 5 documents. Create gap report and 6-month action plan.", type: "goal", status: "pending", skills: ["Planning"] },
        { week: 2, title: "Portfolio Excellence", description: "Every project deployed, documented, and screenshot-verified.", type: "project", status: "pending", skills: ["Portfolio", "Documentation"] },
        { week: 4, title: "Kubernetes + CKA Track", description: "Complete K8s and start CKA exam preparation.", type: "certification", status: "pending", skills: ["Kubernetes", "CKA"] },
        { week: 6, title: "LLM Engineering Deep Dive", description: "Fine-tune a model, build an agent, deploy a RAG-enhanced chatbot.", type: "skill", status: "pending", skills: ["LLM", "Fine-tuning", "Agents"] },
        { week: 8, title: "Open Source Leadership", description: "Become a regular contributor to one major AI OSS project.", type: "project", status: "pending", skills: ["Open Source"] },
        { week: 10, title: "CKA Certification Exam", description: "Take and pass the CKA exam.", type: "certification", status: "pending", skills: ["Kubernetes", "Certification"] },
        { week: 12, title: "System Design Mastery", description: "Master 20 system design patterns. Build one end-to-end distributed system.", type: "skill", status: "pending", skills: ["System Design", "Architecture"] },
        { week: 16, title: "Research Publication", description: "Submit a paper or technical blog on your LLM/AI work.", type: "goal", status: "pending", skills: ["Research", "Writing"] },
        { week: 20, title: "Elite Applications", description: "Apply to Google, Meta, OpenAI, Anthropic, and top AI startups.", type: "application", status: "pending", skills: ["Job Search"] },
        { week: 24, title: "Offer Negotiation", description: "Navigate multiple offers using competing leverage.", type: "goal", status: "pending", skills: ["Negotiation"] },
      ],
    },
    "interview": {
      type: "interview",
      goal: "Be fully interview-ready in 6 weeks (DSA + System Design + Behavioral)",
      userDataUsed: ["Resume.pdf", "Skill set", "Career trajectory"],
      successProbability: 0.82,
      generatedAt: new Date().toISOString(),
      milestones: [
        { week: 1, title: "LeetCode Easy Streak", description: "Solve 3 Easy LeetCode problems daily. Focus on Arrays, Strings, HashMaps.", type: "skill", status: "pending", skills: ["DSA", "Problem Solving"] },
        { week: 2, title: "LeetCode Medium Progression", description: "Move to Medium problems: Trees, Graphs, DP fundamentals.", type: "skill", status: "pending", skills: ["DSA", "Trees", "Graphs"] },
        { week: 3, title: "System Design: Basics", description: "Study URL shortener, rate limiter, news feed design. Learn CAP theorem.", type: "skill", status: "pending", skills: ["System Design"] },
        { week: 4, title: "System Design: AI Systems", description: "Design an ML pipeline, recommendation engine, and real-time feature store.", type: "skill", status: "pending", skills: ["System Design", "ML Systems"] },
        { week: 5, title: "Behavioral Prep (STAR)", description: "Prepare 15 STAR stories from your internship and projects.", type: "goal", status: "pending", skills: ["Behavioral", "Communication"] },
        { week: 6, title: "Mock Interviews (3x)", description: "Complete 3 full mock interviews covering all rounds.", type: "goal", status: "pending", skills: ["Mock Interviews"] },
      ],
    },
    "placement": {
      type: "placement",
      goal: "Maximize campus/off-campus placement success rate",
      userDataUsed: ["Full profile", "Skills inventory", "Document verification"],
      successProbability: 0.91,
      generatedAt: new Date().toISOString(),
      milestones: [
        { week: 1, title: "Resume Placement Optimization", description: "Tailor resume for placement drives: GPA, projects, certifications in correct order.", type: "goal", status: "pending", skills: ["Resume", "Placement"] },
        { week: 2, title: "Core CS Fundamentals", description: "Revise OS, DBMS, Networks, OOP — the placement interview staples.", type: "skill", status: "pending", skills: ["OS", "DBMS", "Networks", "OOP"] },
        { week: 3, title: "Aptitude + Reasoning", description: "Practice 30 aptitude questions daily for online assessment rounds.", type: "skill", status: "pending", skills: ["Aptitude", "Reasoning"] },
        { week: 4, title: "Coding Round Practice", description: "Focus on arrays, sorting, strings — the most common placement coding patterns.", type: "skill", status: "pending", skills: ["DSA", "Coding"] },
        { week: 5, title: "HR + GD Preparation", description: "Practice Group Discussion topics. Prepare salary negotiation responses.", type: "goal", status: "pending", skills: ["Communication", "HR", "Negotiation"] },
        { week: 6, title: "Apply Everywhere", description: "Register for all drives. Apply to service + product companies in parallel.", type: "application", status: "pending", skills: ["Application"] },
      ],
    },
    "startup": {
      type: "startup",
      goal: "Build a fundable AI startup or join one as technical co-founder",
      userDataUsed: ["Project portfolio", "Tech stack", "Domain expertise"],
      successProbability: 0.68,
      generatedAt: new Date().toISOString(),
      milestones: [
        { week: 1, title: "Identify Problem Space", description: "Use your AI expertise to identify 3 problems in a domain you understand. Validate with 10 user interviews.", type: "goal", status: "pending", skills: ["Product Thinking", "Research"] },
        { week: 2, title: "MVP Architecture Design", description: "Design a lean MVP using your existing stack (FastAPI + React + PostgreSQL).", type: "project", status: "pending", skills: ["Product", "Architecture"] },
        { week: 4, title: "Build MVP in 2 Weeks", description: "Ship a working MVP. Leverage IdentityOS infrastructure patterns for speed.", type: "project", status: "pending", skills: ["Shipping", "Execution"] },
        { week: 6, title: "YC Application Prep", description: "Prepare YC application. Document traction metrics, team, and thesis.", type: "goal", status: "pending", skills: ["Fundraising", "Pitch"] },
        { week: 8, title: "Get 10 Paying Users", description: "The only metric that matters at pre-seed. Charge from day one.", type: "goal", status: "pending", skills: ["Sales", "Product"] },
        { week: 12, title: "Apply to Accelerators", description: "Apply to YC, Antler, and 5 other relevant programs.", type: "application", status: "pending", skills: ["Fundraising"] },
      ],
    },
    "higher-studies": {
      type: "higher-studies",
      goal: "Gain admission to a top MS/PhD program in AI/ML or CS",
      userDataUsed: ["Research paper", "ML internship", "Academic profile"],
      successProbability: 0.74,
      generatedAt: new Date().toISOString(),
      milestones: [
        { week: 1, title: "Target Programs Research", description: "Shortlist 10-15 programs. Identify professor research alignment.", type: "goal", status: "pending", skills: ["Research"] },
        { week: 2, title: "GRE Preparation", description: "Begin GRE prep. Target 165+ Quant, 155+ Verbal for top programs.", type: "skill", status: "pending", skills: ["GRE", "Academics"] },
        { week: 4, title: "Strengthen Research Portfolio", description: "Extend your published paper. Submit to a workshop/conference.", type: "project", status: "pending", skills: ["Research", "Writing"] },
        { week: 6, title: "Cold Email Professors", description: "Email 10 professors with specific research alignment. Attach your paper.", type: "goal", status: "pending", skills: ["Networking", "Communication"] },
        { week: 8, title: "Statement of Purpose Draft", description: "Write and iterate SOP. Include IdentityOS + research paper + ML internship.", type: "goal", status: "pending", skills: ["Writing", "SOP"] },
        { week: 10, title: "Request Recommendation Letters", description: "Request letters from internship supervisor + professor. Brief them thoroughly.", type: "goal", status: "pending", skills: ["Networking"] },
        { week: 12, title: "Submit Applications", description: "Submit all 10-15 applications. Apply for fellowships (NSF, GRFP) in parallel.", type: "application", status: "pending", skills: ["Application"] },
      ],
    },
  };

  return roadmaps[type];
}

// =========================================================
// CAREER SIMULATOR
// =========================================================

export function simulateCareer(target: string): CareerSimulation | null {
  return CAREER_SIMULATIONS[target] ?? null;
}

export const CAREER_TARGETS = Object.keys(CAREER_SIMULATIONS);

// =========================================================
// RECOMMENDATIONS ENGINE
// =========================================================

export function getSmartRecommendations(): SmartRecommendation[] {
  return DEMO_RECOMMENDATIONS;
}

// =========================================================
// RESUME OPTIMIZER
// =========================================================

export function getATSAnalysis(): ATSAnalysis {
  return DEMO_ATS;
}

// =========================================================
// PORTFOLIO INTELLIGENCE
// =========================================================

export function getPortfolioEvaluation(): PortfolioEvaluation {
  return DEMO_PORTFOLIO_EVAL;
}

// =========================================================
// IDENTITY HEALTH CALCULATOR
// =========================================================

export function calculateIdentityHealth(): IdentityHealthSnapshot {
  const memory = getMemory();
  const latest = memory.healthHistory[memory.healthHistory.length - 1];
  return latest ?? {
    timestamp: new Date().toISOString(),
    overallHealth: 0,
    completeness: 0,
    verificationScore: 0,
    skillDiversity: 0,
    projectDiversity: 0,
    documentationQuality: 0,
    careerReadiness: 0,
    learningVelocity: 0,
  };
}

export function getHealthMetricLabel(key: string): string {
  const labels: Record<string, string> = {
    overallHealth: "Overall Health",
    completeness: "Identity Completeness",
    verificationScore: "Verification Score",
    skillDiversity: "Skill Diversity",
    projectDiversity: "Project Diversity",
    documentationQuality: "Documentation Quality",
    careerReadiness: "Career Readiness",
    learningVelocity: "Learning Velocity",
  };
  return labels[key] ?? key;
}

export function getHealthColor(score: number): string {
  if (score >= 85) return "#4ade80"; // green
  if (score >= 70) return "#4F8CFF"; // blue
  if (score >= 55) return "#facc15"; // yellow
  return "#f87171"; // red
}
