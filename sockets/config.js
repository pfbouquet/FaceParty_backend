const { instrument } = require("@socket.io/admin-ui");
const socketIo = require("socket.io");
const sockets = require("./sockets");

module.exports = (server) => {
  const io = socketIo(server, {
    cors: {
      origin: [
        "https://admin.socket.io",
        "http://localhost:3000",
        "http://192.168.100.181",
        "http://192.168.100.76",
      ],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("Client connected", socket.id);
    socket.on("disconnect", () => {
      console.log("Client disconnected", socket.id);
    });
    sockets(io, socket);
  });

  io.on("connection", (socket) => {
    socket.on("leave-room", (roomID) => {
      socket.leave(roomID);
      console.log(`Socket ${socket.id} left room ${roomID}`);
      // Notify user
      socket.emit("left-success", {
        message: "You have successfully left the room!",
        room: roomID,
      });
      // Notify room
      socket.to(roomID).emit("user-left", {
        leaver: socket.id,
      });
    });
  });

  // 🔐 Instrumentation pour l'interface admin
  instrument(io, {
    auth: false,
    mode: "development",
  });

  return io;
};
