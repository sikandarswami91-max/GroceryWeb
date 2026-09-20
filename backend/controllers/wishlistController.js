import Wishlist from '../models/Wishlist.js';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';

// @desc    Get user's wishlist
// @route   GET /api/wishlist
// @access  Private
export const getWishlist = async (req, res) => {
  try {
    let wishlist = await Wishlist.findOne({ user: req.user._id }).populate({
      path: 'products',
      select: 'name slug price originalPrice images stock rating numReviews category isActive',
      populate: { path: 'category', select: 'name slug' },
    });

    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user._id, products: [] });
    }

    res.json({
      success: true,
      wishlist,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching wishlist',
    });
  }
};

// @desc    Add product to wishlist
// @route   POST /api/wishlist/add/:productId
// @access  Private
export const addToWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    let wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist) {
      wishlist = new Wishlist({ user: req.user._id, products: [] });
    }

    if (!wishlist.products.includes(productId)) {
      wishlist.products.push(productId);
      await wishlist.save();
    }

    const updated = await Wishlist.findOne({ user: req.user._id }).populate({
      path: 'products',
      select: 'name slug price originalPrice images stock rating numReviews category isActive',
    });

    res.json({
      success: true,
      message: 'Product added to wishlist',
      wishlist: updated,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error adding to wishlist',
    });
  }
};

// @desc    Remove product from wishlist
// @route   DELETE /api/wishlist/remove/:productId
// @access  Private
export const removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    let wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist) {
      return res.status(404).json({
        success: false,
        message: 'Wishlist not found',
      });
    }

    wishlist.products = wishlist.products.filter(
      (id) => id.toString() !== productId
    );

    await wishlist.save();

    const updated = await Wishlist.findOne({ user: req.user._id }).populate({
      path: 'products',
      select: 'name slug price originalPrice images stock rating numReviews category isActive',
    });

    res.json({
      success: true,
      message: 'Product removed from wishlist',
      wishlist: updated,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error removing from wishlist',
    });
  }
};

// @desc    Move product from wishlist to cart
// @route   POST /api/wishlist/move-to-cart/:productId
// @access  Private
export const moveToCart = async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Product not available',
      });
    }

    if (product.stock < 1) {
      return res.status(400).json({
        success: false,
        message: 'Product is out of stock',
      });
    }

    // Add to cart
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
    }

    const existingIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (existingIndex > -1) {
      cart.items[existingIndex].quantity += 1;
      cart.items[existingIndex].price = product.price;
    } else {
      cart.items.push({
        product: productId,
        quantity: 1,
        price: product.price,
      });
    }

    await cart.save();

    // Remove from wishlist
    let wishlist = await Wishlist.findOne({ user: req.user._id });
    if (wishlist) {
      wishlist.products = wishlist.products.filter(
        (id) => id.toString() !== productId
      );
      await wishlist.save();
    }

    res.json({
      success: true,
      message: 'Moved to cart successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error moving item to cart',
    });
  }
};
