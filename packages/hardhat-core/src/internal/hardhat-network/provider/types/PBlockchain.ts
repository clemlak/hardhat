import { Block } from "@ethereumjs/block";
import { TypedTransaction } from "@ethereumjs/tx";
import { BN } from "ethereumjs-util";

import { FilterParams } from "../node-types";
import { RpcLogOutput, RpcReceiptOutput } from "../output";

import { Blockchain } from "./Blockchain";
import { Callback } from "./Callback";

export interface PBlockchain {
  getLatestBlock(): Promise<Block>;
  getBlock(blockHashOrNumber: Buffer | number | BN): Promise<Block | undefined>;
  addBlock(block: Block): Promise<Block>;
  deleteBlock(blockHash: Buffer): void;
  deleteLaterBlocks(block: Block): void;
  getTotalDifficulty(blockHash: Buffer): Promise<BN>;
  getTransaction(
    transactionHash: Buffer
  ): Promise<TypedTransaction | undefined>;
  getLocalTransaction(transactionHash: Buffer): TypedTransaction | undefined;
  getBlockByTransactionHash(
    transactionHash: Buffer
  ): Promise<Block | undefined>;
  getTransactionReceipt(
    transactionHash: Buffer
  ): Promise<RpcReceiptOutput | undefined>;
  addTransactionReceipts(receipts: RpcReceiptOutput[]): void;
  getLogs(filterParams: FilterParams): Promise<RpcLogOutput[]>;
}

export function toBlockchain(pb: PBlockchain): Blockchain {
  async function getBlock(blockTag: number | Buffer | BN) {
    const block = await pb.getBlock(blockTag);
    if (block === undefined) {
      // tslint:disable-next-line only-hardhat-error
      throw new Error("Block not found");
    }
    return block;
  }

  function delBlock(blockHash: Buffer, cb: Callback) {
    try {
      pb.deleteBlock(blockHash);
    } catch (e) {
      return;
    }
  }

  return {
    getBlock,
    putBlock: pb.addBlock.bind(pb),
    delBlock,
    getDetails,
    iterator,
  };
}

function getDetails(_: string, cb: Callback) {
  cb(null);
}

function iterator() {
  // tslint:disable-next-line only-hardhat-error
  throw new Error(".iterator() is not supported");
}
