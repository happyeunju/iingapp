import { defineWorkersConfig } from "@cloudflare/vitest-pool-workers/config";

export default defineWorkersConfig({
  test: {
    poolOptions: {
      workers: {
        main: "src/index.ts",
        miniflare: {
          compatibilityDate: "2024-09-09",
          compatibilityFlags: ["nodejs_compat"],
          vars: {
            ENV: "test",
            JWT_SECRET: "test-secret-do-not-use-in-prod",
            SUPABASE_URL: "https://example.supabase.co",
            SUPABASE_SERVICE_ROLE_KEY: "test-service-role-key",
          },
        },
      },
    },
  },
});
