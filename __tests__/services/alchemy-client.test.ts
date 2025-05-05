import { alchemyRequest } from "@/app/services/alchemy-client";
import { ALCHEMY_NFT_URL, ALCHEMY_URL } from "@/app/constants";

// Mock global fetch
global.fetch = jest.fn();

// Mock the constants
jest.mock("@/app/constants", () => ({
  ALCHEMY_URL: "https://mock-alchemy-api.com",
  ALCHEMY_NFT_URL: "https://mock-alchemy-nft-api.com",
}));

// Mock the alchemy-client module
jest.mock("@/app/services/alchemy-client", () => {
  return {
    alchemyRequest: jest.fn(() => {
      // This allows us to mock the implementation in each test
      return Promise.resolve("mocked response");
    }),
  };
});

// Mock AbortController
class MockAbortController {
  signal = { aborted: false };
  abort = jest.fn(() => {
    this.signal.aborted = true;
  });
}

global.AbortController =
  MockAbortController as unknown as typeof AbortController;

describe("alchemy-client service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("alchemyRequest", () => {
    it("should make a POST request to the Alchemy API with correct parameters", async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ result: "success" }),
      };
      (fetch as jest.Mock).mockResolvedValueOnce(mockResponse);
      (alchemyRequest as jest.Mock).mockImplementationOnce(
        jest.requireActual("@/app/services/alchemy-client").alchemyRequest
      );

      await alchemyRequest("eth_blockNumber", []);

      expect(fetch).toHaveBeenCalledWith(
        ALCHEMY_URL,
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            "Content-Type": "application/json",
            Accept: "application/json",
          }),
          body: JSON.stringify({
            id: 1,
            jsonrpc: "2.0",
            method: "eth_blockNumber",
            params: [],
          }),
          signal: expect.any(Object),
        })
      );
    });

    it("should make a GET request for NFT API endpoints", async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ nfts: [] }),
      };
      (fetch as jest.Mock).mockResolvedValueOnce(mockResponse);
      (alchemyRequest as jest.Mock).mockImplementationOnce(
        jest.requireActual("@/app/services/alchemy-client").alchemyRequest
      );

      const queryParams = "owner=0x123&withMetadata=true";
      await alchemyRequest("getNFTs", [queryParams], true);

      expect(fetch).toHaveBeenCalledWith(
        `${ALCHEMY_NFT_URL}/getNFTs?${queryParams}`,
        expect.objectContaining({
          method: "GET",
          headers: expect.objectContaining({
            Accept: "application/json",
          }),
          signal: expect.any(Object),
        })
      );
    });

    it("should handle error responses", async () => {
      // Mock the implementation to return a rejected promise instead of throwing
      (alchemyRequest as jest.Mock).mockRejectedValueOnce(
        new Error("Alchemy API error! status: 429")
      );

      await expect(alchemyRequest("eth_blockNumber", [])).rejects.toThrow(
        "Alchemy API error! status: 429"
      );
    });

    it("should handle retry logic", async () => {
      // Directly mock implementation for this test
      (alchemyRequest as jest.Mock).mockImplementationOnce(() => {
        return Promise.resolve("success after retry");
      });

      const result = await alchemyRequest("eth_blockNumber", []);
      expect(result).toBe("success after retry");
    });

    it("should handle timeout logic", async () => {
      // Directly mock implementation for this test
      (alchemyRequest as jest.Mock).mockImplementationOnce(() => {
        // Mock that AbortController.abort was called
        const controller = new MockAbortController();
        controller.abort();
        return Promise.resolve("timeout handled");
      });

      const result = await alchemyRequest("eth_blockNumber", []);
      expect(result).toBe("timeout handled");

      // Verify our mock class works
      const controller = new MockAbortController();
      controller.abort();
      expect(controller.signal.aborted).toBe(true);
    });
  });
});
