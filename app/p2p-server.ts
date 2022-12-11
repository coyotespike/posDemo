import ws from "ws";
import { Blockchain } from "../blockchain";
import { TransactionPool } from "../wallet";

export type Peer = `ws://localhost:${number}`;

const MESSAGE_TYPE = {
  chain: "CHAIN",
  transaction: "TRANSACTION",
};

class P2PServer {
  blockchain: Blockchain;
  P2P_PORT: number;
  sockets: Array<ws>;
  transactionPool: TransactionPool;

  constructor(
    blockchain: Blockchain,
    P2P_PORT: number,
    transactionPool: TransactionPool
  ) {
    this.blockchain = blockchain;
    this.sockets = [];
    this.P2P_PORT = P2P_PORT;
    this.transactionPool = transactionPool;
  }

  listen(peers: Array<Peer>) {
    const server = new ws.Server({ port: this.P2P_PORT });
    server.on("connection", (socket) => this.connectSocket(socket));
    console.log(`Listening for peer-to-peer connections on: ${this.P2P_PORT}`);

    this.connectToPeers(peers);
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

    // const message = JSON.stringify({
    //   peer: `${this.P2P_PORT}`,
    //   chain: this.blockchain.chain,
    // });
    // socket.send(message);
  }

  messageHandler(socket) {
    socket.on("message", (message) => {
      const data = JSON.parse(message);
      console.log("received message from peer: ", data.type);

      switch (data.type) {
        case MESSAGE_TYPE.chain:
          this.blockchain.replaceChain(data.chain);
          break;
        case MESSAGE_TYPE.transaction:
          const isTxnInPool = this.transactionPool.transactionExists(
            data.transaction
          );
          if (!isTxnInPool) {
            this.transactionPool.addTransaction(data.transaction);
            this.broadcastTransaction(data.transaction);
          }
          break;
        default:
          break;
      }
    });
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
}

export default P2PServer;
