import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const uri = process.env.mongo_url;

async function testConnection() {
    try {
        console.log("Checking connection with URI provided in .env...");
        await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
        console.log("✅ Connection Successful!");
        process.exit(0);
    } catch (err) {
        console.log("❌ Connection Failed!");
        console.log("Error Message:", err.message);
        console.log("\n--- TROUBLESHOOTING ---");
        console.log("1. Go to MongoDB Atlas -> Security -> Database Access");
        console.log("2. Ensure a user named 'shemin' exists.");
        console.log("3. Click 'Edit' and reset the password to 'shemin123'.");
        console.log("4. Update your .env file to use this new password.");
        console.log("5. Ensure Network Access (IP Whitelist) allows your current IP.");
        process.exit(1);
    }
}

testConnection();
