// app/middleware/adminMiddleware.js

const User = require("../models/User");

let cachedSalesContacts = null;
let lastCacheTime = 0;
const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes

module.exports = async (req, res, next) => {
  try {
    // Current path for sidebar active highlighting
    res.locals.currentPath = req.originalUrl;

    // Sales contacts caching
    const now = Date.now();
    if (!cachedSalesContacts || now - lastCacheTime > CACHE_DURATION_MS) {
      cachedSalesContacts = await User.find(
        {},
        "_id firstName lastName mobile email position role"
      )
        .sort({ firstName: 1 })
        .lean();

      lastCacheTime = now;
    }

    res.locals.salesContacts = cachedSalesContacts;
    next();
  } catch (err) {
    console.error("Error fetching sales contacts:", err);
    res.locals.salesContacts = [];
    next();
  }
};
