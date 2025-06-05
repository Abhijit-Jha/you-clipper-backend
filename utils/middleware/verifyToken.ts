import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from "dotenv";

dotenv.config();

interface DecodedToken {
    id: string;
    name: string;
    email?: string;
    isPremium?: boolean;
    isFreeTrialUsed?: boolean;
}

// 👇 Extend Express's Request interface to include `user`
declare module 'express-serve-static-core' {
    interface Request {
        user?: DecodedToken;
    }
}

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    // console.log(authHeader)
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.status(401).json({ error: "Unauthorized: No token provided" });
        return;
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET!) as DecodedToken;
        req.user = decoded;

        next();
    } catch (err) {
        res.status(403).json({ error: "Invalid or expired token" });
    }
};
