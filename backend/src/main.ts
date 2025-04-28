import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";
import authRouter from "./routes/auth.route";
import productRouter from "./routes/product.route";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";
import { errorMiddleware } from "./libs/error-middleware";
import cookieParser from 'cookie-parser';

const swaggerDocument = require("./swagger-output.json");

dotenv.config();

const app = express();

app.use(morgan("dev"));

// CORS – only once, with credentials!
const corsOptions = {
  origin: "http://localhost:3000",
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"],
};
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// **this** must come before any handler that reads `req.cookies`
app.use(cookieParser());


app.use("/api/auth", authRouter);
app.use("/api/product", productRouter);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
  standardHeaders: "draft-8", // draft-6: `RateLimit-*` headers; draft-7 & draft-8: combined `RateLimit` header
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
  // store: ... , // Redis, Memcached, etc. See below.
});

app.use(limiter);

app.use(
  "/api-docs", // 設定查看api文件的路徑
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocument)
);

app.use(errorMiddleware)

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
  console.log(
    `Swagger API Documentation at http://localhost:${process.env.PORT}/api-docs`
  );
});
