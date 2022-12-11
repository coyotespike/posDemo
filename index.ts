import { Block, Blockchain } from "./blockchain";
import Client from "./client";
import { chainServer, P2PServer, Peer } from "./app";

const block = new Block(
  new Date(),
  "lastHash",
  "hash",
  [],
  "i am the validator",
  "signature"
);

const blockchain = new Blockchain();
blockchain.addBlock([]);

const HTTP_PORT = 3001;
const client = new Client(HTTP_PORT);

const startServerAndClient = async () => {
  await chainServer(blockchain, HTTP_PORT);
  const client = new Client(HTTP_PORT);
  const blocks = await client.getBlocks();
  console.log(blocks);
};

const startP2PServer = async () => {
  const portsAndPeers = [
    { port: 5001, peers: ["ws://localhost:5002", "ws://localhost:5003"] },
    { port: 5002, peers: ["ws://localhost:5001", "ws://localhost:5003"] },
    { port: 5003, peers: ["ws://localhost:5001", "ws://localhost:5002"] },
  ];
  await portsAndPeers.forEach(async (portAndPeer) => {
    const { port, peers } = portAndPeer;
    const p2pServer = new P2PServer(blockchain, port);
    await p2pServer.listen(peers as Peer[]);
  });

  console.log("P2P Server started");
};

const startMiners = async () => {
  const portsAndPeers = [
    {
      chainPort: 3001,
      peerPort: 5001,
      peers: ["ws://localhost:5002", "ws://localhost:5003"],
    },
    {
      chainPort: 3002,
      peerPort: 5002,
      peers: ["ws://localhost:5001", "ws://localhost:5003"],
    },
    {
      chainPort: 3003,
      peerPort: 5003,
      peers: ["ws://localhost:5001", "ws://localhost:5002"],
    },
  ];
  const genesisBlock = blockchain.getGenesisBlock();
  await portsAndPeers.forEach(async (portAndPeer) => {
    const { chainPort, peerPort, peers } = portAndPeer;
    const blockchain = new Blockchain(genesisBlock);
    const p2pServer = new P2PServer(blockchain, peerPort);
    await p2pServer.listen(peers as Peer[]);
    await chainServer(blockchain, chainPort, p2pServer);
  });

  console.log("Miners started");
};

// startServerAndClient();
// startP2PServer();
startMiners();

client.mineBlock(["this is so much data!"]);
