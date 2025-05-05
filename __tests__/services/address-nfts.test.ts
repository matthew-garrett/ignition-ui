import { getAddressNFTs } from "@/app/services/address-nfts";
import { alchemyRequest } from "@/app/services/alchemy-client";
import { NFTResponse } from "@/app/types";

// Mock the alchemyRequest function
jest.mock("@/app/services/alchemy-client", () => ({
  alchemyRequest: jest.fn(),
}));

describe("address-nfts service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should throw an error if address is not provided", async () => {
    await expect(getAddressNFTs("")).rejects.toThrow(
      "Address parameter is required"
    );
  });

  it("should fetch NFTs with required parameters", async () => {
    const mockAddress = "0x1234567890abcdef1234567890abcdef12345678";
    const mockNFTsResponse: NFTResponse = {
      ownedNfts: [
        {
          collectionName: "Test Collection",
          contractAddress: "0xabcdef1234567890abcdef1234567890abcdef12",
          tokenId: "123",
          name: "Test NFT",
          image: "https://example.com/image.png",
          tokenType: "ERC721",
          media: [
            {
              raw: "https://example.com/raw.png",
              thumbnail: "https://example.com/thumbnail.png",
              gateway: "https://example.com/gateway.png",
            },
          ],
          metadata: {
            name: "Test NFT",
          },
        },
      ],
      totalCount: 1,
    };

    // Mock the alchemyRequest to return the mock response
    (alchemyRequest as jest.Mock).mockResolvedValueOnce(mockNFTsResponse);

    const result = await getAddressNFTs(mockAddress);

    // Verify alchemyRequest was called with the correct parameters
    expect(alchemyRequest).toHaveBeenCalledWith(
      "getNFTs",
      [
        "owner=0x1234567890abcdef1234567890abcdef12345678&withMetadata=true&pageSize=100",
      ],
      true
    );

    // Verify the result matches the mock response
    expect(result).toEqual(mockNFTsResponse);
  });

  it("should include pageKey when provided", async () => {
    const mockAddress = "0x1234567890abcdef1234567890abcdef12345678";
    const mockPageKey = "test-page-key";
    const mockNFTsResponse: NFTResponse = {
      ownedNfts: [],
      totalCount: 0,
      pageKey: "next-page-key",
    };

    // Mock the alchemyRequest to return the mock response
    (alchemyRequest as jest.Mock).mockResolvedValueOnce(mockNFTsResponse);

    const result = await getAddressNFTs(mockAddress, mockPageKey);

    // Verify alchemyRequest was called with the correct parameters including pageKey
    expect(alchemyRequest).toHaveBeenCalledWith(
      "getNFTs",
      [
        "owner=0x1234567890abcdef1234567890abcdef12345678&withMetadata=true&pageKey=test-page-key&pageSize=100",
      ],
      true
    );

    // Verify the result matches the mock response
    expect(result).toEqual(mockNFTsResponse);
  });

  it("should use custom pageSize when provided", async () => {
    const mockAddress = "0x1234567890abcdef1234567890abcdef12345678";
    const mockPageSize = "50";
    const mockNFTsResponse: NFTResponse = {
      ownedNfts: [],
      totalCount: 0,
    };

    // Mock the alchemyRequest to return the mock response
    (alchemyRequest as jest.Mock).mockResolvedValueOnce(mockNFTsResponse);

    const result = await getAddressNFTs(mockAddress, undefined, mockPageSize);

    // Verify alchemyRequest was called with the correct parameters including custom pageSize
    expect(alchemyRequest).toHaveBeenCalledWith(
      "getNFTs",
      [
        "owner=0x1234567890abcdef1234567890abcdef12345678&withMetadata=true&pageSize=50",
      ],
      true
    );

    // Verify the result matches the mock response
    expect(result).toEqual(mockNFTsResponse);
  });

  it("should handle API errors properly", async () => {
    const mockAddress = "0x1234567890abcdef1234567890abcdef12345678";
    const mockError = new Error("API Error");

    // Mock the alchemyRequest to throw an error
    (alchemyRequest as jest.Mock).mockRejectedValueOnce(mockError);

    // Verify the error is propagated correctly
    await expect(getAddressNFTs(mockAddress)).rejects.toThrow("API Error");
  });
});
