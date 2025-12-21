import 'dotenv/config';
import express from "express";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import routes from "./routes/index.js";
import { notFoundHandler, errorHandler } from "./middlewares/errorHandlers.js";
import { initClerk } from "./middlewares/auth.js";
import { defaultLimiter } from "./middlewares/rateLimiter.js";
import { validateEnv } from "./utils/validateEnv.js";

// Validate environment variables on startup
validateEnv();

const app = express();
const PORT = process.env.PORT || 4000;
// Health check root - moved to top to ensure availability even if config is incomplete
app.get("/", (req, res) => {
  res.send({ status: "ok", message: "Bhadwa rand server is running" });
});

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));


// Rate limiting
// app.use(defaultLimiter);
app.set("trust proxy", 1);

// Clerk authentication (populates req.auth)
// Wrap initClerk to skip if keys are missing
app.use((req, res, next) => {
  const isDev = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;
  if (isDev && (!process.env.CLERK_PUBLISHABLE_KEY || !process.env.CLERK_SECRET_KEY)) {
    if (req.method !== 'OPTIONS') {
      const missing = [];
      if (!process.env.CLERK_PUBLISHABLE_KEY) missing.push('CLERK_PUBLISHABLE_KEY');
      if (!process.env.CLERK_SECRET_KEY) missing.push('CLERK_SECRET_KEY');
      console.warn(`⚠️ Clerk keys missing (${missing.join(', ')}) - bypassing authentication middleware`);
    }
    return next();
  }
  return initClerk(req, res, next);
});

// Routes
app.use("/api", routes);

// 404 and error handlers
app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`HiringBull server running on port ${PORT}`);
});
