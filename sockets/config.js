const { instrument } = require("@socket.io/admin-ui");
const socketIo = require("socket.io");
const sockets = require("./sockets");
const {
  socketLeaveAllRooms,
  socketJoinRoom,
  socketLeaveRoom,
} = require("../services/socketRoomManager");

module.exports = (server) => {
  const io = socketIo(server, {
    cors: {
      origin: [
        process.env.EXPO_PUBLIC_BACKEND_URL,
        process.env.FRONTEND_URL,
        "http://localhost",
        "https://admin.socket.io",
      ],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("Client connected", socket.id);
    sockets(io, socket);

    socket.on("disconnect", () => socketLeaveAllRooms(socket));
    socket.on("leave-all-rooms", () => socketLeaveAllRooms(socket));
    socket.on("leave-room", (roomID) => socketLeaveRoom(socket, roomID));
    socket.on("join-room", (newRoomID) => socketJoinRoom(socket, newRoomID));
  });

  // 🔐 Instrumentation pour l'interface admin
  instrument(io, {
    auth: false,
    mode: "development",
  });

  return io;
};
