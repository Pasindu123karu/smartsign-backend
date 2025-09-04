import { VercelRequest, VercelResponse } from "@vercel/node";
import Cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Initialize CORS middleware
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

// In-memory "database" example (replace with your DB logic)
const users: any[] = [];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  await runMiddleware(req, res, cors);

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Please provide all fields" });
    }

    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = {
      name,
      email,
      password: hashedPassword,
      token: jwt.sign({ email }, "your-secret-key", { expiresIn: "1h" }),
    };

    users.push(newUser);

    return res.status(201).json({ message: "User created", user: newUser, token: newUser.token });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
}
