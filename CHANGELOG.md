# Changelog

Todos los cambios notables en este proyecto serán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/),
y este proyecto se adhiere a [Semantic Versioning](https://semver.org/lang/es/).

## [Unreleased]

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
