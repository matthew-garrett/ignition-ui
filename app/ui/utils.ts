import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function truncateAddress(
  address: string,
  startLength = 6,
  endLength = 4
): string {
  if (!address) {
    return "";
  }

  if (address.length <= startLength + endLength) {
    return address;
  }

  const start = startLength > 0 ? address.slice(0, startLength) : "";
  const end = endLength > 0 ? address.slice(-endLength) : "";

  return `${start}...${end}`;
}
