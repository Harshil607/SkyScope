import express from "express";
import dotenv from "dotenv";
import { retrieveCache } from "./services/opensky.services.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

const app = express();

app.use(express.json());

app.get("/api/aircraft", async (req, res) => {
  try {
    const { cache, lastCacheUpdate } = retrieveCache();
    res.status(200).json({
      success: true,
      lastCacheUpdate,
      data: cache,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is listening on ${PORT}...`);
});
