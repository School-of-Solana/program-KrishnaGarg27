import { useState } from "react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { CreateLottery } from "./components/CreateLottery";
import LotteryList from "./components/LotteryList";

export default function App() {
  const [lotteries, setLotteries] = useState([]);
  return (
    <div className="bg-gray-950 text-gray-50 py-12">
      <div className="mx-auto p-8 w-2xl border-2 border-violet-400 rounded-3xl hover:shadow-md hover:shadow-violet-400">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl text-violet-400">SOLANA LOTTERY DAPP</h1>
          <WalletMultiButton />
        </div>
        <CreateLottery lotteries={lotteries} setLotteries={setLotteries} />
        <LotteryList lotteries={lotteries} setLotteries={setLotteries} />
      </div>
    </div>
  );
}
