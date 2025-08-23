// Test script to debug JWT token
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

// This is the token from the browser console (truncated for security)
const testToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY2YzhlOWZhM2YzZTY4OTcyODA1Yjk2MSIsInVzZXJuYW1lIjoiYWRtaW4iLCJlbWFpbCI6ImFkbWluQHF1aXpvcmEuY29tIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzI0NDA4NDI3LCJleHAiOjE3MjUwMTMyMjd9.TB7Ntk";

try {
    const decoded = jwt.verify(testToken, process.env.JWT_SECRET);
    console.log('Token is valid:', decoded);
} catch (error) {
    console.log('Token verification failed:', error.message);
    
    // Try to decode without verification to see the content
    try {
        const decoded = jwt.decode(testToken);
        console.log('Token content (unverified):', decoded);
    } catch (decodeError) {
        console.log('Token decode failed:', decodeError.message);
    }
}

console.log('JWT_SECRET:', process.env.JWT_SECRET);
