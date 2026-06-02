/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BASE_API_URL?: string;
  readonly VITE_LEGACY_MODE?: string;
  readonly VITE_LEGACY_BASENAME?: string;

  readonly VITE_CLERK_PUBLISHABLE_KEY?: string;
  readonly VITE_CLERK_JWT_TEMPLATE?: string;
  readonly VITE_CLERK_ORG_ROLE_ADMIN?: string;
  readonly VITE_CLERK_ORG_ROLE_MEMBER?: string;
  readonly VITE_AUTH_DISABLED?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
