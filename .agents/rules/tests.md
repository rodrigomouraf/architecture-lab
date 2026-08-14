# CRITICAL - Testing Standards

These rules are MANDATORY.

These rules apply to backend and frontend code. Automated tests are a critical part of the implementation and must not be skipped.

## Test all code

Every piece of production code must be covered by automated tests. This rule is critical and must not be ignored. A feature is not complete until its relevant behavior is tested and the test suite passes.

```ts
import { describe, expect, it } from "vitest";

describe("calculateTotal", () => {
  it("returns the sum of item prices", () => {
    const total = calculateTotal([
      { price: 10, quantity: 2 },
      { price: 5, quantity: 1 },
    ]);

    expect(total).toBe(25);
  });
});
```

## Maintain at least 80% coverage

The project must maintain a minimum of 80% automated test coverage. Measure coverage for statements, branches, functions, and lines. Treat a drop below the threshold as a failing quality check.

```ts
// vitest.config.ts
export default defineConfig({
  test: {
    coverage: {
      provider: "v8",
      thresholds: {
        statements: 80,
        branches: 80,
        functions: 80,
        lines: 80,
      },
    },
  },
});
```

Coverage is a signal, not proof of quality. Tests must validate meaningful behavior with effective assertions.

## Prioritize critical behavior

Prioritize tests according to business and operational risk. Critical flows such as checkout, payment, authentication, authorization, data integrity, and order processing must receive more attention than low-risk features such as basic product-category administration.

```ts
describe("checkout", () => {
  it("does not create an order when payment is declined", async () => {
    paymentGateway.charge.mockRejectedValueOnce(new PaymentDeclinedError());

    await expect(checkoutService.checkout(validCart)).rejects.toThrow(
      PaymentDeclinedError,
    );
    expect(orderRepository.create).not.toHaveBeenCalled();
  });
});
```

## Follow the FIRST principles

Use the FIRST principles for automated tests. The Timely principle is intentionally omitted from this standard.

### Fast

Tests must run quickly. Prefer unit tests and test doubles such as stubs to avoid slow external dependencies, network calls, file systems, databases, and unnecessary application startup.

```ts
it("returns the cached customer", async () => {
  const customerRepository = {
    findById: vi.fn().mockResolvedValue({ id: "customer-1" }),
  };
  const service = new CustomerService(customerRepository);

  await expect(service.findById("customer-1")).resolves.toEqual({
    id: "customer-1",
  });
});
```

### Independent

Tests must not depend on the order in which they run or on state created by another test. Each test must create its own data and reset mocks, database state, and shared resources between tests.

```ts
beforeEach(() => {
  vi.clearAllMocks();
});

it("accepts a valid email", () => {
  expect(validateEmail("person@example.com")).toBe(true);
});

it("rejects an invalid email", () => {
  expect(validateEmail("invalid-email")).toBe(false);
});
```

### Repeatable

Running a test repeatedly must produce the same result. Control nondeterministic inputs such as current time, random values, generated identifiers, and external API responses. Use mocks for values that would otherwise change between runs.

```ts
it("expires a session after the configured duration", () => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-01-01T10:00:00.000Z"));

  const session = createSession({ durationMinutes: 30 });

  vi.advanceTimersByTime(30 * 60 * 1000);

  expect(session.isExpired()).toBe(true);
  vi.useRealTimers();
});
```

### Self-validating

Tests must fail when the intended behavior is broken. Assert outcomes, state changes, errors, and important interactions. Do not write tests that only execute code or assert that a function returns a truthy value without verifying the requirement.

```ts
it("applies the discount only to eligible customers", () => {
  const total = calculateDiscountedTotal({
    subtotal: 100,
    customerType: "regular",
  });

  expect(total).toBe(100);
});
```

## Structure tests with Given/When/Then or AAA

Every test should have a clear setup, action, and verification. Use either Given/When/Then or Arrange/Act/Assert consistently within the test.

```ts
it("locks an account after too many failed attempts", () => {
  // Arrange
  const account = createAccount({ failedAttempts: 4 });

  // Act
  const updatedAccount = registerFailedLogin(account);

  // Assert
  expect(updatedAccount.isLocked).toBe(true);
});
```

## Follow the test pyramid

Keep the test suite broadest at the unit-test level, narrower at the integration-test level, and smallest at the end-to-end level. Use unit tests for isolated business rules, integration tests for collaboration with real internal components, and E2E tests for a small set of critical user journeys.

```text
        /\\
       /E2E\\       Few, critical user journeys
      /------\\
     /Integration\\  Service and component boundaries
    /--------------\\
   /   Unit tests   \\ Many, fast, isolated tests
  /------------------\\
```

## Use Vitest for automated tests

Use Vitest for unit and integration tests in both the backend and frontend. Prefer descriptive test names and Vitest assertions and mocks.

```ts
import { describe, expect, it, vi } from "vitest";

describe("OrderRepository", () => {
  it("returns an order by its identifier", async () => {
    const database = { query: vi.fn() };
    database.query.mockResolvedValueOnce({ id: "order-1" });

    const repository = new OrderRepository(database);

    await expect(repository.findById("order-1")).resolves.toEqual({
      id: "order-1",
    });
  });
});
```

## Use Playwright for E2E tests

Use Playwright for end-to-end tests. Keep E2E tests focused on critical, observable user journeys and avoid duplicating every unit-test case at the browser level.

```ts
import { expect, test } from "@playwright/test";

test("a customer can complete checkout", async ({ page }) => {
  await page.goto("/cart");
  await page.getByRole("button", { name: "Checkout" }).click();
  await page.getByLabel("Card number").fill("4242424242424242");
  await page.getByRole("button", { name: "Pay now" }).click();

  await expect(page.getByText("Order confirmed")).toBeVisible();
});
```

## Keep E2E tests in a top-level `e2e` directory

E2E tests must live in a top-level `e2e` directory outside both the frontend and backend directories. This keeps browser workflows separate from implementation-specific tests.

```text
project/
├── backend/
├── frontend/
└── e2e/
    ├── checkout.spec.ts
    └── authentication.spec.ts
```

## Test one concept per test

Each test must focus on one behavior or requirement. Do not combine unrelated behaviors in one test. Split success, validation, authorization, error, and side-effect requirements into separate tests so failures identify the broken requirement precisely.

```ts
describe("createProduct", () => {
  it("creates a product with valid input", () => {
    expect(createProduct(validProductInput())).toMatchObject({
      name: "Keyboard",
    });
  });

  it("rejects a product without a name", () => {
    expect(() => createProduct({ price: 50 })).toThrow("Name is required");
  });
});
```

## Cover frontend and backend comprehensively

Both frontend and backend code must have meaningful automated coverage. Frontend tests should verify rendered states, user interactions, accessibility-relevant behavior, and error states. Backend tests should verify business rules, validation, authorization, persistence boundaries, and failure handling.

```ts
it("shows a loading state while the products request is pending", () => {
  render(<ProductList products={undefined} isLoading />);

  expect(screen.getByText("Loading products")).toBeVisible();
});
```
