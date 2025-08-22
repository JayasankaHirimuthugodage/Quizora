import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from '../config/db.js'; // adjust if file path differs

dotenv.config();

const runTest = async () => {
  try {
    await connectDB();

    // Define a test schema and model
    const sampleSchema = new mongoose.Schema({
      name: String,
      email: String,
      createdAt: {
        type: Date,
        default: Date.now,
      },
    });

    const Sample = mongoose.model('Sample', sampleSchema);

    // Insert sample data
    const testData = [
      { name: 'Alice Johnson', email: 'alice@example.com' },
      { name: 'Bob Smith', email: 'bob@example.com' },
      { name: 'Charlie Brown', email: 'charlie@example.com' },
    ];

    const result = await Sample.insertMany(testData);
    console.log('✅ Sample documents inserted:');
    console.log(result);

    // Fetch and log inserted data
    const allData = await Sample.find();
    console.log('🔍 All documents in "samples" collection:');
    console.log(allData);

    // ⚠️ Data is NOT deleted so you can verify in MongoDB Compass/Atlas
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    mongoose.connection.close(() => {
      console.log('🔌 Mongoose connection closed');
    });
  }
};

runTest();
