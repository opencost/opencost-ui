import type { Config } from "@react-router/dev/config";

const basename = process.env.VITE_BASENAME;

export default {
  ssr: false,
  ...(basename && basename !== "" && { basename }),
} satisfies Config;
