import { renderToBuffer, Font } from "@react-pdf/renderer";
import React from "react";
import { PdfDocument, PdfDocumentProps } from "./PdfDocument";

// Deshabilitar partición de palabras con guiones (Hyphenation).
// Esto resuelve el error de ESM en Node.js y previene que el ATS divida palabras clave técnicas (ej. 'TypeScript' -> 'Type-script').
Font.registerHyphenationCallback((word) => [word]);

export async function generateNativeResumePdf(props: PdfDocumentProps): Promise<Buffer> {
  const documentElement = React.createElement(PdfDocument, props);
  const buffer = await renderToBuffer(documentElement);
  return Buffer.from(buffer);
}
