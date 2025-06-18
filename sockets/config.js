const { instrument } = require("@socket.io/admin-ui");
const socketIo = require("socket.io");
const sockets = require("./sockets");
const {
  socketLeaveAllRooms,
  socketJoinRoom,
  socketLeaveRoom,
} = require("../services/socketRoomManager"); //gestion des rooms

module.exports = (server) => {
  // initialise le serveur socket.io avec CORS
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

  // écoute des connexions socket
  io.on("connection", (socket) => {
    console.log("Client connected", socket.id);
    sockets(io, socket);

    // écoute des événements socket
    socket.on("disconnect", () => socketLeaveAllRooms(socket)); // auto leave
    socket.on("leave-all-rooms", () => socketLeaveAllRooms(socket)); // leave toutes les rooms
    socket.on("leave-room", (roomID) => socketLeaveRoom(socket, roomID)); // leave une room
    socket.on("join-room", (newRoomID) => socketJoinRoom(socket, newRoomID)); // rejoint une room
  });

  // 🔐 Instrumentation pour l'interface admin
  instrument(io, {
    auth: false,
    mode: "development",
  });

  return io;
};
