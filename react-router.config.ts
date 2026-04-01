import type { Config } from "@react-router/dev/config";

const legacyBasename =
  process.env.VITE_LEGACY_MODE === "true" && process.env.VITE_LEGACY_BASENAME
    ? process.env.VITE_LEGACY_BASENAME
    : undefined;

export default {
  ssr: false,
  ...(legacyBasename && { basename: legacyBasename }),
} satisfies Config;
