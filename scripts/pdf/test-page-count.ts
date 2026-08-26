import fs from 'fs';
import puppeteer from 'puppeteer';
import { extractText } from 'unpdf';
import { generateTemplateHtml } from '@/lib/exporters/htmlTemplateExporter';
import { TemplateId, ResumeData } from '@/types/resume';

const TEMPLATE_LIST: { id: TemplateId; name: string }[] = [
  { id: "chile_profesional", name: "Chile & LatAm Profesional" },
  { id: "harvard", name: "Classic Dense (Harvard Style)" },
  { id: "tech_minimalist", name: "Engineering Clean (Tech Minimalist)" },
  { id: "modern_executive", name: "Modern Executive" },
  { id: "skills_first", name: "Skills-First Builder" },
  { id: "stanford_clean", name: "Entry Academic (Stanford Clean)" },
  { id: "compact_swiss", name: "Compact Swiss Grid" },
  { id: "executive_serif", name: "Executive Serif" },
  { id: "tech_compact", name: "Tech Compact" },
  { id: "modern_minimal", name: "Modern Minimal" },
  { id: "career_changer", name: "Career Changer" },
  { id: "academic_international", name: "Academic International" },
];

async function testPages() {
  const rawData = fs.readFileSync('./examples/sample_junior_dev.json', 'utf-8');
  const sampleData: ResumeData = JSON.parse(rawData);
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  
  console.log('Testing page count for all templates with realistic dense CV data...\n');
  let failures = 0;

  for (const t of TEMPLATE_LIST) {

    const page = await browser.newPage();
    const docHtml = generateTemplateHtml(sampleData, t.id, 'letter');
    const fullHtml = `<!DOCTYPE html><html><head><meta charset='UTF-8'><style>@page{size:letter portrait;margin:0;}*{box-sizing:border-box;}body{margin:0;padding:0;}</style></head><body>${docHtml}</body></html>`;
    await page.setContent(fullHtml, { waitUntil: 'domcontentloaded' });
    const pdfBuffer = await page.pdf({ format: 'Letter', printBackground: true, margin: { top: '0mm', bottom: '0mm', left: '0mm', right: '0mm' } });
    const { totalPages } = await extractText(new Uint8Array(pdfBuffer));
    const status = totalPages === 1 ? '✅ 1 PAGE OK' : `❌ OVERFLOW (${totalPages} PAGES)`;
    console.log(`[${status}] ${t.name} (${t.id})`);
    if (totalPages !== 1) failures++;
    await page.close();
  }
  await browser.close();

  console.log(`\nResult: ${TEMPLATE_LIST.length - failures}/${TEMPLATE_LIST.length} templates fit in 1 page.`);
  if (failures > 0) process.exit(1);
}

testPages().catch(err => {
  console.error(err);
  process.exit(1);
});
