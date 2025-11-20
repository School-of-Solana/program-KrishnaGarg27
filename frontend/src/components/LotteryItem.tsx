import { useWallet } from "@solana/wallet-adapter-react";
import { useState } from "react";
import { getAnchorProgram } from "../lib/anchor";
import EnterLotteryButton from "./Buttons/EnterLotteryButton";
import PickWinnerButton from "./Buttons/PickWinnerButton";
import ClaimPrizeButton from "./Buttons/ClaimPrizeButton";

export const LotteryItem = function ({ lottery }) {
  const [account, setAccount] = useState(lottery.account);
  const publicKey = lottery.publicKey;
  const { wallet } = useWallet();
  const { program } = getAnchorProgram(wallet);

  const lotteryState = account.winner
    ? account.claimed
      ? "Prize Claimed"
      : "Winner Picked"
    : "Running";

  async function updateLotteryAccount() {
    setAccount(await program.account.lottery.fetch(publicKey));
  }

  return (
    <div className="p-4 mb-4 flex justify-start border rounded-xl border-green-400 hover:shadow-md hover:shadow-green-400">
      <div className="flex flex-col">
        <p>
          Lottery: {<AddressDisplay address={(publicKey as any).toString()} />}
        </p>
        <p>
          Creator:{" "}
          {<AddressDisplay address={(account as any).creator.toString()} />}
        </p>
        <p>Entry Price: {Number((account as any).entryPrice) / 1e9} Sol</p>
        <p>
          Entries: {(account as any).totalEntries.toString()} /{" "}
          {(account as any).maxEntries.toString()}
        </p>
        <p>Prize Pot: {Number((account as any).prizePot) / 1e9} Sol</p>
        {(account as any).winner && (
          <p>
            Winner Entry:{" "}
            {<AddressDisplay address={(account as any).winner.toString()} />}
          </p>
        )}
        <p>{lotteryState}</p>
      </div>
      <div className="flex flex-col justify-center ms-18 gap-4">
        <EnterLotteryButton
          account={account}
          publicKey={publicKey}
          wallet={wallet}
          updateLotteryAccount={updateLotteryAccount}
        />
        <PickWinnerButton
          account={account}
          publicKey={publicKey}
          wallet={wallet}
          updateLotteryAccount={updateLotteryAccount}
        />
        <ClaimPrizeButton
          account={account}
          publicKey={publicKey}
          wallet={wallet}
          updateLotteryAccount={updateLotteryAccount}
        />
      </div>
    </div>
  );
};

export function truncateAddress(address: string, size = 10) {
  if (!address) return "";
  return `${address.slice(0, size)}...${address.slice(-size)}`;
}

export function AddressDisplay({ address }: { address: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 1000); // hide message after 1.5 sec
  };

  return (
    <button
      onClick={handleCopy}
      className="relative font-mono text-sm text-blue-400 hover:text-blue-300 transition"
    >
      {truncateAddress(address)}

      {copied && (
        <span
          className="absolute left-1/2 -translate-x-1/2 top-full mt-1 
                         text-xs bg-gray-800 text-white px-2 py-1 rounded shadow"
        >
          Copied!
        </span>
      )}
    </button>
  );
}
