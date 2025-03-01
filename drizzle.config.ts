import { defineConfig } from "drizzle-kit";

export default defineConfig({
  out: "./migrations",
  schema: "./db/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: "postgresql://stc:stxpassword@localhost:5432/clarity_agent",
  },
});
