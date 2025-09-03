import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("SmartSign Backend is running 🚀");
});

export default app; // ✅ Important: export for Vercel
