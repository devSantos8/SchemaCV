# Changelog

Todos los cambios notables en este proyecto serán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/),
y este proyecto se adhiere a [Semantic Versioning](https://semver.org/lang/es/).

## [Unreleased]

## [0.1.0] - 2026-08-26

### Added
- Integración de Copilot IA con Google Gemini y gestión de sesiones contextuales.
- Motor de auditoría ATS determinista con 12 reglas de verificación.
- Modal de vista previa ampliada para inspección visual de las 12 plantillas.
- Pipeline de Integración Continua (CI) en GitHub Actions para validación automática de código.
- Script de diagnóstico preventivo local (`scripts/healthcheck.ts`).
- Exportador de currículums a formato Microsoft Word (.docx) nativo.
- Panel interactivo de comparación entre perfil de candidato y oferta laboral.

### Changed
- Optimización de espaciados y jerarquía semántica en todas las plantillas para formato estricto de 1 página.
- Configuración de ESLint flat config para compatibilidad con Next.js 16.
- Estandarización de tipografías web-safe en los exportadores PDF y HTML.

### Fixed
- Corrección de reglas de hooks en páginas de evaluación (`Rules of Hooks`).
- Normalización de caracteres en encabezados JSX de plantillas compactas.
- Eliminación de falsos positivos en detección de tokens fusionados para URLs técnicas.
