import mongoose from "mongoose";
import Order from "../models/Order.js";

export const createOrder = async (req, res) => {
  try {
    const { userId, items, total, name, email, address, payment, phone } = req.body;

    if (!name || !email || !address || !phone || !items || items.length === 0) {
      return res.status(400).json({ message: "Shipping details, email, and items are required" });
    }

    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({ message: "Phone number must be exactly 10 digits" });
    }

    const mappedItems = items.map(item => ({
      product: (item._id || item.id) && mongoose.Types.ObjectId.isValid(item._id || item.id) ? (item._id || item.id) : null,
      team: item.team || item.name || "Unknown Item",
      price: Number(item.price) || 0,
      quantity: Number(item.quantity) || 1,
      size: item.size || "N/A",
      image: item.image
    }));

    const validTotal = Number(total) || mappedItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    const order = new Order({
      user: (req.user && req.user.id) ? req.user.id : (userId && mongoose.Types.ObjectId.isValid(userId) ? userId : null),
      items: mappedItems,
      total: validTotal,
      name,
      email,
      address,
      phone,
      paymentMethod: payment || req.body.paymentMethod || "COD",
      status: "Pending" // Match model enum
    });

    const savedOrder = await order.save();
    res.status(201).json(savedOrder);
  } catch (error) {
    console.error("Create Order Error:", error);
    res.status(400).json({ message: error.message });
  }
};

export const getUserOrders = async (req, res) => {
  try {
    const userId = req.user ? req.user.id : req.query.userId;
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Valid UserId is required" });
    }

    // --- Search, Filter, Sort Logic ---
    const { search, status, sort } = req.query;
    let query = { user: userId };

    // Filter by Status
    if (status && status !== "All") {
      query.status = status;
    }

    // Search Logic
    if (search) {
      const searchRegex = new RegExp(search, "i");
      query.$or = [
        { "items.team": searchRegex },
        { "items.name": searchRegex },
        { status: searchRegex }
      ];

      if (mongoose.Types.ObjectId.isValid(search)) {
        query.$or.push({ _id: search });
      }
    }

    // Sort Logic
    let sortOptions = { createdAt: -1 };
    if (sort === "oldest") sortOptions = { createdAt: 1 };
    else if (sort === "price_high") sortOptions = { total: -1 };
    else if (sort === "price_low") sortOptions = { total: 1 };

    const orders = await Order.find(query)
      .populate("items.product")
      .sort(sortOptions);

    res.json(orders);
  } catch (error) {
    console.error("Get User Orders Error:", error);
    res.status(500).json({ message: error.message });
  }
};

export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({}).populate("user", "name email");
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export const updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (order) {
      res.json(order);
    } else {
      res.status(404).json({ message: "Order not found" });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}
export const cancelOrder = async (req, res) => {
  try {
    const { reason } = req.body;

    if (!reason || reason.trim() === "") {
      return res.status(400).json({
        message: "Cancellation reason is required",
      });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    // Ensure user cancels only their own order
    const userId = req.user.id || req.user._id;
    if (!order.user || order.user.toString() !== userId.toString()) {
      return res.status(403).json({
        message: "Not authorized to cancel this order",
      });
    }

    if (order.status === "Delivered") {
      return res.status(400).json({
        message: "Delivered order cannot be cancelled",
      });
    }

    if (order.status === "Cancelled" || order.status === "Cancellation Requested") {
      return res.status(400).json({
        message: "Order already cancelled or cancellation requested",
      });
    }

    // Use findByIdAndUpdate to avoid validation errors on legacy missing fields (like email)
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          status: "Cancellation Requested",
          cancelReason: reason,
          cancelledAt: Date.now()
        }
      },
      { new: true }
    );

    res.json({
      message: "Order cancelled successfully",
      order: updatedOrder,
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

