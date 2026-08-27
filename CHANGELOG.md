# Changelog

Todos los cambios notables en este proyecto serán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/),
y este proyecto se adhiere a [Semantic Versioning](https://semver.org/lang/es/).

## [Unreleased]

### Added
- **Sección de Referencias Laborales**: Soporte integral para agregar, reordenar y visualizar referencias en el editor visual, drag-and-drop, exportadores (PDF, DOCX, YAML) y las 12 plantillas de diseño.
- **Reglas ATS Corporativas Avanzadas (Workday, Taleo, Greenhouse, iCIMS)**:
  - *Orden Cronológico Inverso*: Detección y validación de orden decreciente en historial de empleos.
  - *Cuantificación de Logros*: Verificación de métricas cuantificables (%, cifras, tiempos de reducción, volumen) en al menos el 30-40% de las viñetas.
  - *Verbos de Acción Fuertes*: Validación de verbos de impacto al inicio de viñetas (*Desarrollé*, *Lideré*, *Optimizé*, *Built*, *Led*, etc.).
- **Suite de Validación E2E ATS Expandida**: Nuevas reglas automáticas A7 (Extracción de referencias con contacto) y A8 (Delimitación limpia de proyectos técnicos).

### Changed
- **Calibración Matemática del Score ATS**: Recalibración de los pesos de las 13 reglas deterministas de formato para sumar exactamente 100 puntos netos.
- **Paridad Visual 1:1 en Exportación PDF**: El PDF exportado conserva al 100% la estética, tipografía, alineaciones y colores corporativos de la plantilla seleccionada en el editor.
- **Ajuste Estricto a 1 Página**: Calibración de tipografía y espaciado para que CVs densos (incluso con 5 certificaciones) quepan exactamente en 1 sola página.

### Fixed
- **Cálculo de Años de Experiencia**: Corrección en el parser de fechas para extraer años a partir de strings con mes (ej. "Mar 2026"), evitando que devuelva 0 años en la coincidencia con ofertas.
- **Normalización de Ligaduras OCR**: Conversión automática de ligaduras tipográficas (`ﬁ` -> `fi`, `ﬂ` -> `fl`, `ﬀ` -> `ff`) en el importador de CVs para evitar pérdidas de palabras clave.
- **Preservación de Cargos en Experiencia**: Corrección del parser heurístico para evitar la sobrescritura del cargo (`subHeader`) en bloques laborales consecutivos.

## [1.0.0] - 2026-08-26

### Added
- Lanzamiento oficial de SchemaCV: Plataforma de ingeniería de currículums técnicos y auditoría ATS.
- Editor dual en tiempo real (Formulario interactivo y editor de código YAML/JSON).
- Asistente Copilot IA integrado con Google Gemini con prompts estructurados y validación Zod.
- Motor de auditoría ATS determinista con 12 reglas de verificación exhaustiva.
- Soporte para 12 plantillas profesionales optimizadas para formato estricto de 1 página.
- Módulos de exportación nativa a PDF (Puppeteer), DOCX (docx) y HTML semántico.
- Pipeline de Integración Continua (CI) en GitHub Actions (`.github/workflows/ci.yml`).
- Manifiesto declarativo `manifest.yaml` y suite de diagnóstico preventivo (`scripts/devops/healthcheck.ts`).
- Script de automatización de versiones `scripts/devops/bump-version.ts` (`npm run bump:patch`, `bump:minor`, `bump:major`).
- Módulo de rastreo y gestión de postulaciones laborales con scraping automatizado.

### Changed
- Reorganización modular de la carpeta `scripts/` en subdirectorios por dominio (`ai`, `ats`, `devops`, `jobs`, `pdf`).
- Configuración de ESLint flat config para compatibilidad con Next.js 16.
- Estandarización de tipografías web-safe y diseño responsive en todo el catálogo de plantillas.
- Limpieza de comentarios y optimización de ejecución en el pipeline de GitHub Actions.

### Fixed
- Corrección de reglas de hooks en páginas de evaluación (`Rules of Hooks`).
- Normalización de literales de comentarios en encabezados JSX de plantillas compactas.
- Eliminación de falsos positivos en detección de tokens fusionados para URLs técnicas.
