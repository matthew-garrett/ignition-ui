"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

interface CopyToClipboardProps {
  text: string;
  displayText?: string;
  className?: string;
}

export const CopyToClipboard = ({
  text,
  displayText,
  className = "",
}: CopyToClipboardProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy text:", error);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className={`inline-flex items-center gap-1 cursor-pointer ${className}`}
      title="Copy to clipboard"
    >
      {displayText || text}
      <span className="ml-1">
        {copied ? (
          <Check className="h-4 w-4 text-green-500" />
        ) : (
          <Copy className="h-4 w-4" />
        )}
      </span>
    </button>
  );
};

export default CopyToClipboard;
