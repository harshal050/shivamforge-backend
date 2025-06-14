// const redis = require('redis');

// const redisClient = redis.createClient({
//   url: "rediss://default:Ab--AAIjcDE3NWUzMDU1MDk4NGY0MmQ3YWRmYTkwYjkxOTcyNzUyOHAxMA@dashing-hen-49086.upstash.io:6379"
// });

// redisClient.on('error', (err) => {
//   console.error('Redis Client Error:', err);
// });

// async function sendToQueue() {
//   try {
//     await redisClient.connect();
//     await redisClient.lPush("contractDetails", "hello");
//     console.log("Pushed to Redis queue!");
//     await redisClient.quit(); // optional: disconnect cleanly
//   } catch (e) {
//     console.error("Connection failed:", e);
//   }
// }

// sendToQueue();
