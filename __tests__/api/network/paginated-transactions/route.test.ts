import { GET } from "@/app/api/network/recent-transactions/route";
import { processRecentTransactions } from "@/app/services/transactions";
import { alchemyRequest } from "@/app/services/alchemy-client";
import { getLatestBlockNumber, withTimeout } from "@/app/services/network-data";
import { Transfer, RecentTransaction } from "@/app/types";

// Mock dependencies
jest.mock("@/app/services/transactions", () => ({
  processRecentTransactions: jest.fn(),
}));

jest.mock("@/app/services/alchemy-client", () => ({
  alchemyRequest: jest.fn(),
}));

jest.mock("@/app/services/network-data", () => ({
  getLatestBlockNumber: jest.fn(),
  withTimeout: jest.fn().mockImplementation((promise) => promise),
}));

// Mock Next.js Response
jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn().mockImplementation((data, options) => ({
      json: data,
      status: options?.status,
      headers: options?.headers as Record<string, string>,
    })),
  },
}));

describe("Paginated Transactions API Route", () => {
  // Setup common test variables
  const mockLatestBlock = "0x100000";
  const mockFromBlock = "0xfec78"; // calculated from mockLatestBlock - 5000
  const mockLimit = 10;
  const mockTransfers: Transfer[] = [
    {
      to: "0xto1",
      from: "0xfrom1",
      asset: "ETH",
      hash: "0xhash1",
      value: "1.0",
      category: "external",
      blockNum: "0xff000",
    },
    {
      to: "0xto2",
      from: "0xfrom2",
      asset: "USDT",
      hash: "0xhash2",
      value: "100.0",
      category: "erc20",
      blockNum: "0xff001",
    },
  ];

  const mockProcessedTransactions: RecentTransaction[] = [
    {
      hash: "0xhash1",
      from: "0xfrom1",
      to: "0xto1",
      value: "1.0",
      blockNumber: "0xff000",
      asset: "ETH",
      category: "external",
    },
    {
      hash: "0xhash2",
      from: "0xfrom2",
      to: "0xto2",
      value: "100.0",
      blockNumber: "0xff001",
      asset: "USDT",
      category: "erc20",
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup default mocks
    (getLatestBlockNumber as jest.Mock).mockResolvedValue(mockLatestBlock);

    (processRecentTransactions as jest.Mock).mockReturnValue(
      mockProcessedTransactions
    );
  });

  it("should fetch transactions successfully without pagination", async () => {
    // Mock alchemy request response
    (alchemyRequest as jest.Mock).mockResolvedValueOnce({
      transfers: mockTransfers,
      pageKey: null,
    });

    // Create mock request
    const mockRequest = {
      url: "https://example.com/api/network/paginated-transactions",
      headers: {
        get: jest.fn(),
      },
    } as unknown as Request;

    const response = await GET(mockRequest);

    // Verify correct data was passed to services
    expect(getLatestBlockNumber).toHaveBeenCalled();
    expect(alchemyRequest).toHaveBeenCalledWith("alchemy_getAssetTransfers", [
      {
        fromBlock: mockFromBlock,
        toBlock: mockLatestBlock,
        category: ["external", "erc20"],
        excludeZeroValue: true,
        maxCount: `0xa`, // hex for 10
        order: "desc",
      },
    ]);

    // Verify transactions were processed correctly
    expect(processRecentTransactions).toHaveBeenCalledWith(
      mockTransfers,
      mockLimit
    );

    // Verify response structure
    expect(response.json).toEqual({
      transactions: mockProcessedTransactions,
      pageKey: null,
    });

    // Verify Cache-Control headers are set correctly
    expect(response.headers).toBeDefined();
    // Using a type guard to safely check the header
    if (response.headers && typeof response.headers === "object") {
      const cacheControlHeader = Object.entries(response.headers).find(
        ([key]) => key === "Cache-Control"
      );
      expect(cacheControlHeader).toBeDefined();
      expect(cacheControlHeader?.[1]).toMatch(/public, s-maxage=30/);
    }
  });

  it("should handle pagination correctly", async () => {
    const mockPageKey = "nextPageToken123";

    // Mock alchemy request response with pageKey
    (alchemyRequest as jest.Mock).mockResolvedValueOnce({
      transfers: mockTransfers,
      pageKey: mockPageKey,
    });

    // Create mock request with pageKey
    const mockRequest = {
      url: "https://example.com/api/network/paginated-transactions?pageKey=currentPageToken",
      headers: {
        get: jest.fn(),
      },
    } as unknown as Request;

    const response = await GET(mockRequest);

    // Verify pagination parameter was passed
    expect(alchemyRequest).toHaveBeenCalledWith("alchemy_getAssetTransfers", [
      expect.objectContaining({
        pageKey: "currentPageToken",
      }),
    ]);

    // Verify response includes pageKey
    expect(response.json).toEqual({
      transactions: mockProcessedTransactions,
      pageKey: mockPageKey,
    });
  });

  it("should handle custom limit parameter", async () => {
    const customLimit = 5;

    // Mock alchemy request response
    (alchemyRequest as jest.Mock).mockResolvedValueOnce({
      transfers: mockTransfers.slice(0, 1),
      pageKey: null,
    });

    // Create mock request with custom limit
    const mockRequest = {
      url: `https://example.com/api/network/paginated-transactions?limit=${customLimit}`,
      headers: {
        get: jest.fn(),
      },
    } as unknown as Request;

    // Execute the request
    await GET(mockRequest);

    // Verify that regardless of the limit parameter passed in the URL,
    // the route is using the fixed TRANSACTIONS_PER_PAGE value (10)
    expect(processRecentTransactions).toHaveBeenCalledWith(
      expect.any(Array),
      mockLimit // mockLimit is 10, matching TRANSACTIONS_PER_PAGE
    );
  });

  it("should handle empty results correctly", async () => {
    // Mock empty transfers response
    (alchemyRequest as jest.Mock).mockResolvedValueOnce({
      transfers: [],
      pageKey: null,
    });

    const mockRequest = {
      url: "https://example.com/api/network/paginated-transactions",
      headers: {
        get: jest.fn(),
      },
    } as unknown as Request;

    const response = await GET(mockRequest);

    // Verify early return with empty array
    expect(response.json).toEqual({
      transactions: [],
      pageKey: null,
    });

    // Verify no processing was done for empty transfers
    expect(processRecentTransactions).not.toHaveBeenCalled();
  });

  it("should handle null transfers correctly", async () => {
    // Mock null transfers in response
    (alchemyRequest as jest.Mock).mockResolvedValueOnce({
      transfers: null,
      pageKey: null,
    });

    const mockRequest = {
      url: "https://example.com/api/network/paginated-transactions",
      headers: {
        get: jest.fn(),
      },
    } as unknown as Request;

    // Execute the request but don't check the response for this test
    await GET(mockRequest);

    // Verify processRecentTransactions was called with empty array
    expect(processRecentTransactions).toHaveBeenCalledWith([], mockLimit);
  });

  it("should handle errors gracefully", async () => {
    // Mock an error in getLatestBlockNumber
    const mockError = new Error("API failure");
    (getLatestBlockNumber as jest.Mock).mockRejectedValueOnce(mockError);

    const mockRequest = {
      url: "https://example.com/api/network/paginated-transactions",
      headers: {
        get: jest.fn(),
      },
    } as unknown as Request;

    const response = await GET(mockRequest);

    // Verify error response
    expect(response.json).toEqual({
      error: "Failed to fetch transactions: API failure",
    });
    expect(response.status).toBe(500);
  });

  it("should handle timeout errors", async () => {
    // Mock timeout behavior
    (withTimeout as jest.Mock).mockRejectedValueOnce(
      new Error("Request timeout")
    );

    const mockRequest = {
      url: "https://example.com/api/network/paginated-transactions",
      headers: {
        get: jest.fn(),
      },
    } as unknown as Request;

    const response = await GET(mockRequest);

    // Verify error response
    expect(response.json).toEqual({
      error: "Failed to fetch transactions: Request timeout",
    });
    expect(response.status).toBe(500);
  });
});
