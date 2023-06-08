# Open source React frontend for ton.vote website
- [TON blockchain smart contracts for ton.vote](https://github.com/orbs-network/ton-vote-contracts)
- [TypeScript SDK for interacting with ton.vote contracts](https://github.com/orbs-network/ton-vote-contracts-sdk)
- [Open source React frontend for ton.vote website](https://github.com/orbs-network/ton-vote)
- [Caching server for ton.vote providing convenient API over on-chain data](https://github.com/orbs-network/ton-vote-cache)

---

## Background

Our team is working on an open no code governance platform for TON, similar to [snapshot.org](https://snapshot.org/) on EVM.

This system will support governance proposals and voting using native coins (TON coin), jettons or NTFs, with programmable strategies. For example, NFT voting weights can factor rarity if that's what a DAO wants to do.

The full system is still WIP and we are working on adding more features like custom strategies and support to different voting systems.

## Properties of this version

* Voting is done on-chain and costs gas. The future system will also allow gasless voting through off-chain signatures.

* Votes can be weighted by TON coin balance, Jetton or NFT holdings. Results are calculated in regards to a historic snapshot of the balances that is pre-defined in the proposal. This helps prevent users from manipulating the vote by purchasing/borrowing tokens for the sake of the vote only. This also makes sure that every token can only be used by a single voter.

* Counting of the votes occurs client-side. We can't tally the votes on-chain since a contract cannot read historic account state. By counting the votes client-side we still reach a pretty good degree of trustlessness. Everyone can be convinced on their own machine that the result is correct. This is a similar trade-off as done on [snapshot.org](https://snapshot.org/) which is the most popular DAO voting platform today.

## How can you vote?

To vote, make sure that your TON coin balance was not zero on the snapshot date. Voting will require sending a transaction on mainnet and this will cost very little gas. You will have to send the transaction from the same wallet that held your TON coin balance on the snapshot date.

There are many wallets on TON, we made sure that you can use any of them and that the voting process is as frictionless as possible. Here are some different alternatives for voting:

1. Use the client in https://ton.vote which supports TonHub, TonKeeper and OpenMask (via TonConnect2)

2. Transfer 0.01 TON manually to the proposal's contract address and add a comment with your vote - `yes` or `no` or `abstain`. The proposal's address is available in the client on the proposal page under the information section.

3. Open the relevant ton:// deep link with a supporting wallet. This is the general format (replace proposal-address with the relevant proposal address and your-vote with your vote - yes, no or abstain): ton://transfer/{proposal-address}?amount=10000000&text={your-vote}.
For example:
    * yes - `ton://transfer/EQCVy5bEWLQZrh5PYb1uP3FSO7xt4Kobyn4T9pGy2c5-i-GS?amount=10000000&text=yes`
    * no - `ton://transfer/EQCVy5bEWLQZrh5PYb1uP3FSO7xt4Kobyn4T9pGy2c5-i-GS?amount=10000000&text=no`
    * abstain - `ton://transfer/EQCVy5bEWLQZrh5PYb1uP3FSO7xt4Kobyn4T9pGy2c5-i-GS?amount=10000000&text=abstain`
  
After voting, you can open the client in https://ton.vote to see your vote counted. It will appear in the top of the recent votes list.

Note that we only allow users to use their own voting assets. This means we do not count votes from known custodial services such as exchanges, custodial wallets, etc. You can check the list of blacklisted addresses [here](https://github.com/orbs-network/ton-vote-contracts-sdk/blob/7f57da46b66cbdab23ad597cb8f665f500e2b60e/src/custodian.ts). 
If you are an owner of an address from this list and want to know how to vote, you can contact us via Telegram: https://t.me/TONVoteSupportGroup.

## How can you verify the results?

We took great care to make sure the voting process and calculation is decentralized and trustless. You can verify the results by yourself and you are not required to trust anyone in the process.

1. Votes are sent as on-chain transactions to a smart contract on mainnet. The smart contract address can be obtained from the proposal page on the information section.

2. You can open the proposal contract in an explorer and see all transactions sent to it with their votes as comments. You can also use ton verifier to see the contract code since it is verified, just go to https://verifier.ton.org and enter the propoal address. The source includes parameters of the proposal like start and end dates, snapshot date, voting strategy and more.

3. The browser app that displays the results is open source and served from GitHub Pages on [this repo](https://github.com/orbs-network/ton-vote). It uses a cache server only for better user experience but it can also work without the cache server and read all data from the chain in order to calculate the results. 

4. When you press the "Verify" button next to the results, your browser will download all the votes sent to the contract by using TON RPC API. Your browser will query the balance of each voter in the snapshot time using TON RPC API. Your browser will then combine the results by applying the weight for each vote as the balance. This entire process happens client-side making it 100% trustless.

5. To alleviate any concerns that the TON RPC API gateways might influence the results somehow, the client also allows you to provide your own RPC endpoints. You can find this option under "Settings". You are welcome to rely on any RPC endpoint you trust or run your own endpoint to be 100% trustless.

6. When Ethereum, which is considered successfully decentralized by the industry, held [similar votes](https://cointelegraph.com/news/eip-999-why-a-vote-to-release-parity-locked-funds-evoked-so-much-controversy) community-wide, the process was similar. So we are in good company.

## Walkthrough of the implementation

* Every DAO needs to open a DAO space before it can submit new proposals. The DAO as well as the prposals are contracts on the TON blockchain. you can see the contracts implementations [here](https://github.com/orbs-network/ton-vote-contracts).

* The proposal contract is a very simple Tact contract to be a destination for votes. Voters vote with a comment so they can vote even without a special client. Contract holds parameters of the proposal such as start, end and snapshot timestamps, voting system and strategy, title ansd description and more. 

* The proposal owners can update the proposal only until the start timestamp, after this time it is immutable and can not be changed. We use this mechanism to avoid influencing the proposal results but still allowing owners to make some changes to the proposal before it starts.

* [Vote calculation logic](https://github.com/orbs-network/ton-vote-contracts-sdk/blob/main/src/proposalLogic.ts) - The vote calculation happens in JavaScript. It downloads all the votes using HTTP v2 API (transactions sent to the contract). Each vote is weighted according to the holdings of the voter in the snapshot timestamp, which is read using HTTP v4 API. Most recent vote takes.

* [App UI](https://github.com/orbs-network/ton-vote) - The product is heavily inspired by snapshot.org proposal page. Users see the current status of the vote and calculate the result client-side. Users can vote using TON Connect 2 and support for other wallets like TonHub, although users can also vote by sending a comment to the contract so no client is mandatory. Users can change in the settings the HTTP v2 and HTTP v4 endpoints in order to be 100% trustless (in case they fear that the RPC servers don't give them the correct data).

## How to get verified as a DAO space?
The [UI](https://ton.vote) displays a blue checkmark next to verified DAOs, indicating that their ownership of the domain has been verified. Verified DAO spaces on [ton.vote](https://ton.vote) can be trusted as they accurately represent the claimed domain. When a DAO is verified, its website is featured in the DAO space on the homepage of [ton.vote](https://ton.vote).

## How to make test proposals?
We have built a dedicated platform for testing proposals and its available [here](https://dev.ton.vote). 
It is advisable to refrain from spamming your DAO with testing proposals. If you wish to create a test proposal, you can utilize dev.ton.vote. Just create a new DAO and create as many testing proposals as needed.

We have created a dedicated platform at [dev.ton.vote](https://dev.ton.vote) specifically for testing proposals. To maintain the integrity of your DAO, we kindly request that you refrain from spamming it with testing proposals. Instead, you can leverage the dev.ton.vote platform to create a new DAO and generate as many testing proposals as you require.

## Live demo

The platform is live and deployed to mainnet. The client is at https://ton.vote - you can go there and play with the system. There are missing features that are still WIP. You can submit additional feedback as [issues](https://github.com/orbs-network/ton-vote/issues) or directly to the [Telegram support group](https://t.me/TONVoteSupportGroup).

## Why not calculate results on-chain?

There are ideas in the community on how to implement an on-chain DAO. Most proposals have to do with Jettons, not with TON coin itself. These proposals also generally prevent or limit tokens from being transferred during the vote so they would not be used twice. We believe that such limitations will decrease participation in the vote and prevent some voices from being heard. Even with democratic elections that happen once every 4 years, voter turn-out is always too low. The off-chain calculation method is as secure (nobody can create widespread result fraud) and by relying on a historic balance snapshot, there is no need to limit any of the voters in any way.

## License

MIT

