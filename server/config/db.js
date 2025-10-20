const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error('MONGO_URI environment variable is not set. Please add it to your .env');
    process.exit(1);
  }

  const opts = {
    // modern connection options
    useNewUrlParser: true,
    useUnifiedTopology: true,
    // reduce time waiting on server selection failures during dev
    serverSelectionTimeoutMS: 5000,
  };

  try {
    await mongoose.connect(uri, opts);
    console.log('MongoDB Connected');
  } catch (err) {
    console.error('MongoDB connection error:', err && err.message ? err.message : err);
    if (err && err.name === 'MongoServerSelectionError') {
      console.error('MongoServerSelectionError: could not connect to any servers.');
      console.error('Common causes:');
      console.error('- MONGO_URI is missing or malformed (check SRV vs standard connection string)');
      console.error('- Network/DNS issues (can you resolve the hostname from this machine?)');
      console.error('- MongoDB server is not running or is blocked by firewall');
      console.error('Try connecting with the MongoDB shell or a GUI (mongosh, Compass) to verify the URI.');
    }
    process.exit(1);
  }
};

module.exports = connectDB;
