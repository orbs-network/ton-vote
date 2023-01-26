# This is a proof of concept

We're working on a no code governance platform for TON, similar to [snapshot.org](https://snapshot.org/) on EVM.

This system will support governance proposals and voting using native coins (TON coin), jettons or NTFs, with programmable strategies. For example, NFT voting weights can factor rarity if that's what a DAO wants to do.

Due to the recent turmoil in the community due to the miner addresses that may get frozen, we wanted to see if the DAO platform could be used to get the general TON holder community's opinion on the matter.

The full system is still WIP and not ready for a production release, so we decided to implement a much simpler case for a single vote and pitch it to TF.

## Properties of this version

* Voting is done on-chain and costs gas. The future system will also allow gasless voting through off-chain signatures.

* Results are calculated in regards to a historic snapshot of holdings that is pre-defined in the proposal. This helps prevent users from manipulating the vote by purchasing/borrowing tokens for the sake of the vote only.

* Counting of the votes occurs client-side. We can't tally the votes on-chain since a contract cannot read historic account state. By counting the votes client-side we still reach a pretty good degree of trustlessness. Every one can be convinced on their own machine that the result is correct.

* This "system" supports a single proposal. Users can vote multiple times, the most recent vote takes.
