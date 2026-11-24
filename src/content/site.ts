// Site-wide content. Edit here — pages render from this data.

import type { IconName } from "../core/icons";

export const site = {
  name: "TechResearch",
  tagline: "Exploring systems, software, cloud, and real-world engineering concepts.",
  role: "Cloud & DevOps Engineer",
  specialties: "Multi-cloud · Cloud Architecture · Infrastructure Automation",
  motto: "Designing. Automating. Modernising.",
  mottoLine: "Building practical cloud solutions for modern infrastructure and applications.",
  experienceYears: 5,
  location: "Hyderabad, India",
  heroWords: ["cloud architecture", "infrastructure as code", "DevOps automation", "application modernisation"],
};

// ============================================================ PERSONAL DETAILS
// Not stored in code. At deploy time the workflow reads them from AWS
// (SSM Parameter Store + a private S3 bucket) into /site-config.js — see
// my-website-infra/docs/07-profile-and-private-files.md. Anything missing is
// simply hidden. Values are validated here because they arrive at runtime.

export interface Certification {
  name: string;
  issuer: string;
  year?: string;
  /** Verification page (Credly, etc.). */
  url?: string;
}

const str = (v: unknown, max = 200): string => (typeof v === "string" ? v.trim().slice(0, max) : "");
const httpsUrl = (v: unknown): string => {
  const s = str(v, 500);
  return /^https:\/\/[^\s"'<>]+$/i.test(s) ? s : "";
};

const raw = window.SITE_CONFIG?.profile ?? {};

export const profile = {
  name: str(raw.name, 80),
  email: /^[^\s@<>"]+@[^\s@<>"]+\.[^\s@<>"]+$/.test(str(raw.email)) ? str(raw.email) : "",
  linkedin: httpsUrl(raw.linkedin),
  github: httpsUrl(raw.github),
  /** Path under /profile/, copied from the private bucket at deploy time. */
  photo: /^\/profile\/photo\.(jpe?g|png|webp)$/i.test(str(raw.photo)) ? str(raw.photo) : "",
  /** CV exists in the private bucket; downloaded via the API after a bot check. */
  cvAvailable: raw.cvAvailable === true,
};

export const certifications: Certification[] = (Array.isArray(raw.certifications) ? raw.certifications : [])
  .map((c): Certification => ({
    name: str(c?.name, 120),
    issuer: str(c?.issuer, 80),
    year: str(c?.year, 10) || undefined,
    url: httpsUrl(c?.url) || undefined,
  }))
  .filter((c) => c.name && c.issuer);

// ==============================================================================

export const cloudPlatforms =["AWS", "Microsoft Azure", "Google Cloud", "Oracle Cloud (OCI)"];

export const nav = [
  { label: "Home", href: "/index.html", page: "home" },
  { label: "Articles", href: "/posts.html", page: "posts" },
  { label: "About", href: "/about.html", page: "about" },
] as const;

// ------------------------------------------------------------------ about

export const about = {
  headline: "Building, automating and modernising cloud infrastructure.",
  intro: [
    `Hi, I'm ${profile.name ? `${profile.name} — a` : "a"} ${site.role} with ${site.experienceYears}+ years of experience in IT, focused on cloud architecture, infrastructure automation, application modernisation, and DevOps engineering.`,
    "My work revolves around solving practical infrastructure and engineering challenges — designing cloud environments, modernising applications, improving deployment processes, and building solutions that are scalable, secure, and maintainable.",
    "Over the years, I've worked across AWS, Microsoft Azure, Google Cloud Platform (GCP), and Oracle Cloud Infrastructure (OCI), with hands-on experience spanning Kubernetes, Docker, Terraform, CI/CD, and cloud-native technologies.",
  ],
  whatIDoLead:
    "I enjoy working at the intersection of cloud infrastructure, application architecture, and automation — especially on projects where architecture decisions need to translate into real, working implementations.",
  highlight: {
    eyebrow: "Project highlight",
    title: "Enterprise authentication migration: Auth0 → Amazon Cognito",
    text: "Led the migration of an enterprise application's authentication from Auth0 to Amazon Cognito — working across frontend and backend components and integrating AWS services to support a seamless transition.",
    points: ["Frontend & backend changes", "AWS-native identity", "Seamless cutover"],
    postSlug: "auth0-to-cognito",
  },
  approach: {
    quote: "Technology is valuable when it solves real problems.",
    text: "I'm interested in understanding not just how a technology works, but why it exists — and I'm actively exploring how AI and AI-assisted engineering tools are changing the way infrastructure, software, and DevOps teams operate.",
    principles: [
      { icon: "search" as IconName, title: "Why it exists", text: "The problem a technology was created to solve." },
      { icon: "layers" as IconName, title: "Where it fits", text: "Its place within the wider architecture." },
      { icon: "scale" as IconName, title: "The trade-offs", text: "What you gain — and what you give up — by adopting it." },
    ],
    learning:
      "For me, continuous learning isn't about collecting technology names. It's about developing the ability to evaluate, implement, and operate solutions effectively.",
  },
  mission:
    "Through this website, I document my technical learnings, share practical engineering insights, explore new technologies, and build resources that help other professionals navigate the constantly evolving IT landscape.",
  interests: ["Platform engineering", "Kubernetes", "DevSecOps", "AI-driven automation", "Cloud-native architecture", "Evolution of cloud platforms"],
};

export interface Skill {
  icon: IconName;
  title: string;
  text: string;
  tags: string[];
}

/** "What I do" — areas of work. */
export const skills: Skill[] = [
  {
    icon: "cloud",
    title: "Cloud Architecture",
    text: "Designing and implementing cloud-based infrastructure and application solutions.",
    tags: ["AWS", "Azure", "GCP", "OCI"],
  },
  {
    icon: "migrate",
    title: "Cloud Migration",
    text: "Modernising applications and migrating workloads between platforms and services.",
    tags: ["Modernisation", "Re-platforming"],
  },
  {
    icon: "zap",
    title: "DevOps & Automation",
    text: "Streamlining infrastructure provisioning, deployment workflows, and operational processes.",
    tags: ["CI/CD", "Automation"],
  },
  {
    icon: "box",
    title: "Containerisation & Orchestration",
    text: "Working with Docker and Kubernetes to manage modern application environments.",
    tags: ["Docker", "Kubernetes"],
  },
  {
    icon: "code",
    title: "Infrastructure as Code",
    text: "Using Terraform and automation tools to build repeatable, manageable infrastructure.",
    tags: ["Terraform", "IaC"],
  },
  {
    icon: "shield",
    title: "Cloud Security & Identity",
    text: "Authentication, authorisation, identity management, and cloud security integrations.",
    tags: ["IAM", "Amazon Cognito", "Auth0"],
  },
];

/** Technology groups. `learning: true` marks interests, not professional proficiency. */
export const techGroups: { title: string; items: string[]; learning?: boolean }[] = [
  { title: "Cloud platforms", items: ["AWS", "Microsoft Azure", "Google Cloud", "Oracle Cloud (OCI)"] },
  { title: "Containers & orchestration", items: ["Docker", "Kubernetes"] },
  { title: "Infrastructure & delivery", items: ["Terraform", "CI/CD pipelines", "Infrastructure automation"] },
  { title: "Identity & security", items: ["Amazon Cognito", "Auth0", "IAM"] },
  { title: "Currently learning", items: ["Go", "Python", "AI-assisted engineering"], learning: true },
];

export const timeline = [
  {
    title: "The Foundation",
    text: 'Started in Electronics Engineering, giving me a "bare-metal" understanding of systems before moving up the stack.',
  },
  {
    title: "The Enterprise Shift",
    text: "Managed large-scale infrastructure migrations at Infosys, transitioning legacy systems to modern cloud providers.",
  },
  {
    title: "Cloud & DevOps Engineering",
    text: "Designing multi-cloud environments, modernising applications, and leading an enterprise authentication migration from Auth0 to Amazon Cognito.",
  },
  {
    title: "What's Next",
    text: "Exploring AI-assisted engineering, platform engineering, and DevSecOps — while learning Go and Python.",
  },
];

/** Lines "typed" by the terminal in the home hero. */
export const terminalScript: { cmd?: string; out?: string; tone?: "ok" | "muted" | "accent" }[] = [
  { cmd: "terraform plan -out=site.tfplan" },
  { out: "Plan: 12 to add, 0 to change, 0 to destroy.", tone: "muted" },
  { cmd: "terraform apply site.tfplan" },
  { out: "aws_s3_bucket.site: Creation complete", tone: "muted" },
  { out: "aws_cloudfront_distribution.site: Creation complete", tone: "muted" },
  { out: "Apply complete! Resources: 12 added.", tone: "ok" },
  { cmd: "npm run build && aws s3 sync dist s3://site" },
  { out: "✓ deployed to the edge", tone: "accent" },
];
