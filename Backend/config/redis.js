import { createClient } from "redis";

const redisClient = createClient({
    url: process.env.REDIS_URL,
    RESP: 2
});

redisClient.on("error", (err) => {
    console.log("Redis error:", err);
});

const connectRedis = async () => {
    await redisClient.connect();
    console.log("Redis connected successfully");
};

export { redisClient, connectRedis };