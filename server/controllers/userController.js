const User = require('../models/User');
const crypto = require('crypto');
const sendEmail = require('../utils/email');

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin or Super Admin
const getUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new user (Staff/Admin)
// @route   POST /api/users
// @access  Private/Admin or Super Admin
const createUser = async (req, res) => {
  try {
    const { name, email, password, role, permissions, phone, profileImage, department, designation, status } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Use provided password or generate a random temporary password
    const isManualPassword = !!password;
    const finalPassword = password || crypto.randomBytes(4).toString('hex').toUpperCase();

    const user = await User.create({
      name,
      email,
      password: finalPassword,
      role: role || 'STAFF',
      permissions: permissions || {},
      phone: phone || '',
      profileImage: profileImage || '',
      department: department || '',
      designation: designation || '',
      status: status || 'Active',
      mustChangePassword: !isManualPassword, // Require password change on first login only if auto-generated
    });

    if (user) {
      // Send email invitation with credentials
      try {
        await sendEmail({
          email: user.email,
          subject: 'Welcome to Gabha Studio CRM - Your Invitation',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
              <h2 style="color: #d97706; text-align: center;">Welcome to Gabha Studio CRM</h2>
              <p>Hello <strong>${user.name}</strong>,</p>
              <p>An account has been created for you on the Gabha Studio CRM Panel. Below are your login credentials:</p>
              <table style="width: 100%; margin: 20px 0; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Email:</td>
                  <td style="padding: 8px; border: 1px solid #ddd;">${user.email}</td>
                </tr>
                <tr>
                  <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Password:</td>
                  <td style="padding: 8px; border: 1px solid #ddd; font-family: monospace; font-size: 16px; color: #b45309;">${finalPassword}</td>
                </tr>
              </table>
              <p style="background-color: #fef3c7; color: #92400e; padding: 10px; border-radius: 5px;">
                <strong>Important:</strong> Please log in and review your account details.
              </p>
              <p style="text-align: center; margin-top: 30px;">
                <a href="https://gabha-studio-04-05-2026.onrender.com/login" style="background-color: #d97706; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Log In to CRM</a>
              </p>
              <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;" />
              <p style="font-size: 12px; color: #777; text-align: center;">This is an automated message. Please do not reply directly to this email.</p>
            </div>
          `,
          message: `Hello ${user.name},\n\nAn account has been created for you on the Gabha Studio CRM. Here are your credentials:\n\nEmail: ${user.email}\nPassword: ${finalPassword}\n\nLog in here: https://gabha-studio-04-05-2026.onrender.com/login`
        });
      } catch (emailError) {
        console.error('Failed to send invitation email:', emailError);
      }

      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        employeeId: user.employeeId,
        department: user.department,
        designation: user.designation,
        status: user.status,
        permissions: user.permissions,
        mustChangePassword: user.mustChangePassword,
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin or Super Admin
const updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.role = req.body.role || user.role;
    user.permissions = req.body.permissions || user.permissions;
    user.phone = req.body.phone !== undefined ? req.body.phone : user.phone;
    user.profileImage = req.body.profileImage !== undefined ? req.body.profileImage : user.profileImage;
    user.department = req.body.department !== undefined ? req.body.department : user.department;
    user.designation = req.body.designation !== undefined ? req.body.designation : user.designation;
    user.status = req.body.status !== undefined ? req.body.status : user.status;

    if (req.body.password) {
      user.password = req.body.password;
      user.mustChangePassword = false;
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      phone: updatedUser.phone,
      profileImage: updatedUser.profileImage,
      employeeId: updatedUser.employeeId,
      department: updatedUser.department,
      designation: updatedUser.designation,
      status: updatedUser.status,
      permissions: updatedUser.permissions,
      mustChangePassword: updatedUser.mustChangePassword,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Super Admin
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (user) {
      if (user.role === 'SUPER_ADMIN') {
        return res.status(400).json({ message: 'Cannot delete SUPER_ADMIN' });
      }
      await user.deleteOne();
      res.json({ message: 'User removed' });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getUsers, createUser, updateUser, deleteUser };
