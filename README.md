# PoS Implementation

From [this fine walkthrough](https://medium.com/coinmonks/implementing-proof-of-stake-part-6-c811ce78ab0f).

I find a lot of value in ELI5 implementations. Here I ran everything in TypeScript and rewrote a couple of functions to make them more elegant or intuitive (for me).


![structure](structure.webp)

## ESM issues
The web now supports modules, but this module system is not so compatible with Node and still less TS.

fetch is at 2.6.5 to avoid issues.

## Questions for Later

It's clear to me that in a PoW system any validator out of touch with the network will temporarily have a different chain. And we know about failures to reach consensus and how they resolve.

In PoS it seems we have many transactions on many nodes. And then they elect a validator using staking.

Also, I am a little confused about how a WS server works. Here it seems a server has many sockets to connect with peers. It is not really a server-client model.

## Transactions and the Pool

> The transaction-pool will be an object updated in real time that contains all the new transactions submitted by all miners in the network.

> Users will create transactions and then they will submit every transaction to the pool. These new transactions, present in the pool, will be considered unconfirmed.

> Miners take a group of transactions from this pool and create the block and makes the transaction confirmed.

## Staking

As described in tag v0.0.1, we make a basic blockchain. Clients ask a chainServer to mine, and a p2pServer broadcasts all blocks. Every peer applies the longest chain rule.

To add staking:
- a client sends transactions to the chainServer.
- when the threshold is reached, each peer will check if it is the leader
- if nobody is, nothing will happen.

- a peer can send a message with type STAKE, and some amount to stake
- then the chain records that amount of staking
- the chain also transfers the block fee to the validator

- a peer can send a message with type validator fee
- the chain checks if it's valid and if so the peer is added to the list of validators
- and the peer gets the transfer fee for that transaction

So far it is lacking an easy demo of staking and validating. Nor is there a distinction built in yet.
