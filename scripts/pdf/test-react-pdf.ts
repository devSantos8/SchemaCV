import fs from "fs";
import { extractText } from "unpdf";
import { generateNativeResumePdf } from "@/lib/exporters/reactPdf/renderPdf";
import { ResumeData, TemplateId } from "@/types/resume";

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

async function testReactPdf() {
  const rawData = fs.readFileSync("./examples/sample_junior_dev.json", "utf-8");
  const sampleData: ResumeData = JSON.parse(rawData);

  console.log("Testing React-PDF Native Engine across all 12 templates...\n");
  let failures = 0;
  const startTime = Date.now();

  for (const t of TEMPLATE_LIST) {
    const tStart = Date.now();
    const pdfBuffer = await generateNativeResumePdf({
      data: sampleData,
      templateId: t.id,
      paperSize: "letter",
      title: `CV_${sampleData.name}_${t.id}`,
    });
    const duration = Date.now() - tStart;

    const { totalPages, text } = await extractText(new Uint8Array(pdfBuffer));
    const fullText = (Array.isArray(text) ? text.join(" ") : String(text)).toLowerCase();
    const hasName = fullText.includes(sampleData.name.toLowerCase());
    const hasCompany = fullText.includes("klap fintech solutions");
    const status = totalPages === 1 && hasName && hasCompany ? "✅ PASS (1 PAGE)" : `❌ FAIL (${totalPages} PAGES, name: ${hasName})`;

    console.log(`[${status}] ${t.name} (${t.id}) — ${duration}ms, ${pdfBuffer.length} bytes`);
    if (totalPages !== 1 || !hasName || !hasCompany) failures++;
  }

  const totalDuration = Date.now() - startTime;
  console.log(`\n🎉 React-PDF Test Complete: ${TEMPLATE_LIST.length - failures}/${TEMPLATE_LIST.length} templates passed in ${totalDuration}ms (avg ${(totalDuration / TEMPLATE_LIST.length).toFixed(1)}ms per PDF)!\n`);

  if (failures > 0) process.exit(1);
}

testReactPdf().catch((err) => {
  console.error("Test error:", err);
  process.exit(1);
});
