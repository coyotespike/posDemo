import { TransactionType, Transaction } from "../chainUtils";

class TransactionPool {
  transactions: TransactionType[] = [];

  addTransaction(transaction: Transaction) {
    this.transactions.push(transaction);
  }

  validTransactions() {
    return this.transactions.filter((transaction) => {
      const isValidTransaction = Transaction.verifyTransaction(transaction);
      if (!isValidTransaction) {
        console.log(`Invalid transaction from ${transaction.input.from}`);
      }
      return isValidTransaction;
    });
  }

  transactionExists(transaction: Transaction) {
    const txn = this.transactions.find((t) => t.id === transaction.id);
    return !!txn;
  }
}

export default TransactionPool;
