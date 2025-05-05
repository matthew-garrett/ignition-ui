"use client";
import CopyToClipboard from "./copy-to-clipboard";
import SearchAddress from "./search-address";
import TokenBalancesTable from "./token-balances-table";
import { truncateAddress } from "@/app/ui/utils";
import Link from "next/link";
import { FormattedTokenBalancesResponse, NFTResponse } from "@/app/types";
import { ExternalLink } from "lucide-react";
import { ArrowLeft } from "lucide-react";

export const ClientAddressDashboard = ({
  address,
  balances,
  nfts,
  error,
}: {
  address: string;
  balances: FormattedTokenBalancesResponse;
  nfts: NFTResponse | null;
  error: string;
}) => (
  <div className="min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
    <div className="flex gap-8 w-full items-center">
      <Link href="/">
        <div className="bg-gray-100 hover:bg-gray-200 rounded-lg p-4 h-28 flex items-center justify-center">
          <ArrowLeft className="w-15 h-15" />
        </div>
      </Link>
      <div className="bg-gray-100 rounded-lg p-4 h-28 flex flex-col justify-evenly w-1/2">
        <h2 className="text-xl font-semibold">Selected Address:</h2>
        <h2 className="text-xl font-semibold flex gap-2 items-center">
          <CopyToClipboard
            text={address}
            className="text-2xl font-semibold"
            displayText={truncateAddress(address)}
          />
          <a href={`https://etherscan.io/address/${address}`} target="_blank">
            <ExternalLink className="w-4 h-4" />
          </a>
        </h2>
      </div>
      <div className="bg-gray-100 rounded-lg p-4 h-28 flex flex-col justify-between w-1/2">
        <h2 className="text-xl font-semibold">Search New Address</h2>
        <SearchAddress />
      </div>
    </div>

    {error && <p className="text-red-500">Error: {error}</p>}

    {balances && (
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Token Balances</h2>
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <TokenBalancesTable tokens={balances.tokens} />
        </div>
      </div>
    )}

    {nfts && (
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">NFTs ({nfts.totalCount})</h2>
        <div className="max-w-screen-lg m-auto grid grid-cols-4 gap-8">
          {nfts.ownedNfts.map(
            (
              nft: {
                media: { thumbnail: string; gateway: string }[];
                metadata: { name: string };
              },
              index: number
            ) => {
              const image =
                nft.media[0].thumbnail || nft.media[0].gateway || null;
              return nft.metadata?.name && image ? (
                <div
                  key={index}
                  className="bg-gray-100 hover:bg-gray-200 rounded-lg p-4"
                >
                  <h3 className="text-lg font-semibold">
                    {nft.metadata?.name}
                  </h3>
                  <a href={image} target="_blank">
                    <img
                      src={image}
                      alt={nft.metadata?.name || "NFT"}
                      width={200}
                      height={200}
                    />
                  </a>
                </div>
              ) : null;
            }
          )}
        </div>
      </div>
    )}
  </div>
);

export default ClientAddressDashboard;
