import mongoose from "mongoose";

const password = "shemin123";
const uri = `mongodb+srv://shemin:${password}@cluster0.z2ssz2l.mongodb.net/?retryWrites=true&w=majority`;

async function test() {
    try {
        console.log("Testing with password: shemin123");
        await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
        console.log("✅ SUCCESS!");
        process.exit(0);
    } catch (err) {
        console.log("❌ FAILED:", err.message);
        process.exit(1);
    }
}

test();
