const sockets = async (io, socket) => {
    socket.on("question", (data) => {
        setTimeout(() => {
            io.emit("game-cycle", data)
        }, 500);
    })

    socket.on("playerUpdate", (roomID) => {
        setTimeout(() => {
            io.to(roomID).emit("playerUpdate")
        }, 500);
    })
};

module.exports = sockets;
