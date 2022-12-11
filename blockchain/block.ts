import { ChainUtil } from "../chainUtils";

class Block {
  timestamp: Date;
  lastHash: string;
  hash: string;
  data: Array<any>;
  validator: string;
  signature: string;

  constructor(
    timestamp,
    lastHash,
    hash,
    data = [],
    validator = null,
    signature = null
  ) {
    this.timestamp = timestamp;
    this.lastHash = lastHash;
    this.hash = hash;
    this.data = data;
    this.validator = validator;
    this.signature = signature;
  }

  toString() {
    return `Block -
Timestamp : ${this.timestamp}
Last Hash : ${this.lastHash}
Hash      : ${this.hash}
Data      : ${this.data}
Validator : ${this.validator}
Signature : ${this.signature}`;
  }

  static hash(timestamp, lastHash, data) {
    return ChainUtil.hash(`${timestamp}${lastHash}${data}`);
  }

  static genesis() {
    return new Block(
      `genesis time`,
      "----",
      "genesis-hash",
      [],
      "genesis-validator",
      "genesis-signature"
    );
  }
  static createBlock(lastBlock, data) {
    let hash;
    let timestamp = Date.now();
    const lastHash = lastBlock.hash;
    hash = Block.hash(timestamp, lastHash, data);

    return new Block(timestamp, lastHash, hash, data);
  }
  static blockHash(block) {
    const { timestamp, lastHash, data } = block;
    return Block.hash(timestamp, lastHash, data);
  }
}

export default Block;
