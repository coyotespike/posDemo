/*
  Validator nodes can add stake, be elected as leader, and create blocks.

  Only those nodes who send a special transaction with a validator fee can become a validator.

  The fee or coins are later burnt and are not used.
  */

class Validators {
  list: string[] = [];
  constructor() {
    this.list = [];
  }

  update(transaction) {
    if (transaction.amount == 30 && transaction.to == "0") {
      this.list.push(transaction.from);
      return true;
    }
    return false;
  }
}

export default Validators;
