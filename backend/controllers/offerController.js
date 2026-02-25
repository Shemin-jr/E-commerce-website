import User from "../models/User.js";

// POST /api/offers/:userId  – add an offer to a specific user
export const addOffer = async (req, res) => {
    const { title, discountPercent, expiresAt } = req.body;

    if (!title || !discountPercent) {
        return res.status(400).json({ message: "Title and discountPercent are required" });
    }

    if (discountPercent < 1 || discountPercent > 100) {
        return res.status(400).json({ message: "Discount must be between 1 and 100" });
    }

    try {
        const user = await User.findById(req.params.userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        const newOffer = {
            title,
            discountPercent,
            expiresAt: expiresAt || null,
            active: true,
        };

        user.offers.push(newOffer);
        await user.save();

        const added = user.offers[user.offers.length - 1];
        res.status(201).json({ message: "Offer added successfully", offer: added });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// DELETE /api/offers/:userId/:offerId  – remove offer from a user
export const removeOffer = async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        const offerIndex = user.offers.findIndex(
            (o) => o._id.toString() === req.params.offerId
        );

        if (offerIndex === -1) {
            return res.status(404).json({ message: "Offer not found" });
        }

        user.offers.splice(offerIndex, 1);
        await user.save();

        res.json({ message: "Offer removed successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET /api/offers/:userId  – get all offers for a specific user
export const getUserOffers = async (req, res) => {
    try {
        const user = await User.findById(req.params.userId).select("name email offers");
        if (!user) return res.status(404).json({ message: "User not found" });

        res.json({ user: { _id: user._id, name: user.name, email: user.email }, offers: user.offers });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET /api/offers  – get all users who have at least one offer (admin overview)
export const getAllUsersWithOffers = async (req, res) => {
    try {
        const users = await User.find({ "offers.0": { $exists: true } })
            .select("name email offers")
            .sort({ createdAt: -1 });

        res.json({ users });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
