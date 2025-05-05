"use client";

import { Input } from "@/app/ui/input";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isAddress } from "viem";

export const SearchAddress = () => {
  const [walletAddress, setWalletAddress] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (walletAddress !== "") {
      setError("");
    }
  }, [walletAddress]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAddress(walletAddress)) {
      setError("Invalid wallet address");
      return;
    }
    router.push(`/${walletAddress}`);
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          value={walletAddress}
          onChange={(e) => setWalletAddress(e.target.value)}
          placeholder="Enter wallet address"
          className="h-10 bg-white"
        />
        <button
          type="submit"
          disabled={error ? true : false}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50 cursor-pointer"
        >
          Search
        </button>
      </form>
      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
};

export default SearchAddress;
