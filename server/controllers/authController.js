const User = require("../models/User");
const bcrypt = require("bcryptjs");
const sendEmail = require("../config/email");
const jwt = require("jsonwebtoken");


exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();

    // Send welcome email (HTML)
    const loginUrl = process.env.FRONTEND_URL ? `${process.env.FRONTEND_URL}/auth/login` : 'http://localhost:5173/auth/login';
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin:auto; padding:20px; background:#f9f9f9; border-radius:10px; text-align:center;">
        <h2 style="color:#4B0082;">Welcome, ${name}!</h2>
        <p style="color:#333; font-size:16px;">Your student account has been successfully created at ICEM.</p>
        <p style="color:#333; font-size:16px;">Login now to explore events and activities.</p>
        <a href="${loginUrl}" 
           style="display:inline-block; margin-top:20px; background: linear-gradient(90deg,#4B0082,#8A2BE2); color:white; padding:12px 25px; border-radius:8px; text-decoration:none; font-weight:bold;">
          Go to Login
        </a>
        <p style="color:#666; font-size:12px; margin-top:20px;">If you have questions, contact <a href="mailto:support@icem.edu">support@icem.edu</a></p>
      </div>
    `;
    await sendEmail(email, 'Welcome to ICEM Events!', htmlContent, true);

    res.status(201).json({ message: 'User registered successfully', user: newUser });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Login user
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "Invalid email or password" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid email or password" });

    // issue JWT for protected routes
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        role: user.role,
        email: user.email,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Promote student to club/admin
exports.promoteUser = async (req, res) => {
  try {
    const { userId, newRole } = req.body;

    const allowedRoles = ["student", "clubMember", "admin"];
    if (!allowedRoles.includes(newRole))
      return res.status(400).json({ message: "Invalid role" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.role = newRole;
    await user.save();

  // Send promotion email (HTML)
  const dashboardUrl = process.env.FRONTEND_URL ? `${process.env.FRONTEND_URL}/${newRole === 'student' ? 'student' : 'admin'}/dashboard` : 'http://localhost:5173/admin/dashboard';
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin:auto; padding:20px; background:#f9f9f9; border-radius:10px; text-align:center;">
      <h2 style="color:#4B0082;">Congratulations, ${user.name}!</h2>
      <p style="color:#333; font-size:16px;">You have been promoted to <strong>${newRole}</strong> by Admin at ICEM.</p>
      <p style="color:#333; font-size:16px;">Explore your new privileges in the community.</p>
      <a href="${dashboardUrl}" 
         style="display:inline-block; margin-top:20px; background: linear-gradient(90deg,#4B0082,#8A2BE2); color:white; padding:12px 25px; border-radius:8px; text-decoration:none; font-weight:bold;">
        Go to Dashboard
      </a>
      <p style="color:#666; font-size:12px; margin-top:20px;">If you have questions, contact <a href="mailto:support@icem.edu">support@icem.edu</a></p>
    </div>
  `;
  await sendEmail(user.email, `You are now a ${newRole}!`, htmlContent, true);

  res.status(200).json({ message: `User promoted to ${newRole}`, user });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Send custom email (admin)
exports.sendCustomEmail = async (req, res) => {
  try {
    const { to, subject, content, isHtml } = req.body;

    if (!to || !subject || !content) {
      return res.status(400).json({ message: 'to, subject and content are required' });
    }

    await sendEmail(to, subject, content, Boolean(isHtml));
    res.status(200).json({ message: 'Email sent' });
  } catch (error) {
    console.error('Send email error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
