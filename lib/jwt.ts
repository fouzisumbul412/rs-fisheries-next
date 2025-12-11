import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET!;

// Create JWT token
export function createToken(payload: any) {
    return jwt.sign(payload, SECRET, { expiresIn: "1d" });
}

// Verify JWT token
export function verifyToken(token: string) {
    return jwt.verify(token, SECRET);
}
