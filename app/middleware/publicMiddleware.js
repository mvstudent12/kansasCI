// app/middleware/publicMiddleware.js

module.exports = (req, res, next) => {
  // Cart session and count
  res.locals.cart = req.session.cart || [];
  res.locals.cartCount = res.locals.cart.reduce(
    (total, item) => total + (item.quantity || 0),
    0
  );

  // Wishlist session and count
  res.locals.wishList = req.session.wishList || [];
  res.locals.wishCount = res.locals.wishList.length;

  // Inspiration / gallery session and count
  res.locals.inspirationList = req.session.inspirationList || [];
  res.locals.inspirationCount = res.locals.inspirationList.length;

  next();
};
