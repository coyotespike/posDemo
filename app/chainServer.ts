import express from "express";
import bodyParser from "body-parser";
import { stringify } from "flatted";

import { Blockchain } from "../blockchain";
import P2PServer from "./p2p-server";

import { TransactionPool, Wallet } from "../wallet";

const wallet = new Wallet(Date.now().toString());
const transactionPool = new TransactionPool();

const initHttpServer = (
  myBlockchain: Blockchain,
  HTTP_PORT: number,
  p2pServer?: P2PServer
): Promise<express.Express> => {
  return new Promise((resolve, reject) => {
    const app = express();
    app.use(bodyParser.json());

    app.get("/blocks", (req, res) => {
      res.json(myBlockchain.chain);
    });

    app.get("/transactions", (req, res) => {
      res.json(transactionPool.transactions);
    });

    app.post("/transact", (req, res) => {
      const { to, amount, type } = req.body;
      const transaction = wallet.createTransaction(
        to as string,
        amount as number,
        type as string,
        myBlockchain,
        transactionPool
      );
      res.send(transaction);
      // res.send({});
    });

    app.post("/mine", (req, res) => {
      const { data } = req.body;
      const block = myBlockchain.addBlock(data);
      console.log(`New block added: ${block.toString()}`);
      p2pServer && p2pServer.syncChains();
      res.redirect("/blocks");
    });

    app.listen(HTTP_PORT, () => {
      console.log(`Listening http on port: ${HTTP_PORT}`);
      resolve(app);
    });
  });
};

export default initHttpServer;
