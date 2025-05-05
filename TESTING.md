# Testing Guide for Web3 Dashboard

This document outlines the testing approach for the Web3 Dashboard application. We use Jest as our primary testing framework.

## Running Tests

To run all tests:

```bash
npm test
```

To run tests with coverage reports:

```bash
npm run test:coverage
```

To run tests in watch mode during development:

```bash
npm run test:watch
```

## Test Structure

Tests are organized to mirror the application structure:

```
__tests__/
  api/
    address/         # Tests for address-related API endpoints
    network/         # Tests for network-related API endpoints
    token/           # Tests for token-related API endpoints
    util/            # Tests for utility functions
      services/      # Tests for service functions
  lib/               # Tests for library functions
```

## Testing Patterns

### API Endpoint Tests

API endpoint tests follow this pattern:

1. Create a mock request
2. Mock the dependencies (like the Alchemy client)
3. Execute the API handler
4. Verify the expected response

Example:

```typescript
// Mock the dependencies
jest.mock("@/app/api/util/alchemy-client", () => ({
  alchemyRequest: jest.fn(),
}));

// Test the endpoint
it("should fetch NFTs for a valid address", async () => {
  // Mock the response from dependencies
  (alchemyRequest as jest.Mock).mockResolvedValue(mockResponse);

  // Create a mock request
  const mockRequest = createMockRequest({ address: "0xUser1" });

  // Call the API handler
  await GET(mockRequest);

  // Verify the dependencies were called correctly
  expect(alchemyRequest).toHaveBeenCalledWith(
    "getNFTs",
    ["owner=0xUser1&withMetadata=true&pageSize=100"],
    true
  );

  // Verify the response
  expect(NextResponse.json).toHaveBeenCalledWith(mockResponse);
});
```

### Utility Function Tests

Utility function tests verify the behavior of utility and service functions:

1. Set up mocks for any dependencies
2. Prepare test inputs
3. Call the function with the inputs
4. Verify the expected outputs

Example:

```typescript
it('should format transfer data into recent transactions', () => {
  // Prepare test inputs
  const mockTransfers = [...];
  const blockTimestamps = {...};

  // Call the function
  const result = processRecentTransactions(mockTransfers, blockTimestamps);

  // Verify the expected output
  expect(result).toEqual([...expected output...]);
});
```

### Library Function Tests

Library function tests verify the behavior of utility functions in the lib directory:

```typescript
it("should truncate an address with default parameters", () => {
  const address = "0x1234567890abcdef1234567890abcdef12345678";
  expect(truncateAddress(address)).toBe("0x1234...5678");
});
```

## Adding New Tests

To add tests for a new API endpoint or utility function:

1. Create a new test file mirroring the app's structure (e.g., `__tests__/api/path/to/file.test.ts`)
2. Import the necessary dependencies and function(s) to test
3. Set up mocks as needed
4. Write test cases following the patterns above

## Handling Dependencies with Compatibility Issues

Some libraries like `viem` may cause compatibility issues with Jest due to dependencies on Node.js or browser APIs. You have a few options:

1. Create a separate test file with a simplified mock implementation of the function you're testing
2. Use Jest's module mocking to replace the library with a simplified implementation
3. Add polyfills for missing APIs in the Jest setup file

Example of a simplified mock implementation:

```typescript
// Define a simplified version of the function that doesn't use troublesome dependencies
function formatTokenBalances(tokenData, dustThreshold = 0.0001) {
  // Simplified implementation for testing purposes
  return {
    address: tokenData.address,
    tokens: tokenData.tokens
      .map((token) => ({
        // Transform token data
      }))
      .filter(/* Filter conditions */)
      .sort(/* Sort conditions */),
  };
}
```

## Mocking Guidelines

- Use Jest's mocking capabilities to isolate functions during testing
- For complex functions, consider mocking their implementation rather than their return values
- When testing API endpoints, mock external service calls to prevent actual API requests
- Use `jest.spyOn` to verify function calls while allowing original implementations when desired

## Test Coverage

We aim to maintain high test coverage for critical application areas:

- API endpoints: 100% coverage
- Utility functions: 80%+ coverage
- Service functions: 80%+ coverage
- Library functions: 80%+ coverage

When adding new features, follow the Test-Driven Development (TDD) approach by writing tests first, then implementing the functionality to meet those tests.

## Recently Added Tests

The test suite has been expanded to include:

- Token Metadata API endpoint tests
- Library utilities tests (cn and truncateAddress functions)
- An alternative approach for testing token-balances.ts without viem dependencies
- Recent Transactions API endpoint tests
- Top Wallets and Contracts API endpoint tests

## Coverage Report

The current test coverage is:

```
-----------------------------------|---------|----------|---------|---------|-----------------------------
File                               | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
-----------------------------------|---------|----------|---------|---------|-----------------------------
All files                          |   73.11 |    43.22 |    43.9 |    73.7 |
 address/nfts                      |     100 |      100 |     100 |     100 |
 address/token-balances            |   91.66 |      100 |     100 |   91.66 |
 network/blocks                    |     100 |      100 |     100 |     100 |
 network/paginated-transactions    |   97.43 |       76 |     100 |   97.36 |
 network/recent-transactions       |   96.87 |       80 |     100 |   96.77 |
 network/top-wallets-and-contracts |     100 |      100 |     100 |     100 |
 token/metadata                    |     100 |      100 |     100 |     100 |
 util (alchemy-client)             |   55.31 |       35 |   14.28 |   59.09 |
 util/services                     |   34.21 |    18.96 |   22.72 |   32.87 |
-----------------------------------|---------|----------|---------|---------|-----------------------------
```

### Areas for Further Improvement

Areas that still need more test coverage include:

1. The utility functions in alchemy-client.ts
2. The utility services in token-balances.ts and transactions.ts

When implementing new features, continue to follow the testing patterns established in this codebase.
