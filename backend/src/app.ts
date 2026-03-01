import express from 'express';
import dotenv from "dotenv";
// @ts-ignore
import cors from 'cors';
import authRouter from './routes/auth.route.js';
// import storageRoutes  from "./routes/s3.routes.js"
import fileRoutes from "./routes/file.route.js"
import folderRoutes from "./routes/folder.route.js";
import nodeRoutes from "./routes/node.route.js";
import recentRoutes from "./routes/recent.route.js"

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRouter);
app.use("/api/files", fileRoutes);
app.use("/api/folders", folderRoutes);
app.use("/api/nodes", nodeRoutes);
app.use("/api/recent-files",recentRoutes)


// app.use("/api/storage",storageRoutes);

export default app;