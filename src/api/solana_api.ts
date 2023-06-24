import * as anchor from "@project-serum/anchor";
import { Program, AnchorError, web3, Provider } from "@project-serum/anchor";
import { Staking } from "../idl/staking";
import {
  Transaction,
  SystemProgram,
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  sendAndConfirmTransaction,
  PublicKey,
} from "@solana/web3.js";
import { AnchorWallet } from "@solana/wallet-adapter-react";
import { PollModel } from "../models/PollModel";

export async function createPollOnChain(
  program: Program,
  wallet: AnchorWallet,
  pollKeypair: anchor.web3.Keypair,
  pollModel: PollModel
) {
  if (program === undefined || wallet === undefined) {
    return undefined;
  }
  return await program.methods
    .createPoll(pollKeypair.publicKey, 0, pollModel.max_options)
    .accounts({
      pollAccount: pollKeypair.publicKey,
      user: wallet.publicKey,
    })
    .signers([pollKeypair])
    .rpc();
}

export async function createVoteOnChain(
  program: Program,
  wallet: AnchorWallet,
  pollPublicKey: PublicKey,
  voteCipher: string,
  solStaked: number
) {
  if (program === undefined || wallet === undefined) {
    return undefined;
  }
  const [individualVotePDA, bumpVote] = PublicKey.findProgramAddressSync(
    [pollPublicKey.toBuffer(), wallet.publicKey.toBuffer()],
    program.programId
  );

  const lamportsToStake = new anchor.BN(solStaked * LAMPORTS_PER_SOL);

  // Create Vote
  return await program.methods
    .createVote(voteCipher, lamportsToStake)
    .accounts({
      pollAccount: pollPublicKey,
      voteAccount: individualVotePDA,
      user: wallet.publicKey,
    })
    .signers([])
    .rpc();
}

export async function updateVoteOnChain(
  program: Program,
  wallet: AnchorWallet,
  pollPublicKey: PublicKey,
  voteCipher: string,
  extraSoltoStake: number
) {
  if (program === undefined || wallet === undefined) {
    return undefined;
  }

  const [individualVotePDA, bumpVote] = PublicKey.findProgramAddressSync(
    [pollPublicKey.toBuffer(), wallet.publicKey.toBuffer()],
    program.programId
  );
  const lamportsToStake = new anchor.BN(extraSoltoStake * LAMPORTS_PER_SOL);

  // Update Vote
  return await program.methods
    .updateVote(voteCipher, lamportsToStake)
    .accounts({
      pollAccount: pollPublicKey,
      voteAccount: individualVotePDA,
      user: wallet.publicKey,
    })
    .signers([])
    .rpc();
}

export async function getVoteFromChain(
  program: Program,
  wallet: AnchorWallet,
  pollPublicKey: PublicKey
) {
  if (program === undefined || wallet === undefined) {
    return undefined;
  }

  const [individualVotePDA, bumpVote] = PublicKey.findProgramAddressSync(
    [pollPublicKey.toBuffer(), wallet.publicKey.toBuffer()],
    program.programId
  );

  console.log(program);
  console.log(individualVotePDA.toString());

  return await program.account.individualVote.fetch(individualVotePDA);
}
