import { AnchorProvider, Program } from "@coral-xyz/anchor";
import type { Idl } from "@coral-xyz/anchor";
import { Connection } from "@solana/web3.js";
import idl from "../idl/anchor_project.json";
import { RPC_ENDPOINT } from "./connection";

export function getAnchorProgram(wallet: any) {
  const connection = new Connection(RPC_ENDPOINT, "confirmed");
  const provider = new AnchorProvider(
    connection,
    wallet,
    AnchorProvider.defaultOptions()
  );
  const program = new Program(idl as Idl, provider);
  return { program, provider, connection };
}
