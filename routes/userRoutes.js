const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Adjust path based on your structure
require('dotenv').config();
const router = express.Router();
const jwtSecret = process.env.JWT_SECRET;

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Register a new user
 *     description: Create a new user account with hashed password storage.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               Name:
 *                 type: string
 *                 example: John Doe
 *               Email:
 *                 type: string
 *                 format: email
 *                 example: john.doe@example.com
 *               Password:
 *                 type: string
 *                 format: password
 *                 example: "Password@123"
 *               Address:
 *                 type: string
 *                 example: "123 Main St, Anytown, USA"
 *               ProfilePicture:
 *                 type: string
 *                 example: "https://example.com/profile.jpg"
 *     responses:
 *       "201":
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       "400":
 *         description: Bad request
 */

/**
 * @swagger
 * /api/users/by-ids:
 *   post:
 *     summary: Get users by IDs
 *     description: Fetch users by an array of user IDs.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               ids:
 *                 type: array
 *                 items:
 *                   type: string
 *                   example: ["605c72ef1532072b88d3db5a", "605c72ef1532072b88d3db5b"]
 *     responses:
 *       "200":
 *         description: List of users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       "400":
 *         description: Invalid IDs array
 */

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users
 *     description: Fetch all users from the database.
 *     responses:
 *       "200":
 *         description: List of users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       "500":
 *         description: Server error
 */

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get user by ID
 *     description: Fetch a user by their unique ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The user ID
 *     responses:
 *       "200":
 *         description: User found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       "404":
 *         description: User not found
 *       "500":
 *         description: Server error
 */

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Update user details
 *     description: Update the details of an existing user.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The user ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               Name:
 *                 type: string
 *                 example: John Doe Updated
 *               Email:
 *                 type: string
 *                 format: email
 *                 example: john.doe.updated@example.com
 *               Address:
 *                 type: string
 *                 example: "456 New St, Anytown, USA"
 *               ProfilePicture:
 *                 type: string
 *                 example: "https://example.com/new-profile.jpg"
 *               IsActive:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       "200":
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       "404":
 *         description: User not found
 *       "400":
 *         description: Invalid input
 */

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Delete a user
 *     description: Delete an existing user by their unique ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The user ID
 *     responses:
 *       "200":
 *         description: User deleted successfully
 *       "404":
 *         description: User not found
 *       "500":
 *         description: Server error
 */

/**
 * @swagger
 * /api/users/login:
 *   post:
 *     summary: User login
 *     description: Authenticate a user and return a JWT token.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               Email:
 *                 type: string
 *                 format: email
 *                 example: john.doe@example.com
 *               Password:
 *                 type: string
 *                 format: password
 *                 example: "Password@123"
 *     responses:
 *       "200":
 *         description: Login successful, returns JWT token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   example: "JWT_Token_Here"
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       "400":
 *         description: Invalid credentials
 */

/**
 * @swagger
 * /api/users/password-reset-request:
 *   post:
 *     summary: Password reset request
 *     description: Generate a password reset token and send it to the user.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               Email:
 *                 type: string
 *                 format: email
 *                 example: john.doe@example.com
 *     responses:
 *       "200":
 *         description: Password reset token generated
 *       "404":
 *         description: User not found
 */

/**
 * @swagger
 * /api/users/password-reset:
 *   post:
 *     summary: Reset user password
 *     description: Reset the user's password using the reset token.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               ResetToken:
 *                 type: string
 *                 example: "Reset_Token_Here"
 *               NewPassword:
 *                 type: string
 *                 format: password
 *                 example: "NewPassword@123"
 *     responses:
 *       "200":
 *         description: Password reset successfully
 *       "400":
 *         description: Invalid or expired reset token
 */

/**
 * @swagger
 * /api/users/password-change:
 *   post:
 *     summary: Change user password
 *     description: Change the user's password using old and new passwords.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 example: "605c72ef1532072b88d3db5a"
 *               oldPassword:
 *                 type: string
 *                 format: password
 *                 example: "OldPassword@123"
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 example: "NewPassword@123"
 *     responses:
 *       "200":
 *         description: Password changed successfully
 *       "400":
 *         description: Incorrect old password or invalid input
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: "605c72ef1532072b88d3db5a"
 *         Name:
 *           type: string
 *           example: John Doe
 *         Email:
 *           type: string
 *           format: email
 *           example: john.doe@example.com
 *         PasswordHash:
 *           type: string
 *           example: "$2b$10$S7S4A/fk9mft1z9c.0WpcA7vTcWgHg5DxptHaF0bm49O.QpOrGTxG"
 *         Address:
 *           type: string
 *           example: "123 Main St, Anytown, USA"
 *         ProfilePicture:
 *           type: string
 *           example: "https://example.com/profile.jpg"
 *         IsActive:
 *           type: boolean
 *           example: true
 */


// Middleware to authenticate token
const authenticateToken = (req, res, next) => {
  // Extract the token from the Authorization header (in the format 'Bearer <token>')
  const token = req.header('Authorization')?.replace('Bearer ', '');

  // If no token is provided, return a 401 error
  if (!token) {
    return res.status(401).json({ error: 'Authorization token is required' });
  }

  try {
    // Verify the token and decode it
    const decoded = jwt.verify(token, jwtSecret);

    // Attach the decoded user information (userId) to the request object
    req.userId = decoded.userId;

    // Proceed to the next middleware or route handler
    next();
  } catch (error) {
    // If the token is invalid or expired, return a 401 error
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

// Create a new user
router.post('/', async (req, res) => {
  try {
    const { Name, Email, Password, Address, ProfilePicture } = req.body;

     // Validate email and password
    if (!Email || !Password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

     // Check if the user already exists
    const existingUser = await User.findOne({ Email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(Password, 10);

    const newUser = new User({
      Name,
      Email,
      PasswordHash: passwordHash,
      Address,
      ProfilePicture,
    });

    const savedUser = await newUser.save();
    res.status(201).json(savedUser);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});


  // Route to get books by IDs
  router.post('/by-ids',authenticateToken, async (req, res) => {
    try {
        const { ids } = req.body; // Expecting { ids: [id1, id2, ...] }
        if (!ids || !Array.isArray(ids)) {
            return res.status(400).json({ message: 'Invalid IDs array' });
        }

        const users = await User.find({ _id: { $in: ids } }).sort({ createdAt: -1 });
        res.status(200).json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
  });

// Get all users
router.get('/',authenticateToken, async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get a specific user by ID
router.get('/:id',authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update a user's details
router.put('/:id',authenticateToken, async (req, res) => {
  try {
    const { Name, Email, Address, ProfilePicture, IsActive } = req.body;

    // Update user information
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { Name, Email, Address, ProfilePicture, IsActive },
      { new: true, runValidators: true } // Ensure validators run during update
    );

    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete a user
router.delete('/:id',authenticateToken, async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// User login (for authentication)
router.post('/login', async (req, res) => {
  try {
    const { Email, Password } = req.body;

    // Find the user by email
    const user = await User.findOne({ Email });
    if (!user) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    // Check if the password is correct
    const isPasswordValid = await bcrypt.compare(Password, user.PasswordHash);
    if (!isPasswordValid) {
      return res.status(400).json({ error: 'Invalid Cred' });
    }

    // Create a JWT token
    const token = jwt.sign({ userId: user._id }, jwtSecret, { expiresIn: '1h' });

    res.status(200).json({ token, user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Password reset request (generate reset token)
router.post('/password-reset-request',authenticateToken, async (req, res) => {
  try {
    const { Email } = req.body;

    const user = await User.findOne({ Email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Generate reset token (for simplicity, just using a random string)
    const resetToken = jwt.sign({ userId: user._id }, jwtSecret, { expiresIn: '1h' });

    user.ResetToken = resetToken;
    await user.save();

    // Send reset token via email (in a real app, you'd send this to the user via email)
    res.status(200).json({ message: 'Password reset token generated', resetToken });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Password reset (set new password)
router.post('/password-reset',authenticateToken, async (req, res) => {
  try {
    const { ResetToken, NewPassword } = req.body;

    // Verify the reset token
    const decoded = jwt.verify(ResetToken, jwtSecret);
    const user = await User.findById(decoded.userId);
    if (!user || user.ResetToken !== ResetToken) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    // Hash the new password
    const passwordHash = await bcrypt.hash(NewPassword, 10);
    user.PasswordHash = passwordHash;
    user.ResetToken = null; // Clear the reset token

    await user.save();
    res.status(200).json({ message: 'Password reset successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Password reset (set new password)
router.post('/password-change',authenticateToken, async (req, res) => {
  try {
    
    const { userId,oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: 'Old and new passwords are required' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Step 2: Compare the old password with the stored hashed password
    const isMatch = await bcrypt.compare(oldPassword, user.PasswordHash);
    if (!isMatch) {
      return res.status(400).json({ message: 'Old password is incorrect' });
    }

    // Verify the reset token
    //const decoded = jwt.verify(ResetToken, 'your_jwt_secret');
    //const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({ error: 'There is some error' });
    }

    // Hash the new password
    const passwordHash = await bcrypt.hash(newPassword, 10);
    user.PasswordHash = passwordHash;
    await user.save();
    res.status(200).json({ message: 'Password reset successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
