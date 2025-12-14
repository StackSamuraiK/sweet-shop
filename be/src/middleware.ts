
import type { NextFunction, Response, Request } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken"
interface AuthPayLoad extends JwtPayload {
    userId?: number,
    shopId?: number
}
//@ts-ignore
export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(500).json({
            msg: "Auth header is either missing or incorrect"
        })
    }
    const token = authHeader?.split(' ')[1]
    if (!token) return res.json({ msg: "Token is missing" })

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "") as AuthPayLoad
        if (decoded.userId) req.userId = decoded.userId;
        if (decoded.shopId) req.shopId = decoded.shopId;

    } catch (error) {
        return res.status(401).json({ msg: "Invalid token" });
    }
    next()
}