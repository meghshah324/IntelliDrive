import app from "./app.js";
import { connectRedis } from "./config/redis.js";
import "./services/worker/trashCleanup.worker.js";


const PORT = process.env.PORT || 5000;

await connectRedis();

app.listen(PORT, () => {
     console.log(`server is running on port ${PORT}`);
})