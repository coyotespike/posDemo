import { ChainUtil } from "../chainUtils";
import { eddsa as EDDSA } from "elliptic";
import { Transaction, INITIAL_BALANCE } from "../chainUtils";

class Wallet {
  balance: number;
  keyPair: EDDSA.key;
  publicKey: string;

  constructor(secret) {
    this.balance = INITIAL_BALANCE;
    this.keyPair = ChainUtil.genKeyPair(secret);
    this.publicKey = this.keyPair.getPublic("hex");
  }

  toString() {
    return `Wallet -
        publicKey: ${this.publicKey.toString()}
        balance  : ${this.balance}`;
  }

  sign(dataHash) {
    // the toHex is important because otherwise we get a circular JSON structure
    // not even flatted can handle it
    return this.keyPair.sign(dataHash).toHex();
  }

  createTransaction(recipient, amount, type, blockchain, transactionPool) {
    this.balance = this.getBalance(blockchain);
    if (amount > this.balance) {
      console.log(`Amount: ${amount} exceeds current balance: ${this.balance}`);
      return;
    }
    let transaction = Transaction.newTransaction(this, recipient, amount, type);
    transactionPool.addTransaction(transaction);
    return transaction;
  }
  getBalance(blockchain) {
    return blockchain.getBalance(this.publicKey);
  }

  getPublicKey() {
    return this.publicKey;
  }
}

export default Wallet;
