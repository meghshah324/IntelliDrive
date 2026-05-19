import express from 'express';
import dotenv from "dotenv";
// @ts-ignore
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRouter from './routes/auth.route.js';
import fileRoutes from "./routes/file.route.js"
import folderRoutes from "./routes/folder.route.js";
import nodeRoutes from "./routes/node.route.js";
import recentRoutes from "./routes/recent.route.js"
import starRoutes from "./routes/star.route.js";
import trashRoutes from "./routes/trash.route.js";

dotenv.config();

const app = express();

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  }),
);
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRouter);
app.use("/api/files", fileRoutes);
app.use("/api/folders", folderRoutes);
app.use("/api/nodes", nodeRoutes);
app.use("/api/recent-files",recentRoutes)
app.use("/api/stars", starRoutes);
app.use("/api/trash", trashRoutes);

export default app;