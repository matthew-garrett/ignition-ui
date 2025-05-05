import { ALCHEMY_NFT_URL, ALCHEMY_URL } from "@/app/constants";

/**
 * Makes a request to the Alchemy API with retry logic
 * @param method The Alchemy API method to call
 * @param params The parameters for the method
 * @param isNftURL Whether to use the NFT API URL
 * @param maxRetries Maximum number of retries on failure
 * @param timeout Timeout in milliseconds
 * @returns The response from the Alchemy API
 */
export async function alchemyRequest<T>(
  method: string,
  params: unknown[],
  isNftURL?: boolean,
  // maxRetries: number = 2,
  timeout: number = 10000
): Promise<T> {
  const url = isNftURL ? ALCHEMY_NFT_URL : ALCHEMY_URL;
  let lastError: Error | unknown = null;

  try {
    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      // Special handling for NFT API endpoint which use a different endpoint
      if (isNftURL && method === "getNFTs") {
        const queryParamsString = params[0] as string;

        const response = await fetch(`${url}/getNFTs?${queryParamsString}`, {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`Alchemy API error! status: ${response.status}`);
        }

        return response.json();
      }

      const requestBody = {
        id: 1,
        jsonrpc: "2.0",
        method,
        params,
      };

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Alchemy API error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.result;
    } finally {
      clearTimeout(timeoutId);
    }
  } catch (error) {
    lastError = error;
  }

  // This should never be reached due to throw above, but TypeScript needs it
  throw lastError;
}
