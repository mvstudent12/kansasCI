const Order = require("../models/Order");
const User = require("../models/User");

/**
 * Returns a list of all users with the count of their open orders.
 * @returns {Promise<Array<{_id, name, role, email, openOrders}>>}
 */

async function getUsersWithOpenOrders() {
  // Aggregate open orders
  const openOrderCounts = await Order.aggregate([
    {
      $match: {
        status: { $nin: ["Completed", "Void"] },
        archived: false,
        assignedTo: { $ne: null },
      },
    },
    {
      $group: {
        _id: "$assignedTo",
        openOrders: { $sum: 1 },
      },
    },
  ]);

  const orderCountMap = {};
  openOrderCounts.forEach((entry) => {
    orderCountMap[entry._id.toString()] = entry.openOrders;
  });

  const users = await User.find(
    {},
    "firstName lastName position role email"
  ).lean();

  return users.map((user) => ({
    _id: user._id,
    name: `${user.firstName} ${user.lastName}`,
    role: user.role,
    email: user.email,
    position: user.position,
    openOrders: orderCountMap[user._id.toString()] || 0,
  }));
}

module.exports = { getUsersWithOpenOrders };
