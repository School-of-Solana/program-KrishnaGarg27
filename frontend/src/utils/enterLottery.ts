import { SystemProgram } from "@solana/web3.js";
import { getAnchorProgram } from "../lib/anchor";
import { deriveEntryPDA, derivePrizeVaultPDA } from "../lib/pda";

export async function enterLottery(wallet, lotteryPDA, entryId) {
  const { program, provider } = getAnchorProgram(wallet.adapter);
  const [prizeVaultPDA] = derivePrizeVaultPDA(program.programId, lotteryPDA);
  const [entryPDA] = deriveEntryPDA(program.programId, lotteryPDA, entryId);

  await program.methods
    .enterLottery()
    .accounts({
      owner: provider.wallet.publicKey,
      lottery: lotteryPDA,
      prizeVault: prizeVaultPDA,
      entry: entryPDA,
      systemProgram: SystemProgram.programId,
    })
    .rpc();
}
