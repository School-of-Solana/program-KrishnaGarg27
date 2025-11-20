import { useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { getAnchorProgram } from "../lib/anchor";
import { LotteryItem } from "./LotteryItem";

export default function LotteryList({ lotteries, setLotteries }) {
  const { wallet, connected } = useWallet();

  const load = async () => {
    if (!wallet) return;
    const { program } = getAnchorProgram(wallet.adapter);
    setLotteries(await (program.account as any).lottery.all());
  };

  useEffect(() => {
    if (connected) load();
  }, [connected]);

  return (
    <div className="my-10 p-4 border rounded-xl border-green-400 hover:shadow-md hover:shadow-green-400">
      <h3 className="mb-4 text-green-400">All Lotteries</h3>
      {lotteries.map((lottery) => (
        <LotteryItem key={lottery.publicKey.toString()} lottery={lottery} />
      ))}
    </div>
  );
}
