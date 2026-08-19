export interface SkillDefinition {
  name: string;
  category: SkillCategoryKey;
  aliases?: string[];
}

export type SkillCategoryKey =
  | "Languages"
  | "Frameworks & Libraries"
  | "Cloud & DevOps"
  | "Databases & Storage"
  | "Tools & Platforms"
  | "Methodologies & Soft Skills";

export const SKILL_CATEGORIES_CONFIG: Record<
  SkillCategoryKey,
  { label: string; description: string; iconName: string; color: string }
> = {
  Languages: {
    label: "Lenguajes de Programación",
    description: "TypeScript, Python, JavaScript, Go, Java, Rust, C#, SQL...",
    iconName: "Code2",
    color: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800",
  },
  "Frameworks & Libraries": {
    label: "Frameworks y Librerías",
    description: "React, Next.js, Node.js, NestJS, Tailwind CSS, Express, Vue, Angular...",
    iconName: "Layers",
    color: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800",
  },
  "Cloud & DevOps": {
    label: "Cloud y DevOps",
    description: "Docker, Kubernetes, AWS, GCP, Azure, GitHub Actions, Terraform, CI/CD...",
    iconName: "Cloud",
    color: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800",
  },
  "Databases & Storage": {
    label: "Bases de Datos y Almacenamiento",
    description: "PostgreSQL, MongoDB, Redis, MySQL, SQLite, Prisma ORM, Elasticsearch...",
    iconName: "Database",
    color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
  },
  "Tools & Platforms": {
    label: "Herramientas y Plataformas",
    description: "Git, Linux, Postman, Figma, Vite, Jest, GraphQL, REST APIs...",
    iconName: "Wrench",
    color: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-200 dark:border-cyan-800",
  },
  "Methodologies & Soft Skills": {
    label: "Metodologías y Habilidades Blandas",
    description: "Scrum/Agile, System Design, Liderazgo Técnico, Clean Architecture, CI/CD...",
    iconName: "CheckCircle2",
    color: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800",
  },
};

export const COMMON_SKILLS_TAXONOMY: SkillDefinition[] = [
  // Lenguajes
  { name: "TypeScript", category: "Languages", aliases: ["TS"] },
  { name: "JavaScript", category: "Languages", aliases: ["JS", "ES6+"] },
  { name: "Python", category: "Languages", aliases: ["Python 3", "Py"] },
  { name: "SQL", category: "Languages", aliases: ["T-SQL", "PL/SQL"] },
  { name: "Go", category: "Languages", aliases: ["Golang"] },
  { name: "Java", category: "Languages", aliases: ["Java 17", "Java 21"] },
  { name: "Rust", category: "Languages" },
  { name: "C#", category: "Languages", aliases: [".NET", "CSharp"] },
  { name: "C++", category: "Languages", aliases: ["CPP"] },
  { name: "HTML5", category: "Languages", aliases: ["HTML"] },
  { name: "CSS3", category: "Languages", aliases: ["CSS"] },
  { name: "Bash", category: "Languages", aliases: ["Shell Scripting", "Zsh"] },
  { name: "PHP", category: "Languages" },
  { name: "Ruby", category: "Languages" },

  // Frameworks & Libraries
  { name: "React", category: "Frameworks & Libraries", aliases: ["React.js", "ReactJS"] },
  { name: "Next.js", category: "Frameworks & Libraries", aliases: ["NextJS", "Next 14", "Next 15"] },
  { name: "Node.js", category: "Frameworks & Libraries", aliases: ["NodeJS", "Node"] },
  { name: "NestJS", category: "Frameworks & Libraries", aliases: ["Nest"] },
  { name: "Express.js", category: "Frameworks & Libraries", aliases: ["Express"] },
  { name: "Tailwind CSS", category: "Frameworks & Libraries", aliases: ["Tailwind", "TailwindCSS"] },
  { name: "Astro", category: "Frameworks & Libraries" },
  { name: "Vue.js", category: "Frameworks & Libraries", aliases: ["Vue", "Vue 3"] },
  { name: "Angular", category: "Frameworks & Libraries" },
  { name: "Django", category: "Frameworks & Libraries" },
  { name: "FastAPI", category: "Frameworks & Libraries" },
  { name: "Flask", category: "Frameworks & Libraries" },
  { name: "Spring Boot", category: "Frameworks & Libraries", aliases: ["Spring"] },
  { name: "Zustand", category: "Frameworks & Libraries" },
  { name: "Redux Toolkit", category: "Frameworks & Libraries", aliases: ["Redux"] },
  { name: "TanStack Query", category: "Frameworks & Libraries", aliases: ["React Query"] },
  { name: "Radix UI", category: "Frameworks & Libraries" },
  { name: "Framer Motion", category: "Frameworks & Libraries" },

  // Cloud & DevOps
  { name: "Docker", category: "Cloud & DevOps", aliases: ["Containerization"] },
  { name: "Kubernetes", category: "Cloud & DevOps", aliases: ["K8s"] },
  { name: "AWS", category: "Cloud & DevOps", aliases: ["Amazon Web Services", "EC2", "S3", "Lambda"] },
  { name: "Google Cloud Platform", category: "Cloud & DevOps", aliases: ["GCP"] },
  { name: "Microsoft Azure", category: "Cloud & DevOps", aliases: ["Azure"] },
  { name: "GitHub Actions", category: "Cloud & DevOps", aliases: ["GHA", "CI/CD Pipelines"] },
  { name: "GitLab CI", category: "Cloud & DevOps", aliases: ["GitLab CI/CD"] },
  { name: "Terraform", category: "Cloud & DevOps", aliases: ["IaC"] },
  { name: "Linux", category: "Cloud & DevOps", aliases: ["Ubuntu", "Debian", "CentOS"] },
  { name: "Nginx", category: "Cloud & DevOps" },
  { name: "Vercel", category: "Cloud & DevOps" },

  // Databases & Storage
  { name: "PostgreSQL", category: "Databases & Storage", aliases: ["Postgres"] },
  { name: "MongoDB", category: "Databases & Storage", aliases: ["Mongo"] },
  { name: "Redis", category: "Databases & Storage" },
  { name: "MySQL", category: "Databases & Storage" },
  { name: "SQLite", category: "Databases & Storage" },
  { name: "SQL Server", category: "Databases & Storage", aliases: ["MSSQL"] },
  { name: "Prisma ORM", category: "Databases & Storage", aliases: ["Prisma"] },
  { name: "TypeORM", category: "Databases & Storage" },
  { name: "Drizzle ORM", category: "Databases & Storage", aliases: ["Drizzle"] },
  { name: "Supabase", category: "Databases & Storage" },
  { name: "Firebase", category: "Databases & Storage", aliases: ["Firestore"] },

  // Tools & Platforms
  { name: "Git", category: "Tools & Platforms", aliases: ["GitHub", "GitLab"] },
  { name: "REST APIs", category: "Tools & Platforms", aliases: ["RESTful APIs", "REST"] },
  { name: "GraphQL", category: "Tools & Platforms" },
  { name: "Postman", category: "Tools & Platforms", aliases: ["cURL", "Insomnia"] },
  { name: "Figma", category: "Tools & Platforms", aliases: ["UI/UX Design"] },
  { name: "Vite", category: "Tools & Platforms" },
  { name: "Webpack", category: "Tools & Platforms" },
  { name: "Jest", category: "Tools & Platforms", aliases: ["Unit Testing"] },
  { name: "Playwright", category: "Tools & Platforms", aliases: ["E2E Testing"] },
  { name: "Cypress", category: "Tools & Platforms" },

  // Methodologies & Soft Skills
  { name: "Scrum / Agile", category: "Methodologies & Soft Skills", aliases: ["Scrum", "Agile", "Kanban"] },
  { name: "System Design", category: "Methodologies & Soft Skills", aliases: ["Arquitectura de Software"] },
  { name: "Clean Architecture", category: "Methodologies & Soft Skills", aliases: ["DDD", "Clean Code"] },
  { name: "CI/CD", category: "Methodologies & Soft Skills", aliases: ["Continuous Integration", "Continuous Delivery"] },
  { name: "Code Review", category: "Methodologies & Soft Skills" },
  { name: "Resolución de Problemas", category: "Methodologies & Soft Skills", aliases: ["Problem Solving"] },
  { name: "Liderazgo Técnico", category: "Methodologies & Soft Skills", aliases: ["Tech Lead", "Team Mentoring"] },
];

/**
 * Clasifica una lista de habilidades de texto plano en categorías canónicas.
 */
export function classifySkillsIntoCategories(rawSkills: string[]): {
  category: string;
  skills: string[];
}[] {
  const map: Record<string, Set<string>> = {
    Languages: new Set(),
    "Frameworks & Libraries": new Set(),
    "Cloud & DevOps": new Set(),
    "Databases & Storage": new Set(),
    "Tools & Platforms": new Set(),
    "Methodologies & Soft Skills": new Set(),
  };

  const uncategorized = new Set<string>();

  rawSkills.forEach((skill) => {
    const trimmed = skill.trim();
    if (!trimmed) return;

    const lower = trimmed.toLowerCase();
    const match = COMMON_SKILLS_TAXONOMY.find((item) => {
      if (item.name.toLowerCase() === lower) return true;
      return item.aliases?.some((a) => a.toLowerCase() === lower);
    });

    if (match) {
      map[match.category].add(match.name);
    } else {
      // Solo agregar a no categorizados si parece una habilidad real (no una oración o párrafo)
      if (
        trimmed.length >= 2 &&
        trimmed.length <= 30 &&
        trimmed.split(/\s+/).length <= 3 &&
        !trimmed.includes(".") &&
        !trimmed.includes(":") &&
        !trimmed.includes("–") &&
        !trimmed.includes("—") &&
        !/^(el|la|los|las|de|en|con|por|para|un|una|construí|integré|desarrollé|optimicé|responsable)/i.test(trimmed)
      ) {
        uncategorized.add(trimmed);
      }
    }
  });

  const result: { category: string; skills: string[] }[] = [];

  Object.entries(map).forEach(([catKey, set]) => {
    if (set.size > 0) {
      result.push({
        category: catKey,
        skills: Array.from(set),
      });
    }
  });

  if (uncategorized.size > 0) {
    result.push({
      category: "Otras Habilidades",
      skills: Array.from(uncategorized),
    });
  }

  return result;
}
