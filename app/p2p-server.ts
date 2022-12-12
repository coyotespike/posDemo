import ws from "ws";
import { Blockchain } from "../blockchain";
import { TransactionPool, Wallet } from "../wallet";

export type Peer = `ws://localhost:${number}`;

const MESSAGE_TYPE = {
  chain: "CHAIN",
  transaction: "TRANSACTION",
  block: "BLOCK",
};

class P2PServer {
  blockchain: Blockchain;
  P2P_PORT: number;
  sockets: Array<ws>;
  transactionPool: TransactionPool;
  wallet: Wallet;

  constructor(
    blockchain: Blockchain,
    P2P_PORT: number,
    transactionPool: TransactionPool,
    wallet: Wallet
  ) {
    this.blockchain = blockchain;
    this.sockets = [];
    this.P2P_PORT = P2P_PORT;
    this.transactionPool = transactionPool;
    this.wallet = wallet;
  }

  listen(peers?: Array<Peer>) {
    const server = new ws.Server({ port: this.P2P_PORT });
    server.on("connection", (socket) => this.connectSocket(socket));
    console.log(`Listening for peer-to-peer connections on: ${this.P2P_PORT}`);

    if (peers) {
      this.connectToPeers(peers);
    }
  }

  connectToPeers(peers: Array<Peer>) {
    peers.forEach((peer) => {
      const socket = new ws(peer);
      console.log(`Connecting to peer: ${peer}`);
      socket.on("open", () => this.connectSocket(socket));
    });
  }

  connectSocket(socket) {
    this.sockets.push(socket);
    console.log("Socket connected");

    this.messageHandler(socket);
  }

  messageHandler(socket) {
    socket.on("message", (message) => {
      const data = JSON.parse(message);
      console.log("received message from peer: ", data.type);

      switch (data.type) {
        case MESSAGE_TYPE.chain:
          this.blockchain.replaceChain(data.chain);
          break;
        case MESSAGE_TYPE.block:
          if (this.isValidBlock(data.block)) {
            this.broadcastBlock(data.block);
          }
          break;

        case MESSAGE_TYPE.transaction:
          const isTxnInPool = this.transactionPool.transactionExists(
            data.transaction
          );
          if (!isTxnInPool) {
            const thresholdReached = this.transactionPool.addTransaction(
              data.transaction
            );
            this.broadcastTransaction(data.transaction);

            if (thresholdReached) {
              if (this.blockchain.getLeader() === this.wallet.getPublicKey()) {
                console.log("I am the leader, creating a block");
                let block = this.blockchain.createBlock(
                  this.transactionPool.transactions,
                  this.wallet
                );
                this.broadcastBlock(block);
                this.transactionPool.clear();
              }
            }
          }
          break;
        default:
          break;
      }
    });
  }

  isValidBlock(block) {
    const lastBlock = this.blockchain.getLastBlock();
    /**
     * check hash
     * check last hash
     * check signature
     * check leader
     */
    if (
      block.lastHash === lastBlock.hash &&
      block.hash === block.blockHash(block) &&
      block.verifyBlock(block) &&
      block.verifyLeader(block, this.blockchain.getLeader())
    ) {
      console.log("block valid");
      this.blockchain.addBlock(block);
      return true;
    } else {
      return false;
    }
  }

  sendChain(socket) {
    socket.send(
      JSON.stringify({
        type: MESSAGE_TYPE.chain,
        chain: this.blockchain.chain,
      })
    );
  }

  syncChains() {
    this.sockets.forEach((socket) => {
      this.sendChain(socket);
    });
  }

  broadcastTransaction(transaction) {
    this.sockets.forEach((socket) => this.sendTransaction(socket, transaction));
  }

  sendTransaction(socket, transaction) {
    socket.send(
      JSON.stringify({
        type: MESSAGE_TYPE.transaction,
        transaction,
      })
    );
  }

  broadcastBlock(block) {
    this.sockets.forEach((socket) => {
      this.sendBlock(socket, block);
    });
  }

  sendBlock(socket, block) {
    socket.send(
      JSON.stringify({
        type: MESSAGE_TYPE.block,
        block: block,
      })
    );
  }
}

export default P2PServer;
