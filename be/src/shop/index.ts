import express from "express"
import type { Request, Response} from "express"
import { SweetShopSignIn, SweetShopSignUp } from "../types.js";
import { prisma } from "../db.js";
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"

export const shopRouter = express.Router();

shopRouter.post('/register', async(req:Request, res:Response)=>{
    const result = SweetShopSignUp.safeParse(req.body)
    try {
        if(!result.success){
            res.status(403).json({
                msg:"Wrong input creds"
            })
        }

        if(result.data == undefined) return
        const existingShop = await prisma.shop.findFirst({
            where:{
                email:result.data.email
            }
        })

        if(existingShop){
            res.status(401).json({
                msg:"The shop is already registered please login"
            })
        }

        const hashedPassword = await bcrypt.hash(result.data.password, 10)
        const newShop = await prisma.shop.create({
            data:{
                name: result.data?.name || "",
                password: hashedPassword,
                role: result.data.role,
                email: result.data.email
            }
        })

        const token = jwt.sign({shopId:newShop.id , role:newShop.role}, process.env.JWT_SECRET || "")

        return res.status(200).json({
            msg:"Shop registered successfully",
            shop: newShop,
            token: token
        })
    } catch (error) {
        return res.json({
            error:result.error
        })
    }
})

//@ts-ignore
shopRouter.post('/login', async(req:Request, res:Response)=>{
    const result = SweetShopSignIn.safeParse(req.body)
    try {
        if(!result.success){
            return res.status(403).json({
                msg:"Wrong input creds"
            })
        }
        const existingShop = await prisma.shop.findFirst({
            where:{
                email:req.body.email
            }
        })
        if(!existingShop){
            res.status(403).json({
                msg:"The shop is not registered please register"
            })
        }
        if(existingShop?.id == null) return res.send("shop id is null")
        const token = jwt.sign({shopId:existingShop.id}, process.env.JWT_SECRET || "")

        return res.status(201).json({
            msg:"Logged In",
            shop: existingShop,
            token: token
        })
    } catch (error) {
        return result.error
    }
})