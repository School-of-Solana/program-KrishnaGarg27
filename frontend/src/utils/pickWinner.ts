import type { PublicKey } from "@solana/web3.js";
import { getAnchorProgram } from "../lib/anchor";

export async function pickWinner(
  wallet: any,
  lotteryPDA: PublicKey,
  lotteryId: number
) {
  const { program, provider } = getAnchorProgram(wallet.adapter);

  await program.methods
    .pickWinner(lotteryId)
    .accounts({
      creator: provider.wallet.publicKey,
      lottery: lotteryPDA,
    })
    .rpc();
}
