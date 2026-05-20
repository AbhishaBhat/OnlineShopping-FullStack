const User = require('../models/userModel');

// Get user profile
exports.getUserProfile = async (req, res) => {
    try {
        const userId = req.user.id; // Assuming user ID is stored in req.user
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

// Update user profile
exports.updateUserProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const updatedData = req.body; // Assuming the updated data is sent in the request body
        const updatedUser = await User.updateById(userId, updatedData);
        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({ message: 'User updated successfully', updatedUser });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

// Get user order history
exports.getUserOrderHistory = async (req, res) => {
    try {
        const userId = req.user.id;
        const orders = await User.getOrderHistory(userId);
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

module.exports.me = (req, res) => {
  if (!req.user) return res.status(401).json({ ok: false, message: 'Unauthorized' });
  // return minimal safe fields
  const { user_id, full_name, email, phone, address, role, status, last_login, created_at } = req.user;
  return res.json({ ok: true, user: { user_id, full_name, email, phone, address, role, status, last_login, created_at } });
};

module.exports.updateAddress = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ ok: false, message: 'Unauthorized' });

    const address = String(req.body.address || '').trim();
    if (!address) {
      return res.status(400).json({ ok: false, message: 'Address is required.' });
    }

    await User.update(req.user.user_id, {
      full_name: req.user.full_name,
      email: req.user.email,
      phone: req.user.phone,
      address
    });

    return res.json({ ok: true, message: 'Address updated.', address });
  } catch (error) {
    console.error('updateAddress error:', error);
    return res.status(500).json({ ok: false, message: 'Server error while updating address.' });
  }
};
