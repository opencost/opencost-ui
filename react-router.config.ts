import type { Config } from "@react-router/dev/config";

const basename = process.env.VITE_BASENAME ?? undefined;

export default {
  ssr: false,
  ...(basename && { basename }),
} satisfies Config;
