const socketIo = require("socket.io");
const sockets = require("./sockets");
const { instrument } = require("@socket.io/admin-ui");

module.exports = (server) => {
  const io = socketIo(server, {
    cors: {
      origin: [
        "https://admin.socket.io",
        "http://192.168.100.181",
        "http://192.168.100.76",
      ],
      allowedHeaders: ["Origin", "X-Requested-With", "Content-Type", "Accept"],
      methods: ["GET", "POST", "PUT", "DELETE"],
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

  instrument(io, {
    auth: false,
  });

  return io;
};
