import {
  getNetworkBlocks,
  getTopWalletsAndContracts,
  getLatestBlockNumber,
  getBlockByNumber,
  getAssetTransfers,
  withTimeout,
} from "@/app/services/network-data";
import { alchemyRequest } from "@/app/services/alchemy-client";
import { processTopContractsAndWallets } from "@/app/services/transactions";
import { BlockResponse, Transfer } from "@/app/types";

// Mock the dependencies
jest.mock("@/app/services/alchemy-client", () => ({
  alchemyRequest: jest.fn(),
}));

jest.mock("@/app/services/transactions", () => ({
  processTopContractsAndWallets: jest.fn(),
}));

// Mock the constants
jest.mock("@/app/constants", () => ({
  TIMEOUT_MS: 5000,
}));

describe("network-data service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getNetworkBlocks", () => {
    it("should fetch the latest block data correctly", async () => {
      const mockBlockData: BlockResponse = {
        number: "0x1234",
        timestamp: "0x60a1b",
      };

      (alchemyRequest as jest.Mock).mockResolvedValueOnce(mockBlockData);

      const result = await getNetworkBlocks();

      expect(alchemyRequest).toHaveBeenCalledWith("eth_getBlockByNumber", [
        "latest",
        false,
      ]);
      expect(result).toEqual(mockBlockData);
    });
  });

  describe("getLatestBlockNumber", () => {
    it("should fetch the latest block number", async () => {
      const mockBlockNumber = "0x1234";

      (alchemyRequest as jest.Mock).mockResolvedValueOnce(mockBlockNumber);

      const result = await getLatestBlockNumber();

      expect(alchemyRequest).toHaveBeenCalledWith("eth_blockNumber", []);
      expect(result).toEqual(mockBlockNumber);
    });
  });

  describe("getBlockByNumber", () => {
    it("should fetch block details by number", async () => {
      const mockBlockNumber = "0x1234";
      const mockBlockDetails = {
        number: "0x1234",
        timestamp: "0x60a1b",
      };

      (alchemyRequest as jest.Mock).mockResolvedValueOnce(mockBlockDetails);

      const result = await getBlockByNumber(mockBlockNumber);

      expect(alchemyRequest).toHaveBeenCalledWith("eth_getBlockByNumber", [
        mockBlockNumber,
        false,
      ]);
      expect(result).toEqual(mockBlockDetails);
    });

    it("should include transactions when specified", async () => {
      const mockBlockNumber = "0x1234";
      const mockBlockDetails = {
        number: "0x1234",
        timestamp: "0x60a1b",
      };

      (alchemyRequest as jest.Mock).mockResolvedValueOnce(mockBlockDetails);

      const result = await getBlockByNumber(mockBlockNumber, true);

      expect(alchemyRequest).toHaveBeenCalledWith("eth_getBlockByNumber", [
        mockBlockNumber,
        true,
      ]);
      expect(result).toEqual(mockBlockDetails);
    });
  });

  describe("getAssetTransfers", () => {
    it("should fetch asset transfers with provided parameters", async () => {
      const mockParams = {
        fromBlock: "0x1000",
        toBlock: "0x1234",
        category: ["external"],
        excludeZeroValue: true,
      };

      const mockTransfers: Transfer[] = [
        {
          to: "0xaddress1",
          from: "0xaddress2",
          asset: "ETH",
          hash: "0xhash1",
          value: "1.0",
          category: "external",
          blockNum: "0x1234",
        },
      ];

      (alchemyRequest as jest.Mock).mockResolvedValueOnce({
        transfers: mockTransfers,
      });

      const result = await getAssetTransfers(mockParams);

      expect(alchemyRequest).toHaveBeenCalledWith("alchemy_getAssetTransfers", [
        mockParams,
      ]);
      expect(result).toEqual(mockTransfers);
    });

    it("should handle empty response properly", async () => {
      const mockParams = {
        fromBlock: "0x1000",
        toBlock: "0x1234",
      };

      (alchemyRequest as jest.Mock).mockResolvedValueOnce({});

      const result = await getAssetTransfers(mockParams);

      expect(alchemyRequest).toHaveBeenCalledWith("alchemy_getAssetTransfers", [
        mockParams,
      ]);
      expect(result).toEqual([]);
    });

    it("should handle unexpected response format", async () => {
      const mockParams = {
        fromBlock: "0x1000",
        toBlock: "0x1234",
      };

      (alchemyRequest as jest.Mock).mockResolvedValueOnce("invalid response");

      const result = await getAssetTransfers(mockParams);

      expect(alchemyRequest).toHaveBeenCalledWith("alchemy_getAssetTransfers", [
        mockParams,
      ]);
      expect(result).toEqual([]);
    });
  });

  describe("getTopWalletsAndContracts", () => {
    it("should fetch and process top wallets and contracts", async () => {
      const mockBlockNumber = "0x1234";
      const mockTransfers: Transfer[] = [
        {
          to: "0xaddress1",
          from: "0xaddress2",
          asset: "ETH",
          hash: "0xhash1",
          value: "1.0",
          category: "external",
          blockNum: "0x1234",
        },
      ];

      const mockResult = {
        topContracts: [{ address: "0xcontract1", transfers: 10 }],
        topWallets: [{ address: "0xwallet1", transfers: 5 }],
      };

      (alchemyRequest as jest.Mock)
        .mockResolvedValueOnce(mockBlockNumber)
        .mockResolvedValueOnce({ transfers: mockTransfers });
      (processTopContractsAndWallets as jest.Mock).mockResolvedValueOnce(
        mockResult
      );

      const result = await getTopWalletsAndContracts();

      expect(alchemyRequest).toHaveBeenCalledWith("eth_blockNumber", []);
      expect(alchemyRequest).toHaveBeenCalledWith("alchemy_getAssetTransfers", [
        expect.objectContaining({
          fromBlock: expect.any(String),
          toBlock: mockBlockNumber,
          category: ["external", "erc20"],
          excludeZeroValue: true,
        }),
      ]);

      // Check that processTopContractsAndWallets was called with the correct data
      expect(processTopContractsAndWallets).toHaveBeenCalledWith(mockTransfers);
      expect(result).toEqual(mockResult);
    });
  });

  describe("withTimeout", () => {
    it("should resolve with the promise result if not timed out", async () => {
      const mockPromise = Promise.resolve("success");
      const result = await withTimeout(mockPromise, 1000);
      expect(result).toEqual("success");
    });

    it("should reject with timeout error if promise takes too long", async () => {
      // Create a promise that never resolves
      const mockPromise = new Promise((resolve) => {
        setTimeout(resolve, 2000);
      });

      await expect(withTimeout(mockPromise, 100)).rejects.toThrow(
        "Request timeout"
      );
    });
  });
});
