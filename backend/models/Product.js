import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide product name'],
      trim: true,
      maxlength: [200, 'Product name cannot exceed 200 characters'],
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please provide product description'],
    },
    price: {
      type: Number,
      required: [true, 'Please provide product price'],
      min: [0, 'Price must be greater than or equal to 0'],
    },
    originalPrice: {
      type: Number,
      min: [0, 'Original price must be greater than or equal to 0'],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Please specify a category'],
    },
    brand: {
      type: String,
      trim: true,
      default: 'MegaBasket Fresh',
    },
    images: [
      {
        url: {
          type: String,
          required: true,
        },
        public_id: {
          type: String,
          default: '',
        },
      },
    ],
    stock: {
      type: Number,
      required: [true, 'Please specify product stock'],
      default: 0,
      min: [0, 'Stock cannot be negative'],
    },
    unit: {
      type: String,
      default: '1 kg',
      trim: true,
    },
    sku: {
      type: String,
      trim: true,
      default: '',
    },
    specifications: [
      {
        title: { type: String, required: true },
        value: { type: String, required: true },
      },
    ],
    rating: {
      type: Number,
      default: 0,
      min: [0, 'Rating cannot be less than 0'],
      max: [5, 'Rating cannot be more than 5'],
    },
    numReviews: {
      type: Number,
      default: 0,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual aliases for compatibility
productSchema.virtual('reviewCount').get(function () {
  return this.numReviews;
});
productSchema.virtual('featured').get(function () {
  return this.isFeatured;
});
productSchema.virtual('active').get(function () {
  return this.isActive;
});

// Text indexes for search
productSchema.index({ name: 'text', description: 'text', brand: 'text' });

export default mongoose.model('Product', productSchema);
