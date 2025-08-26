import mongoose from 'mongoose';

const mongooseConnection = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log(`✅ Mongoose connected to ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ Mongoose connection error:', error.message);
    process.exit(1); // Exit process with failure
  }
};

export default mongooseConnection;
