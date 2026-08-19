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

[Características](#características-principales) •
[Perfil Base y Versiones](#perfil-base-maestro-y-versiones-de-cv) •
[Filosofía de 1 Hoja](#filosofía-de-1-sola-hoja) •
[Catálogo de Plantillas](#catálogo-de-plantillas-ats) •
[Instalación](#instalación-y-desarrollo) •
[Esquema YAML](#esquema-yaml-rendercv-compatible) •
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

### 5. Ingesta Asistida por IA
- Extracción y normalización automática de datos a partir de archivos PDF existentes hacia el esquema estructurado de SchemaCV.

---

## Catálogo de Plantillas ATS

| Plantilla | Identificador | Tipografía | Densidad | Casos de Uso Recomendados |
| :--- | :--- | :--- | :--- | :--- |
| **Harvard Classic** | `harvard` | Serif (EB Garamond) | Media | Finanzas, Consultoría, Legal, Perfiles Académicos y Corporativos |
| **Tech Minimalist** | `tech_minimalist` | Sans-Serif + Monospace | Alta | Software Engineers, DevOps, Backend, Frontend y Full-Stack |
| **Stanford Clean** | `stanford_clean` | Sans-Serif (Geist Sans) | Alta | Product Managers, Data Scientists, Ingenieros de IA y Startups |
| **Compact Swiss Grid** | `compact_swiss` | Swiss Modernist (Helvetica) | Máxima (1 Hoja) | Perfiles Senior con trayectoria extensa que requieren formato estricto de 1 página |
| **Modern Executive** | `modern_executive` | Sans-Serif con Acento Lateral | Media | Tech Leads, Engineering Managers y Arquitectos de Software |
| **Skills-First / Builder** | `skills_first` | Sans-Serif Clean | Alta | Makers, Fundadores Técnicos y Desarrolladores Open Source |

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

- **PDF Vectorial:** Renderizado nativo de alta resolución compatible con impresión de navegador y servicio headless Puppeteer.
- **Word (.docx):** Documentos generados con la librería `docx`, utilizando estilos de encabezado semánticos estándar para lectura automatizada por ATS.
- **Esquema YAML:** Archivo estructurado `.yaml` compatible con la especificación de RenderCV.
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

### 3. Ejecutar servidor de desarrollo
```bash
npm run dev
```
Accede en el navegador a [http://localhost:3000](http://localhost:3000).

### 4. Compilar para producción
```bash
npm run build
npm run start
```

---

## Esquema YAML (RenderCV Compatible)

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

## Atajos de Teclado

| Atajo | Acción |
| :--- | :--- |
| `Ctrl + Z` / `Cmd + Z` | Deshacer cambio en el CV |
| `Ctrl + Y` / `Ctrl + Shift + Z` | Rehacer cambio |
| `Ctrl + P` / `Cmd + P` | Imprimir o Guardar en PDF |

---

## Stack Tecnológico

- **Framework:** Next.js 15+ (App Router)
- **Interfaz y Componentes:** React 19, Radix UI, Lucide Icons
- **Estilos:** Tailwind CSS v4
- **Gestión de Estado:** Zustand con persistencia en LocalStorage
- **Editor de Código:** CodeMirror 6 con soporte YAML
- **Validación:** Zod 4
- **Generación DOCX:** docx
- **Motor PDF:** Puppeteer y unpdf

## Licencia

Este proyecto se distribuye bajo la licencia MIT. Consulta el archivo `LICENSE` para más información.
