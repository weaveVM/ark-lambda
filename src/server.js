import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
dotenv.config()

import { getArks } from "./utils/state.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

app.use(bodyParser.json({ limit: "10gb" }));
app.use(bodyParser.urlencoded({limit: "10gb", extended: true, parameterLimit:1000000}));

app.get("/arks", async (req, res) => {
  try {
    const arks = await getArks();

    res.json(arks);
  } catch (error) {
    console.error("Error fetching Ark Lambda Arks:", error.message);
    res.status(500).json({ error: "Error fetching Ark LAmbda Arks:" });
  }
});

app.post('/is-ark-user', async(req, res) => {
    const { accounts } = req.body;
    const headers = req.headers
    console.log(req.body)
   
    if (headers['x-api-key']!== process.env.ZEALY_API_KEY) {
      throw new Error('Invalid API Key')
    }
   
   
    const arks = await getArks();
    const user = accounts?.wallet;
    const user_exists = (arks[user.toLowerCase()]).length;
   
    if (!user_exists) {
      return res.status(400).send({
        message: 'Validation failed'
      })
    }
   
    return res.status(200).send({
      message: "Quest completed"
    })
  });

app.listen(PORT, () => {
  console.log(`[⚡️] server running at port: ${PORT}`);
});