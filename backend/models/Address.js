import mongoose from 'mongoose';

const addressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    fullName: {
      type: String,
      required: [true, 'Please provide full name'],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Please provide phone number'],
      trim: true,
    },
    addressLine: {
      type: String,
      required: [true, 'Please provide address line / house details'],
      trim: true,
    },
    city: {
      type: String,
      required: [true, 'Please provide city'],
      trim: true,
    },
    state: {
      type: String,
      required: [true, 'Please provide state'],
      trim: true,
    },
    pincode: {
      type: String,
      required: [true, 'Please provide postal/pin code'],
      trim: true,
    },
    country: {
      type: String,
      required: true,
      default: 'India',
      trim: true,
    },
    landmark: {
      type: String,
      trim: true,
      default: '',
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

addressSchema.virtual('street').get(function () {
  return this.addressLine;
}).set(function (v) {
  this.addressLine = v;
});

addressSchema.virtual('postalCode').get(function () {
  return this.pincode;
}).set(function (v) {
  this.pincode = v;
});

export default mongoose.model('Address', addressSchema);

