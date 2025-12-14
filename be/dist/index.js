import express from 'express';
import cors from 'cors';
import "dotenv/config";
import { authRouter } from "./auth/index.js";
import { shopRouter } from "./shop/index.js";
import { sweetRouter } from "./sweets/index.js";
const port = process.env.BACKEND_PORT || 3000;
const app = express();
app.use(express.json());
app.use(cors());
app.use('/api/auth', authRouter);
app.use('/api/shop', shopRouter);
app.use('/api/sweet', sweetRouter);
app.listen(port, () => {
    console.log(`Your app is listening on ${port}`);
});
//# sourceMappingURL=index.js.map