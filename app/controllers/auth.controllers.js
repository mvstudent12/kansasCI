const User = require("../models/User");
const bcrypt = require("bcryptjs");

exports.signIn = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const isValid = await user.isValidPassword(password);
    if (!isValid)
      return res.status(401).json({ message: "Invalid credentials" });

    // Save role-based session
    req.session.user = {
      _id: user._id,
      email: user.email,
      role: user.role,
    };
    console.log(req.session.user);
    // res.status(200).json({ message: "Login successful", role: user.role });
    res.render("shop/kcishop", { layout: "shop" });
  } catch (err) {
    res.status(500).json({ message: "Login error", error: err.message });
  }
};

exports.logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).json({ message: "Logout failed" });
    res.clearCookie("connect.sid");
    res.status(200).json({ message: "Logged out successfully" });
  });
};
