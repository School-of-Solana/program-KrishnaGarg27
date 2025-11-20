import { clusterApiUrl } from "@solana/web3.js";

export const NETWORK = "devnet";
export const RPC_ENDPOINT =
  import.meta.env.VITE_SOLANA_RPC || clusterApiUrl(NETWORK);
