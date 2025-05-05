import { NextResponse } from "next/server";
import { processRecentTransactions } from "@/app/services/transactions";
import { alchemyRequest } from "@/app/services/alchemy-client";
import { getLatestBlockNumber } from "@/app/services/network-data";
import { Transfer } from "@/app/types";
import { TIMEOUT_MS, CACHE_DURATION } from "@/app/constants";
import { withTimeout } from "@/app/services/network-data";

export const dynamic = "force-dynamic";

// Fixed number of transactions to fetch per page
const TRANSACTIONS_PER_PAGE = 10;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const pageKey = searchParams.get("pageKey") || null;
    const latestBlock = await getLatestBlockNumber();
    const latestNumber = parseInt(latestBlock, 16);
    const blocksToLookBack = 5000;
    const fromBlock = `0x${(latestNumber - blocksToLookBack).toString(16)}`;
    const toBlock = latestBlock;

    const params = {
      fromBlock,
      toBlock,
      category: ["external", "erc20"],
      excludeZeroValue: true,
      maxCount: `0x${TRANSACTIONS_PER_PAGE.toString(16)}`,
      order: "desc",
      ...(pageKey && { pageKey }),
    };

    const transfersPromise = alchemyRequest<{
      transfers?: Transfer[];
      pageKey?: string;
    }>("alchemy_getAssetTransfers", [params]);

    const result = (await withTimeout(transfersPromise, TIMEOUT_MS)) as {
      transfers?: Transfer[];
      pageKey?: string;
    };

    if (result && result.transfers && result.transfers.length === 0) {
      return NextResponse.json({
        transactions: [],
        pageKey: null,
      });
    }
    const transfers = result?.transfers || [];
    const nextPageKey = result?.pageKey || null;

    const recentTxs = processRecentTransactions(
      transfers,
      TRANSACTIONS_PER_PAGE
    );

    return NextResponse.json(
      {
        transactions: recentTxs,
        pageKey: nextPageKey,
      },
      {
        headers: {
          "Cache-Control": `public, s-maxage=${CACHE_DURATION}, stale-while-revalidate=${
            CACHE_DURATION * 5
          }`,
        },
      }
    );
  } catch (error) {
    console.error("Error in paginated transactions API:", error);
    const errorMessage =
      error instanceof Error
        ? `Failed to fetch transactions: ${error.message}`
        : "Failed to fetch transactions";

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
