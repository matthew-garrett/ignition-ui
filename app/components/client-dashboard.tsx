"use client";

import SearchAddress from "./search-address";
import TransactionBarChart from "./transaction-bar-chart";
import RecentTransactionTable from "./recent-transaction-table";
import { BlockResponse, TopContract, TopWallet } from "@/app/types";

interface ClientDashboardProps {
  latestBlock: BlockResponse;
  blockTime: string;
  contractsChartData: TopContract[];
  walletsChartData: TopWallet[];
}

export const ClientDashboard = ({
  latestBlock,
  blockTime,
  contractsChartData,
  walletsChartData,
}: ClientDashboardProps) => (
  <div className="min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
    <div className="flex gap-8 w-full">
      <div className="bg-gray-100 rounded-lg p-4 h-28 flex flex-col justify-evenly w-1/2">
        <h2 className="text-xl font-semibold">
          Latest Block: {latestBlock.number}
        </h2>
        <p className="text-md">Block Time: {blockTime}</p>
      </div>
      <div className="bg-gray-100 rounded-lg p-4 h-28 flex flex-col justify-between w-1/2">
        <h2 className="text-xl font-semibold">Search Address</h2>
        <SearchAddress />
      </div>
    </div>

    <div className="flex gap-8 w-full">
      <div className="mt-8 w-1/2">
        <h2 className="text-xl font-semibold mb-4">
          Top 5 Contracts (most Interactions) in the last 500 blocks
        </h2>
        <div className="bg-gray-100 rounded-lg p-4">
          <TransactionBarChart
            data={contractsChartData}
            xAxisLabel="Contracts (oldest to newest by block)"
            yAxisLabel="Interaction Count"
          />
        </div>
      </div>

      <div className="mt-8 w-1/2">
        <h2 className="text-xl font-semibold mb-4">
          Top 5 Wallets (most Interactions) in the last 500 blocks
        </h2>
        <div className="bg-gray-100 rounded-lg p-4">
          <TransactionBarChart
            data={walletsChartData}
            xAxisLabel="Wallets (oldest to newest by block)"
            yAxisLabel="Interaction Count"
          />
        </div>
      </div>
    </div>

    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-4">Recent Transactions</h2>
      <div className="text-black">
        <RecentTransactionTable />
      </div>
    </div>
  </div>
);

export default ClientDashboard;
