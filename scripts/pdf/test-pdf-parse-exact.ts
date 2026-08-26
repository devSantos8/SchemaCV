import puppeteer from "puppeteer";
import { extractText } from "unpdf";
import { generateTemplateHtml } from "@/lib/exporters/htmlTemplateExporter";

const sampleData = {
  name: "Joain Matias Monroy Santos",
  headline: "Software Engineer",
  email: "joain.monroy@example.com",
  phone: "+56 9 1234 5678",
  location: "Santiago, Chile",
  website: "https://jmonroy.dev",
  summary: "Software Engineer con experiencia en desarrollo full stack y modelos generativos.",
  language: "es" as const,
  social_networks: [
    { network: "LinkedIn", username: "jmonroys17", url: "https://linkedin.com/in/jmonroys17" },
    { network: "GitHub", username: "devSantos8", url: "https://github.com/devSantos8" },
  ],
  skills: [
    { id: "s1", category: "Backend", skills: ["Python", "Node.js", "FastAPI", "PostgreSQL"] },
  ],
  experience: [
    {
      id: "e1",
      position: "Ingeniero I",
      company: "DevOps Tech",
      location: "Santiago, Chile",
      start_date: "Mar 2026",
      end_date: "",
      current: true,
      summary: "Liderazgo en despliegue de modelos.",
      highlights: ["Diseño de arquitectura escalable."],
    },
  ],
  education: [
    {
      id: "ed1",
      institution: "Universidad de Chile",
      degree: "Ingeniería Informática",
      start_date: "2020",
      end_date: "2025",
      current: false,
      highlights: [],
    },
  ],
  projects: [],
  custom_sections: [],
  hidden_sections: [],
  section_order: ["summary", "skills", "experience", "projects", "education", "certifications"],
  certifications: [
    { id: "c1", name: "Cloud Architecture", issuer: "Google", date: "2026" },
  ],
};

async function testExport() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();
  const documentHtml = generateTemplateHtml(sampleData, "tech_minimalist", "letter");

  const fullHtml = `<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CV</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700&family=Geist+Mono:wght@400;500;600&family=EB+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
      @page {
        size: letter portrait;
        margin: 0;
      }
      * {
        box-sizing: border-box;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      body {
        margin: 0;
        padding: 0;
        background-color: white !important;
        color: #09090b !important;
      }
      .page-break-avoid {
        break-inside: avoid !important;
        page-break-inside: avoid !important;
      }
    </style>
  </head>
  <body>
    <div id="print-root" style="width: 100%; margin: 0; padding: 0;">
      ${documentHtml}
    </div>
  </body>
</html>`;

  await page.setContent(fullHtml, {
    waitUntil: "domcontentloaded",
  });

  const pdfBuffer = await page.pdf({
    format: "Letter",
    printBackground: true,
    margin: { top: "0mm", bottom: "0mm", left: "0mm", right: "0mm" },
  });

  await browser.close();

  const { text } = await extractText(new Uint8Array(pdfBuffer));
  console.log("=== EXTRACTED PDF TEXT ===");
  console.log(text.join("\n"));
  console.log("==========================");
}

testExport();
