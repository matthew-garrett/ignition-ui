import { formatUnits } from "viem";
import { truncateAddress } from "@/app/ui/utils";
import { alchemyRequest } from "./alchemy-client";
import {
  EnhancedTokenBalancesResponse,
  FormattedToken,
  FormattedTokenBalancesResponse,
  TokenBalancesResponse,
  TokenMetadata,
  TokenWithMetadata,
} from "@/app/types";

/**
 * Fetches and enriches all token balances for a specific Ethereum address
 * @param address Ethereum address to fetch token balances for
 * @returns Promise with formatted token balances and metadata
 */
export async function fetchTokenBalances(
  address: string,
  dustThreshold: number
): Promise<FormattedTokenBalancesResponse> {
  const erc20Balances = await alchemyRequest<TokenBalancesResponse>(
    "alchemy_getTokenBalances",
    [address]
  );

  const ethBalance = await alchemyRequest<string>("eth_getBalance", [
    address,
    "latest",
  ]);

  const tokensWithMetadata: TokenWithMetadata[] = await Promise.all(
    erc20Balances.tokenBalances.map(async (token) => {
      try {
        const metadata = await alchemyRequest<TokenMetadata>(
          "alchemy_getTokenMetadata",
          [token.contractAddress]
        );

        return {
          ...token,
          metadata,
        };
      } catch (error) {
        console.error(
          `Error fetching metadata for ${token.contractAddress}:`,
          error
        );
        return token;
      }
    })
  );

  tokensWithMetadata.unshift({
    contractAddress: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
    tokenBalance: ethBalance,
    metadata: {
      name: "Ethereum",
      symbol: "ETH",
      logo: "https://tokens.1inch.io/0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee.png",
      decimals: 18,
      tokenType: "NATIVE",
    },
  });

  const enhancedResponse: EnhancedTokenBalancesResponse = {
    address: erc20Balances.address,
    tokens: tokensWithMetadata,
  };

  return formatTokenBalances(enhancedResponse, dustThreshold);
}

/**
 * Format ERC20 token balances to human-readable values and filter out dust
 * @param tokenData The raw token balances response
 * @param dustThreshold The minimum value to consider (default: 0.0001)
 * @returns Formatted token balances with human-readable values
 */
export function formatTokenBalances(
  tokenData: EnhancedTokenBalancesResponse,
  dustThreshold: number = 0.0001
): FormattedTokenBalancesResponse {
  const formattedTokens: FormattedToken[] = tokenData.tokens
    .map((token) => {
      const decimals = token.metadata?.decimals || 18;
      const rawBalance = token.tokenBalance;

      let formattedBalance = "0";
      try {
        formattedBalance = formatUnits(BigInt(rawBalance), decimals || 18);
      } catch (error) {
        console.error(
          `Error formatting balance for ${token.contractAddress}:`,
          error
        );
      }

      return {
        contractAddress: token.contractAddress,
        truncatedAddress: truncateAddress(token.contractAddress),
        tokenBalance: rawBalance,
        formattedBalance,
        name: token.metadata?.name,
        symbol: token.metadata?.symbol,
        logo: token.metadata?.logo,
        decimals: token.metadata?.decimals,
        tokenType: token.metadata?.tokenType,
      };
    })
    .filter((token) => {
      return token.tokenType !== "ERC721" && token.tokenType !== "ERC1155";
    })
    // Filter out dust values
    .filter((token) => {
      const numericBalance = parseFloat(token.formattedBalance);
      return !isNaN(numericBalance) && numericBalance >= dustThreshold;
    })
    // Sort by balance (highest first)
    .sort((a, b) => {
      const balanceA = parseFloat(a.formattedBalance);
      const balanceB = parseFloat(b.formattedBalance);
      return balanceB - balanceA;
    });

  return {
    address: tokenData.address,
    tokens: formattedTokens,
  };
}
