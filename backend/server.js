import express from "express";
import dotenv from "dotenv";
import { formatAircraft } from "./services/opensky.services.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

const app = express();

app.use(express.json());

app.get("/api/aircraft", async (req, res) => {
  try {
    const aircraft = await formatAircraft();
    res
      .status(200)
      .json({ success: true, lastUpadated: new Date(), data: aircraft });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is listening on ${PORT}...`);
});
