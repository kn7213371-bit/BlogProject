import express from "express";
import { pagesRouter } from "./routes/pages.routes.js";
import { authRouter } from "./routes/auth.routes.js";
import { connectDB } from "./db/index.js";
import { sessionMiddleware } from "./config/session.js";
import cookieParser from "cookie-parser";
import { postsRouter } from "./routes/posts.routes.js";

process.loadEnvFile()

const app = express();
app.use(cookieParser());
app.use(express.json());
app.use((req, res, next) => {
  console.log(new Date().toLocaleString(), req.method, req.url);
  next();
});

app.use(sessionMiddleware)
app.use("/auth",authRouter);
app.use("/api/posts",postsRouter)
app.use("/uploads", express.static("uploads"));
app.use(pagesRouter);

app.use((err, req, res, next) => {
  console.log("err", err);
  res.status(500).json({ error: "something went wrong" });
});
await connectDB();

app.listen(3000, () => {
  console.log("listening on port 3000");
});
