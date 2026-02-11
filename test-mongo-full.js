import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const testConn = async () => {
    const uri = process.env.mongo_url || process.env.MONGO_URI;
    console.log('Attempting to connect to:', uri.replace(/:.+@/, ':****@'));
    try {
        await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
        console.log('✅ Connection Successful');
        process.exit(0);
    } catch (err) {
        console.error('❌ Connection Failed:', err.message);
        process.exit(1);
    }
};

testConn();
