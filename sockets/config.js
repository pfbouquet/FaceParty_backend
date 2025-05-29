const { instrument } = require("@socket.io/admin-ui");
const socketIo = require("socket.io");
const sockets = require("./sockets");

function socketLeaveRoom(theSocket, theRoom) {
  // Leave room
  theSocket.leave(theRoom);
  // Notify user
  theSocket.emit("left-success", {
    message: "You have successfully left the room!",
    room: theRoom,
  });
  // Notify room
  theSocket.to(theRoom).emit("user-left", {
    leaver: theSocket.id,
  });
}

function socketLeaveAllRooms(theSocket) {
  for (const theRoom of theSocket.rooms) {
    // skip its own default room (which is the socket.id)
    if (theRoom !== theSocket.id) {
      socketLeaveRoom(theSocket, theRoom);
    }
  }
}

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

    socket.on("disconnect", () => {
      console.log("Client disconnected", socket.id);
      socketLeaveAllRooms(socket);
    });

    socket.on("leave-all-rooms", () => {
      socketLeaveAllRooms(socket);
    });

    sockets(io, socket);
  });

  io.on("connection", (socket) => {
    socket.on("leave-room", (roomID) => {
      socketLeaveRoom(socket, roomID);
    });
    socket.on("join-room", (newRoomID) => {
      // 1) Drop them from _all_ other rooms except their own private room
      for (const room of socket.rooms) {
        if (room !== socket.id && room !== newRoomID) {
          socketLeaveRoom(socket, room);
        }
      }
      // 2) Then join the new one (even if they were already in it)
      socket.join(newRoomID);
      socket.emit("joined-room", newRoomID);
    });
  });

  // 🔐 Instrumentation pour l'interface admin
  instrument(io, {
    auth: false,
    mode: "development",
  });

  return io;
};
