const sockets = async (io, socket) => {
    socket.on("question", (data) => {
        setTimeout(() => {
            io.emit("game-cycle", data)
        }, 500);
    })
};

module.exports = sockets;
