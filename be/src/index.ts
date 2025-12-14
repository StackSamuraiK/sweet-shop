import "dotenv/config"
import express from "express"
import cors from "cors"
import { authRouter } from "./auth/index.js";
import { sweetRouter } from "./sweets/index.js";
import {type Response, type Request} from "express"
import { shopRouter } from "./shop/index.js";

const app = express();

app.use(express.json());
app.use(cors());
app.use('/api/auth',authRouter)
app.use('/api/shop', shopRouter)
app.use('/api/sweet', sweetRouter)

//@ts-ignore
app.get('/health',(req:Request, res:Response)=>{
    res.send("Everything's good go ahead"); 
});

app.listen(process.env.BACKEND_PORT, ()=>{
    console.log(`Your app is listening on ${process.env.BACKEND_PORT}`)
})