import { ClientAddressDashboard } from "@/app/components/client-address-dashboard";
import { fetchTokenBalances } from "@/app/services/token-balances";
import { getAddressNFTs } from "@/app/services/address-nfts";
import { DUST_THRESHOLD } from "@/app/constants";

export async function generateStaticParams() {
  return [{ address: "0x0f96c3d7bfebc442930c2f58da332e597470239e" }];
}

async function getAddressData(address: string) {
  const tokenBalances = await fetchTokenBalances(address, DUST_THRESHOLD);
  const nfts = await getAddressNFTs(address);

  return { balances: tokenBalances, nfts, error: null };
}

export default async function AddressDashboard({
  params,
}: {
  params: Promise<{ address: string }>;
}) {
  const { address } = await params;
  const { balances, nfts, error } = await getAddressData(address);

  return (
    <ClientAddressDashboard
      address={address}
      balances={balances}
      nfts={nfts}
      error={error || ""}
    />
  );
}
