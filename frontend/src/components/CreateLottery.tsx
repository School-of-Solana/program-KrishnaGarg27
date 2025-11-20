import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { getAnchorProgram } from "../lib/anchor";
import { deriveLotteryPDA, derivePrizeVaultPDA } from "../lib/pda";
import { SystemProgram } from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";

export const CreateLottery = ({ lotteries, setLotteries }) => {
  const { wallet, connected } = useWallet();

  const [lotteryId, setLotteryId] = useState(0);
  const [entryPrice, setEntryPrice] = useState(10000000);
  const [maxEntries, setMaxEntries] = useState(10);

  const [validInputs, setValidInputs] = useState([true, true, true]);
  const [lotteryIdInUse, setLotteryIdInUse] = useState(false);

  function changeLotteryId(e: any) {
    setLotteryId(e.target.value);
    setLotteryIdInUse(false);
    setValidInputs((i) => {
      i[0] = e.target.value >= 0 && e.target.value <= 255;
      return i;
    });
  }
  function changeEntryPrice(e: any) {
    setEntryPrice(e.target.value);
    setValidInputs((i) => {
      i[1] = e.target.value > 0;
      return i;
    });
  }
  function changeMaxEntries(e: any) {
    setMaxEntries(e.target.value);
    setValidInputs((i) => {
      i[2] = e.target.value > 0;
      return i;
    });
  }

  const createLottery = async () => {
    if (!wallet) return;

    const { program, provider } = getAnchorProgram(wallet.adapter);
    const creator = provider.wallet.publicKey;
    const [lotteryPDA] = deriveLotteryPDA(
      program.programId,
      creator,
      lotteryId
    );
    const [prizeVaultPDA] = derivePrizeVaultPDA(program.programId, lotteryPDA);

    try {
      await (program.account as any).lottery.fetch(lotteryPDA);
      setLotteryIdInUse(true);
    } catch (err) {
      await program.methods
        .initialize(
          lotteryId,
          new anchor.BN(entryPrice),
          new anchor.BN(maxEntries)
        )
        .accounts({
          creator,
          lottery: lotteryPDA,
          prizeVault: prizeVaultPDA,
          systemProgram: SystemProgram.programId,
        })
        .rpc({ commitment: "confirmed" });
      const lotteryData = await program.account.lottery.fetch(lotteryPDA);
      setLotteries([
        { publicKey: lotteryPDA, account: lotteryData },
        ...lotteries,
      ]);
    }
  };

  return (
    <div className="my-10 p-4 border rounded-xl border-green-400 hover:shadow-md hover:shadow-green-400">
      <h3 className="mb-4 text-green-400">Create Lottery</h3>
      <div className="mb-4 text-red-400">
        {!connected && <h3>Please connect your wallet</h3>}
        {!validInputs[0] && <h3>Login ID should be between 0 and 255</h3>}
        {!validInputs[1] && <h3>Entry Price should be more than 0</h3>}
        {!validInputs[2] && <h3>Max entries should be more than 0</h3>}
        {lotteryIdInUse && <h3>Lottery Id is already in use</h3>}
      </div>
      <div className="flex justify-between mb-1">
        <label htmlFor="lotteryId">Lottery Id</label>
        <input
          id="lotteryId"
          type="number"
          value={lotteryId}
          onChange={changeLotteryId}
          placeholder="Lottery ID"
          className="p-1 border rounded-sm border-green-400 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
      </div>
      <div className="flex justify-between mb-1">
        <label htmlFor="entryPrice">Entry Price (in lamports)</label>
        <input
          id="entryPrice"
          type="number"
          value={entryPrice}
          onChange={changeEntryPrice}
          placeholder="Entry Price"
          className="p-1 border rounded-sm border-green-400 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
      </div>
      <div className="flex justify-between mb-3">
        <label htmlFor="maxEntries">Max Entries</label>
        <input
          id="maxEntries"
          type="number"
          value={maxEntries}
          onChange={changeMaxEntries}
          placeholder="Max Entries"
          className="p-1 border rounded-sm border-green-400 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
      </div>
      <button
        onClick={createLottery}
        disabled={!(connected && validInputs.every((i) => i))}
        className="p-3 bg-green-500 rounded-md text-neutral-950 text-lg hover:ring-1 hover:ring-green-500 hover:bg-green-600"
      >
        Create Lottery
      </button>
    </div>
  );
};
