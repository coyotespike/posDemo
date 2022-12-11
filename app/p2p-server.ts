import ws from "ws";
import { Blockchain } from "../blockchain";

export type Peer = `ws://localhost:${number}`;

class P2PServer {
  blockchain: Blockchain;
  P2P_PORT: number;
  sockets: Array<ws>;

  constructor(blockchain: Blockchain, P2P_PORT: number) {
    this.blockchain = blockchain;
    this.sockets = [];
    this.P2P_PORT = P2P_PORT;
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

    // socket.send(JSON.stringify(this.blockchain.chain));
    const message = JSON.stringify({
      peer: `${this.P2P_PORT}`,
      chain: this.blockchain.chain,
    });
    socket.send(message);
  }

  messageHandler(socket) {
    socket.on("message", (message) => {
      const data = JSON.parse(message);
      this.blockchain.replaceChain(data.chain);
    });
  }

  sendChain(socket) {
    socket.send(JSON.stringify(this.blockchain));
  }

  syncChains() {
    this.sockets.forEach((socket) => {
      this.sendChain(socket);
    });
  }
}

export default P2PServer;
