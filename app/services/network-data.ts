import {
  BlockResponse,
  TopContract,
  TopWallet,
  Transfer,
  TransferParams,
} from "@/app/types";
import { alchemyRequest } from "./alchemy-client";
import { TIMEOUT_MS } from "@/app/constants";
import { processTopContractsAndWallets } from "./transactions";

/**
 * Fetch the latest blocks data from Alchemy
 * @returns Promise with the latest block data
 */
export async function getNetworkBlocks(): Promise<BlockResponse> {
  const blockData = await alchemyRequest<BlockResponse>(
    "eth_getBlockByNumber",
    ["latest", false]
  );
  return blockData;
}

/**
 * Fetch top wallets and contracts data
 * @returns Promise with top contracts and wallets data
 */
export async function getTopWalletsAndContracts(): Promise<{
  topContracts: TopContract[];
  topWallets: TopWallet[];
}> {
  const numBlocks = 500;

  const latest = await withTimeout(getLatestBlockNumber(), TIMEOUT_MS);

  const latestNumber = parseInt(latest, 16);
  const fromBlock = `0x${(latestNumber - numBlocks).toString(16)}`;
  const toBlock = latest;

  const transfers = await withTimeout(
    getAssetTransfers({
      fromBlock,
      toBlock,
      category: ["external", "erc20"],
      excludeZeroValue: true,
      maxCount: `0x${numBlocks.toString(16)}`,
    }),
    TIMEOUT_MS
  );

  const { topContracts, topWallets } = await processTopContractsAndWallets(
    transfers
  );

  return {
    topContracts: topContracts,
    topWallets: topWallets,
  };
}

/**
 * Get the latest block number
 */
export async function getLatestBlockNumber(): Promise<string> {
  return alchemyRequest<string>("eth_blockNumber", []);
}

/**
 * Get block details by number
 */
export async function getBlockByNumber(
  blockNumber: string,
  includeTransactions: boolean = false
) {
  return alchemyRequest<{
    number: string;
    timestamp: string;
  }>("eth_getBlockByNumber", [blockNumber, includeTransactions]);
}

/**
 * Get asset transfers
 */
export async function getAssetTransfers(
  params: TransferParams
): Promise<Transfer[]> {
  const result = await alchemyRequest<{ transfers?: Transfer[] }>(
    "alchemy_getAssetTransfers",
    [params]
  );

  if (!result || typeof result !== "object") {
    console.warn("Unexpected response format from Alchemy API:", result);
    return [];
  }

  return result.transfers || [];
}

/**
 * Wraps a promise with a timeout
 * @param promise The promise to wrap with a timeout
 * @param ms Timeout in milliseconds
 * @returns Promise that resolves with the original promise result or rejects with timeout error
 */
export async function withTimeout<T>(
  promise: Promise<T>,
  ms: number
): Promise<T> {
  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error("Request timeout")), ms)
  );

  return Promise.race([promise, timeoutPromise]) as Promise<T>;
}
