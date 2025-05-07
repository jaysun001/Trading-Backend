const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      // Connection pool size
      maxPoolSize: 10,
      // Keep trying to send operations for this many milliseconds
      serverSelectionTimeoutMS: 5000,
      // Control how long the connection can be idle before being closed
      socketTimeoutMS: 45000,
      // Log connected state
      family: 4, // Use IPv4, skip trying IPv6
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Handle connection events
    mongoose.connection.on("connected", () => {
      console.log("Mongoose connected to DB");
    });

    mongoose.connection.on("error", (err) => {
      console.error(`Mongoose connection error: ${err}`);
    });

    mongoose.connection.on("disconnected", () => {
      console.log("Mongoose disconnected");
    });

    // Handle process termination and cleanup
    process.on("SIGINT", async () => {
      await mongoose.connection.close();
      console.log("Mongoose disconnected through app termination");
      process.exit(0);
    });

    return conn;
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    // Retry logic can be implemented here
    process.exit(1);
  }
};

module.exports = connectDB;



