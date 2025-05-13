exports.requireLogin = (req, res, next) => {
  if (!req.session.user) {
    return res.status(401).json({ message: "You must be logged in" });
  }
  next();
};

exports.requireRole = (role) => {
  return (req, res, next) => {
    if (!req.session.user || req.session.user.role !== role) {
      return res.status(403).json({ message: "Access denied" });
    }
    next();
  };
};
