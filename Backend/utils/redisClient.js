const Redis = require("ioredis");
const zlib = require("zlib"); // Importing zlib for compression
require("dotenv").config();

// Ensure UPSTASH_REDIS_URL is set in your environment variables
if (!process.env.UPSTASH_REDIS_URL) {
  console.error("❌ UPSTASH_REDIS_URL not set in environment variables.");
  process.exit(1); // Exit if Redis URL is not available
}

const client = new Redis(process.env.UPSTASH_REDIS_URL, {
  // Additional options to make Redis connection more reliable
  connectTimeout: 10000, // Set connection timeout (in ms)
  retryStrategy: (times) => {
    if (times >= 10) {
      return undefined; // Stop retrying after 10 attempts
    }
    return Math.min(times * 100, 3000); // Retry every 100ms, up to 3 seconds
  },
});

client.on("connect", () => {
  console.log("✅ Redis connected (Upstash)");
});

client.on("error", (err) => {
  console.error("❌ Redis error:", err);
});

// Periodic health check (Optional, but a good practice)
setInterval(async () => {
  try {
    await client.ping();
    console.log("✅ Redis health check passed");
  } catch (err) {
    console.error("❌ Redis health check failed:", err);
  }
}, 60000); // Check Redis health every minute

/**
 * Compress data before storing it in Redis.
 * @param {any} data - The data you want to compress.
 * @returns {Promise<Buffer>} - The compressed data.
 */
const compressData = async (data) => {
  return new Promise((resolve, reject) => {
    if (!data) {
      return reject("❌ Cannot compress empty data");
    }

    zlib.gzip(JSON.stringify(data), (err, buffer) => {
      if (err) {
        console.error("❌ Error compressing data:", err);
        reject(err);
      }
      resolve(buffer);
    });
  });
};

/**
 * Decompress data after fetching it from Redis.
 * @param {Buffer} data - The compressed data from Redis.
 * @returns {Promise<any>} - The decompressed data.
 */
const decompressData = async (data) => {
  return new Promise((resolve, reject) => {
    if (!data) {
      return reject("❌ No data found in Redis for this key.");
    }

    zlib.gunzip(data, (err, buffer) => {
      if (err) {
        console.error("❌ Error decompressing data:", err);
        return reject("❌ Error decompressing data.");
      }

      try {
        const parsedData = JSON.parse(buffer.toString());
        resolve(parsedData);
      } catch (parseError) {
        console.error("❌ Error parsing decompressed data:", parseError);
        reject("❌ Error parsing decompressed data.");
      }
    });
  });
};

/**
 * Cache data with a specific key after compression.
 * @param {string} cacheKey - Unique key to store the data in Redis.
 * @param {any} data - The data you want to cache.
 * @param {number} expirationTime - Expiration time for the cache (in seconds).
 */
const setCache = async (cacheKey, data, expirationTime = 3600) => {
  try {
    if (!cacheKey || !data) {
      console.error("❌ Cache key or data is missing. Cannot cache data.");
      return;
    }
    const compressedData = await compressData(data); // Compress data before storing
    await client.setex(cacheKey, expirationTime, compressedData.toString('base64'));

    console.log(`✅ Cached data with key: ${cacheKey}`);
  } catch (err) {
    console.error("❌ Error caching data:", err);
  }
};

/**
 * Get cached data by key and decompress it.
 * @param {string} cacheKey - Unique key to fetch the cached data.
 * @returns {Promise<any>} - The decompressed cached data.
 */
const getCache = async (cacheKey) => {
  try {
    if (!cacheKey) {
      console.warn("❌ Cache key is missing.");
      return null;
    }

    const data = await client.get(cacheKey);

    if (!data) {
      console.warn(`❌ No data found for cache key: ${cacheKey}`);
      return null; // Return null if no data exists for this cache key
    }
    const buffer = Buffer.from(data, 'base64');

    const decompressedData = await decompressData(buffer);
    console.log(`✅ Found cached data for key: ${cacheKey}`);
    return decompressedData;
  } catch (err) {
    console.error("❌ Error getting cached data:", err);
    return null; // Return null to prevent the server from crashing
  }
};

const deleteUserListCache = async () => {
  try {
    const keys = await client.keys("users:*");
    if (keys.length > 0) {
      await client.del(...keys);
      console.log("✅ Deleted cached user list pages");
    }
  } catch (err) {
    console.error("❌ Error deleting user list cache:", err);
  }
};

/**
 * Delete cache keys matching a given pattern (e.g. blogs:*)
 * @param {string} pattern - Redis key pattern to delete
 */
const delCacheByPattern = async (pattern) => {
  try {
    const keys = await client.keys(pattern);
    if (keys.length > 0) {
      await client.del(...keys);
      console.log(`✅ Deleted Redis keys matching pattern: ${pattern}`);
    } else {
      console.log(`ℹ️ No Redis keys matched pattern: ${pattern}`);
    }
  } catch (err) {
    console.error(`❌ Error deleting Redis keys for pattern '${pattern}':`, err);
  }
};


module.exports = {
  client,
  setCache,
  getCache,
  deleteUserListCache,
  delCacheByPattern,
};
