import { connect } from "node:http2";
import app from "./app.js";
import { connectRedis } from "./config/redis.js";


const PORT = process.env.PORT || 5000;

await connectRedis()

app.listen(PORT, () => {
     console.log(`server is running on port ${PORT}`);
})