// Quitte une room, notifie le joueur et les autres
function socketLeaveRoom(socket, room) {
  socket.leave(room);
  socket.emit("left-success", { room });
  socket.to(room).emit("player-update", {
    message: `User ${socket.id} left ${room}`,
  });
}

// Quitte toutes les rooms
function socketLeaveAllRooms(socket) {
  for (const r of socket.rooms) {
    if (r !== socket.id) {
      socketLeaveRoom(socket, r);
    }
  }
}

// joueur rejoint une room après avoir quitté les autres
function socketJoinRoom(socket, room) {
  socketLeaveAllRooms(socket); //quitte toutes les rooms
  socket.join(room); //rejoint la nouvelle room
  socket.emit("joined-room", room); //confirme au joueur
  socket.to(room).emit("player-update", {
    message: `User ${socket.id} joined ${room}`, //prévient les autres joueurs
  });
}

module.exports = { socketLeaveAllRooms, socketLeaveRoom, socketJoinRoom };
