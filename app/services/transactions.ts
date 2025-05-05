import {
  Transfer,
  TopContract,
  TopWallet,
  TransferResults,
  RecentTransaction,
} from "@/app/types";
import { alchemyRequest } from "./alchemy-client";

/**
 * Checks if an address is a contract by getting its bytecode
 * @param address Ethereum address to check
 * @returns True if the address is a contract
 */
export async function isContract(address: string): Promise<boolean> {
  try {
    const code = await alchemyRequest<string>("eth_getCode", [
      address,
      "latest",
    ]);

    return code !== "0x";
  } catch (error) {
    console.error(`Error checking if address ${address} is a contract:`, error);
    return false;
  }
}

/**
 * Processes transfer data to extract top contracts and wallets
 * @param transfers Array of transfer objects to analyze
 * @returns Object containing top contracts and wallets
 */
export async function processTopContractsAndWallets(
  transfers: Transfer[]
): Promise<TransferResults> {
  const topContracts = await getTopContracts(transfers);
  const topWallets = await getTopWallets(transfers);

  return { topContracts, topWallets };
}

/**
 * Identifies and returns the most frequently interacted with contract addresses
 * @param transfers Array of transfer objects to analyze
 * @param limit Maximum number of top contracts to return (default: 5)
 * @returns Array of top contract addresses with interaction counts
 */
export async function getTopContracts(
  transfers: Transfer[],
  limit: number = 5
): Promise<TopContract[]> {
  const counts: Record<string, number> = {};

  for (const transfer of transfers) {
    if (transfer.to) {
      counts[transfer.to] = (counts[transfer.to] || 0) + 1;
    }
  }

  // First sort by count
  const sortedAddresses = Object.entries(counts)
    .map(([address, count]) => ({ address, count }))
    .sort((a, b) => b.count - a.count);

  // Then check each address until we find 'limit' contract addresses
  const contractsOnly: TopContract[] = [];
  for (const { address, count } of sortedAddresses) {
    if (contractsOnly.length >= limit) break;

    const isContractAddress = await isContract(address);
    if (isContractAddress) {
      contractsOnly.push({ address, transfers: count });
    }
  }

  return contractsOnly;
}

/**
 * Identifies and returns the most active wallet addresses (non-contract addresses)
 * @param transfers Array of transfer objects to analyze
 * @param limit Maximum number of top wallets to return (default: 5)
 * @returns Array of top wallet addresses with transaction counts
 */
export async function getTopWallets(
  transfers: Transfer[],
  limit: number = 5
): Promise<TopWallet[]> {
  const counts: Record<string, number> = {};

  for (const tx of transfers) {
    if (tx.from && tx.to) {
      counts[tx.from] = (counts[tx.from] || 0) + 1;
      counts[tx.to] = (counts[tx.to] || 0) + 1;
    }
  }

  // First sort by count and filter out null address
  const sortedAddresses = Object.entries(counts)
    .filter(
      ([address]) => address !== "0x0000000000000000000000000000000000000000"
    )
    .map(([address, count]) => ({ address, count }))
    .sort((a, b) => b.count - a.count);

  // Then check each address until we find 'limit' non-contract addresses
  const walletsOnly: TopWallet[] = [];
  for (const { address, count } of sortedAddresses) {
    if (walletsOnly.length >= limit) break;

    const isContractAddress = await isContract(address);
    if (!isContractAddress) {
      walletsOnly.push({ address, transfers: count });
    }
  }

  return walletsOnly;
}

/**
 * Formats transfer data into recent transactions with timestamps
 * @param transfers Array of transfer objects to process
 * @param blockTimestamps Mapping of block numbers to timestamps
 * @param limit Maximum number of recent transactions to return (default: 10)
 * @returns Array of formatted recent transactions
 */
export function processRecentTransactions(
  transfers: Transfer[],
  limit: number = 10
): RecentTransaction[] {
  const recentTxs: RecentTransaction[] = [];

  for (const tx of transfers) {
    if (!tx.hash || !tx.blockNum) continue;

    recentTxs.push({
      hash: tx.hash,
      from: tx.from || "",
      to: tx.to || null,
      value: tx.value || "0",
      blockNumber: tx.blockNum,
      asset: tx.asset,
      category: tx.category,
    });

    if (recentTxs.length >= limit) break;
  }

  return recentTxs;
}
