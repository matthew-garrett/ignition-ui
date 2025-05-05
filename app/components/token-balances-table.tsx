"use client";

import React from "react";
import Image from "next/image";
import { ExternalLink } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/ui/table";
import { ETHER_SCAN_ADDRESS_URL } from "@/app/constants";

interface TokenBalanceTableProps {
  tokens: {
    contractAddress: string;
    truncatedAddress: string;
    tokenBalance: string;
    formattedBalance: string;
    name?: string;
    symbol?: string;
    logo?: string;
    decimals?: number;
    tokenType?: string;
  }[];
}

export function TokenBalancesTable({ tokens }: TokenBalanceTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Token</TableHead>
          <TableHead>Balance</TableHead>
          <TableHead>Address</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody className="bg-gray-100">
        {tokens.map((token, index) => (
          <TableRow key={index}>
            <TableCell className="font-medium flex items-center gap-2">
              {token.logo ? (
                <Image
                  src={token.logo}
                  alt={token.symbol || "token"}
                  width={24}
                  height={24}
                  className="rounded-full"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs">
                  {token.symbol?.[0] || "?"}
                </div>
              )}
              {token.symbol || "Unknown"}
            </TableCell>
            <TableCell>{token.formattedBalance}</TableCell>
            <TableCell>
              <a
                href={`${ETHER_SCAN_ADDRESS_URL}${token.contractAddress}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-black underline"
              >
                {token.truncatedAddress}
                <ExternalLink className="w-3 h-3" />
              </a>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export default TokenBalancesTable;
