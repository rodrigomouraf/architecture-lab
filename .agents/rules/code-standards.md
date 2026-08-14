# Code Standards

These standards apply to all code in this repository. Examples use TypeScript.

## Avoid comments unless absolutely necessary

Do not add comments that merely restate what the code does. Prefer clear names and small functions. Add a comment only when the intent cannot be expressed clearly in code, such as when documenting a complex regular expression or an external constraint.

```ts
// Avoid: the comment repeats the code's behavior.
const activeUsers = users.filter((user) => user.isActive);

// Acceptable: the expression is complex and the business rule is not obvious.
const brazilianPhonePattern = /^\+55\s?\(?\d{2}\)?\s?9?\d{4}-?\d{4}$/;
```

## Keep classes and TypeScript files under 100 lines

Never create a class or `.ts` file with more than 100 lines. If a class or file grows beyond this limit, split it by responsibility. Keep orchestration, domain logic, validation, and infrastructure concerns in separate modules.

```ts
// Prefer focused files:
// user-validator.ts  -> validation rules
// user-repository.ts -> persistence
// user-service.ts    -> use-case orchestration
```

## Keep methods and functions under 30 lines

Methods and functions must contain no more than 30 lines. When behavior is longer, extract cohesive steps into smaller private methods or standalone functions with meaningful names.

```ts
function createUser(input: CreateUserInput): User {
  const normalizedInput = normalizeUserInput(input);
  validateUserInput(normalizedInput);
  const user = buildUser(normalizedInput);

  return saveUser(user);
}

function normalizeUserInput(input: CreateUserInput): CreateUserInput {
  return {
    ...input,
    email: input.email.trim().toLowerCase(),
    name: input.name.trim(),
  };
}
```

## Limit conditional nesting to three levels

Do not nest more than three `if`/`else` levels. Prefer guard clauses and early returns to reduce accumulated conditional logic. Extract a decision into a named function when it remains difficult to read.

```ts
function processOrder(order: Order | null): Result {
  if (!order) {
    return failure("Order not found");
  }

  if (order.status !== "pending") {
    return failure("Order cannot be processed");
  }

  if (!hasStock(order.items)) {
    return failure("Insufficient stock");
  }

  return fulfillOrder(order);
}
```

## Use no more than three parameters

Methods and functions should have at most three parameters. When more data is required, create a parameter object with a descriptive type.

```ts
type SendEmailParams = {
  recipient: string;
  subject: string;
  body: string;
  replyTo?: string;
};

function sendEmail(params: SendEmailParams): Promise<void> {
  return emailClient.send(params);
}
```

## Extract magic numbers and strings into constants

Replace unexplained numeric and string literals with constants whose names clarify the concept and intent.

```ts
const MAX_LOGIN_ATTEMPTS = 5;
const ACCOUNT_LOCK_DURATION_MINUTES = 15;
const ACCOUNT_LOCKED_MESSAGE = "Account temporarily locked";

if (failedAttempts >= MAX_LOGIN_ATTEMPTS) {
  lockAccount(ACCOUNT_LOCK_DURATION_MINUTES);
  return failure(ACCOUNT_LOCKED_MESSAGE);
}
```

## Declare variables close to their use

Declare a variable immediately before the operation that uses it. Avoid creating variables at the beginning of a long function or keeping values alive across unrelated logic.

```ts
function buildInvoice(order: Order): Invoice {
  const customer = findCustomer(order.customerId);
  validateCustomer(customer);

  const lineItems = createLineItems(order.items);
  const total = calculateTotal(lineItems);

  return { customer, lineItems, total };
}
```

## Keep sensitive data out of source code

Never hard-code sensitive values such as API keys, passwords, tokens, private certificates, or connection strings. Store them in an external `.env` file, keep that file out of version control, and read values through environment configuration.

```ts
const apiKey = process.env.PAYMENTS_API_KEY;

if (!apiKey) {
  throw new Error("PAYMENTS_API_KEY is not configured");
}

const paymentsClient = new PaymentsClient({ apiKey });
```

```env
# .env (never commit this file)
PAYMENTS_API_KEY=replace-with-a-local-secret
```

Use a committed `.env.example` containing placeholders when other developers need to know which variables are required.

```env
# .env.example
PAYMENTS_API_KEY=
```
