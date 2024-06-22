require('dotenv').config();
const mongoose = require('mongoose');
const { MONGODB_URL } = process.env;

let cached = { conn: null, promise: null };

const connect = async () => {
  if (cached.conn) return cached.conn;

  if (!MONGODB_URL) {
    throw new Error("MONGODB_URL environment variable is not defined.");
  }

  cached.promise =
    cached.promise ||
    mongoose.connect(MONGODB_URL, {
      dbName: "Nutrixa",
      bufferCommands: false,
      connectTimeoutMS: 30000,
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then((mongoose) => {
      console.log("Connected to MongoDB successfully!");
      return mongoose;
    })
    .catch((error) => {
      console.error("Failed to connect to MongoDB", error);
      throw error;
    });

  cached.conn = await cached.promise;

  return cached.conn;
};

module.exports = { connect };


// async function testConnection() {
//   try {
//     const db = await connect();
//     if (db) {
//       console.log("Connected to MongoDB successfully!");
//       // Optionally perform further operations here
//       // Example: Query a collection or insert a document
//     } else {
//       console.error("Failed to connect to MongoDB.");
//     }
//   } catch (error) {
//     console.error("Error connecting to MongoDB:", error);
//   } finally {
//     // Ensure to disconnect after testing (optional)
//     await mongoose.disconnect();
//     console.log("Disconnected from MongoDB.");
//   }
// }

// // Call the test function
// testConnection();



