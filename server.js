import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import { routes } from "./routes/index.js";
import cors from "cors";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(express.json());
app.use(morgan("dev"));
app.use(cors());
routes(app);
app.listen(PORT, () => {
  console.log("Server is listening on port", PORT);
});
