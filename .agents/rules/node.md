# Node.js Standards

These standards apply to Node.js services, scripts, workers, and backend modules in this repository.

## Prefer `async`/`await` over callbacks

Use `async`/`await` for asynchronous control flow. It improves readability, keeps error handling consistent, and avoids deeply nested callback chains. Use callbacks only when an API requires them or when implementing a callback-based interface.

```ts
async function readUserProfile(userId: string): Promise<UserProfile> {
  const response = await userClient.getProfile(userId);

  return response.profile;
}
```

```ts
// Avoid callback nesting for application logic.
userClient.getProfile(userId, (error, profile) => {
  if (error) {
    handleError(error);
    return;
  }

  renderProfile(profile);
});
```

Handle errors explicitly and avoid unhandled promise rejections.

```ts
async function startApplication(): Promise<void> {
  try {
    await server.listen();
  } catch (error: unknown) {
    logger.error("Failed to start application", error);
    process.exitCode = 1;
  }
}
```

## Do not block the event loop unnecessarily

Node.js relies on a single event loop for JavaScript execution. Avoid synchronous file-system, cryptographic, compression, child-process, and network operations in request handlers or other hot paths. Prefer asynchronous APIs and move CPU-intensive work to worker threads or a separate job service.

```ts
import { readFile } from "node:fs/promises";

async function loadTemplate(path: string): Promise<string> {
  return readFile(path, "utf8");
}
```

```ts
// Avoid synchronous I/O in a request handler.
import { readFileSync } from "node:fs";

function handleRequest(): string {
  return readFileSync("template.html", "utf8");
}
```

For heavy calculations, use a worker thread or queue instead of calculating synchronously while handling requests.

```ts
import { Worker } from "node:worker_threads";

function calculateReport(input: ReportInput): Promise<Report> {
  return new Promise((resolve, reject) => {
    const worker = new Worker(new URL("./report-worker.js", import.meta.url), {
      workerData: input,
    });

    worker.once("message", resolve);
    worker.once("error", reject);
  });
}
```

## Load environment variables with `dotenv`

Keep configuration and secrets in an external `.env` file. Load them with `dotenv` at the application boundary, validate required values, and never commit real secrets. Keep `.env` in `.gitignore` and provide `.env.example` with placeholders.

```ts
import "dotenv/config";

type AppConfig = {
  port: number;
  databaseUrl: string;
};

function loadConfig(): AppConfig {
  const port = Number(process.env.PORT ?? "3000");
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required");
  }

  return { port, databaseUrl };
}
```

```env
# .env (never commit real values)
PORT=3000
DATABASE_URL=postgres://user:password@localhost:5432/app
```

```env
# .env.example
PORT=3000
DATABASE_URL=
```

## Apply graceful shutdown to HTTP servers

When the process receives `SIGTERM` or `SIGINT`, stop accepting new connections, allow in-flight requests to finish, close databases and other resources, and exit with an appropriate status. Make shutdown idempotent and enforce a timeout so the process cannot remain alive forever.

```ts
const SHUTDOWN_TIMEOUT_MS = 10_000;
let isShuttingDown = false;

async function shutdown(signal: string): Promise<void> {
  if (isShuttingDown) {
    return;
  }

  isShuttingDown = true;
  logger.info(`Received ${signal}; shutting down`);

  const timeout = setTimeout(() => {
    logger.error("Graceful shutdown timed out");
    process.exit(1);
  }, SHUTDOWN_TIMEOUT_MS);

  try {
    await httpServer.close();
    await database.close();
    clearTimeout(timeout);
    process.exitCode = 0;
  } catch (error: unknown) {
    clearTimeout(timeout);
    logger.error("Graceful shutdown failed", error);
    process.exitCode = 1;
  }
}

process.once("SIGTERM", () => void shutdown("SIGTERM"));
process.once("SIGINT", () => void shutdown("SIGINT"));
```

## Centralize logging through an adapter

Use `console.log` and `console.error` only inside a centralized logging adapter. Application modules must depend on the adapter rather than calling console methods directly. This keeps formatting and future integration with a structured logging system in one place.

```ts
type LogContext = Record<string, string | number | boolean>;

export const logger = {
  info(message: string, context?: LogContext): void {
    console.log(JSON.stringify({ level: "info", message, ...context }));
  },

  error(message: string, error?: unknown, context?: LogContext): void {
    const errorMessage = error instanceof Error ? error.message : error;
    console.error(
      JSON.stringify({ level: "error", message, error: errorMessage, ...context }),
    );
  },
};
```

```ts
// Application code uses the adapter.
logger.info("Order created", { orderId: order.id });

try {
  await processOrder(order);
} catch (error: unknown) {
  logger.error("Order processing failed", error, { orderId: order.id });
}
```

```ts
// Avoid direct console usage outside the logging adapter.
console.log("Order created");
console.error(error);
```

## Version lock files

Commit the package-manager lock file and keep it synchronized with the manifest. For npm, version `package-lock.json`; for pnpm, version `pnpm-lock.yaml`; for Yarn, version `yarn.lock`. Do not delete or ignore lock files to work around dependency resolution problems.

```text
project/
├── package.json
├── package-lock.json
└── .gitignore
```

## Avoid circular dependencies

Keep the dependency graph acyclic. Extract shared types and utilities into lower-level modules, depend on abstractions where appropriate, and organize modules by clear responsibility. Do not fix a circular dependency by relying on import order or partially initialized exports.

```ts
// shared/order-types.ts: low-level shared contract
export type Order = {
  id: string;
  total: number;
};
```

```ts
// order-service.ts imports the contract, but shared types do not import the service.
import type { Order } from "./shared/order-types.js";

export function summarizeOrder(order: Order): string {
  return `${order.id}: ${order.total}`;
}
```

```ts
// Avoid: order-service.ts imports payment-service.ts while payment-service.ts
// imports order-service.ts, creating a circular dependency.
```

## Keep process-level failures observable

Register handlers for otherwise unhandled failures, log the failure through the centralized adapter, and terminate when the process may be in an unsafe state. Do not silently continue after an uncaught exception.

```ts
process.on("unhandledRejection", (reason: unknown) => {
  logger.error("Unhandled promise rejection", reason);
  process.exitCode = 1;
});

process.on("uncaughtException", (error: Error) => {
  logger.error("Uncaught exception", error);
  process.exit(1);
});
```
