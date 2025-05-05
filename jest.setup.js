// Mock global objects required by Next.js
global.Request = class {};
global.Response = class {};

// Add TextEncoder and TextDecoder for viem library
// eslint-disable-next-line
const { TextEncoder, TextDecoder } = require("util");
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock console methods for cleaner test output
global.console = {
  ...console,
  error: jest.fn(),
  warn: jest.fn(),
  log: jest.fn(),
};

// Mock next/server components
jest.mock("next/server", () => {
  return {
    NextRequest: jest.fn().mockImplementation((url) => {
      return {
        url: url || "https://example.com",
        nextUrl: new URL(url || "https://example.com"),
      };
    }),
    NextResponse: {
      json: jest.fn((data, options) => ({ data, options })),
    },
  };
});

// Mock the fetch API
global.fetch = jest.fn();

// Mock NextResponse
global.NextResponse = {
  json: jest.fn((data, init) => ({ data, init })),
  redirect: jest.fn((url) => ({ url })),
};

// Increase jest timeout
jest.setTimeout(15000);
