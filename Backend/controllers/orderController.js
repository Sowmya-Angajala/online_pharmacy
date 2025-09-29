// controllers/orderController.js
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Medicine = require('../models/Medicine');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
// controllers/orderController.js - Updated createOrder function
const createOrder = async (req, res) => {
  try {
    const { shippingAddress, paymentMethod, cartItems } = req.body;

    // If cartItems are provided in request, use them. Otherwise, get from database
    let orderItems = [];
    let subtotal = 0;

    if (cartItems && cartItems.length > 0) {
      // Use cartItems from frontend
      for (const cartItem of cartItems) {
        const medicine = await Medicine.findById(cartItem.medicineId);
        
        if (!medicine) {
          return res.status(404).json({
            success: false,
            message: `Medicine not found: ${cartItem.medicineId}`
          });
        }

        if (medicine.stock < cartItem.quantity) {
          return res.status(400).json({
            success: false,
            message: `Insufficient stock for ${medicine.name}`
          });
        }

        const price = medicine.discountPrice && medicine.discountPrice < medicine.price ? 
                     medicine.discountPrice : medicine.price;
        const total = price * cartItem.quantity;

        orderItems.push({
          medicine: medicine._id,
          name: medicine.name,
          quantity: cartItem.quantity,
          price: price,
          total: total
        });

        subtotal += total;

        // Reduce stock
        medicine.stock -= cartItem.quantity;
        await medicine.save();
      }
    } else {
      // Fallback: Get user's cart from database
      const cart = await Cart.findOne({ user: req.user.id })
        .populate('items.medicine', 'name price discountPrice stock');

      if (!cart || cart.items.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Cart is empty'
        });
      }

      for (const item of cart.items) {
        const medicine = item.medicine;
        
        if (medicine.stock < item.quantity) {
          return res.status(400).json({
            success: false,
            message: `Insufficient stock for ${medicine.name}`
          });
        }

        const price = medicine.discountPrice && medicine.discountPrice < medicine.price ? 
                     medicine.discountPrice : medicine.price;
        const total = price * item.quantity;

        orderItems.push({
          medicine: medicine._id,
          name: medicine.name,
          quantity: item.quantity,
          price: price,
          total: total
        });

        subtotal += total;
        medicine.stock -= item.quantity;
        await medicine.save();
      }

      // Clear cart only if we used database cart
      await Cart.findOneAndUpdate(
        { user: req.user.id },
        { $set: { items: [], totalAmount: 0, totalItems: 0 } }
      );
    }

    // Calculate totals
    const shippingFee = subtotal > 500 ? 0 : 40;
    const tax = subtotal * 0.05;
    const totalAmount = subtotal + shippingFee + tax;

    // Create order
    const order = await Order.create({
      user: req.user.id,
      items: orderItems,
      shippingAddress,
      paymentMethod,
      subtotal,
      shippingFee,
      tax,
      totalAmount,
      orderStatus: 'pending'
    });

    await order.populate('user', 'name email');

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: order
    });
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating order',
      error: error.message
    });
  }
};

// @desc    Get user's orders
// @route   GET /api/orders
// @access  Private
const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .populate('user', 'name email');

    res.json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching orders',
      error: error.message
    });
  }
};

// @desc    Get all orders (Admin)
// @route   GET /api/orders/all
// @access  Private/Admin
const getAllOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    const filter = {};
    if (status && status !== 'all') {
      filter.orderStatus = status;
    }

    const orders = await Order.find(filter)
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Order.countDocuments(filter);

    res.json({
      success: true,
      count: orders.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: orders
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching orders',
      error: error.message
    });
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:orderId
// @access  Private
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId)
      .populate('user', 'name email phone')
      .populate('items.medicine', 'name images');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if user owns the order or is admin
    if (order.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching order',
      error: error.message
    });
  }
};

// @desc    Update order status (Admin)
// @route   PUT /api/orders/:orderId
// @access  Private/Admin
const updateOrderStatus = async (req, res) => {
  try {
    const { orderStatus, trackingNumber } = req.body;

    const validStatuses = ['pending', 'confirmed', 'packed', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(orderStatus)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order status'
      });
    }

    const order = await Order.findById(req.params.orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    order.orderStatus = orderStatus;
    if (trackingNumber) order.trackingNumber = trackingNumber;
    
    if (orderStatus === 'delivered') {
      order.deliveryDate = new Date();
    }

    await order.save();
    await order.populate('user', 'name email phone');

    res.json({
      success: true,
      message: 'Order status updated successfully',
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating order status',
      error: error.message
    });
  }
};

// @desc    Cancel order
// @route   PATCH /api/orders/:orderId
// @access  Private
const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if user owns the order
    if (order.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Only allow cancellation for pending orders
    if (order.orderStatus !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Order cannot be cancelled at this stage'
      });
    }

    order.orderStatus = 'cancelled';
    await order.save();

    // Restore stock
    for (const item of order.items) {
      await Medicine.findByIdAndUpdate(
        item.medicine,
        { $inc: { stock: item.quantity } }
      );
    }

    res.json({
      success: true,
      message: 'Order cancelled successfully',
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error cancelling order',
      error: error.message
    });
  }
};

module.exports = {
  createOrder,
  getUserOrders,
  getOrderById,
  updateOrderStatus,
  getAllOrders,
  cancelOrder
};