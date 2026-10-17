import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const JWT_SECRET = process.env.JWT_SECRET || "bookleaf_super_secret_jwt_key_2026";

export function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

export function hashPassword(plainPassword) {
  return bcrypt.hashSync(plainPassword, 10);
}

export function comparePassword(plainPassword, hashedPassword) {
  if (!hashedPassword) return false;
  return bcrypt.compareSync(plainPassword, hashedPassword);
}

export function extractAuthUser(req) {
  try {
    const authHeader = req.headers.get("authorization");
    let token = null;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7);
    } else {
      const cookieHeader = req.headers.get("cookie");
      if (cookieHeader) {
        const cookies = Object.fromEntries(
          cookieHeader.split("; ").map((c) => {
            const [k, ...v] = c.split("=");
            return [k, decodeURIComponent(v.join("="))];
          })
        );
        token = cookies.bookleaf_token;
      }
    }

    if (!token) return null;
    return verifyToken(token);
  } catch {
    return null;
  }
}
