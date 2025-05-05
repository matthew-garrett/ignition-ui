"use client";

import { ETHER_SCAN_ADDRESS_URL } from "@/app/constants";
import { TopContract } from "@/app/types";
import { truncateAddress } from "@/app/ui/utils";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  TooltipProps,
  ResponsiveContainer,
} from "recharts";

interface TransactionBarChartProps {
  data: TopContract[];
  isLoading?: boolean;
  xAxisLabel?: string;
  yAxisLabel?: string;
}

interface CustomXAxisTickProps {
  x: number;
  y: number;
  payload: {
    value: string;
    index: number;
  };
}

export function TransactionBarChartSkeleton() {
  return (
    <div className="w-full h-[300px] bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse">
      <div className="h-full w-full flex items-center justify-center">
        <p className="text-gray-400 dark:text-gray-500">
          Loading chart data...
        </p>
      </div>
    </div>
  );
}

const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload as TopContract;
    const address = data.address || "";

    return (
      <div className="bg-white dark:bg-gray-800 p-3 rounded border dark:border-gray-700 shadow-md">
        <p className="text-sm font-medium">
          Address: {address ? truncateAddress(address) : "-"}
        </p>
        <p className="text-sm">{`Interactions: ${data.transfers}`}</p>
      </div>
    );
  }
  return null;
};

export const TransactionBarChart = ({
  data,
  yAxisLabel = "Number of Interactions",
}: TransactionBarChartProps) => {
  const renderCustomXAxisTick = (props: CustomXAxisTickProps) => {
    const { x, y, payload } = props;
    const originalAddress = payload.value || "";
    const displayAddress = originalAddress
      ? truncateAddress(originalAddress)
      : "-";

    const etherscanUrl = originalAddress
      ? `${ETHER_SCAN_ADDRESS_URL}${originalAddress}`
      : "";

    return (
      <g transform={`translate(${x},${y})`}>
        <a href={etherscanUrl} target="_blank" rel="noopener noreferrer">
          <rect
            x="-50"
            y="0"
            width="100"
            height="20"
            fill="transparent"
            cursor="pointer"
          />
          <text
            x="0"
            y="10"
            textAnchor="middle"
            fill={"black"}
            fontSize="12px"
            textDecoration={originalAddress ? "underline" : "none"}
          >
            {displayAddress}
          </text>
        </a>
      </g>
    );
  };

  return (
    <div className="w-full h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <XAxis
            dataKey={(item) => item.address || ""}
            tick={renderCustomXAxisTick}
            height={40}
            textAnchor="middle"
            interval={0}
            label={{
              position: "insideBottom",
              offset: -10,
            }}
          />
          <YAxis
            label={{
              value: yAxisLabel,
              angle: -90,
              position: "insideLeft",
              offset: 0,
              style: {
                fill: "black",
                fontSize: "12px",
                textAnchor: "middle",
                dominantBaseline: "middle",
              },
            }}
            tick={{ fontSize: "14px", fill: "black" }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="transfers" fill="#3b82f6" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TransactionBarChart;
