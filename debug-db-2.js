import mongoose from "mongoose";

const uris = [
    "mongodb+srv://shemin:shemin@123@cluster0.z2ssz2l.mongodb.net/",
    "mongodb+srv://shemin:shemin%40123@cluster0.z2ssz2l.mongodb.net/",
    "mongodb+srv://shemin:shemin123@cluster0.z2ssz2l.mongodb.net/"
];

async function test() {
    for (const uri of uris) {
        try {
            console.log("Testing:", uri.replace(/:.+@/, ":****@"));
            await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
            console.log("✅ SUCCESS!");
            process.exit(0);
        } catch (err) {
            console.log("❌ FAILED:", err.message);
        }
    }
}

test();
