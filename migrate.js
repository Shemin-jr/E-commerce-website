import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import dotenv from "dotenv";
import Product from "./backend/models/Product.js";
import User from "./backend/models/User.js";
import bcrypt from "bcryptjs";

dotenv.config();

const __dirname = path.resolve();
const dbPath = path.join(__dirname, "frondend", "db.json");

const migrate = async () => {
    try {
        const uri = process.env.mongo_url;
        if (!uri) throw new Error("mongo_url not found in .env");

        console.log("-----------------------------------------");
        console.log(" Starting Data Migration...");
        console.log("URI:", uri.replace(/:.+@/, ":****@"));

        await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
        console.log("✅ Connected successfully!");

        if (!fs.existsSync(dbPath)) {
            throw new Error(`db.json not found at ${dbPath}`);
        }

        const data = JSON.parse(fs.readFileSync(dbPath, "utf-8"));

        console.log("📦 Cleaning and migrating products...");
        await Product.deleteMany({});
        if (data.products) {
            await Product.insertMany(data.products.map(p => ({
                team: p.team,
                price: Number(p.price) || 0,
                category: p.category,
                image: p.image,
                backImage: p.backImage,
                description: p.description,
                sizes: p.sizes || [],
                quantity: Number(p.quantity) || 0
            })));
        }

        console.log("👤 Migrating users & admins...");
        await User.deleteMany({});
        const allUsers = [];
        if (data.users) {
            for (const u of data.users) {
                const hashedPassword = await bcrypt.hash(String(u.password), 10);
                allUsers.push({
                    name: u.name,
                    email: u.email,
                    password: hashedPassword,
                    role: "user",
                    blocked: u.blocked || false
                });
            }
        }
        if (data.admins) {
            for (const a of data.admins) {
                const hashedPassword = await bcrypt.hash(String(a.password), 10);
                allUsers.push({
                    name: a.name || "Admin",
                    email: a.email,
                    password: hashedPassword,
                    role: "admin"
                });
            }
        }
        if (allUsers.length > 0) await User.insertMany(allUsers);

        console.log("🎉 Migration completed successfully!");
        process.exit(0);
    } catch (error) {
        console.error("\n❌ MIGRATION FAILED:");
        console.error("Error Name:", error.name);
        console.error("Error Message:", error.message);
        if (error.reason) console.error("Reason:", error.reason);
        process.exit(1);
    }
};

migrate();
