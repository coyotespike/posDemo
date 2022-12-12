import fetch from "node-fetch";
import { Transaction } from "../chainUtils";

class Client {
  fetch: typeof fetch;
  HTTP_PORT: number;

  constructor(HTTP_PORT: number) {
    this.fetch = fetch;
    this.HTTP_PORT = HTTP_PORT || 3001;
  }

  async getBlocks() {
    const response = await this.fetch(
      `http://localhost:${this.HTTP_PORT}/blocks`
    );
    return await response.json();
  }

  async mineBlock(data: Array<any>) {
    const response = await this.fetch(
      `http://localhost:${this.HTTP_PORT}/mine`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data }),
      }
    );
    return await response.json();
  }

  async getTransactions() {
    const response = await this.fetch(
      `http://localhost:${this.HTTP_PORT}/transactions`
    );
    return await response.json();
  }

  async transact(txn: Transaction) {
    const response = await this.fetch(
      `http://localhost:${this.HTTP_PORT}/transact`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(txn),
      }
    );
    return await response.json();
  }
}

export default Client;
