const Redis = require("ioredis");
require("dotenv").config();

const client = new Redis(process.env.UPSTASH_REDIS_URL); // ✅ Secure, direct connection

client.on("connect", () => {
  console.log("✅ Redis connected (Upstash)");
});

client.on("error", (err) => {
  console.error("❌ Redis error:", err);
});

module.exports = client;
