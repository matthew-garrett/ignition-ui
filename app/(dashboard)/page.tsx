import { ClientDashboard } from "@/app/components/client-dashboard";
import {
  getNetworkBlocks,
  getTopWalletsAndContracts,
} from "@/app/services/network-data";

export const dynamic = "force-dynamic";

async function getInitialData() {
  const latestBlock = await getNetworkBlocks();
  const { topContracts, topWallets } = await getTopWalletsAndContracts();

  return {
    latestBlock,
    topContracts,
    topWallets,
  };
}

export default async function Dashboard() {
  const { latestBlock, topContracts, topWallets } = await getInitialData();

  const blockTime = latestBlock.timestamp
    ? new Date(parseInt(latestBlock.timestamp, 16) * 1000).toLocaleString()
    : "Unknown";

  return (
    <ClientDashboard
      latestBlock={latestBlock}
      blockTime={blockTime}
      contractsChartData={topContracts}
      walletsChartData={topWallets}
    />
  );
}
