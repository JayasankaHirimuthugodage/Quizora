import mongoose from 'mongoose';

const connectDB = async () => {
  console.log('🔌 Connecting to MongoDB...');

  try {
    await mongoose.connect(process.env.MONGO_URI);
  } catch (error) {
    console.error(`❌ MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

mongoose.connection.on('connected', () => {
  console.log(`✅ Mongoose connected to ${mongoose.connection.host}`);
});

mongoose.connection.on('error', (err) => {
  console.error(`❌ Mongoose connection error: ${err.message}`);
});

mongoose.connection.on('disconnected', () => {
  console.log('⚠️ Mongoose disconnected');
});

export default connectDB;
