import type { BN } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";

const encoder = new TextEncoder();

const LOTTERY_SEED = encoder.encode("lottery");
const ENTRY_SEED = encoder.encode("entry");
const VAULT_SEED = encoder.encode("vault");

export function deriveLotteryPDA(
  programId: PublicKey,
  creator: PublicKey,
  lotteryId: number
) {
  return PublicKey.findProgramAddressSync(
    [LOTTERY_SEED, creator.toBuffer(), new Uint8Array([lotteryId])],
    programId
  );
}

export function derivePrizeVaultPDA(programId: PublicKey, lottery: PublicKey) {
  return PublicKey.findProgramAddressSync(
    [VAULT_SEED, lottery.toBuffer()],
    programId
  );
}

export function deriveEntryPDA(
  programId: PublicKey,
  lottery: PublicKey,
  entryId: BN
) {
  return PublicKey.findProgramAddressSync(
    [ENTRY_SEED, lottery.toBuffer(), entryId.toArrayLike(Uint8Array, "le", 8)],
    programId
  );
}
