import { createWalletClient, custom } from "viem";
import { avalancheFuji } from "viem/chains";

export function getWalletClient() {
  if (typeof window === "undefined") return null;
  if (!window.ethereum) throw new Error("No wallet found");

  return createWalletClient({
    chain: avalancheFuji,
    transport: custom(window.ethereum),
  });
}
