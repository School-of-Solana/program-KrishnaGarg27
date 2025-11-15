import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { AnchorProject } from "../target/types/anchor_project";
import { assert } from "chai";

describe("anchor_project", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.anchorProject as Program<AnchorProject>;

  const creatorAlice = anchor.web3.Keypair.generate();
  const creatorBob = anchor.web3.Keypair.generate();
  const creatorAnatoly = anchor.web3.Keypair.generate();

  const lotteryIdAlice = 132;
  const lotteryIdBob = 56;
  const lotteryIdAnatoly = 32;

  const getLotteryPda = (creator: anchor.web3.Keypair, lotteryId: number) => {
    return anchor.web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from("lottery"),
        creator.publicKey.toBuffer(),
        Buffer.from([lotteryId]),
      ],
      program.programId
    );
  };
  const getPrizeVaultPda = (lotteryPda: anchor.web3.PublicKey) => {
    return anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("vault"), lotteryPda.toBuffer()],
      program.programId
    );
  };

  const [lotteryPdaAlice] = getLotteryPda(creatorAlice, lotteryIdAlice);
  const [lotteryPdaBob] = getLotteryPda(creatorBob, lotteryIdBob);
  const [lotteryPdaAnatoly] = getLotteryPda(creatorAnatoly, lotteryIdAnatoly);

  const [prizeVaultPdaAlice] = getPrizeVaultPda(lotteryPdaAlice);
  const [prizeVaultPdaBob] = getPrizeVaultPda(lotteryPdaBob);
  const [prizeVaultPdaAnatoly] = getPrizeVaultPda(lotteryPdaAnatoly);

  it("Alice's Lottery Initialized Successfully", async () => {
    await airdrop(provider.connection, creatorAlice.publicKey);

    const entryPrice = new anchor.BN(1 * anchor.web3.LAMPORTS_PER_SOL);
    const maxEntries = new anchor.BN(1000);

    const tx = await program.methods
      .initialize(lotteryIdAlice, entryPrice, maxEntries)
      .accounts({
        creator: creatorAlice.publicKey,
        lottery: lotteryPdaAlice,
        prizeVault: prizeVaultPdaAlice,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([creatorAlice])
      .rpc({ commitment: "confirmed" });

    checkLottery(
      program,
      lotteryPdaAlice,
      prizeVaultPdaAlice,
      creatorAlice.publicKey,
      "Alice",
      lotteryIdAlice,
      entryPrice,
      maxEntries
    );
  });

  it("Bob's Lottery should not initialize", async () => {
    await airdrop(provider.connection, creatorBob.publicKey);

    const entryPrice = new anchor.BN(0);
    const maxEntries = new anchor.BN(1000);

    let testFailed = false;

    try {
      const tx = await program.methods
        .initialize(lotteryIdBob, entryPrice, maxEntries)
        .accounts({
          creator: creatorBob.publicKey,
          lottery: lotteryPdaBob,
          prizeVault: prizeVaultPdaBob,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([creatorBob])
        .rpc({ commitment: "confirmed" });
    } catch (error) {
      const err = anchor.AnchorError.parse(error.logs);
      assert.strictEqual(
        err.error.errorCode.code,
        "ZeroEntryPrice",
        "Expected error 'Entry Price cannot be zero'"
      );
      testFailed = true;
    }

    assert.strictEqual(
      testFailed,
      true,
      "Lottery Initialisation with zero entry price should fail."
    );
  });

  it("Anatoly's Lottery should not initialize", async () => {
    await airdrop(provider.connection, creatorAnatoly.publicKey);

    const entryPrice = new anchor.BN(1 * anchor.web3.LAMPORTS_PER_SOL);
    const maxEntries = new anchor.BN(0);

    let testFailed = false;

    try {
      const tx = await program.methods
        .initialize(lotteryIdAnatoly, entryPrice, maxEntries)
        .accounts({
          creator: creatorAnatoly.publicKey,
          lottery: lotteryPdaAnatoly,
          prizeVault: prizeVaultPdaAnatoly,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([creatorAnatoly])
        .rpc({ commitment: "confirmed" });
    } catch (error) {
      const err = anchor.AnchorError.parse(error.logs);
      assert.strictEqual(
        err.error.errorCode.code,
        "ZeroMaxEntries",
        "Expected error 'Max Entries cannot be zero'"
      );
      testFailed = true;
    }

    assert.strictEqual(
      testFailed,
      true,
      "Lottery Initialisation with zero max entries should fail."
    );
  });

  it("Bob enters Alice's Lottery successfully", async () => {
    const lotteryData = await program.account.lottery.fetch(lotteryPdaAlice);
    const [entryPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from("entry"),
        lotteryPdaAlice.toBuffer(),
        creatorBob.publicKey.toBuffer(),
        lotteryData.totalEntries.toArrayLike(Buffer, "le", 8),
      ],
      program.programId
    );

    const tx = await program.methods
      .enterLottery()
      .accounts({
        owner: creatorBob.publicKey,
        lottery: lotteryPdaAlice,
        prizeVault: prizeVaultPdaAlice,
        entry: entryPda,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([creatorBob])
      .rpc({ commitment: "confirmed" });

    const entryData = await program.account.entry.fetch(entryPda);

    assert.strictEqual(
      entryData.owner.toString(),
      creatorBob.publicKey.toString(),
      "The owner of the entry does not match with Bob"
    );
    assert.strictEqual(
      entryData.lottery.toString(),
      lotteryPdaAlice.toString(),
      "The lottery id of the entry does not match the original lottery pda"
    );
    assert(
      entryData.entryId.eq(lotteryData.totalEntries),
      "Entry ids do not match"
    );
  });

  it("Bob fails to enter Anatoly's lottery more than maximum number of times", async () => {
    const entryPrice = new anchor.BN(0.1 * anchor.web3.LAMPORTS_PER_SOL);
    const maxEntries = new anchor.BN(10);

    const tx1 = await program.methods
      .initialize(lotteryIdAnatoly, entryPrice, maxEntries)
      .accounts({
        creator: creatorAnatoly.publicKey,
        lottery: lotteryPdaAnatoly,
        prizeVault: prizeVaultPdaAnatoly,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([creatorAnatoly])
      .rpc({ commitment: "confirmed" });

    let testFailed = false;
    let i;

    try {
      for (i = 0; i <= 10; i++) {
        const lotteryData = await program.account.lottery.fetch(
          lotteryPdaAnatoly
        );
        const [entryPda] = anchor.web3.PublicKey.findProgramAddressSync(
          [
            Buffer.from("entry"),
            lotteryPdaAnatoly.toBuffer(),
            creatorBob.publicKey.toBuffer(),
            lotteryData.totalEntries.toArrayLike(Buffer, "le", 8),
          ],
          program.programId
        );

        const tx = await program.methods
          .enterLottery()
          .accounts({
            owner: creatorBob.publicKey,
            lottery: lotteryPdaAnatoly,
            prizeVault: prizeVaultPdaAnatoly,
            entry: entryPda,
            systemProgram: anchor.web3.SystemProgram.programId,
          })
          .signers([creatorBob])
          .rpc({ commitment: "confirmed" });
      }
    } catch (error) {
      const err = anchor.AnchorError.parse(error.logs);
      assert.strictEqual(i, 10, "Bob should have been able to make 10 entries");
      assert.strictEqual(
        err.error.errorCode.code,
        "MaxEntriesReached",
        "Expected error 'Max Entries Reached'"
      );
      testFailed = true;
    }

    assert.strictEqual(
      testFailed,
      true,
      "Bob should have failed to make more than the maximum number of entries"
    );
  });
});

async function airdrop(
  connection: any,
  address: any,
  amount = 100 * anchor.web3.LAMPORTS_PER_SOL
) {
  await connection.confirmTransaction(
    await connection.requestAirdrop(address, amount),
    "confirmed"
  );
}

async function checkLottery(
  program: Program<AnchorProject>,
  lotteryPda: anchor.web3.PublicKey,
  prizeVaultPda: anchor.web3.PublicKey,
  creatorKey: anchor.web3.PublicKey,
  creatorName: string,
  lotteryId: number,
  entryPrice: anchor.BN,
  maxEntries: anchor.BN
) {
  const lotteryData = await program.account.lottery.fetch(lotteryPda);

  assert.strictEqual(
    lotteryData.creator.toString(),
    creatorKey.toString(),
    `The public key of the lottery creator and ${creatorName} do not match`
  );

  assert.strictEqual(
    lotteryData.prizeVault.toString(),
    prizeVaultPda.toString(),
    `The public key of the lottery prize vault and the calculated prize vault do not match`
  );

  assert.strictEqual(
    lotteryData.lotteryId,
    lotteryId,
    "Lottery IDs do not match"
  );

  assert.strictEqual(
    lotteryData.prizePot,
    new anchor.BN(0),
    "Prize pot should be zero initially"
  );

  assert.strictEqual(
    lotteryData.entryPrice,
    entryPrice,
    "Entry Prices do not match"
  );

  assert.strictEqual(
    lotteryData.maxEntries,
    maxEntries,
    "Max entries do not match"
  );

  assert.strictEqual(
    lotteryData.totalEntries,
    new anchor.BN(0),
    "Total entries should be zero initially"
  );

  assert.strictEqual(
    lotteryData.winnerChosen,
    false,
    "Winner chosen should be false initially"
  );
}
