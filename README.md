# TON Community DAO Vote

We're working on a no code governance platform for TON, similar to [snapshot.org](https://snapshot.org/) on EVM.

This system will support governance proposals and voting using native coins (TON coin), jettons or NTFs, with programmable strategies. For example, NFT voting weights can factor rarity if that's what a DAO wants to do.

Due to the recent turmoil in the community due to the miner addresses that may get frozen, we wanted to see if the DAO platform could be used to get the general TON holder community's opinion on the matter.

The full system is still WIP and not ready for a production release, so we decided to implement a much simpler case for a single vote and pitch it to TF.

## Properties of this version

* Voting is done on-chain and costs gas. The future system will also allow gasless voting through off-chain signatures.

* Results are calculated in regards to a historic snapshot of holdings that is pre-defined in the proposal. This helps prevent users from manipulating the vote by purchasing/borrowing tokens for the sake of the vote only.

* Counting of the votes occurs client-side. We can't tally the votes on-chain since a contract cannot read historic account state. By counting the votes client-side we still reach a pretty good degree of trustlessness. Everyone can be convinced on their own machine that the result is correct.

* This "system" supports a single proposal. Users can vote multiple times, the most recent vote takes.

## Walkthrough of the implementation

* [Contract](https://github.com/orbs-network/dao-vote/tree/main/contracts) - A very simple FunC contract to be a destination for votes. Voters vote with a comment so they can vote even without a special client. Contract holds the start and end timestamps. Also holds the timeatamp of the snapshot. We also want to add the list of frozen addresses to be getters in this contract so it is immuatble.

* [Vote calculation logic](https://github.com/orbs-network/dao-vote/tree/main/src/contracts-api) - The vote calculation happens in JavaScript. It downloads all the votes using HTTP v2 API (transactions sent to the contract). Each vote is weighted according to the holdings of the voter in the snapshot timestamp, which is read using HTTP v4 API. Most recent vote takes. The calculation logic also runs client-side so every user can run it in their browser and be convinced of the result.

* [App UI](https://github.com/orbs-network/dao-vote/tree/main/src) - The product is heavily inspired by snapshot.org proposal page. Users see the current status of the vote and calculate the result client-side. Users can vote using TON Connect 2 and support for other wallets like TonHub, although users can also vote by sending a comment to the contract so no client is mandatory. Users can change in the settings the HTTP v2 and HTTP v4 endpoints in order to be 100% trustless (in case they fear that the RPC servers don't give them the correct data).

## Live demo

The vote is currently live as a demo and deployed to mainnet. The client is at https://ton.vote - you can go there and play with the system.

## Additional missing features

There are few missing features that are still WIP. They are all listed in the [issues](https://github.com/orbs-network/dao-vote/issues). Please submit additional feedback as issues.
