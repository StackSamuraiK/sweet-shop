import jwt from "jsonwebtoken";
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
        //@ts-ignore
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "");
    }
    catch (error) {
    }
};
//# sourceMappingURL=middleware.js.map