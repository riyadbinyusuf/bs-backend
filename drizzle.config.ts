import { defineConfig } from "drizzle-kit";
import { env } from "./src/utils/env";

export default defineConfig({
  out: "./drizzle",
  schema: [
    "./src/models/schema.ts",
  ],
  dialect: "postgresql",
  dbCredentials: {
    url: env.DB_URL,
  },
});
