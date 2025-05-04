import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";
import productRouter from "./routes/product.route";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";
import { errorMiddleware } from "./libs/error-middleware";
import cookieParser from "cookie-parser";
import authRouter from "./routes/auth";

const swaggerDocument = require("./swagger-output.json");


// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(morgan("dev"));

// CORS 設定：從 .env 調整 origin
const corsOptions = {
  origin: process.env.CORS_ORIGIN?.split(",") || ["http://localhost:3000"],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"],
};
app.use(cors(corsOptions));
app.options("*", cors(corsOptions)); // 預先檢查請求（CORS preflight）

// JSON, URL encoded parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cookies parser
app.use(cookieParser());

// API Routes
app.use("/api/auth", authRouter);
app.use("/api/product/seller", productRouter);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: "draft-8",
  legacyHeaders: false,
});
app.use(limiter);

// Swagger
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Error handler
app.use(errorMiddleware);

// Start server
const PORT = process.env.PORT || 8080;
app.listen(Number(PORT), "0.0.0.0", () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`📄 Swagger docs available at /api-docs`);
  console.log(`🌐 Allowed CORS Origins: ${process.env.CORS_ORIGIN}`);
});
