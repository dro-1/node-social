let io;

exports.connect = (server) => {
  io = require("socket.io")(server, {
    cors: {
      origin: "*",
    },
  });
  io.on("connection", (socket) => {
    console.log("Client Connected");
    socket.emit("API", {
      hi: "hello",
    });
  });
};

exports.getIO = () => io;
