import Product from '../models/Product.js';
import Category from '../models/Category.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../services/cloudinaryService.js';

const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');
};

// @desc    Get products with search, filtering, sorting, and pagination
// @route   GET /api/products
// @access  Public
export const getProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    const query = {};

    // Only active products for regular requests unless admin flag is specified
    if (!req.query.admin) {
      query.isActive = true;
    }

    // Search by keyword (name, description, brand, or category)
    if (req.query.search && req.query.search.trim() !== '') {
      const searchRegex = new RegExp(req.query.search.trim(), 'i');
      const matchingCats = await Category.find({ name: searchRegex }).select('_id');
      const catIds = matchingCats.map((c) => c._id);
      query.$or = [
        { name: searchRegex },
        { description: searchRegex },
        { brand: searchRegex },
        { category: { $in: catIds } },
      ];
    }

    // Filter by category (either Category ID or slug)
    if (req.query.category && req.query.category !== 'all') {
      if (req.query.category.match(/^[0-9a-fA-F]{24}$/)) {
        query.category = req.query.category;
      } else {
        const cat = await Category.findOne({ slug: req.query.category });
        if (cat) {
          query.category = cat._id;
        }
      }
    }

    // Filter by price range
    if (req.query.minPrice || req.query.maxPrice) {
      query.price = {};
      if (req.query.minPrice) query.price.$gte = Number(req.query.minPrice);
      if (req.query.maxPrice) query.price.$lte = Number(req.query.maxPrice);
    }

    // Filter by stock
    if (req.query.inStock === 'true') {
      query.stock = { $gt: 0 };
    }

    // Filter by rating
    if (req.query.rating) {
      query.rating = { $gte: Number(req.query.rating) };
    }

    // Filter by featured
    if (req.query.featured === 'true') {
      query.isFeatured = true;
    }

    // Sorting
    let sortOptions = { createdAt: -1 }; // default newest
    if (req.query.sort) {
      switch (req.query.sort) {
        case 'price-asc':
        case 'price_asc':
          sortOptions = { price: 1 };
          break;
        case 'price-desc':
        case 'price_desc':
          sortOptions = { price: -1 };
          break;
        case 'popular':
        case 'rating':
          sortOptions = { rating: -1, numReviews: -1 };
          break;
        case 'name-asc':
        case 'name_asc':
          sortOptions = { name: 1 };
          break;
        case 'name-desc':
        case 'name_desc':
          sortOptions = { name: -1 };
          break;
        case 'oldest':
          sortOptions = { createdAt: 1 };
          break;
        case 'newest':
        default:
          sortOptions = { createdAt: -1 };
      }
    }

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .populate('category', 'name slug')
      .sort(sortOptions)
      .skip(skip)
      .limit(limit);

    res.json({
      success: true,
      count: products.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching products',
    });
  }
};

// @desc    Get featured products
// @route   GET /api/products/featured
// @access  Public
export const getFeaturedProducts = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 8;
    const products = await Product.find({ isFeatured: true, isActive: true })
      .populate('category', 'name slug')
      .limit(limit)
      .sort({ rating: -1 });

    res.json({
      success: true,
      products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching featured products',
    });
  }
};

// @desc    Get single product by ID or slug
// @route   GET /api/products/:idOrSlug
// @access  Public
export const getProductByIdOrSlug = async (req, res) => {
  try {
    const { idOrSlug } = req.params;
    let product;

    if (idOrSlug.match(/^[0-9a-fA-F]{24}$/)) {
      product = await Product.findById(idOrSlug).populate('category', 'name slug description');
    } else {
      product = await Product.findOne({ slug: idOrSlug }).populate(
        'category',
        'name slug description'
      );
    }

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    res.json({
      success: true,
      product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching product',
    });
  }
};

// @desc    Get related products in the same category
// @route   GET /api/products/:id/related
// @access  Public
export const getRelatedProducts = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    const limit = parseInt(req.query.limit) || 4;
    const related = await Product.find({
      category: product.category,
      _id: { $ne: product._id },
      isActive: true,
    })
      .populate('category', 'name slug')
      .limit(limit);

    res.json({
      success: true,
      products: related,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching related products',
    });
  }
};

// @desc    Upload multiple product images to Cloudinary
// @route   POST /api/products/upload-images
// @access  Private/Admin
export const uploadProductImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide at least one image file',
      });
    }

    const uploadPromises = req.files.map((file) =>
      uploadToCloudinary(file.buffer, 'megabasket/products')
    );

    const uploadedImages = await Promise.all(uploadPromises);

    res.json({
      success: true,
      images: uploadedImages,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error uploading images to Cloudinary',
    });
  }
};

// @desc    Create new product
// @route   POST /api/products
// @access  Private/Admin
export const createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      originalPrice,
      category,
      brand,
      images,
      stock,
      unit,
      sku,
      specifications,
      isFeatured,
      isActive,
    } = req.body;

    if (!name || !description || price === undefined || !category) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, description, price, and category',
      });
    }

    // Verify category exists
    const categoryDoc = await Category.findById(category);
    if (!categoryDoc) {
      return res.status(400).json({
        success: false,
        message: 'Specified category does not exist',
      });
    }

    let baseSlug = slugify(name);
    let slug = baseSlug;
    let counter = 1;
    while (await Product.findOne({ slug })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    const product = await Product.create({
      name: name.trim(),
      slug,
      description,
      price: Number(price),
      originalPrice: originalPrice ? Number(originalPrice) : Number(price),
      category,
      brand: brand || 'MegaBasket Fresh',
      images: images && images.length > 0 ? images : [],
      stock: stock !== undefined ? Number(stock) : 0,
      unit: unit ? unit.trim() : '1 kg',
      sku: sku || `MB-${Math.floor(100000 + Math.random() * 900000)}`,
      specifications: Array.isArray(specifications) ? specifications : [],
      isFeatured: Boolean(isFeatured),
      isActive: isActive !== undefined ? Boolean(isActive) : true,
    });

    res.status(201).json({
      success: true,
      product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error creating product',
    });
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Admin
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    if (req.body.name && req.body.name.trim() !== product.name) {
      product.name = req.body.name.trim();
      let baseSlug = slugify(req.body.name);
      let slug = baseSlug;
      let counter = 1;
      while (await Product.findOne({ slug, _id: { $ne: product._id } })) {
        slug = `${baseSlug}-${counter}`;
        counter++;
      }
      product.slug = slug;
    }

    if (req.body.description !== undefined) product.description = req.body.description;
    if (req.body.price !== undefined) product.price = Number(req.body.price);
    if (req.body.originalPrice !== undefined) product.originalPrice = Number(req.body.originalPrice);
    if (req.body.category) product.category = req.body.category;
    if (req.body.brand !== undefined) product.brand = req.body.brand;
    if (req.body.images) product.images = req.body.images;
    if (req.body.stock !== undefined) product.stock = Number(req.body.stock);
    if (req.body.unit !== undefined) product.unit = req.body.unit;
    if (req.body.sku !== undefined) product.sku = req.body.sku;
    if (req.body.specifications !== undefined) product.specifications = req.body.specifications;
    if (req.body.isFeatured !== undefined) product.isFeatured = Boolean(req.body.isFeatured);
    if (req.body.isActive !== undefined) product.isActive = Boolean(req.body.isActive);

    const updatedProduct = await product.save();

    res.json({
      success: true,
      product: updatedProduct,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating product',
    });
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Admin
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    // Attempt deleting images from Cloudinary
    if (product.images && product.images.length > 0) {
      for (const img of product.images) {
        if (img.public_id) {
          await deleteFromCloudinary(img.public_id).catch(() => {});
        }
      }
    }

    await Product.findByIdAndDelete(product._id);

    res.json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error deleting product',
    });
  }
};
