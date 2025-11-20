import { getAnchorProgram } from "../lib/anchor";

export async function pickWinner(wallet, lotteryPDA, lotteryId) {
  const { program, provider } = getAnchorProgram(wallet.adapter);

  await program.methods
    .pickWinner(lotteryId)
    .accounts({
      creator: provider.wallet.publicKey,
      lottery: lotteryPDA,
    })
    .rpc();
}
