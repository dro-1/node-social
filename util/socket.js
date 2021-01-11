let io;

exports.connect = (server) => {
  io = require("socket.io")(server);
  io.on("connection", (socket) => {
    console.log("Client Connected");
  });
};

exports.getIO = () => io;
