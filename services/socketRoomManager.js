function socketLeaveRoom(socket, room) {
  socket.leave(room);
  socket.emit("left-success", { room });
  socket.to(room).emit("player-update", {
    message: `User ${socket.id} left ${room}`,
  });
}

function socketLeaveAllRooms(socket) {
  for (const r of socket.rooms) {
    if (r !== socket.id) {
      socketLeaveRoom(socket, r);
    }
  }
}

function socketJoinRoom(socket, room) {
  // drop from every other room
  socketLeaveAllRooms(socket);

  // join the new one
  socket.join(room);
  socket.emit("joined-room", room);
  socket.to(room).emit("player-update", {
    message: `User ${socket.id} joined ${room}`,
  });
}

module.exports = { socketLeaveAllRooms, socketLeaveRoom, socketJoinRoom };
