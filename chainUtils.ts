import { eddsa as EDDSA } from "elliptic";
import { v1 as uuidV1 } from "uuid";
import { SHA256 } from "crypto-js";

const eddsa = new EDDSA("ed25519");

type TransactionInput = {
  timestamp: number;
  from: string;
  senderSignature: string;
};

type TransactionOutput = {
  to: string;
  amount: number;
  fee: number;
};

export type TransactionType = {
  id: string;
  input: TransactionInput;
  output: TransactionOutput;
};

class ChainUtil {
  static genKeyPair(secret) {
    return eddsa.keyFromSecret(secret);
  }

  static id() {
    return uuidV1();
  }

  static hash(data) {
    return SHA256(JSON.stringify(data)).toString();
  }
  static verifySignature(publicKey, signature, dataHash) {
    return eddsa.keyFromPublic(publicKey, "hex").verify(dataHash, signature);
  }
}

class Transaction {
  id: string;
  input: TransactionInput;
  output: TransactionOutput;
  type: string;

  constructor(type, input, output) {
    this.id = ChainUtil.id();
    this.type = type;
    this.input = input;
    this.output = output;
  }

  static newTransaction(senderWallet, to, amount, type) {
    if (amount + TRANSACTION_FEE > senderWallet.balance) {
      console.log("Not enough balance");
      return;
    }

    return Transaction.generateTransaction(senderWallet, to, amount, type);
  }

  static generateTransaction(senderWallet, to, amount, type) {
    const output = {
      to: to,
      amount: amount - TRANSACTION_FEE,
      fee: TRANSACTION_FEE,
    };
    const input = Transaction.signTransaction(output, senderWallet);
    return new Transaction(type, input, output);
  }

  static signTransaction(transactionOutput, senderWallet) {
    // senderWallet must sign because we debit their account
    const input = {
      timestamp: Date.now(),
      from: senderWallet.publicKey,
      senderSignature: senderWallet.sign(ChainUtil.hash(transactionOutput)),
    };
    return input;
  }

  static verifyTransaction(transaction) {
    return ChainUtil.verifySignature(
      transaction.input.from,
      transaction.input.senderSignature,
      ChainUtil.hash(transaction.output)
    );
  }
}

const TRANSACTION_FEE = 1;
const INITIAL_BALANCE = 1000;

export { ChainUtil, Transaction, TRANSACTION_FEE, INITIAL_BALANCE };
