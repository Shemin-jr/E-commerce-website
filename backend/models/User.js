import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        role: { type: String, enum: ["user", "admin"], default: "user" },
        blocked: { type: Boolean, default: false },
        cart: [
            {
                productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
                quantity: { type: Number, default: 1 },
                size: { type: String },
                sizes: [String],
                // Store full details for snapshot if needed, or rely on populate
                team: String,
                price: Number,
                image: String,
                category: String
            }
        ],
        wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
    },
    { timestamps: true }
);

const User = mongoose.model("User", userSchema); 
export default User;
