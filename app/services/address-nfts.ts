import { NFTResponse } from "@/app/types";
import { alchemyRequest } from "./alchemy-client";

/**
 * Fetch all NFTs owned by a specific Ethereum address
 *
 * @param address Ethereum address to fetch NFTs for
 * @param pageKey Optional token for fetching the next page of results
 * @param pageSize Optional number of NFTs to return per page (defaults to 100)
 * @returns Promise with NFT collection data
 */
export async function getAddressNFTs(
  address: string,
  pageKey?: string,
  pageSize: string = "100"
): Promise<NFTResponse> {
  if (!address) {
    throw new Error("Address parameter is required");
  }

  // Construct the query parameters for the NFT API
  const queryParams = new URLSearchParams();
  queryParams.append("owner", address);
  queryParams.append("withMetadata", "true");
  if (pageKey) queryParams.append("pageKey", pageKey);
  queryParams.append("pageSize", pageSize);

  // Pass the queryParams string as a parameter to the alchemyRequest function
  const nftsResponse = await alchemyRequest<NFTResponse>(
    "getNFTs",
    [queryParams.toString()],
    true // Use NFT URL
  );

  return nftsResponse;
}
