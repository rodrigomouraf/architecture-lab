# JavaScript and TypeScript Standards

These standards apply to all JavaScript and TypeScript code in the repository. Prefer code that is explicit, type-safe, predictable, and easy to review.

## Prefer `const`; never use `var`

Use `const` by default. Use `let` only when a variable must be reassigned. Never use `var`, because its function scope and hoisting behavior make code harder to reason about.

```ts
const userName = "Ada";
let retryCount = 0;

retryCount += 1;
```

```ts
// Avoid
var total = 0;
```

## Use strict equality

Always compare values with `===` and `!==`. Never use `==` or `!=`, because implicit coercion can hide bugs.

```ts
if (user.id === requestedUserId) {
  return user;
}

if (value !== null) {
  process(value);
}
```

## Never use `any`

Do not use `any`, including implicit `any`. Prefer a specific type, a generic, `unknown` for untrusted values, or a discriminated union. Narrow `unknown` before using it.

```ts
function parseJson(value: string): unknown {
  return JSON.parse(value);
}

function getMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return "Unknown error";
}
```

```ts
// Avoid
function renderData(data: any): void {
  console.log(data);
}
```

## Prefer explicit types for object parameters and returns

Define named types or interfaces for object-shaped parameters and return values. This makes contracts visible and allows the compiler to catch incorrect usage.

```ts
type CreateUserInput = {
  name: string;
  email: string;
};

type User = {
  id: string;
  name: string;
  email: string;
};

function createUser(input: CreateUserInput): User {
  return {
    id: crypto.randomUUID(),
    name: input.name,
    email: input.email,
  };
}
```

Type primitive values too when the annotation improves a public contract or prevents ambiguity. Let obvious local primitive types be inferred when the type is self-evident.

```ts
const maxRetries = 3;
const isEnabled = true;
```

## Prefer arrow functions where appropriate

Use arrow functions for callbacks, especially with `map`, `filter`, `reduce`, event handlers, and promise chains. Keep primary or exported functions as declarations when that improves discoverability, stack traces, hoisting behavior, or the module's public structure.

```ts
function getActiveUserNames(users: User[]): string[] {
  return users
    .filter((user) => user.isActive)
    .map((user) => user.name);
}
```

```ts
const total = items.reduce((sum, item) => sum + item.price, 0);
button.addEventListener("click", () => submitForm());
```

## Use non-nested ternaries for simple conditional assignment

Use a ternary for a short, readable conditional value assignment. Ternaries must never be nested. Use `if` statements or extract a named function when the condition is complex or has multiple branches.

```ts
const label = isLoading ? "Loading" : "Ready";
const access = user.isAdmin ? "admin" : "member";
```

```ts
// Avoid nested ternaries
const label = isLoading ? "Loading" : hasError ? "Error" : "Ready";
```

## Avoid mutation when it reduces clarity

Prefer immutable transformations for collections and object updates. Do not mutate function arguments or shared state unexpectedly.

```ts
function addTag(article: Article, tag: string): Article {
  return {
    ...article,
    tags: [...article.tags, tag],
  };
}
```

## Use guard clauses for invalid states

Return early for invalid input, missing data, and exceptional cases. This keeps the main path at a low indentation level.

```ts
function publishArticle(article: Article | null): PublishedArticle {
  if (!article) {
    throw new Error("Article is required");
  }

  if (article.status !== "draft") {
    throw new Error("Only drafts can be published");
  }

  return { ...article, status: "published" };
}
```

## Use meaningful names

Names should communicate intent and domain meaning. Avoid abbreviations, vague names, and names that describe implementation details instead of behavior.

```ts
const unpaidInvoiceCount = invoices.filter(
  (invoice) => invoice.status === "unpaid",
).length;
```

```ts
// Avoid
const x = data.filter((item) => item.s === "u").length;
```

## Handle promises explicitly

Await promises when the result is needed, return them when forwarding the result, and handle expected failures. Do not leave promises floating unintentionally.

```ts
async function loadUser(userId: string): Promise<User> {
  const response = await userClient.get(userId);

  return response.user;
}
```

Use `Promise.all` for independent asynchronous operations that can run concurrently.

```ts
async function loadDashboard(userId: string): Promise<DashboardData> {
  const [profile, notifications] = await Promise.all([
    loadProfile(userId),
    loadNotifications(userId),
  ]);

  return { profile, notifications };
}
```

## Keep modules focused

Each module should have one clear responsibility. Export only what other modules need, avoid circular dependencies, and keep side effects at explicit application boundaries.

```ts
// currency.ts: formatting and conversion only
export function formatCurrency(amountInCents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amountInCents / 100);
}
```

## Use exhaustive handling for unions

When handling a discriminated union, cover every valid case and make future additions visible to the compiler.

```ts
type PaymentResult =
  | { status: "approved"; transactionId: string }
  | { status: "declined"; reason: string };

function describePayment(result: PaymentResult): string {
  if (result.status === "approved") {
    return `Approved: ${result.transactionId}`;
  }

  return `Declined: ${result.reason}`;
}
```

## Validate with the compiler, linter, and Biome

After every task that changes code, run the project's type checker, linter, and Biome checks. Fix reported issues before considering the task complete.

```powershell
npm run typecheck
npm run lint
npx biome check .
```

If the repository does not yet define a lint script or does not have Biome installed, report that limitation and configure the missing tooling before relying on those checks in CI. Do not silently skip the validation.
