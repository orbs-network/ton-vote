# TON Community DAO Vote

## Background

Our team is working on an open no code governance platform for TON, similar to [snapshot.org](https://snapshot.org/) on EVM.

This system will support governance proposals and voting using native coins (TON coin), jettons or NTFs, with programmable strategies. For example, NFT voting weights can factor rarity if that's what a DAO wants to do.

The full system is still WIP and not ready for a production release, so we decided to implement a much simpler case for a single vote and pitch it to TF.

## Properties of this version

* Voting is done on-chain and costs gas. The future system will also allow gasless voting through off-chain signatures.

* Votes are weighted by TON coin balance. Results are calculated in regards to a historic snapshot of the balances that is pre-defined in the proposal. This helps prevent users from manipulating the vote by purchasing/borrowing tokens for the sake of the vote only. This also makes sure that every token can only be used by a single voter.

* Counting of the votes occurs client-side. We can't tally the votes on-chain since a contract cannot read historic account state. By counting the votes client-side we still reach a pretty good degree of trustlessness. Everyone can be convinced on their own machine that the result is correct. This is a similar trade-off as done on [snapshot.org](https://snapshot.org/) which is the most popular DAO voting platform today.

* This simplified "system" supports a single proposal. Users can vote multiple times and change their mind, the most recent vote takes.

## How can you vote?

To vote, make sure that your TON coin balance was not zero on the snapshot date. Voting will require sending a transaction on mainnet and this will cost very little gas. You will have to send the transaction from the same wallet that held your TON coin balance on the snapshot date.

There are many wallets on TON, we made sure that you can use any of them and that the voting process is as frictionless as possible. Here are some different alternatives for voting:

1. Use the client in https://ton.vote which supports TonHub, TonKeeper and OpenMask (via TonConnect2)

2. Manually transfer 0.01 TON to the contract address EQD0b665oQ8R3OpEjKToOrqQ9a9B52UnlY-VDKk73pCccvLr and include a comment with your vote, specifying the numbers of the selected projects. You may format the comment by either separating the numbers with commas or with spaces, such as "1, 2, 5, 7, 9" or "1 2 5 7 9".

3. Open the relevant ton:// deep link with a supporting wallet: `ton://transfer/EQD0b665oQ8R3OpEjKToOrqQ9a9B52UnlY-VDKk73pCccvLr?amount=10000000&text=1, 2, 5, 7, 9`
  
After voting, you can open the client in https://ton.vote to see your vote counted. It will appear in the top of the recent votes list.

If you choose to send a direct message to the contract with a message please use the following mapping:
1 - Tsunami Exchange, 2 - 1ton, 3 - Genlock, 4 - Tonic Lounge, 5 - DeDust, 6 - Nunjan IDE, 7 - TonEase, 
8 - Evaa, 9 - re:doubt, 10 - Punk City.

For example, if you want to vote to: Tsunami Exchange, 1ton, Genlock, Tonic Lounge, DeDust you should send a message with 0.075 Ton to the voting contract at address EQD0b665oQ8R3OpEjKToOrqQ9a9B52UnlY-VDKk73pCccvLr with a comment '1, 2, 3, 4, 5' or '1 2 3 4 5'

Note that we only allow users to use their own voting assets. This means we do not count votes from known custodial services such as exchanges, custodial wallets, etc. You can check the list of blacklisted addresses [here](https://github.com/orbs-network/dao-vote/blob/12ddd3d368c3bc1dc331cc219de496f23c99771e/src/contracts-api/custodian.js). 
If you are an owner of an address from this list and want to know how to vote, you can contact us via Telegram: https://t.me/TONVoteSupportGroup.

## How can you verify the results?

We took great care to make sure the voting process and calculation is decentralized and trustless. You can verify the results by yourself and you are not required to trust anyone in the process.

1. Votes are sent as on-chain transactions to a smart contract on mainnet: https://tonscan.org/address/EQD0b665oQ8R3OpEjKToOrqQ9a9B52UnlY-VDKk73pCccvLr

2. You can open this contract in an explorer and see all transactions sent to it with their votes as comments. You can also see the contract code since it is [verified](https://verifier.ton.org/EQD0b665oQ8R3OpEjKToOrqQ9a9B52UnlY-VDKk73pCccvLr). The source includes parameters of the vote like start and end time.

3. The browser app that displays the results is open source and served from GitHub Pages on [this repo](https://github.com/orbs-network/dao-vote). It does not require any hidden servers in order to calculate the results. You can even fork this repo and run your own version of the app to make sure 100% that this is the code running in your browser.

4. When you press the "Verify" button next to the results, your browser will download all the votes sent to the contract by using TON RPC API. Your browser will query the balance of each voter in the snapshot time using TON RPC API. Your browser will then combine the results by applying the weight for each vote as the balance. This entire process happens client-side making it 100% trustless.

5. To alleviate any concerns that the TON RPC API gateways might influence the results somehow, the client also allows you to provide your own RPC endpoints. You can find this option under "Settings". You are welcome to rely on any RPC endpoint you trust or run your own endpoint to be 100% trustless.

6. When Ethereum, which is considered successfully decentralized by the industry, held [similar votes](https://cointelegraph.com/news/eip-999-why-a-vote-to-release-parity-locked-funds-evoked-so-much-controversy) community-wide, the process was similar. So we are in good company.

## Walkthrough of the implementation

* [Contract](https://github.com/orbs-network/dao-vote/tree/main/contracts) - A very simple FunC contract to be a destination for votes. Voters vote with a comment so they can vote even without a special client. Contract holds the start and end timestamps. Also holds the timeatamp of the snapshot.

* [Vote calculation logic](https://github.com/orbs-network/dao-vote/tree/main/src/contracts-api) - The vote calculation happens in JavaScript. It downloads all the votes using HTTP v2 API (transactions sent to the contract). Each vote is weighted according to the holdings of the voter in the snapshot timestamp, which is read using HTTP v4 API. Most recent vote takes. The calculation logic also runs client-side so every user can run it in their browser and be convinced of the result.

* [App UI](https://github.com/orbs-network/dao-vote/tree/main/src) - The product is heavily inspired by snapshot.org proposal page. Users see the current status of the vote and calculate the result client-side. Users can vote using TON Connect 2 and support for other wallets like TonHub, although users can also vote by sending a comment to the contract so no client is mandatory. Users can change in the settings the HTTP v2 and HTTP v4 endpoints in order to be 100% trustless (in case they fear that the RPC servers don't give them the correct data).

## Live demo

The vote is currently live as a demo and deployed to mainnet. The client is at https://ton.vote - you can go there and play with the system. There are few missing features that are still WIP. They are all listed in the [issues](https://github.com/orbs-network/dao-vote/issues). Please submit additional feedback as issues.

## Why not calculate results on-chain?

There are ideas in the community on how to implement an on-chain DAO. Most proposals have to do with Jettons, not with TON coin itself. These proposals also generally prevent or limit tokens from being transferred during the vote so they would not be used twice. We believe that such limitations will decrease participation in the vote and prevent some voices from being heard. Even with democratic elections that happen once every 4 years, voter turn-out is always too low. The off-chain calculation method is as secure (nobody can create widespread result fraud) and by relying on a historic balance snapshot, there is no need to limit any of the voters in any way.

## License

MIT