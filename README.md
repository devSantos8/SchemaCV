<div align="center">

# SchemaCV
### ATS-First Resume & CV Engineering Platform

Plataforma de creación y edición de currículums de alto rendimiento diseñada bajo estándares semánticos ATS (Applicant Tracking Systems), con sincronización bidireccional en tiempo real entre formulario visual y código YAML, optimización estricta de 1 sola hoja, repositorio de perfil base y exportación multiformato (PDF vectorial, Word DOCX, YAML y JSON).

[![Next.js](https://img.shields.io/badge/Next.js-15%2B-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Zustand](https://img.shields.io/badge/State-Zustand-orange?style=flat-square)](https://zustand-demo.pmnd.rs/)
[![ATS Score](https://img.shields.io/badge/ATS_Compatibility-100%25-emerald?style=flat-square)](https://github.com/devSantos8/schemacv)
[![Author](https://img.shields.io/badge/Creator-Joain%20Monroy%20(devSantos8)-black?style=flat-square&logo=github)](https://github.com/devSantos8)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)

[Características](#características-principales) •
[Perfil Base y Versiones](#perfil-base-maestro-y-versiones-de-cv) •
[Filosofía de 1 Hoja](#filosofía-de-1-sola-hoja) •
[Catálogo de Plantillas](#catálogo-de-plantillas-ats) •
[Instalación](#instalación-y-desarrollo) •
[Esquema YAML](#esquema-yaml) •
[Exportación](#motor-de-exportación-multiformato)

</div>

---

## Propósito

Los sistemas de seguimiento de candidatos (ATS) como Workday, Taleo, Greenhouse, Lever e iCIMS analizan miles de currículums diarios descartando formatos con tablas anidadas, elementos gráficos no interpretables o desbordamientos innecesarios a segundas páginas.

SchemaCV resuelve estos problemas mediante:

1. **Estructura semántica plana:** Diseños de una sola columna optimizados para lectura lineal por parsers de texto y algoritmos de selección.
2. **Repositorio de Perfil Base:** Centralización de todo tu historial profesional completo para luego derivar versiones específicas según cada postulación.
3. **Filosofía Single-Page First:** Medición precisa y alertas visuales en tiempo real para condensar el impacto en una sola hoja.
4. **Editor dual sincronizado:** Edición visual mediante componentes o código fuente YAML con sincronización bidireccional inmediata.
5. **Privacidad total:** Almacenamiento 100% local en el navegador del usuario (Local-First).

---

## Características Principales

### 1. Perfil Base Maestro y Gestión Multi-Versión
- **Repositorio Central:** Almacena tu historial completo de empleos, proyectos, catálogo de habilidades técnicas, títulos académicos y certificaciones sin restricción de espacio.
- **Generación de CVs Adaptados:** Crea múltiples versiones de currículum a partir de tu Perfil Base, seleccionando y ajustando el contenido para vacantes específicas.

### 2. Editor Dual Bidireccional (Visual y YAML)
- **Formulario Visual:** Organización modular por secciones con reordenamiento arrastrable (Drag and Drop) mediante `@dnd-kit`.
- **Editor YAML Integrado:** Basado en CodeMirror con resaltado de sintaxis, validación en tiempo real y detección inmediata de errores.
- **Historial Completo:** Pila de hasta 50 estados para operaciones de Deshacer y Rehacer con atajos de teclado (`Ctrl+Z` / `Ctrl+Y`).

### 3. Detección e Indicador de 1 Sola Hoja
- **Medición de Altura Dinámica:** Cálculo en tiempo real de la ocupación respecto al formato de papel seleccionado (US Letter o A4).
- **Línea de Corte Visual (`print:hidden`):** Identifica el límite exacto de la página 1 para advertir cuando el contenido pasa a la página 2.
- **Recomendaciones de Condensación:** Sugerencias automáticas para reducir viñetas o cambiar a plantillas de mayor densidad tipográfica.

### 4. Galería Interactiva de Plantillas ATS
- **Catálogo de 6 Plantillas Nativas:** Previsualización en vivo con datos de muestra o datos reales antes de aplicar.
- **Inspección en Detalle:** Visualización ampliada para revisar jerarquía visual y espaciados.

### 5. Importar CV con IA
- Extracción y normalización automática de datos a partir de archivos PDF existentes hacia el esquema estructurado de SchemaCV.

### 6. Job Tracker + Evaluador ATS de Postulaciones (Oferta vs CV)
- **Job Tracker:** Tablero Kanban para seguimiento de postulaciones (*Guardadas*, *Postuladas*, *Entrevistas*, *Oferta*, *Rechazadas*), scraping automático de ofertas (LinkedIn, Greenhouse, Lever, GetOnBoard, Indeed, Workday) y verificación de enlaces caídos.
- **Evaluador ATS Dedicado (`/jobs/[id]/evaluate`):**
  - **Simulación de Parseo ATS:** Diagnóstico interactivo de cómo el robot ATS extrae los datos de contacto, orden secuencial de secciones y detección de mojibake.
  - **Auditoría de 10 Reglas de Formato:** Evaluación pass/fail con severidad, explicación y guía de remediación.
  - **Match Semántico y Técnico:** Clasificación de requisitos excluyentes (*Must Have*) vs deseables (*Nice to Have*), brecha de años de experiencia y keywords faltantes.
  - **Simulador de Score Proyectado:** Cálculo interactivo en tiempo real del incremento de puntuación al incorporar keywords clave en el CV.
  - **Script CLI:** Ejecuta la evaluación completa por terminal:
    ```bash
    npm run ats:evaluate -- --cv <archivo.pdf|archivo.json> --job <url|archivo.txt|"texto...">
    ```

---

## Reglas ATS Obligatorias (Hard Requirements)

SchemaCV está diseñado bajo **9 reglas de oro** para garantizar un índice de aprobación del 100% en parsers ATS corporativos (Workday, Taleo, Greenhouse, Lever, etc.):

1. **Layout Estricto de 1 Columna:** Lectura secuencial top-to-bottom. Sin sidebars flotantes, sin cajas de texto desancladas ni tablas complejas que confundan a los parsers.
2. **Contacto en el Cuerpo Principal:** Nombres y vías de contacto ubicados directamente en el flujo del documento, nunca en headers/footers del PDF.
3. **Secciones Estándar con Nombres Canónicos:** Títulos literales en ALL CAPS o mayúsculas claras (*"Professional Summary"*, *"Work Experience"*, *"Education"*, *"Technical Skills"*, *"Projects"*, *"Certifications"*).
4. **Tipografías Web-Safe Reales:** Familias tipográficas estándar vectoriales (EB Garamond, Helvetica, Geist Sans, Georgia) con escala 9.5–11pt en body y 14–18pt en títulos. Solo negro puro (#000) o alto contraste.
5. **Fechas Consistentes y Legibles:** Formato estructurado `MMM YYYY` o `YYYY-MM` (ej: `Mar 2022 – Presente`), siempre con mes explícito.
6. **Viñetas Estándar:** Puntos sólidos estándar (`•`). Cero iconos SVG, barras de progreso de skills o gráficos decorativos que resten puntos en el parser.
7. **Output PDF 100% Vectorial y Seleccionable:** Garantía del **Copy-Paste Test** (`Ctrl+A` → Pegar en texto plano → Contenido ordenado e íntegro sin glyphs corruptos).
8. **Márgenes y Proporción:** Márgenes balanceados de 0.5" a 0.7", interlineado de 1.15 a 1.35, sin fotos ni números de página en CVs de 1 hoja.
9. **Encoding UTF-8 Limpio:** Soporte nativo para caracteres hispanos (`á, é, í, ó, ú, ñ`) sin corrupción de texto (*mojibake*).

---

## Validación Automatizada ATS

SchemaCV incluye una suite de pruebas automatizadas que valida cada plantilla contra los criterios de aceptación ATS y compatibilidad bilingüe:

```bash
# Ejecutar suite de validación ATS
npm run test:ats
```

### ¿Cómo realizar el Copy-Paste Test Manual?
1. Abre el PDF generado en tu visor habitual (Chrome, Adobe Acrobat, Preview).
2. Presiona `Ctrl + A` (o `Cmd + A`) y luego `Ctrl + C` para copiar todo.
3. Pega el contenido en un editor de texto plano (Notepad, VS Code).
4. **Verificación:** El texto debe aparecer en orden exacto: Nombre → Contacto → Resumen → Experiencia → Educación → Habilidades, sin caracteres ilegibles (`Ã¡`, etc.).

---

## Catálogo de Plantillas ATS y Soporte Bilingüe (ES / EN)

Todas las plantillas disponen de alternador instantáneo de idioma **[ ES | EN ]** en la barra de herramientas y validación automatizada:

| Plantilla | Identificador | Tipografía | Densidad | Casos de Uso Recomendados |
| :--- | :--- | :--- | :--- | :--- |
| **Classic Dense** | `harvard` | Serif (EB Garamond) | Media | Finanzas, Consultoría, Legal, Perfiles Académicos y Corporativos |
| **Engineering Clean** | `tech_minimalist` | Sans-Serif + Monospace | Alta | Software Engineers, DevOps, Backend, Frontend y Full-Stack |
| **Stanford Clean** | `stanford_clean` | Sans-Serif (Geist Sans) | Alta | Product Managers, Data Scientists, Ingenieros de IA y Startups |
| **Compact Swiss Grid** | `compact_swiss` | Swiss Modernist (Helvetica) | Máxima (1 Hoja) | Perfiles Senior con trayectoria extensa que requieren formato estricto de 1 página |
| **Modern Executive** | `modern_executive` | Sans-Serif con Acento Lateral | Media | Tech Leads, Engineering Managers y Arquitectos de Software |
| **Skills-First / Builder** | `skills_first` | Sans-Serif Clean | Alta | Makers, Fundadores Técnicos y Desarrolladores Open Source |
| **Executive Serif** | `executive_serif` | Serif (Garamond / Georgia) | Media | Directores de Tecnología, Consultores Senior, Finanzas y C-Level |
| **Tech Compact** | `tech_compact` | Sans-Serif + Monospace | Máxima (1 Hoja) | Desarrolladores Web, Mobile, Cloud y Especialistas en Infraestructura |
| **Modern Minimal** | `modern_minimal` | Sans-Serif (Helvetica / Arial) | Media | Desarrolladores Junior, Diseñadores de Producto y Nuevos Talentos |
| **Career Changer** | `career_changer` | Sans-Serif Clean | Alta | Profesionales en transición de carrera, Bootcamps y Autodidactas |
| **Academic International** | `academic_international` | Serif (Times New Roman / Georgia) | Media | Investigadores, Docentes, Doctorados y Postulaciones Internacionales |

---

## Filosofía de 1 Sola Hoja

Para profesionales con menos de 8 a 10 años de experiencia, los reclutadores y algoritmos ATS priorizan currículums directos y concisos de una sola página.

SchemaCV monitorea la altura de renderizado y proporciona guías de referencia:

```
[ Estado Óptimo ]
┌─────────────────────────────────────────────────────────────┐
│  Formato de 1 Hoja Óptimo (92% ocupada)        [ 1 Página ] │
└─────────────────────────────────────────────────────────────┘

[ Desbordamiento a Página 2 ]
┌─────────────────────────────────────────────────────────────┐
│  Excede 1 hoja (1.3 páginas detectadas)        [ Pág. 2 ]   │
│  ----------------- Límite de Página 1 --------------------- │
│  (Contenido posterior pasa a la segunda página)             │
└─────────────────────────────────────────────────────────────┘
```

---

## Motor de Exportación Multiformato

- **PDF Vectorial:** Renderizado nativo de alta resolución compatible con impresión de navegador y servicio headless Puppeteer con fuentes embebidas.
- **Word (.docx):** Documentos generados con la librería `docx`, utilizando estilos de encabezado semánticos estándar para lectura automatizada por ATS.
- **Esquema YAML:** Archivo estructurado `.yaml` completamente editable.
- **JSON Estructurado:** Exportación de datos crudos validados mediante esquemas Zod.

---

## Instalación y Desarrollo

### Requisitos Previos
- Node.js 18.17 o superior
- npm, pnpm o yarn

### 1. Clonar el repositorio
```bash
git clone https://github.com/devSantos8/schemacv.git
cd schemacv
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Ejecutar suite de validación ATS
```bash
npm run test:ats
```

### 4. Ejecutar servidor de desarrollo
```bash
npm run dev
```
Accede en el navegador a [http://localhost:3000](http://localhost:3000).

### 5. Compilar para producción
```bash
npm run build
npm run start
```

---

## Esquema YAML

Ejemplo del formato estructurado compatible con control de versiones en Git:

```yaml
name: Alexander Vance
headline: Senior Full-Stack & Cloud Systems Engineer
email: alexander.vance@devmail.io
phone: "+1 (555) 234-8901"
location: San Francisco, CA
website: https://alexandervance.dev
social_networks:
  - network: LinkedIn
    username: in/alex-vance-cloud
    url: https://linkedin.com/in/alex-vance-cloud
  - network: GitHub
    username: alexvance-sys
    url: https://github.com/alexvance-sys

skills:
  - category: "Lenguajes & Backend"
    skills: [TypeScript, Go, Python, Node.js, GraphQL, PostgreSQL]
  - category: "Cloud & DevOps"
    skills: [AWS, Kubernetes, Docker, Terraform, CI/CD]

experience:
  - company: Datamesh Technologies
    position: Senior Cloud Platform Engineer
    location: San Francisco, CA
    start_date: 2022-03
    end_date: Presente
    current: true
    highlights:
      - Diseñó e implementó arquitectura de microservicios en Kubernetes procesando más de 12M de eventos diarios.
      - Redujo la latencia p99 de la API en un 38% mediante caché distribuida con Redis.

education:
  - institution: University of California, Berkeley
    degree: B.S. in Computer Science
    start_date: 2015-08
    end_date: 2019-05

section_order:
  - summary
  - skills
  - experience
  - projects
  - education
  - certifications
```

---

## Capa de Inteligencia Artificial (AI Engineering & Prompts)

SchemaCV incorpora una capa de IA fuertemente tipada, versionada y centralizada en [`/lib/ai/prompts.ts`](lib/ai/prompts.ts) bajo el modelo **BYOK (Bring Your Own Key)** compatible con Google Gemini (`gemini-3.6-flash`), OpenAI (`gpt-4o-mini`) y Anthropic Claude (`claude-3-5-haiku`).

### 🛡️ La Regla de Oro de Honestidad
> **Principio Inquebrantable:** La IA de SchemaCV tiene **estrictamente prohibido inventar** empleos, métricas, herramientas, habilidades o proyectos que no existan en el CV del usuario. Su función es analizar, reestructurar y potenciar la trayectoria real. Si una palabra clave requerida no tiene respaldo en la experiencia del candidato, la IA la clasifica explícitamente como una brecha real y propone una ruta honesta de adquisición (proyectos personales, documentación o certificaciones).

### 🧠 Catálogo de Skills de la IA

| Skill | Prompt Builder | Temperatura | Salida | Propósito y Capacidades |
| :--- | :--- | :--- | :--- | :--- |
| **1. Extracción de Keywords** | `buildExtractKeywordsPrompt` | `0.2` | JSON Estricto | Extrae hasta 40 keywords normalizadas, categoría (hard/tool/soft), importancia (*required* vs *preferred*), años de experiencia y grado académico. |
| **2. Explicación de Match** | `buildExplainMatchPrompt` | `0.4` | Texto | Explica el puntaje de afinidad, destaca 3 fortalezas clave, 3 brechas prioritarias y entrega un veredicto de postulación honesto. |
| **3. Sugerencias de Mejora** | `buildSuggestImprovementsPrompt` | `0.3` | JSON Estricto | Analiza keywords faltantes: si tienen respaldo genera viñetas de ejemplo; si no, indica ruta de aprendizaje. |
| **4. Narrativa de Auditoría ATS** | `buildATSAuditNarrativePrompt` | `0.3` | Texto | Traduce los fallos deterministas de `/lib/ats` en explicaciones comprensibles y pasos de corrección sin suavizar errores críticos. |
| **5. Reescritor de Bullets** | `buildBulletRewriterPrompt` | `0.4` | JSON Estricto | Transforma viñetas aplicando la fórmula *[Verbo de acción] + [Métrica de impacto] + [Tecnología]* preservando cifras reales. |
| **6. Carta de Presentación** | `buildCoverLetterPrompt` | `0.6` | Texto | Redacta cartas de presentación de 3 párrafos (máx 250 palabras) con gancho técnico y sin clichés genéricos. |
| **7. Copilot de Postulación** | `buildChatSystemPrompt` | `0.7` | Streaming | Asistente conversacional con contexto total de la vacante y el CV para simulación de entrevistas STAR y asesoría de carrera. |

### 🧪 Suite de Pruebas de Prompts
```bash
# Ejecutar validación unitaria de prompts, sanitizado y parsers
npm run test:prompts
```

### 🛠️ Cómo Contribuir o Modificar Prompts
1. **Edición Centralizada:** Modifica exclusivamente [`lib/ai/prompts.ts`](lib/ai/prompts.ts) (prohibidos los prompts inline dispersos en componentes).
2. **Versionado Semver:** Incrementa `PROMPTS_VERSION` ante cualquier cambio en reglas, tono o esquemas de salida.
3. **Validación Zod:** Si añades una nueva salida estructurada, define su correspondiente `ZodSchema` y función `parse*Output`.
4. **Verificación:** Asegura que todos los tests pasen ejecutando `npm run test:prompts && npm run test:ats`.

---

## Atajos de Teclado

| Atajo | Acción |
| :--- | :--- |
| `Ctrl + Z` / `Cmd + Z` | Deshacer cambio en el CV |
| `Ctrl + Y` / `Ctrl + Shift + Z` | Rehacer cambio |
| `Ctrl + P` / `Cmd + P` | Imprimir o Guardar en PDF |

---

## Stack Tecnológico

- **Framework:** Next.js 15+ (App Router)
- **Capa de IA:** Vercel AI SDK (`ai`), `@ai-sdk/google`, `@ai-sdk/openai`, `@ai-sdk/anthropic`
- **Interfaz y Componentes:** React 19, Radix UI, Lucide Icons, Framer Motion
- **Estilos:** Tailwind CSS v4
- **Gestión de Estado:** Zustand con persistencia en LocalStorage
- **Editor de Código:** CodeMirror 6 con soporte YAML
- **Validación:** Zod 4
- **Generación DOCX:** docx
- **Motor PDF:** Puppeteer y unpdf

---

## 👤 Autor y Créditos

**SchemaCV** fue diseñado, desarrollado y es mantenido por:

- **Autor:** Joain Monroy Santos
- **GitHub:** [@devSantos8](https://github.com/devSantos8)
- **LinkedIn:** [linkedin.com/in/jmonroys17](https://linkedin.com/in/jmonroys17)
- **Email:** [joainsantos.m@gmail.com](mailto:joainsantos.m@gmail.com)

---

## 📄 Licencia

Este proyecto está licenciado bajo la **Licencia MIT**. Puedes usarlo, modificarlo y distribuirlo libremente manteniendo el aviso de derechos de autor original.

Consulta el archivo [LICENSE](LICENSE) para el texto legal completo.

```text
Copyright (c) 2024-2026 Joain Monroy Santos (devSantos8)
```
