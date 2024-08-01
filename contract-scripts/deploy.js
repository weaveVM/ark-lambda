import { ethers } from "ethers";
import axios from "axios";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();
const SEQUENCER_ADDRESS = "0x197f818c1313dc58b32d88078ecdfb40ea822614";
const WVM_RPC_URL= "https://testnet-rpc.wvm.dev"
const SEQUENCER_ENDPOINT = "https://wvm-lambda-0755acbdae90.herokuapp.com";

const provider = new ethers.JsonRpcProvider(WVM_RPC_URL);
const wallet = new ethers.Wallet(process.env.WVM_WALLET_PK, provider);

/**
 * 
 * @param {*} input 
 * @returns hash
 */
async function postCalldata(input) {
  try {
    const calldata = ethers.hexlify(ethers.toUtf8Bytes(input));
    console.log(calldata);

    const tx = {
      to: SEQUENCER_ADDRESS,
      value: ethers.parseEther("0"),
      data: calldata,
      gasLimit: ethers.toBigInt("5000000"),
      gasPrice: ethers.parseUnits("100", "gwei"),
    };
    const transactionResponse = await wallet.sendTransaction(tx);
    console.log(`Transaction sent: ${transactionResponse.hash}`);
    return transactionResponse.hash;
  } catch (error) {
    console.error(`Error sending transaction: ${error}`);
  }
}

/**
 * 
 * @returns transaction
 */
function prepareContractData() {
    const sc = fs.readFileSync("./contract/ark.js", "utf-8");
    const state = fs.readFileSync("./contract/ark.json", "utf-8");

    console.log(sc, state)
    const transaction = {
        type: 1,
        sc: sc.split("").map((char) => char.charCodeAt(0)),
          state: state.split("").map((char) => char.charCodeAt(0))
    }

    return JSON.stringify(transaction);
}

/**
 * To deploy via curl:
 * curl -X POST https://wvm-lambda-0755acbdae90.herokuapp.com/deploy -H "Content-Type: application/json" -d '{"txid":"$CONTRACT_ADDRESS"}'
 */
async function deployContract() {
    try {
        const contractRawData = prepareContractData();
        const contractAddress = await postCalldata(contractRawData);
        const response = await axios.post(`${SEQUENCER_ENDPOINT}/deploy`, { txid: contractAddress });

        console.log('Transaction response:', response.data);
        return response.data;

    } catch(error) {
        console.log(error)
    }
}

deployContract();