import express from "express";
import {
    addOffer,
    removeOffer,
    getUserOffers,
    getAllUsersWithOffers,
} from "../controllers/offerController.js";
import protect from "../middleware/authmiddleware.js";
import admin from "../middleware/adminMiddleware.js";

const router = express.Router();

// Admin-only routes
router.get("/", protect, admin, getAllUsersWithOffers);
router.get("/:userId", protect, admin, getUserOffers);
router.post("/:userId", protect, admin, addOffer);
router.delete("/:userId/:offerId", protect, admin, removeOffer);

export default router;
