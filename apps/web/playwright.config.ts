import { defineConfig, devices } from "@playwright/test";

const apiPort = Number(process.env.STUDYFLOW_E2E_API_PORT ?? 3000);
const webPort = Number(process.env.STUDYFLOW_E2E_WEB_PORT ?? 4175);
const apiUrl = `http://127.0.0.1:${apiPort}`;
const webUrl = process.env.PLAYWRIGHT_BASE_URL ?? `http://127.0.0.1:${webPort}`;
const mongoUri =
    process.env.MONGODB_URI ?? "mongodb://127.0.0.1:27017/studyflow_e2e";
const redisUrl = process.env.REDIS_URL ?? "redis://127.0.0.1:6379";
const startServers = process.env.STUDYFLOW_E2E_START_SERVERS !== "false";

const apiCommand = [
    "npm --prefix ../api run build",
    `MONGODB_URI="${mongoUri}" node ../api/dist/scripts/seed-development-users.js`,
    [
        `MONGODB_URI="${mongoUri}"`,
        `REDIS_URL="${redisUrl}"`,
        `PORT="${apiPort}"`,
        `WEB_ORIGIN="${webUrl}"`,
        'STUDYFLOW_E2E_FAKE_AI="true"',
        "node ../api/dist/main.js",
    ].join(" "),
].join(" && ");

export default defineConfig({
    testDir: "./tests/e2e",
    timeout: 60_000,
    expect: { timeout: 10_000 },
    fullyParallel: false,
    retries: process.env.CI ? 1 : 0,
    reporter: [["list"], ["html", { open: "never" }]],
    use: {
        baseURL: webUrl,
        trace: "retain-on-failure",
        screenshot: "only-on-failure",
        video: "retain-on-failure",
    },
    projects: [
        {
            name: "chromium",
            use: { ...devices["Desktop Chrome"] },
        },
    ],
    webServer: startServers
        ? [
              {
                  command: apiCommand,
                  url: `${apiUrl}/api/auth/me`,
                  reuseExistingServer: !process.env.CI,
                  timeout: 120_000,
              },
              {
                  command: `npm run dev -- --host 127.0.0.1 --port ${webPort}`,
                  url: webUrl,
                  reuseExistingServer: !process.env.CI,
                  timeout: 60_000,
              },
          ]
        : undefined,
});
