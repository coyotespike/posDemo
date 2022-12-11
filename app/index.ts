import express from "express";
import bodyParser from "body-parser";

import { Blockchain } from "../blockchain";

const initHttpServer = (
  myBlockchain: Blockchain,
  HTTP_PORT: number
): Promise<express.Express> => {
  return new Promise((resolve, reject) => {
    const app = express();
    app.use(bodyParser.json());

    app.get("/blocks", (req, res) => {
      res.json(myBlockchain.chain);
    });

    app.post("/mine", (req, res) => {
      const { data } = req.body;
      const block = myBlockchain.addBlock(data);
      console.log(`New block added: ${block.toString()}`);
      res.redirect("/blocks");
    });

    app.listen(HTTP_PORT, () => {
      console.log(`Listening http on port: ${HTTP_PORT}`);
      resolve(app);
    });
  });
};

export default initHttpServer;
