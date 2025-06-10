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
};

module.exports = helpers;
