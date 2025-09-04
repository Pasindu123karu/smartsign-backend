import { VercelRequest, VercelResponse } from "@vercel/node";
import Cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Initialize CORS
const cors = Cors({
  methods: ["POST", "OPTIONS"],
  origin: "https://smartsign-frontend.vercel.app",
});

// Helper to run middleware
function runMiddleware(req: VercelRequest, res: VercelResponse, fn: Function) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) return reject(result);
      return resolve(result);
    });
  });
}

// In-memory "database" example (replace with your DB)
const users: any[] = [];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  await runMiddleware(req, res, cors);

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { email, password } = req.body;

    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    return res.status(200).json({ message: "Login successful", user, token: user.token });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
}
