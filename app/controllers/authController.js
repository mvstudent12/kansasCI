const { User } = require("../models");

const bcrypt = require("bcryptjs");

module.exports = {
  async signIn(req, res) {
    try {
      const { email, password } = req.body;
      const trimmedEmail = email.trim();

      // Step 1: Find user by email
      const user = await User.findOne({ email: trimmedEmail });
      if (!user) {
        return res.render("admin/signin", {
          layout: "error",
          error_msg: "Email not found",
          email: trimmedEmail, // keep the typed email
        });
      }

      // Step 2: Compare password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.render("admin/signin", {
          layout: "error",
          error_msg: "Incorrect password",
          email: trimmedEmail, // keep the typed email
        });
      }

      // Step 3: Successful login — store user in session
      req.session.user = {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        position: user.position,
        role: user.role,
      };
      // Store the success message temporarily
      req.session.success_msg = `Welcome to the KCI Dashboard!`;

      await req.session.save(); // ensure session is saved before rendering

      // Step 4: Render dashboard with success message
      res.redirect("/admin/dashboard");
    } catch (err) {
      console.log(err);
      res.render("error/404", { layout: "error" });
    }
  },
};
