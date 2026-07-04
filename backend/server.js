import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./config/db.js";
import routes from "./routes/index.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: "5mb" }));

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/ecommerce";

connectDB(MONGO_URI);

app.get("/", (req, res) => res.send({ status: "ok" }));
app.use("/api", routes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: err.message });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
