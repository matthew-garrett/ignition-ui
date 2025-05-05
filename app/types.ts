export interface BlockResponse {
  number: string;
  timestamp?: string;
}

// Transfer related types
export type Transfer = {
  to: string;
  from: string;
  asset: string;
  hash: string;
  value: string;
  category: string;
  blockNum: string;
};

export type TransferParams = {
  fromBlock: string;
  toBlock: string;
  category?: string[];
  excludeZeroValue?: boolean;
  maxCount?: string;
  order?: string;
};

// Analytics types
export type TopContract = {
  address: string;
  transfers: number;
};

export type TopWallet = {
  address: string;
  transfers: number;
};

export type TransferResults = {
  topContracts: TopContract[];
  topWallets: TopWallet[];
};

export type RecentTransaction = {
  hash: string;
  from: string;
  to: string | null;
  value: string;
  blockNumber: string;
  asset?: string;
  category?: string;
};

// Token related types
export interface TokenMetadata {
  name: string;
  symbol: string;
  logo: string;
  decimals: number;
  tokenType: string;
}

export interface TokenBalance {
  contractAddress: string;
  tokenBalance: string;
}

export interface TokenWithMetadata extends TokenBalance {
  metadata?: TokenMetadata;
}

export interface TokenBalancesResponse {
  address: string;
  tokenBalances: TokenBalance[];
}

export interface EnhancedTokenBalancesResponse {
  address: string;
  tokens: TokenWithMetadata[];
}

export interface FormattedToken {
  contractAddress: string;
  truncatedAddress: string;
  tokenBalance: string;
  formattedBalance: string;
  name?: string;
  symbol?: string;
  logo?: string;
  decimals?: number;
  tokenType?: string;
}

export interface FormattedTokenBalancesResponse {
  address: string;
  tokens: FormattedToken[];
}

// NFT types
export interface NFTMedia {
  raw: string;
  thumbnail: string;
  gateway: string;
}

export interface NFTCollection {
  collectionName: string;
  contractAddress: string;
  tokenId: string;
  name: string;
  image: string;
  description?: string;
  tokenType: string;
  media: NFTMedia[];
  metadata: {
    name: string;
  };
}

export interface NFTResponse {
  ownedNfts: NFTCollection[];
  totalCount: number;
  pageKey?: string;
}
