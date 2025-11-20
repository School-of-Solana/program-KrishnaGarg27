import { enterLottery } from "../../utils/enterLottery";

export default function EnterLotteryButton({
  account,
  publicKey,
  wallet,
  updateLotteryAccount,
}: any) {
  return (
    <>
      {!(account as any).winner &&
        Number((account as any).totalEntries) <
          Number((account as any).maxEntries) && (
          <button
            className="p-2 bg-green-400 rounded-md text-neutral-950"
            onClick={async () => {
              await enterLottery(wallet, publicKey, account.totalEntries);
              await updateLotteryAccount();
            }}
          >
            Enter Lottery
          </button>
        )}
    </>
  );
}
