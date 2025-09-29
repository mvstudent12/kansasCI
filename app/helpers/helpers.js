// helpers.js
const moment = require("moment");

const helpers = {
  countArrayItems: (array) => {
    if (!array) {
      return 0;
    }
    return array.length;
  },

  add: (value, increment) => {
    return value + increment;
  },

  countItems: (array) => {
    return Array.isArray(array) ? array.length : 0;
  },
  eq: (a, b) => {
    if (typeof a === "object" && typeof b === "object") {
      return String(a) === String(b); // Convert to string for comparison
    }
    if (typeof a === "string" && typeof b === "string") {
      return a.toLowerCase() === b.toLowerCase();
    } else return a == b;
  },
  formatDate: (date) => {
    return moment(date).format("MM/D/YY");
  },

  json: (context) => {
    return JSON.stringify(context);
  },
  includes: (array, value) => {
    if (!Array.isArray(array)) return false;
    return array.includes(value);
  },
  lt: (a, b) => a < b,
  gt: (a, b) => a > b,
  subtract: (a, b) => a - b,
  range: function (start, end) {
    let arr = [];
    for (let i = start; i <= end; i++) arr.push(i);
    return arr;
  },
  paginationRange: function (currentPage, totalPages, maxVisible = 7) {
    let range = [];

    const showLeftEllipsis = currentPage > 4;
    const showRightEllipsis = currentPage < totalPages - 3;

    range.push(1); // always show first page

    let start = Math.max(2, currentPage - 2);
    let end = Math.min(totalPages - 1, currentPage + 2);

    if (showLeftEllipsis && start > 2) {
      range.push("...");
    }

    for (let i = start; i <= end; i++) {
      range.push(i);
    }

    if (showRightEllipsis && end < totalPages - 1) {
      range.push("...");
    }

    if (totalPages > 1) {
      range.push(totalPages); // always show last page
    }

    return range;
  },
  firstImagePath: function (images) {
    return images && images.length > 0 ? images[0].path : "";
  },
  length: (arr) => arr?.length || 0,
  urlEncode: function (string) {
    return encodeURIComponent(string);
  },
  dashify: function (text) {
    return text
      .replace(/\s+/g, "-")
      .replace(/&/g, "and")
      .replace(/[^a-zA-Z0-9-_]/g, "")
      .toLowerCase();
  },
  multiply: function (a, b) {
    return (a * b).toFixed(2);
  },
  // Checks if a product is in the wishlist
  containsWish: function (wishList, productId) {
    if (!wishList) return false;
    return wishList.some(
      (item) => item.type === "product" && String(item.id) === String(productId)
    );
  },

  // Checks if a gallery image is in the “inspiration” list
  containsInspiration: function (inspirationList, filePath) {
    if (!inspirationList) return false;
    return inspirationList.some(
      (item) => item.type === "gallery" && item.filePath === filePath
    );
  },
  isActive: function (link, currentPath) {
    // remove trailing slashes
    link = link.replace(/\/$/, "");
    currentPath = currentPath.replace(/\/$/, "");

    return currentPath.startsWith(link) ? "active" : "";
  },
  or: function () {
    // Convert arguments to array, remove the last one (options)
    const args = Array.prototype.slice.call(arguments, 0, -1);
    // Return true if any argument is truthy
    return args.some(Boolean);
  },

  isArray: function (value) {
    return Array.isArray(value);
  },
  and: function (a, b) {
    return a && b;
  },
};

module.exports = helpers;
