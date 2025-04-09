import cors from "cors";
import express from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

import { connectToMongoDB } from "./mongo.js";
import { list, getHtml } from "./routes.js";

const port = process.env.PORT || 8088;
const app = express();

// Calculate Traffic Impact on Your Bandwidth (ADVICE)
// bandwidth usage for different request limits.
// Example:
// Each request to your server involves transmitting data.
// Let’s assume each request is about 10KB in size (which is reasonable for a simple API response or static page).
// If you set a limit of 500 requests per hour:
// 500 requests/hour × 10KB/request = 5,000KB (5MB) per hour.
// In a 24-hour period, that would be 120MB/day.
// Over a 30-day month, you would consume 3.6GB of bandwidth.
// free tier is 100GB/month, therefore 500 requests per hour should be PLENTY
const limiter = rateLimit({
  windowMs: 60 * 60 * 250, // 15 minutes
  max: 250, // Limit each IP to 1000 requests per hour (250 per 15 minutes)
  message: (req, res) => {
    const retryAfter = Math.ceil((req.rateLimit.resetTime - Date.now()) / 1000);
    return {
      error: `Too many requests. Try again in ${retryAfter} seconds.`,
      statusCode: 429,
    };
  },
  headers: true,
});

app.use(limiter);
app.use(cors({ origin: ["*"] }));
app.use(express.json());
app.use(helmet());

app.get("/api/list", list);
app.post("/api/get-html", getHtml);

async function startServer() {
  try {
    await connectToMongoDB();
    app.listen(port, () => console.log(`Server listening on ${port}`));
  } catch (error) {
    console.error("Server failed to start: ", error);
  }
}

startServer();
