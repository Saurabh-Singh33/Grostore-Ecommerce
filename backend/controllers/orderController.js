import Order from "../models/Order.js";
import Product from "../models/Product.js";

const restockItem = async (item) => {
  if (!item?.productId || !item?.quantity) return;
  await Product.findByIdAndUpdate(item.productId, { $inc: { stock: Number(item.quantity) || 0 } });
};

export const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({}).populate("user", "name email");
    res.json({ data: orders, success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getOrdersByUser = async (req, res) => {
  try {
    const userId = req.params.userId;
    if (req.user?.role !== "admin" && String(req.user?._id) !== String(userId)) {
      return res.status(403).json({ message: "Not authorized to view these orders" });
    }

    const orders = await Order.find({ user: userId }).sort({ createdAt: -1 });
    res.json({ data: orders, success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const createOrder = async (req, res) => {
  try {
    const data = req.body;
    const rawItems = Array.isArray(data.items) ? data.items : [];
    if (rawItems.length === 0) {
      return res.status(400).json({ message: "Order must include at least one product" });
    }

    const normalizedItems = rawItems.map((item) => ({
      ...item,
      status: item.status || "active",
    }));

    const decrementedItems = [];
    for (const item of normalizedItems) {
      const quantity = Number(item.quantity) || 0;
      if (!item.productId || quantity <= 0) {
        throw new Error("Invalid order item data");
      }

      const updatedProduct = await Product.findOneAndUpdate(
        { _id: item.productId, stock: { $gte: quantity } },
        { $inc: { stock: -quantity } },
        { new: true }
      );

      if (!updatedProduct) {
        for (const previousItem of decrementedItems) {
          await restockItem(previousItem);
        }
        return res.status(400).json({ message: `Insufficient stock for ${item.name || "a product"}` });
      }

      decrementedItems.push(item);
    }

    const orderCount = await Order.countDocuments();
    const orderId = `ORD-${String(orderCount + 1).padStart(3, "0")}`;

    let order;
    try {
      order = await Order.create({
        ...data,
        id: orderId,
        items: normalizedItems,
        user: req.user?._id,
        status: data.status || "pending",
        createdAt: data.createdAt || new Date(),
      });
    } catch (creationError) {
      for (const previousItem of decrementedItems) {
        await restockItem(previousItem);
      }
      throw creationError;
    }

    res.status(201).json({ data: order, success: true });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }

    const order = await Order.findOne({ id }).populate("user", "name email");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (status === "cancelled" && order.status !== "cancelled") {
      const activeItems = order.items.filter((item) => (item.status || "active") !== "cancelled");
      for (const item of activeItems) {
        await restockItem(item);
        item.status = "cancelled";
        item.cancelledAt = new Date();
      }
      order.total = 0;
    }

    order.status = status;
    if (status === "delivered") {
      order.deliveredAt = new Date();
    }
    await order.save();

    res.json({ data: order, success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const cancelOwnOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findOne({ id });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (String(order.user) !== String(req.user?._id) && req.user?.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to cancel this order" });
    }

    if (!["pending", "processing"].includes(order.status)) {
      return res.status(400).json({ message: "Only pending or processing orders can be cancelled" });
    }

    const activeItems = order.items.filter((item) => (item.status || "active") !== "cancelled");
    for (const item of activeItems) {
      await restockItem(item);
      item.status = "cancelled";
      item.cancelledAt = new Date();
    }

    order.status = "cancelled";
    order.total = 0;
    await order.save();

    res.json({ data: order, success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const cancelOwnOrderItem = async (req, res) => {
  try {
    const { id, itemIndex } = req.params;
    const index = Number.parseInt(itemIndex, 10);
    if (!Number.isInteger(index) || index < 0) {
      return res.status(400).json({ message: "Invalid item index" });
    }

    const order = await Order.findOne({ id });
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (String(order.user) !== String(req.user?._id) && req.user?.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to cancel this order item" });
    }

    if (!["pending", "processing"].includes(order.status)) {
      return res.status(400).json({ message: "Items can be cancelled only when order is pending or processing" });
    }

    if (!order.items[index]) {
      return res.status(404).json({ message: "Order item not found" });
    }

    if ((order.items[index].status || "active") === "cancelled") {
      return res.status(400).json({ message: "This product is already cancelled" });
    }

    await restockItem(order.items[index]);
    order.items[index].status = "cancelled";
    order.items[index].cancelledAt = new Date();

    const activeItems = order.items.filter((item) => (item.status || "active") !== "cancelled");
    const updatedTotal = activeItems.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 0), 0);
    order.total = Number(updatedTotal.toFixed(2));

    if (activeItems.length === 0) {
      order.status = "cancelled";
    }

    await order.save();
    res.json({ data: order, success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
