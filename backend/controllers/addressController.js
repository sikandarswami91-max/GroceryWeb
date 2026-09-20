import Address from '../models/Address.js';

// @desc    Get all addresses for logged in user
// @route   GET /api/addresses
// @access  Private
export const getAddresses = async (req, res) => {
  try {
    const addresses = await Address.find({ user: req.user._id }).sort({
      isDefault: -1,
      createdAt: -1,
    });

    res.json({
      success: true,
      count: addresses.length,
      addresses,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching addresses',
    });
  }
};

// @desc    Add new address
// @route   POST /api/addresses
// @access  Private
export const addAddress = async (req, res) => {
  try {
    const {
      fullName,
      phone,
      addressLine,
      street,
      city,
      state,
      pincode,
      postalCode,
      country,
      landmark,
      isDefault,
    } = req.body;

    const finalAddressLine = (addressLine || street || '').trim();
    const finalPincode = (pincode || postalCode || '').trim();

    if (!fullName || !phone || !finalAddressLine || !city || !state || !finalPincode) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required address fields',
      });
    }

    // If this is the first address or marked default, unset existing defaults
    const addressCount = await Address.countDocuments({ user: req.user._id });
    let shouldBeDefault = Boolean(isDefault) || addressCount === 0;

    if (shouldBeDefault) {
      await Address.updateMany(
        { user: req.user._id },
        { $set: { isDefault: false } }
      );
    }

    const address = await Address.create({
      user: req.user._id,
      fullName: fullName.trim(),
      phone: phone.trim(),
      addressLine: finalAddressLine,
      city: city.trim(),
      state: state.trim(),
      pincode: finalPincode,
      country: country || 'India',
      landmark: landmark || '',
      isDefault: shouldBeDefault,
    });


    res.status(201).json({
      success: true,
      message: 'Address added successfully',
      address,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error adding address',
    });
  }
};

// @desc    Update address
// @route   PUT /api/addresses/:id
// @access  Private
export const updateAddress = async (req, res) => {
  try {
    const address = await Address.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!address) {
      return res.status(404).json({
        success: false,
        message: 'Address not found',
      });
    }

    if (req.body.isDefault) {
      await Address.updateMany(
        { user: req.user._id },
        { $set: { isDefault: false } }
      );
      address.isDefault = true;
    }

    if (req.body.fullName) address.fullName = req.body.fullName.trim();
    if (req.body.phone) address.phone = req.body.phone.trim();
    if (req.body.addressLine) address.addressLine = req.body.addressLine.trim();
    if (req.body.city) address.city = req.body.city.trim();
    if (req.body.state) address.state = req.body.state.trim();
    if (req.body.pincode) address.pincode = req.body.pincode.trim();
    if (req.body.country) address.country = req.body.country.trim();
    if (req.body.landmark !== undefined) address.landmark = req.body.landmark.trim();

    await address.save();

    res.json({
      success: true,
      message: 'Address updated successfully',
      address,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating address',
    });
  }
};

// @desc    Set address as default
// @route   PUT /api/addresses/:id/default
// @access  Private
export const setDefaultAddress = async (req, res) => {
  try {
    const address = await Address.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!address) {
      return res.status(404).json({
        success: false,
        message: 'Address not found',
      });
    }

    await Address.updateMany(
      { user: req.user._id },
      { $set: { isDefault: false } }
    );

    address.isDefault = true;
    await address.save();

    res.json({
      success: true,
      message: 'Address set as default',
      address,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error setting default address',
    });
  }
};

// @desc    Delete address
// @route   DELETE /api/addresses/:id
// @access  Private
export const deleteAddress = async (req, res) => {
  try {
    const address = await Address.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!address) {
      return res.status(404).json({
        success: false,
        message: 'Address not found',
      });
    }

    const wasDefault = address.isDefault;
    await Address.findByIdAndDelete(address._id);

    // If deleted address was default, make the most recent remaining address default
    if (wasDefault) {
      const remaining = await Address.findOne({ user: req.user._id }).sort({
        createdAt: -1,
      });
      if (remaining) {
        remaining.isDefault = true;
        await remaining.save();
      }
    }

    res.json({
      success: true,
      message: 'Address deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error deleting address',
    });
  }
};
