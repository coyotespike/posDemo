import Block from "./block";
import Accounts from "./accounts";
import Stake from "./stake";
import Validators from "./validator";

const MESSAGE_TYPE = {
  chain: "CHAIN",
  transaction: "TRANSACTION",
  block: "BLOCK",
  validator_fee: "VALIDATOR_FEE",
  stake: "STAKE",
};

class Blockchain {
  chain: Block[];
  accounts: Accounts;
  stakes: Stake;
  validators: Validators;

  constructor(genesisBlock?: Block) {
    this.chain = [genesisBlock || Block.genesis()];
    this.accounts = new Accounts();
    this.stakes = new Stake();
    this.validators = new Validators();
  }

  addBlock(block: Block) {
    this.chain.push(block);

    return block;
  }

  createBlock(transactions, wallet) {
    const block = Block.createBlock(
      this.chain[this.chain.length - 1],
      transactions,
      wallet
    );
    return block;
  }

  getLeader() {
    return this.stakes.getMax(this.validators.list);
  }

  getLastBlock() {
    return this.chain[this.chain.length - 1];
  }

  getBalance(address: string) {
    let balance = 0;
    return this.accounts.getBalance(address);
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
      // note this will start at 0, the genesis block, not included in this slice
      const lastBlock = chain[index];

      return (
        block.lastHash === lastBlock.hash &&
        block.hash === Block.blockHash(block)
      );
    });
  }

  replaceChain(newChain) {
    if (newChain.length <= this.chain.length) {
      // console.log("Received chain is not longer than the current chain.");
      return;
    } else if (!this.isValidChain(newChain)) {
      console.log("The received chain is not valid.");
      return;
    }

    console.log("Replacing blockchain with the new chain.");
    this.chain = newChain;
  }

  getGenesisBlock() {
    return this.chain[0];
  }
  executeTransactions(block) {
    block.data.forEach((transaction) => {
      switch (transaction.type) {
        case MESSAGE_TYPE.transaction:
          this.accounts.update(transaction);
          this.accounts.transferFee(block, transaction);
          break;
        case MESSAGE_TYPE.stake:
          this.stakes.update(transaction);
          this.accounts.decrement(
            transaction.input.from,
            transaction.output.amount
          );
          this.accounts.transferFee(block, transaction);

          break;
        case MESSAGE_TYPE.validator_fee:
          if (this.validators.update(transaction)) {
            this.accounts.decrement(
              transaction.input.from,
              transaction.output.amount
            );
            this.accounts.transferFee(block, transaction);
          }
          break;
      }
    });
  }
}

export default Blockchain;
