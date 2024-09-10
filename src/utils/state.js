import axios from "axios";
import { ARK_LAMBDA_CONTRACT } from "./constants.js";

export async function getArks() {
  try {
    const arks = (
      await axios.get(`https://lambda.pink/state/${ARK_LAMBDA_CONTRACT}`)
    )?.data?.arks;
    return arks;
  } catch (error) {
    console.log(error);
    return {};
  }
}
