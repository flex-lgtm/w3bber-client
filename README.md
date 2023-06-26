
<h1 align="center">
  <br>
  <a href="https://www.w3bber.com"><img src="https://w3bber-movie-images.s3.amazonaws.com/w3bber-client/w3bber_logo.png" alt="W3bber" width="200"></a>
  <br>
  W3bber Client
  <br>
</h1>

<h4 align="center">Create secure, verifiable and engaging polls on <a href="https://solana.com" target="_blank">Solana</a> using W3bber Protocol</h4>
<p align="center">
<img src="https://img.shields.io/twitter/follow/w3bber_ratings"/>
<img src="https://img.shields.io/badge/License-MIT-blue"/>
<img src="https://img.shields.io/badge/Powered_by-Solana-02FEAD"/>
</p>
<p align="center">
  <a href="#running-locally">Running Locally</a> •
  <a href="#how-to-use">How To Use</a> •
  <a href="#how-it-works">How it Works</a> •
  <a href="#integration">Integration</a> •
  <a href="#reward-calculation">Reward Calculation</a> •
  <a href="#important-links">Important Links</a> •
</p>

This repo shows how you can create and manage polls through W3bber smart contracts and backend APIs. Key features include:
1. On-chain Blind Polls
2. Ability to stake in polls and win rewards

## Running Locally

In the project directory, you can run:

### `yarn start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

Similarly, you can do `yarn test`, `yarn build` and `yarn eject`

## How to Use
### Creating a Poll
1. Simply click on `Create Poll`, and you'll be prompted to log in. At the bottom you'll find the option for signup, do that with a username and password. Then log in with the same username and password.
2. Once on the Poll Creation page you can fill in the relevant info:\
   2.1 `Poll Id`: This will the public account of the poll keypair on Solana blockchain. **Save the secret somewhere** because you'll need that to sign transactions for this account\
   2.2 `Encryption Key`: This is the RSA encryption public key used to encrypt the user vote before storing it on the chain. This is to ensure the secrecy of votes. **Save the secret key somewhere** as you need this to decrypt votes later\
   2.3 `Poll Title`: Suitable title for the poll\
   2.4 `Options`: Name of voting options separated by `:`\
   2.5 `Reward Calculation Type`: This refers to how each vote is counted: `Singular` means each vote from a wallet has equal weightage, `Linear` means the vote from a wallet has weightage directly proportional to the tokens staked, and `Sublinear` means the vote from a wallet has weightage equal to `logx(Tokens Staked)`, where x in `sublinear_weighing_parameter` which you'll need to choose in next step
   2.6 `Rewards Structure`: Percentage of reward going to each rank in a poll. For example, if you want 80% of the staking pool going to rank 1 and 20% to rank 2, you can write `1:80;2:20`. Percentages should sum to 100.\
   2.7 `Amount Token`: Only SOL can be used to stake for now
3. After filling in the information and **Saving the secret keys** press submit and your poll will start reflecting on the Solana blockchain at the account corresponding to `Poll Id`
### Voting in a Poll
1. From the homepage click: `Vote and Stake` and choose a poll\
2. Fill in the relevant info:\
   2.1 `Option`: The one you want to vote for\
   2.2 `Staking Amount`: Number of SOL you want to stake for this option\
   2.3 `Max Options`: Autofilled, as specified by the poll creator\
   2.4 `Randomized Vote`: Autofilled, some randomization to ensure the secrecy of your vote before encryption. Your actual vote is Randomized Vote % (Max Options + 1)\
   2.5 `Encrypted Vote`: Autofilled, encrypted value of randomized vote that'll be stored on-chain\
   2.6 `Current On-Chain Vote`: Autofilled, Current On-Chain vote from your wallet for this poll, if any\
   2.7 `Current On-Chain Stake`: Autofilled, Total amount staked by your wallet on this poll so far\
3. Press `Vote and Stake` if this is your first time voting for this poll or `Update and Stake` otherwise.

#### NOTE: You cannot withdraw your tokens once staked, however, you can change your vote at any time with or without adding more tokens. In short, only your final vote is counted against all the tokens you stake.
###

## How it works
### Poll Creation
1. An account is created on Solana blockchain with minimal poll metadata
2. Rest of the poll metadata is stored on W3bber backend

### Voting
1. Poll metadata is retrieved from the W3bber backend
2. User selects an option between 1 to max_options
3. Vote is randomized such that vote = randomized_vote % (max_options + 1)
4. The randomized_vote is encrypted using the RSA public key from the poll
5. Vote PDA is created on Solana corresponding to `(poll_id, voter_wallet_id)`, and the encrypted vote is stored at the PDA
6. SOL corresponding to the staking amount are sent from voter wallet to the poll_id account

### Finishing a Poll
1. Poll creator marks the state of the poll as `Finish` on-chain, so no votes can be cast anymore
2. Poll creator calls the w3bber backend api to decrypt the votes by supplying the poll_id and secret_key
3. Once the results are obtained, the poll creator can transfer the reward tokens to the respective wallets

## Integration
If you want to integrate in your own application these are the relevant code sections:

### Interacting with Smart contract:
```typescript
// Path: src/api/solana_api.ts
// https://solana.fm/address/Dvufj2n9dYtimtH8su9ZNHoJ33Yd9a49KAtn5PoJGh2c?cluster=devnet-solana

// Creating Poll on Solana blockchain
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

// Creating Vote on Solana blockchain
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
```
### Interacting with W3bber Backend
```typescript
// Path: src/api/api.ts
// https://consensusbackend.w3bber.com/docs

// Creating Poll on W3bber Backend
export const createPoll = async (bearerToken: string, pollModel: PollModel) => {
  const api_call: string = `${BASEURL}/consensus-polls/create_poll`;
  const config = {
    headers: {
      Authorization: `Bearer ${bearerToken}`,
      accept: "application/json",
      "Content-Type": "application/json",
    },
  };

  console.log(qs.stringify(pollModel));
  return axios.post<PollModel>(api_call, pollModel, config);
};

// Creating Vote on W3bber Backend
export const createVote = async (bearerToken: string, voteModel: VoteModel) => {
  const api_call: string = `${BASEURL}/consensus-polls/create_vote`;
  const config = {
    headers: {
      Authorization: `Bearer ${bearerToken}`,
      accept: "application/json",
      "Content-Type": "application/json",
    },
  };

  console.log(qs.stringify(voteModel));
  return axios.post<VoteModel>(api_call, voteModel, config);
};
```

## Reward Calculation
Consider a poll that took place with 10 options and `Reward Calculation Type` as `Singular`. Also, suppose the rewards distribution was kept as:\
70% for First Place\
20% for Second Place\
10% for Third Place

Assuming, 219 total voters participated in the poll with each voter staking 1 SOL. This is how the votes looked like at the end of the reveal phase after decryption:
<p align="center">
  <img src="https://w3bber-movie-images.s3.amazonaws.com/w3bber-client/1.png" width="30%">
</p>
The distribution of the consensus, thus looks like this graphically:
<p align="center">
  <img src="https://w3bber-movie-images.s3.amazonaws.com/w3bber-client/2.png" width="70%">
</p>

So now:\
Total Staking Pool - *219 SOL*

**Winners:**\
First Place - Option 8\
Second Place - Option 2\
Third Place - Option 7

**Options' Pool:**\
Option 8 - 70% of 219 = 153.3 SOL\
Option 2 - 20% of 219 = 43.8 SOL\
Option 7 - 10% of 219 = 21.9 SOL

Winnings per user voting for an option = Option's Pool * Fractional Weight of user in option's Pool  

Now since we assumed singular reward calculation type and each voter staked 1 SOL, the fractional weight for each user voting for option 8 will be 1 / total_voters for this option = 1 / 62. Similarly 1/36 for option 2 and 1 / 28 for option 7 respectively. Note that these would be different if the reward calculation type were not singular and each user staked different amounts of SOL.

So rewards for each voter for each option:\
Option 8 - 153.3 / 62 = 2.472 SOL for 1 SOL staked\
Option 2 -  43.8 / 36 = 1.216 SOL for 1 SOL staked\
Option 7 - 21.9 / 28 = 0.782 SOL for 1 SOL staked

**Note that this is a Zero Sum Game, where the rewards for winning voters are funded by the losing Options’ voters, and the payouts depend on both the reward function and the calculation method used**

## Important Links
### <a href="https://consensusbackend.w3bber.com/docs" target="_blank">W3bber Backend Docs</a>
### <a href="https://solana.fm/address/Dvufj2n9dYtimtH8su9ZNHoJ33Yd9a49KAtn5PoJGh2c?cluster=devnet-solana" target="_blank">On-Chain Smart Contract (Devnet)</a>
