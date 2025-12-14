import jwt, {} from "jsonwebtoken";
//@ts-ignore
export const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(500).json({
            msg: "Auth header is either missing or incorrect"
        });
    }
    const token = authHeader?.split(' ')[1];
    if (!token)
        return res.json({ msg: "Token is missing" });
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "");
        if (decoded.userId)
            req.userId = decoded.userId;
        if (decoded.shopId)
            req.shopId = decoded.shopId;
    }
    catch (error) {
        return res.status(401).json({ msg: "Invalid token" });
    }
    next();
};
//# sourceMappingURL=middleware.js.map