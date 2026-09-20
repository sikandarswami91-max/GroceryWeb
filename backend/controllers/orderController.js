import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import Address from '../models/Address.js';

// @desc    Create new Cash on Delivery order
// @route   POST /api/orders
// @access  Private
export const createOrder = async (req, res) => {
  try {
    const { addressId, shippingAddress: customAddress, paymentMethod = 'COD' } = req.body;

    if (paymentMethod !== 'COD') {
      return res.status(400).json({
        success: false,
        message: 'Currently only Cash on Delivery (COD) is supported.',
      });
    }

    // Resolve shipping address
    let finalAddress;
    if (addressId) {
      const dbAddress = await Address.findOne({
        _id: addressId,
        user: req.user._id,
      });
      if (!dbAddress) {
        return res.status(400).json({
          success: false,
          message: 'Selected shipping address not found',
        });
      }
      finalAddress = {
        fullName: dbAddress.fullName,
        phone: dbAddress.phone,
        addressLine: dbAddress.addressLine,
        street: dbAddress.addressLine,
        city: dbAddress.city,
        state: dbAddress.state,
        pincode: dbAddress.pincode,
        postalCode: dbAddress.pincode,
        country: dbAddress.country,
        landmark: dbAddress.landmark,
      };
    } else if (customAddress && customAddress.fullName && (customAddress.addressLine || customAddress.street)) {
      const line = customAddress.addressLine || customAddress.street;
      const pin = customAddress.pincode || customAddress.postalCode;
      finalAddress = {
        fullName: customAddress.fullName,
        phone: customAddress.phone,
        addressLine: line,
        street: line,
        city: customAddress.city,
        state: customAddress.state,
        pincode: pin,
        postalCode: pin,
        country: customAddress.country || 'India',
        landmark: customAddress.landmark || '',
      };

    } else {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid shipping address',
      });
    }

    // Fetch user's cart from MongoDB
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Your cart is empty',
      });
    }

    // Authoritative Backend Validation: Check real-time prices and stock in Product collection
    const orderItems = [];
    let itemsPrice = 0;

    for (const item of cart.items) {
      const product = await Product.findById(item.product);
      if (!product || !product.isActive) {
        return res.status(400).json({
          success: false,
          message: `Item in your cart is no longer available`,
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for "${product.name}". Available: ${product.stock}, in cart: ${item.quantity}`,
        });
      }

      const verifiedPrice = product.price;
      const lineTotal = verifiedPrice * item.quantity;
      itemsPrice += lineTotal;

      orderItems.push({
        product: product._id,
        name: product.name,
        quantity: item.quantity,
        price: verifiedPrice,
        image: product.images && product.images.length > 0 ? product.images[0].url : '',
      });
    }

    // Delivery charge rule: Free delivery above 499, else 40
    const shippingPrice = itemsPrice >= 499 ? 0 : 40;
    const totalAmount = itemsPrice + shippingPrice;

    // Generate unique Order Number: MB-{YEAR}-{RANDOM}
    const orderNumber = `MB-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

    // Create the order document
    const order = new Order({
      user: req.user._id,
      orderNumber,
      items: orderItems,
      shippingAddress: finalAddress,
      paymentMethod: 'COD',
      paymentStatus: 'pending',
      orderStatus: 'Pending',
      itemsPrice,
      shippingPrice,
      totalAmount,
      statusHistory: [
        {
          status: 'Pending',
          comment: 'Order placed successfully with Cash on Delivery',
          changedAt: new Date(),
        },
      ],
    });

    const savedOrder = await order.save();

    // Deduct stock for each purchased product
    for (const item of orderItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity },
      });
    }

    // Clear user's cart in MongoDB
    cart.items = [];
    await cart.save();

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      order: savedOrder,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error creating order',
    });
  }
};

// @desc    Get logged in user's orders
// @route   GET /api/orders/my-orders
// @access  Private
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({
      createdAt: -1,
    });

    res.json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching your orders',
    });
  }
};

// @desc    Get single order by ID
// @route   GET /api/orders/:id
// @access  Private (Owner or Admin)
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email phone')
      .populate('items.product', 'slug category');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    // Ensure only the user who placed it or an admin can view it
    if (
      order.user._id.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this order',
      });
    }

    res.json({
      success: true,
      order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching order details',
    });
  }
};

// @desc    Cancel order (Customer can cancel if Pending or Confirmed)
// @route   PUT /api/orders/:id/cancel
// @access  Private
export const cancelOrder = async (req, res) => {
  try {
    const { reason } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    // Check authorization
    if (
      order.user.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this order',
      });
    }

    // Eligible statuses for cancellation
    if (['Shipped', 'Out for Delivery', 'Delivered'].includes(order.orderStatus)) {
      return res.status(400).json({
        success: false,
        message: `Order cannot be cancelled because it is already ${order.orderStatus.toLowerCase()}`,
      });
    }

    if (order.orderStatus === 'Cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Order is already cancelled',
      });
    }

    order.orderStatus = 'Cancelled';
    order.cancelledReason = reason || 'Cancelled by customer';
    order.statusHistory.push({
      status: 'Cancelled',
      comment: reason || 'Cancelled by customer',
      changedAt: new Date(),
    });

    await order.save();

    // Restore product stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.quantity },
      });
    }

    res.json({
      success: true,
      message: 'Order has been cancelled and inventory restored',
      order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error cancelling order',
    });
  }
};
