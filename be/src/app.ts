import "dotenv/config"
import express from "express"
import cors from "cors"
import { authRouter } from "./auth/index.js";
import { sweetRouter } from "./sweets/index.js";
import { shopRouter } from "./shop/index.js";
import { type Response, type Request } from "express";

const app = express();

app.use(express.json());
app.use(cors());
app.use('/api/auth', authRouter);
app.use('/api/shop', shopRouter);
app.use('/api/sweet', sweetRouter);

// Health
// @ts-ignore
app.get('/health', (req: Request, res: Response) => {
  res.send("Everything's good go ahead");
});

export default app;
