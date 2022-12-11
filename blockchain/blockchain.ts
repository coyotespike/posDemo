import Block from "./block";

class Blockchain {
  chain: Block[];

  constructor() {
    this.chain = [Block.genesis()];
  }

  addBlock(data: Array<any>) {
    const block = Block.createBlock(this.chain[this.chain.length - 1], data);
    this.chain.push(block);

    return block;
  }
  isValidChain(chain) {
    /*
        A valid chain must start with the genesis block
        and all blocks must contain the previous hash

        I think you could check only the genesis and last blocks actually
        No that's wrong
        */
    if (JSON.stringify(chain[0]) !== JSON.stringify(Block.genesis()))
      return false;

    return chain.slice(1).every((block, index) => {
      const lastBlock = chain[index - 1];

      return (
        block.lastHash === lastBlock.hash &&
        block.hash === Block.blockHash(block)
      );
    });
  }

  replaceChain(newChain) {
    if (newChain.length <= this.chain.length) {
      console.log("Received chain is not longer than the current chain.");
      return;
    } else if (!this.isValidChain(newChain)) {
      console.log("The received chain is not valid.");
      return;
    }

    console.log("Replacing blockchain with the new chain.");
    this.chain = newChain;
  }
}

export default Blockchain;
