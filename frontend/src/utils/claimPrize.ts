import { SystemProgram } from "@solana/web3.js";
import { derivePrizeVaultPDA } from "../lib/pda";
import { getAnchorProgram } from "../lib/anchor";

export async function claimPrize(wallet, lotteryPDA, entryPDA) {
  const { program, provider } = getAnchorProgram(wallet.adapter);

  const [prizeVaultPDA] = derivePrizeVaultPDA(program.programId, lotteryPDA);

  await program.methods
    .claimPrize()
    .accounts({
      signer: provider.wallet.publicKey,
      winnerEntry: entryPDA,
      lottery: lotteryPDA,
      prizeVault: prizeVaultPDA,
      systemProgram: SystemProgram.programId,
    })
    .rpc();
}
