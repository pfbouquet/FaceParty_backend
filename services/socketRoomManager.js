function socketLeaveRoom(socket, room) {
  socket.leave(room);
  socket.emit("left-success", { room });
  socket.to(room).emit("player-update", {
    type: "player-joined",
    message: `User ${socket.id} left ${room}`,
    leaver: socket.id,
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
    type: "player-joined",
    message: `User ${socket.id} joined ${room}`,
    joiner: socket.id,
  });
}

module.exports = { socketLeaveAllRooms, socketLeaveRoom, socketJoinRoom };
