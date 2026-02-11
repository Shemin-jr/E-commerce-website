import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const test = async () => {
    try {
        console.log("URI from env:", process.env.mongo_url);
        await mongoose.connect(process.env.mongo_url);
        console.log("Connected successfully!");
        process.exit(0);
    } catch (err) {
        console.error("Connection failed:", err.message);
        process.exit(1);
    }
};

test();
