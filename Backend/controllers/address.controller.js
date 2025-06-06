const Address = require('../models/address.model');

// Add a new address
exports.addAddress = async (req, res) => {
  try {
    const {
      name,
      phoneNumber,
      addressLine1,
      addressLine2,
      city,
      state,
      postalCode,
      country,
      isDefault
    } = req.body;

    const address = await Address.create({
      user: req.user._id,
      name,
      phoneNumber,
      addressLine1,
      addressLine2,
      city,
      state,
      postalCode,
      country,
      isDefault: isDefault || false
    });

    res.status(201).json({
      success: true,
      address
    });
  } catch (error) {
    console.error('Error adding address:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get all addresses for a user
exports.getAddresses = async (req, res) => {
  try {
    const addresses = await Address.find({ user: req.user._id }).sort({ isDefault: -1, createdAt: -1 });
    res.status(200).json({
      success: true,
      addresses
    });
  } catch (error) {
    console.error('Error fetching addresses:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Update an address
exports.updateAddress = async (req, res) => {
  try {
    const address = await Address.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!address) {
      return res.status(404).json({
        success: false,
        error: 'Address not found'
      });
    }

    const updatedAddress = await Address.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      address: updatedAddress
    });
  } catch (error) {
    console.error('Error updating address:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Delete an address
exports.deleteAddress = async (req, res) => {
  try {
    const addressId = req.params.id;
    const userId = req.user._id;

    // Find the address and ensure it belongs to the user
    const address = await Address.findOne({ _id: addressId, user: userId });
    
    if (!address) {
      return res.status(404).json({ message: "Address not found" });
    }

    // Use deleteOne instead of remove
    await Address.deleteOne({ _id: addressId });

    res.status(200).json({ message: "Address deleted successfully" });
  } catch (error) {
    console.error("Error deleting address:", error);
    res.status(500).json({ message: "Error deleting address" });
  }
};

// Set default address
exports.setDefaultAddress = async (req, res) => {
  try {
    const address = await Address.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!address) {
      return res.status(404).json({
        success: false,
        error: 'Address not found'
      });
    }

    // Set all addresses to non-default
    await Address.updateMany(
      { user: req.user._id },
      { isDefault: false }
    );

    // Set the selected address as default
    address.isDefault = true;
    await address.save();

    res.status(200).json({
      success: true,
      address
    });
  } catch (error) {
    console.error('Error setting default address:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}; 