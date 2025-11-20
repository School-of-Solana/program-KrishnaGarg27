import { getAnchorProgram } from "../../lib/anchor";
import { pickWinner } from "../../utils/pickWinner";

export default function PickWinnerButton({
  account,
  publicKey,
  wallet,
  updateLotteryAccount,
}) {
  const { provider } = getAnchorProgram(wallet.adapter);
  const creator = provider.wallet.publicKey;
  return (
    <>
      {creator.toString() === account.creator.toString() &&
        !(account as any).winner &&
        Number((account as any).totalEntries) !== 0 && (
          <button
            className="p-2 bg-green-400 rounded-md text-neutral-950"
            onClick={async () => {
              await pickWinner(wallet, publicKey, account.lotteryId);
              await updateLotteryAccount();
            }}
          >
            Pick Winner
          </button>
        )}
    </>
  );
}
