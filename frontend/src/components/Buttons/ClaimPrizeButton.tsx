import { useState, useEffect } from "react";
import { getAnchorProgram } from "../../lib/anchor";
import { claimPrize } from "../../utils/claimPrize";

export default function ClaimPrizeButton({
  account,
  publicKey,
  wallet,
  updateLotteryAccount,
}) {
  const [isWinner, setIsWinner] = useState(false);

  const { program, provider } = getAnchorProgram(wallet.adapter);
  const creator = provider.wallet.publicKey;

  useEffect(() => {
    if (!(account as any).winner) return;
    (async () => {
      const winnerEntryPDA = account.winner;
      const winnerEntryData = await program.account.entry.fetch(winnerEntryPDA);
      if (winnerEntryData.owner.toString() === creator.toString()) {
        setIsWinner(true);
      }
    })();
  });

  return (
    <>
      {(account as any).winner && !(account as any).claimed && isWinner && (
        <button
          className="p-2 bg-green-400 rounded-md text-neutral-950"
          onClick={async () => {
            await claimPrize(wallet, publicKey, account.winner);
            await updateLotteryAccount();
          }}
        >
          Claim Prize
        </button>
      )}
    </>
  );
}
