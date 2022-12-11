# PoS Implementation

From [this fine walkthrough](https://medium.com/coinmonks/implementing-proof-of-stake-part-6-c811ce78ab0f).

I find a lot of value in ELI5 implementations. Here I ran everything in TypeScript and rewrote a couple of functions to make them more elegant or intuitive (for me).


![structure](structure.webp)

## ESM issues
The web now supports modules, but this module system is not so compatible with Node and still less TS.

fetch is at 2.6.5 to avoid issues.
