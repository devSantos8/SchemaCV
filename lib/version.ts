import packageJson from "@/package.json";

export interface AppManifest {
  name: string;
  version: string;
  description: string;
  author: string;
  homepage: string;
  releaseDate: string;
  environment: string;
}

export const APP_MANIFEST: AppManifest = {
  name: packageJson.name,
  version: packageJson.version,
  description: packageJson.description,
  author: packageJson.author,
  homepage: packageJson.homepage,
  releaseDate: "2026-08-26",
  environment: process.env.NODE_ENV || "development",
};
