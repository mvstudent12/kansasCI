function convertTimeTo24(timeStr) {
  if (!timeStr) return "00:00"; // default to midnight
  let [time, modifier] = timeStr.split(/(am|pm)/i);
  let [hours, minutes] = time.split(":").map(Number);

  if (modifier.toLowerCase() === "pm" && hours < 12) hours += 12;
  if (modifier.toLowerCase() === "am" && hours === 12) hours = 0;

  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}:00`;
}

module.exports = { convertTimeTo24 };
