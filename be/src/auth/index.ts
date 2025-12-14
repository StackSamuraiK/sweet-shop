import express, { type Request, type Response } from "express"
import { SigninSchema, SignupSchema } from "../types.js";
import { prisma } from "../db.js";
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"


export const authRouter = express.Router();

//@ts-ignore
authRouter.post('/register', async (req: Request, res: Response) => {
    const result = SignupSchema.safeParse(req.body);
    try {
        if (!result.success) {
            return res.status(403).json({
                msg: "Wrong input creds"
            })
        }
        const hashedPassword = await bcrypt.hash(result.data.password, 10)
        const existingUser = await prisma.user.findFirst(
            {
                where: {
                    email: req.body.email
                }
            })

        if (existingUser) {
            return res.status(401).json({
                msg: "User already exist please login"
            })
        }

        const newUser = await prisma.user.create({
            data: {
                email: result.data.email,
                password: hashedPassword,
                role: result.data.role
            }
        })
        const token = jwt.sign({ userId: newUser.id , role: newUser.role}, process.env.JWT_SECRET || "")

        return res.status(200).json({
            msg: "User created successfully",
            user: newUser,
            token:token
        })
    } catch (error) {
        console.log(result.error)
    }
});

//@ts-ignore
authRouter.post('/login', async (req: Request, res: Response) => {
    const result = SigninSchema.safeParse(req.body);
    try {
        if (!result.success) {
            return res.status(403).json({
                msg: "Wrong input creds"
            })
        }

        const existingUser = await prisma.user.findFirst({
            where: {
                email: result.data.email
            }
        })

        if (!existingUser) {
            return res.status(401).json({
                msg: "User does not exist please register"
            })
        }

        const token = jwt.sign({userId: existingUser.id},process.env.JWT_SECRET || "")

        return res.status(201).json({
            msg:"Logged in",
            token: token,
            user: existingUser
        })
    } catch (error) {
        console.log(result.error)
    }
});