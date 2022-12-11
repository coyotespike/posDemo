import { Block, Blockchain } from "./blockchain";
import Client from "./client";
import initHTTPServer from "./app";

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
  await initHTTPServer(blockchain, HTTP_PORT);
  const client = new Client(HTTP_PORT);
  const blocks = await client.getBlocks();
  console.log(blocks);

  // exit the process
  process.exit(0);
};

startServerAndClient();
