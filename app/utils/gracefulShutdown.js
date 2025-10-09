const gracefulShutdown = (msg, callback) => {
  console.log(`Application disconnected through ${msg}`);
  callback();
};

const setupShutdownHandlers = () => {
  process.on("SIGINT", () => {
    gracefulShutdown("App termination", () => {
      process.exit(0);
    });
  });

  // You can add more signals if needed, e.g., SIGTERM
};

module.exports = {
  gracefulShutdown,
  setupShutdownHandlers,
};
