"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { ETHER_SCAN_TX_URL, ETHER_SCAN_ADDRESS_URL } from "@/app/constants";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/ui/table";
import { truncateAddress } from "@/app/ui/utils";
import { RecentTransaction } from "@/app/types";
import { useInView } from "react-intersection-observer";

export const RecentTransactionTable = () => {
  const [transactions, setTransactions] = useState<RecentTransaction[]>([]);
  const [pageKey, setPageKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const { ref, inView } = useInView({
    rootMargin: "0px",
    threshold: 0.1,
    triggerOnce: false,
  });

  const TABLE_ROW_HEIGHT = 50;
  const ROWS_TO_DISPLAY = 10;
  const TABLE_BODY_HEIGHT = TABLE_ROW_HEIGHT * ROWS_TO_DISPLAY;

  const loadMoreTransactions = useCallback(async () => {
    if (loading || (pageKey === null && transactions.length > 0)) return;

    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (pageKey) params.append("pageKey", pageKey);

      const response = await fetch(
        `/api/network/recent-transactions?${params.toString()}`
      );

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();

      setTransactions((prev) => [...prev, ...(data.transactions || [])]);
      setPageKey(data.pageKey);
    } catch (error) {
      console.error("Error loading more transactions:", error);
    } finally {
      setLoading(false);
    }
  }, [loading, pageKey, transactions.length]);

  useEffect(() => {
    if (inView && pageKey !== null) {
      loadMoreTransactions();
    }
  }, [inView, loadMoreTransactions, pageKey]);

  // Trigger initial load if needed
  useEffect(() => {
    if (transactions.length === 0) {
      loadMoreTransactions();
    }
  }, [loadMoreTransactions, transactions.length]);

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;

    const handleScroll = () => {
      if (!scrollContainer) return;

      const { scrollTop, scrollHeight, clientHeight } = scrollContainer;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 20;
      setIsAtBottom(isNearBottom);
    };

    if (scrollContainer) {
      scrollContainer.addEventListener("scroll", handleScroll);
      return () => scrollContainer.removeEventListener("scroll", handleScroll);
    }
  }, []);

  const columnWidths = {
    txnHash: "w-1/5",
    from: "w-1/5",
    to: "w-1/5",
    value: "w-1/5",
    asset: "w-1/5",
  };

  return (
    <div className="flex flex-col">
      <div className="border rounded-md flex flex-col">
        <div className="bg-background sticky top-0 z-10 border-b rounded-t-[50px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead
                  className={`py-3 rounded-md font-semibold ${columnWidths.txnHash}`}
                >
                  TxnHash
                </TableHead>
                <TableHead
                  className={`py-3 rounded-md font-semibold ${columnWidths.from}`}
                >
                  From
                </TableHead>
                <TableHead
                  className={`py-3 rounded-md font-semibold ${columnWidths.to}`}
                >
                  To
                </TableHead>
                <TableHead
                  className={`py-3 rounded-md font-semibold ${columnWidths.value}`}
                >
                  Value
                </TableHead>
                <TableHead
                  className={`py-3 rounded-md font-semibold ${columnWidths.asset}`}
                >
                  Asset
                </TableHead>
              </TableRow>
            </TableHeader>
          </Table>
        </div>
        <div
          ref={scrollContainerRef}
          className="overflow-auto"
          style={{ height: `${TABLE_BODY_HEIGHT}px` }}
        >
          <Table className="bg-gray-100">
            <TableBody>
              {transactions.length > 0 ? (
                transactions.map((tx: RecentTransaction, index: number) => (
                  <TableRow
                    key={`${tx.hash}-${index}`}
                    style={{ height: `${TABLE_ROW_HEIGHT}px` }}
                  >
                    <TableCell className={columnWidths.txnHash}>
                      <a
                        href={`${ETHER_SCAN_TX_URL}${tx.hash}`}
                        target="_blank"
                        className="text-black underline"
                        rel="noopener noreferrer"
                      >
                        {truncateAddress(tx.hash)}
                      </a>
                    </TableCell>
                    <TableCell className={columnWidths.from}>
                      <a
                        href={`${ETHER_SCAN_ADDRESS_URL}${tx.from}`}
                        target="_blank"
                        className="text-black underline"
                        rel="noopener noreferrer"
                      >
                        {truncateAddress(tx.from)}
                      </a>
                    </TableCell>
                    <TableCell className={columnWidths.to}>
                      {tx.to ? (
                        <a
                          href={`${ETHER_SCAN_ADDRESS_URL}${tx.to}`}
                          target="_blank"
                          className="text-black underline"
                          rel="noopener noreferrer"
                        >
                          {truncateAddress(tx.to)}
                        </a>
                      ) : (
                        "Contract Creation"
                      )}
                    </TableCell>
                    <TableCell className={columnWidths.value}>
                      {tx.value}
                    </TableCell>
                    <TableCell className={columnWidths.asset}>
                      {tx.asset ? `${tx.asset} (${tx.category})` : "-"}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow className="bg-white font-semibold">
                  <TableCell colSpan={5} className="text-center py-8">
                    No transactions found
                  </TableCell>
                </TableRow>
              )}

              {pageKey && (
                <TableRow ref={ref} style={{ height: `${TABLE_ROW_HEIGHT}px` }}>
                  <TableCell colSpan={5} className="text-center py-4">
                    {loading && (
                      <div className="loading flex items-center gap-2 justify-center">
                        <svg
                          className="animate-spin h-5 w-5 text-blue-600"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        <span>Loading more transactions...</span>
                      </div>
                    )}
                    {!loading && <div className="h-4"></div>}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {!pageKey && transactions.length > 0 && isAtBottom && (
        <div className="text-center py-2 text-sm text-gray-600">
          Up to date with the latest transactions
        </div>
      )}
    </div>
  );
};

export default RecentTransactionTable;
