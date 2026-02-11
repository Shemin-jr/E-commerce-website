import mongoose from "mongoose";

const uris = [
    "mongodb+srv://shemin-jr:shemin%40123@cluster0.z2ssz2l.mongodb.net/?retryWrites=true&w=majority",
    "mongodb+srv://shemin-jr:shemin123@cluster0.z2ssz2l.mongodb.net/?retryWrites=true&w=majority",
    "mongodb+srv://admin:admin123@cluster0.z2ssz2l.mongodb.net/?retryWrites=true&w=majority"
];

async function test() {
    for (const uri of uris) {
        try {
            console.log("Testing:", uri.replace(/:.+@/, ":****@"));
            await mongoose.connect(uri, { serverSelectionTimeoutMS: 3000 });
            console.log("✅ SUCCESS with:", uri.replace(/:.+@/, ":****@"));
            process.exit(0);
        } catch (err) {
            console.log("❌ FAILED:", err.message);
        }
    }
    process.exit(1);
}

test();
