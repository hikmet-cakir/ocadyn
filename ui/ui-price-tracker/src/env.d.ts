/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

interface ImportMetaEnv {
  /** Leave empty to use same-origin `/api/*` routes through nginx (recommended). */
  readonly PUBLIC_API_BASE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
